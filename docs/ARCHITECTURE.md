# Jewish Heritage Morocco — Technical Architecture Plan

**Status:** Awaiting approval. No application code has been written yet (per master prompt §29).
**Date:** 2026-08-08

This document answers the 24 questions in §29 of the master prompt, in order. Section
numbers below map to the master prompt's numbering where relevant.

---

## 0. Decisions already locked

| Decision | Choice |
|---|---|
| CMS engine | Payload CMS 3 (runs inside Next.js) |
| Database | Neon serverless Postgres |
| File storage | Cloudflare R2 (S3-compatible) |
| Transactional email | Resend |
| Languages | English (default) + French + Hebrew (RTL) |
| Visual direction | Desert & Indigo |

---

## 1. Exact framework

- **Next.js 15** (App Router, React Server Components) + **React 19** + **TypeScript** (strict).
- **Tailwind CSS v4** for styling, using **CSS logical properties** throughout so the Hebrew
  RTL layout is automatic rather than a second stylesheet.
- **Node 22** runtime (Payload 3 requires Node 20+; the build container already has 22.22.2).
- No Python, no separate backend service, no VPS. One repository, one build, one deploy.

**Why Next.js specifically:** Payload 3 is not a CMS that sits *next to* a Next.js app — it
installs *into* one. The admin panel and the content API are ordinary routes in the same
`app/` directory, compiled by the same `next build`, deployed as the same Netlify function.
This is the structural reason the previous "frontend deployed, admin panel didn't" failure
cannot recur here: there is no second thing to deploy.

---

## 2. Exact architecture

```
Browser
  │
  ├─ Static assets, images ────────────► Netlify CDN + Netlify Image CDN
  │
  └─ HTML / admin / API ──────────────► Netlify Function (Next.js standalone server)
                                              │
                                              ├─ Payload Local API (in-process, no HTTP hop)
                                              │        │
                                              │        └──► Neon Postgres (pooled)
                                              │
                                              ├─ Presigned upload URLs ──► Cloudflare R2
                                              └─ Resend (inquiry notifications)
```

Repository layout:

```
/
├── netlify.toml
├── next.config.mjs
├── package.json
├── .env.example
├── src/
│   ├── app/
│   │   ├── (frontend)/[locale]/…        ← public website
│   │   └── (payload)/
│   │       ├── admin/[[...segments]]/    ← /admin  (Payload admin UI)
│   │       └── api/[...slug]/            ← /api    (Payload REST + GraphQL)
│   ├── collections/                      ← Tours, HeritageSites, Destinations, …
│   ├── globals/                          ← SiteSettings, Navigation
│   ├── blocks/                           ← page-builder blocks
│   ├── components/                       ← design system + site components
│   ├── access/                           ← role-based access control functions
│   ├── hooks/                            ← revalidation, slug, email hooks
│   ├── lib/                              ← queries, seo, tracking, whatsapp, i18n
│   ├── middleware.ts                     ← locale routing (excludes /admin, /api)
│   └── payload.config.ts
├── migrations/                           ← generated SQL migrations (committed)
└── docs/
```

The existing `pinterest_refs.py` / `pexels_refs.py` scripts are unrelated to this site and
stay untouched. The Next.js app lives at the repository **root** so that Netlify's "connect
repo → deploy" flow needs no base-directory configuration.

---

## 3. Exact CMS architecture

Payload 3, self-hosted inside the app. Not a hosted SaaS, not a static-file CMS.

- **Admin UI:** React Server Components served at `/admin` by the Next.js function.
- **Content API:** REST at `/api/*` and GraphQL at `/api/graphql`, auto-generated.
- **Server-side reads:** the public pages do **not** call the REST API over HTTP. They call
  the **Payload Local API** (`payload.find(...)`) directly in the same process — a function
  call, not a network request. This removes an entire round-trip from every page render.
- **Drafts & versions:** every content collection has `versions: { drafts: true }`, giving
  publish/unpublish, revision history, and authenticated draft preview.
- **Content is never hard-coded.** Every tour, heritage site, destination, article, FAQ, and
  even the marketing landing pages are database records rendered by generic templates.

### How a CMS edit reaches the public site

1. Editor saves a tour in `/admin`.
2. Payload writes to Neon and fires an `afterChange` hook.
3. The hook calls `revalidateTag('tours')` and `revalidatePath('/tours/<slug>')`.
4. Netlify's Next.js runtime purges exactly those cached entries.
5. The next visitor gets freshly rendered HTML; everyone after that gets it from CDN cache.

Pages are therefore CDN-fast by default *and* update within seconds of an edit. No rebuild,
no redeploy, no waiting.

---

## 4. Exact database

**Neon serverless Postgres**, via `@payloadcms/db-postgres` (Drizzle ORM under the hood).

- Connection uses Neon's **pooled** connection string (PgBouncer), which is what makes it
  safe under serverless concurrency where each function invocation may open a connection.
- **Schema management:** Drizzle `push` in local development only. Production uses
  **committed SQL migrations** — `payload migrate:create` generates them, and the Netlify
  build runs `payload migrate` *before* `next build`. Production never auto-alters its own
  schema.
- **Deploy previews:** Neon's database branching gives each preview its own copy, so PR
  previews cannot write into production data. (Without this, previews share the production
  DB — see §Risks.)

---

## 5. Exact authentication system

Payload's built-in authentication — production-grade, database-backed, not a toy.

- HTTP-only, secure, SameSite cookies + JWT.
- Salted password hashing, configurable lockout after failed attempts.
- Email-based password reset (through Resend).
- Optional 2FA can be layered later.
- **No seeded credentials in source.** On first visit to `/admin` with an empty users table,
  Payload renders a create-first-user screen. The super admin sets their own password then.
- Subsequent users are invited from inside `/admin`. Nobody shares an account.

Keeping auth inside Payload (rather than adding Clerk/Auth.js) means one user table, one
session system, and role checks that the CMS itself enforces at the database-query level.

---

## 6. Exact storage system

**Cloudflare R2** via `@payloadcms/storage-s3` pointed at R2's S3-compatible endpoint.

> Note: the `@payloadcms/storage-r2` package binds to Cloudflare Workers' native R2 bindings
> and does **not** apply to a Netlify deployment. The S3 adapter against R2's S3 API is the
> correct choice here.

Two details that matter a great deal on Netlify:

1. **`clientUploads: true`.** Netlify functions cap request bodies at ~6MB, and base64
   encoding of binary uploads cuts the effective limit to about **4.5MB**. With
   `clientUploads` enabled, the browser requests a presigned URL and uploads **directly to
   R2**, never routing the file through the function. Large photography uploads work. This
   requires a CORS rule allowing `PUT` from the site's origin on the R2 bucket.
2. **`disableLocalStorage`** is set automatically by the adapter. Nothing is ever written to
   the function's ephemeral filesystem, so no uploaded file can vanish on redeploy.

Public delivery is through an R2 custom domain (e.g. `media.clientdomain.com`), with
`next/image` in front of it so Netlify Image CDN produces resized AVIF/WebP derivatives on
demand.

---

## 7. Exact Netlify deployment architecture

`netlify.toml`:

```toml
[build]
  command = "npm run ci"        # = payload migrate && next build
  publish = ".next"

[build.environment]
  NODE_VERSION = "22"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

The official `@netlify/plugin-nextjs` runtime compiles the Next.js server into a Netlify
Function, uploads static assets to the CDN, wires `next/image` to Netlify Image CDN, and
backs the ISR/data cache with Netlify Blobs so `revalidateTag` works in production.

Additional configuration:
- Security headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, frame options, a CSP
  tuned to allow the future GTM container).
- `X-Robots-Tag: noindex` on `/admin/*`, plus a `robots.txt` disallow.
- Long-lived immutable caching for hashed static assets.

**Function size:** Netlify's limit is 250MB unzipped per handler. Payload + Next + `sharp`
sits comfortably under this, but it is the one number to watch. If it is ever approached,
the mitigation is to drop `sharp` (it is optional in Payload 3) and let Netlify Image CDN
handle all resizing — costing only the admin's crop/focal-point UI.

---

## 8. GitHub → Netlify deployment process

One-time: create a Netlify site, pick "Import from GitHub", select the repo, paste the
environment variables, deploy.

Thereafter, every push to the production branch automatically:
1. Triggers a Netlify build.
2. Runs pending database migrations.
3. Builds Next.js.
4. Deploys the function + CDN assets atomically.
5. Renews TLS as needed.

Pull requests get deploy previews at their own URLs. No manual step, no SSH, no server
process to keep alive.

---

## 9. `/admin` architecture

`/admin` is a Next.js catch-all route (`app/(payload)/admin/[[...segments]]/page.tsx`)
rendered by Payload. It is:

- **Server-rendered**, never statically pre-generated, never cached at the CDN.
- **Protected before render** — unauthenticated requests are redirected to the login screen,
  and every collection query is additionally filtered by the role access functions, so a
  crafted API request cannot bypass the UI.
- **Excluded from the locale middleware**, so `/admin` never becomes `/en/admin`.
- **Excluded from search engines.**

The admin panel is trilingual-aware: editors switch locale with a dropdown and Payload shows
Hebrew fields right-aligned automatically (`rtl: true` on the locale).

---

## 10. Database schema

Collections (each with `slug`, timestamps, and drafts where noted):

### `users` — auth enabled
`email`, `password`, `name`, `role` (`super-admin` | `client-admin` | `editor`), `avatar`.

### `media` — upload enabled, R2-backed
`filename`, `mimeType`, `filesize`, `width`, `height`, **`alt` (required, localized)**,
`caption`, `credit`. Alt text is required at the schema level so no image can ship without
it — an accessibility and SEO guarantee rather than a guideline.

### `tours` — drafts
Grouped fields: identity (`title`, `slug`, `shortDescription`, `heroImage`, `gallery`),
`tourType` (private | small-group | custom), duration (`days`, `nights`, `label`),
`startLocation`, `endLocation`, `destinations[]` → destinations, `highlights[]`,
**`itinerary[]`** (per day: `dayNumber`, `title`, `description`, `overnightIn`,
`meals` {B/L/D}, `accommodation`, `sitesVisited[]` → heritage-sites, `image`),
`heritageSites[]` → heritage-sites, `included[]`, `excluded[]`, `accommodationInfo`,
`transportationInfo`, `mealsInfo`,
`pricing` (`priceFrom`, `currency`, `unit`, `note`, **`showPrice`** toggle),
`availability` (`status`: available | limited | seasonal | on-request | sold-out,
`seasonalNote`, `availableMonths[]`), `relatedTours[]`, `seo` group.

`showPrice` exists because §5 of the brief requires that only supplied information is
displayed — an unpriced tour renders a "Request a quote" CTA instead of an empty price.

### `departures` — dated availability
`tour` → tours, `startDate`, `endDate`, `status` (open | limited | closed | cancelled),
`priceOverride`, `note`. A separate collection (rather than an array inside `tours`) so
"upcoming departures across all tours" is a single indexed query. Surfaced on the tour's
edit screen through a Payload `join` field.

### `heritage-sites` — drafts
`name`, `slug`, `siteType` (synagogue | cemetery | rabbinical-tomb | mellah | jewish-quarter
| museum | landmark | other), `destination` → destinations, `city`, `region`,
`coordinates`, `shortDescription`, `description`, `historicalInfo`, **`historicalSources[]`**
(`title`, `url`), `visitingInfo`, `images[]`, `relatedTours[]`, `relatedSites[]`, `seo`.

`historicalSources` is deliberate: §6 and §17 forbid fabricated history, so the model gives
the client a first-class place to cite where a claim comes from.

### `destinations` — drafts
`name`, `slug`, `heroImage`, `overview`, `jewishHeritage`, `historicalSignificance`,
`gallery[]`, `relatedPosts[]`, `seo`. Heritage sites and tours attach by reverse relation.

### `experiences` — drafts
`title`, `slug`, `summary`, `description`, `image`, `destinations[]`, `relatedTours[]`, `seo`.

### `posts` (blog) — drafts
`title`, `slug`, `featuredImage`, `excerpt`, `content` (Lexical rich text with image /
quote / callout / gallery blocks), `category` → categories, `tags[]`, `author` → users,
`publishedAt`, `relatedTours[]`, `relatedSites[]`, `seo` (incl. `ogImage`).

### `categories`
`title`, `slug`, `description`, `seo`.

### `faqs`
`question`, `answer`, `scope` (general | tour | destination | heritage-site | booking),
`tour` → tours, `destination` → destinations, `order`. One place to manage every FAQ;
tour and destination pages pull their own plus the general set.

### `pages` — drafts, block-based
`title`, `slug`, `layout[]` (blocks: hero, richText, tourGrid, heritageGrid,
destinationGrid, imageText, gallery, testimonials, faqAccordion, ctaBanner, logoStrip,
itineraryTeaser), `seo`. This powers Home, About, Why Travel With Us, the legal pages, and
**every marketing landing page** — so the agency can launch `/jewish-heritage-marrakech`
without a developer.

### `inquiries` — no public read
Traveler fields: `fullName`, `email`, `country`, `phone`, `preferredDates`,
`travelersCount`, `tourInterest` → tours, `tripDuration`, `tripStyle`, `interests[]`,
`additionalRequirements`, `message`, `consent`.
System fields: `status` (new | contacted | qualified | quoted | booked | lost),
`sourcePage`, `referrer`, `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`,
`assignedTo` → users, `internalNotes[]` (`note`, `author`, `createdAt`).

UTM capture is what lets the future agency attribute a booking back to a campaign without
touching the codebase.

### Globals
- **`site-settings`** — company name, logo, contact email, phone, **WhatsApp number and
  default message template**, address, social links, default OG image, booking-process text,
  analytics container ID.
- **`navigation`** — header and footer menus.

Putting the WhatsApp number in the CMS rather than an environment variable means the client
changes it themselves, without a redeploy.

---

## 11. User-role system

| Capability | Super Admin | Client Admin | Editor |
|---|:--:|:--:|:--:|
| Create / edit content | ✅ | ✅ | ✅ |
| Publish / unpublish | ✅ | ✅ | ❌ |
| Delete content | ✅ | ✅ | ❌ |
| Edit SEO fields | ✅ | ✅ | ✅ |
| View / manage inquiries | ✅ | ✅ | ❌ |
| Manage media | ✅ | ✅ | ✅ |
| Site settings & navigation | ✅ | ✅ | ❌ |
| Analytics / tracking IDs | ✅ | ❌ | ❌ |
| Manage users | ✅ | invite editors only | ❌ |
| Hosting / infrastructure | ❌ *(not exposed in CMS at all)* | ❌ | ❌ |

Enforced by Payload `access` functions at collection level and field-level access on
`_status` (publishing) and the analytics settings group. Access rules run on every query
including direct API calls, not just in the UI.

Per §26: hosting credentials are never surfaced in the CMS. The client and the marketing
agency receive CMS logins only.

---

## 12–15. Data models

Covered in full in §10 above — `tours` (12), `heritage-sites` (13), `posts` (14),
`inquiries` (15).

---

## 16. SEO architecture

- **URLs:** clean and human-readable — `/tours/8-day-jewish-heritage-morocco`,
  `/jewish-heritage-sites/slat-al-azama-synagogue`, `/destinations/fez`.
- **Metadata:** Next's Metadata API, generated per route from the CMS `seo` group with
  sensible fallbacks (never an empty or duplicated title).
- **Canonicals** on every page; `hreflang` alternates for en/fr/he plus `x-default`.
- **Structured data (JSON-LD):** `TravelAgency` (site-wide), `TouristTrip` + `Offer`
  (tours), `TouristAttraction` (heritage sites), `Place` (destinations), `BlogPosting`
  (articles), `FAQPage`, `BreadcrumbList`, `WebSite`.
- **Dynamic `sitemap.xml`** generated from the database (all locales) and `robots.txt`.
- **Breadcrumbs** rendered and marked up on every deep page.
- **Internal linking** is structural: tours ↔ heritage sites ↔ destinations ↔ articles are
  genuine relationships in the schema, so cross-links are real, not decorative.
- **Rendering:** server-rendered HTML. Every word is in the initial response — fully
  crawlable with no JavaScript execution required.
- **Per-locale slugs** so French and Hebrew URLs read naturally, with fallback to English.

No keyword-stuffing, and no thin duplicate landing pages: `/jewish-heritage-morocco` and
similar are substantive CMS-authored pages, not templated keyword swaps.

---

## 17. Conversion architecture

Every page carries exactly one primary path to contact:

- **Sticky mobile action bar** — WhatsApp + Request Itinerary, always reachable, out of the
  way of content.
- **Tour pages** — a sticky sidebar (desktop) / bottom bar (mobile) with price-or-quote,
  availability status, Request Itinerary, and WhatsApp.
- **Inline inquiry form** at the foot of tours, heritage pages, and landing pages,
  pre-filled with the tour the visitor was reading.
- **Closing CTA band** on every template.
- `/contact` with the full form, plus phone and email as `tel:` / `mailto:` links.

The form is deliberately short — the fields in §12 of the brief, with anything optional
marked as such — because inquiry volume falls off sharply with length.

---

## 18. WhatsApp implementation

A single `<WhatsAppLink>` component builds `https://wa.me/<number>?text=<prefilled>` from the
CMS-managed number plus page context, so a traveler messaging from a tour page opens WhatsApp
with *"Hello, I'm interested in the 8-Day Jewish Heritage Morocco tour…"* already typed.

Every instance fires a `whatsapp_click` event into `window.dataLayer` with the page, tour,
and placement attached — so the agency can mark it a conversion later without a code change.

---

## 19. Analytics & tracking readiness

No analytics account of mine or the client's is hard-wired. The site exposes:

- An optional **GTM container ID** (environment variable, overridable in CMS settings). Empty
  by default — the agency supplies their own container and owns the data.
- A typed `track()` helper pushing a documented event schema to `window.dataLayer`:
  `tour_view`, `inquiry_start`, `inquiry_submit`, `whatsapp_click`, `phone_click`,
  `email_click`, `booking_request`, `consultation_request`.
- A `/inquiry/thank-you` destination so conversion pixels have a clean URL to fire on.
- `docs/TRACKING.md` documenting every event and payload for whoever inherits the site.

Nothing goes into my personal Google or Meta accounts, per §18 and §26 of the brief.

---

## 20. Required environment variables

```dotenv
# Database — Neon POOLED connection string
DATABASE_URI=

# Payload — openssl rand -hex 32
PAYLOAD_SECRET=

# Public site URL (no trailing slash)
NEXT_PUBLIC_SERVER_URL=

# Cloudflare R2 (S3-compatible)
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=auto
S3_ENDPOINT=
NEXT_PUBLIC_S3_PUBLIC_URL=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=
INQUIRY_NOTIFY_TO=

# Spam protection (Cloudflare Turnstile)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Optional — supplied by the marketing agency later
NEXT_PUBLIC_GTM_ID=

# Draft preview signing
PREVIEW_SECRET=
```

Committed as `.env.example` with empty values. Real secrets live only in Netlify's
environment UI. Nothing sensitive is ever committed.

---

## 21. Required third-party services

| Service | Purpose | Cost to start |
|---|---|---|
| **Netlify** | Hosting, functions, CDN, image CDN, TLS | Free tier |
| **Neon** | Postgres database | Free tier |
| **Cloudflare R2** | Image/file storage | Free tier (no egress fees) |
| **Resend** | Inquiry notification email | Free tier |
| **Cloudflare Turnstile** | Form spam protection | Free |
| **GitHub** | Repository, deploy trigger | Free |

Four accounts to create (Netlify, Neon, Cloudflare, Resend). All have production-viable free
tiers; the realistic first paid upgrade is Neon or Netlify once traffic grows.

---

## 22. One-time setup steps (what you configure manually)

1. **Neon** — create a project, copy the **pooled** connection string.
2. **Cloudflare R2** — create a bucket, create an S3 API token, note the account endpoint.
   Add a CORS rule allowing `PUT` and `GET` from your domain (required for direct uploads).
   Optionally attach a custom domain such as `media.clientdomain.com`.
3. **Resend** — create an account, verify the sending domain, copy the API key.
4. **Turnstile** — create a widget, copy the site and secret keys.
5. **Generate** `PAYLOAD_SECRET` with `openssl rand -hex 32`.
6. **Netlify** — "Import from GitHub", select this repo, paste all environment variables,
   deploy.
7. **Visit `/admin`** — create the super-admin account on the first-run screen.
8. **Add the custom domain** in Netlify and point DNS; HTTPS is provisioned automatically.
9. **Create CMS accounts** for the client and the marketing agency from inside `/admin`.

Total hands-on time once accounts exist: roughly 20–30 minutes. No Linux, no Nginx, no SSH,
no server process.

---

## 23. What happens automatically after a GitHub push

- Netlify detects the push and starts a build.
- Pending database migrations run against Neon.
- Next.js builds; Payload's admin and API build with it.
- The function and CDN assets deploy atomically.
- TLS certificates renew.
- Sitemap regenerates from live data.
- Existing content, uploaded images, users, and inquiries are **untouched** — they live in
  Neon and R2, not in the deployment.

---

## 24. How the CMS stays functional in production

This is the requirement the previous build failed, so stated plainly:

| Failure mode | Why it cannot happen here |
|---|---|
| Admin panel needs a separate backend | There is no separate backend. `/admin` is a route in the same Next.js app. |
| Backend needs a long-running server | It runs as a Netlify Function, invoked on demand. |
| Data lost on redeploy | Data is in Neon Postgres, external to the deployment. |
| Images lost on redeploy | Images are in Cloudflare R2, external to the deployment. |
| Depends on localhost / dev server | Every dependency is a hosted URL supplied by environment variable. |
| Depends on local JSON or localStorage | All content reads and writes go through Postgres. |
| Python process required | There is no Python in the application. |
| CMS edits don't appear publicly | `afterChange` hooks revalidate the affected pages immediately. |

---

## Design system — "Desert & Indigo"

| Token | Value | Use |
|---|---|---|
| `indigo-900` | `#131E44` | Headings, dark sections, footer |
| `indigo-700` | `#22346E` | Primary buttons, links |
| `indigo-500` | `#3B57A8` | Hover, focus rings |
| `sand-50` | `#FAF6EF` | Page background |
| `sand-100` | `#F3EDE1` | Alternating sections |
| `sand-200` | `#E7DCC9` | Borders, dividers |
| `terracotta` | `#B5502F` | Accent, availability badges |
| `brass` | `#B08D4F` | Fine rules, ornament |
| `ink` | `#1A1A17` | Body text |
| `ink-muted` | `#5B5A52` | Secondary text |

All text/background pairings are checked to WCAG AA (AAA for body copy).

**Typography** — loaded per locale so English visitors never download Hebrew glyphs:

- Latin display: **Fraunces** · Latin body: **Inter**
- Hebrew display: **Frank Ruhl Libre** · Hebrew body: **Heebo**

**Moroccan visual language, used sparingly:** thin brass rules with a subtle zellige-derived
motif as section dividers, generous whitespace, arch-topped image masks on hero and card
imagery, and a restrained geometric pattern at very low opacity in section backgrounds.
Photography carries the design; ornament stays at the edges.

**Motion:** short opacity/translate reveals via CSS and IntersectionObserver only. No
animation library. Everything respects `prefers-reduced-motion`.

---

## Trilingual & RTL implementation

- Payload `localization`: `en` (default), `fr`, `he` with `rtl: true`; fallback to `en` so a
  partially translated site never shows blank fields.
- Routing: English at the root (`/tours/...`), French and Hebrew prefixed (`/fr/...`,
  `/he/...`), via middleware rewrite. Matches the URLs in the brief and keeps the primary
  market's canonicals clean.
- `<html lang>` and `dir` set per locale; the entire layout uses logical properties, so
  Hebrew mirrors correctly without duplicated CSS.
- Language switcher preserves the current page across locales.
- `hreflang` alternates plus `x-default` on every page.

---

## Performance plan

- Server Components by default; client JavaScript only for the menu, form, gallery, and
  language switcher.
- `next/image` → Netlify Image CDN → AVIF/WebP, correct `sizes`, lazy below the fold, blur
  placeholders, explicit dimensions to hold layout (CLS).
- `next/font` self-hosting with `display: swap` and locale-scoped subsets.
- Static-first rendering with tag-based revalidation — most visitors are served from CDN.
- No jQuery, no animation library, no carousel library, no icon font.
- Budget: LCP < 2.0s on 4G mobile, CLS < 0.1, INP < 200ms, initial JS < 100KB gzipped.

---

## Security plan

- Role-based access enforced at the query layer, not just the UI.
- `/admin` server-guarded and `noindex`.
- Public inquiry submission goes through a **Server Action**, not a public write endpoint:
  the `inquiries` collection denies public `create`, and only the validated server path
  writes. This prevents scripted spam against the REST API.
- Zod validation on every input, server-side, before it reaches the database.
- Turnstile + honeypot + timing check on the form.
- Parameterised queries throughout (Drizzle) — no string-built SQL.
- Secrets only in Netlify environment variables; `.env` git-ignored; `.env.example` carries
  empty keys.
- Security headers and a CSP set in `netlify.toml`.
- Rate limiting on the inquiry endpoint.

---

## Risks & honest caveats

1. **Netlify function size (250MB unzipped).** Payload + Next + `sharp` fits, but it is the
   number to watch as dependencies grow. Mitigation: drop `sharp` and rely entirely on
   Netlify Image CDN, losing only the admin crop UI.
2. **Cold starts.** The first `/admin` request after idle will be noticeably slower. This
   affects editors, not public visitors, whose pages come from CDN cache.
3. **Deploy previews and the database.** Without Neon branching, preview deploys write to
   production data. I will wire Neon branching, but it is a setup step worth knowing about.
4. **R2 presigned uploads need CORS.** If the CORS rule is missing, uploads fail with an
   opaque browser error. It is in the setup checklist for that reason.
5. **Trilingual content is a content commitment.** The system will be fully ready for
   French and Hebrew, but the site is only as multilingual as the translations the client
   supplies. Untranslated fields fall back to English rather than breaking.
6. **Placeholders, not invented facts.** No testimonials, statistics, awards, years of
   experience, prices, dates, or historical claims will be fabricated. Anywhere the brief
   requires content I have not been given, the CMS will contain a clearly marked
   `[PLACEHOLDER — client to supply]` entry.

---

## Production test plan (§28)

Executed against the live Netlify URL after deployment:

**Public** — every page type renders; navigation; mobile/tablet/desktop; tour, destination,
heritage-site and blog detail pages; WhatsApp links open with prefilled text; inquiry form
submits; all three locales; Hebrew RTL layout; Lighthouse pass.

**CMS** — `/admin` loads; login; each of the three roles sees exactly its permitted surface;
create/edit/publish/unpublish/delete a tour; itinerary editing; heritage-site and blog
management; image upload; inquiry list and status changes; SEO field editing.

**Persistence** — the ten-step sequence in §28 of the brief, ending with a fresh deploy to
confirm nothing is lost: create tour → verify public → edit → verify update → upload image →
verify persistence → submit inquiry → verify in CMS → log out/in → redeploy → verify all data
survives.

---

## Build sequence once approved

1. Scaffold Next.js 15 + Payload 3 + Tailwind v4; `netlify.toml`; `.env.example`.
2. Payload config: database, storage, localization, email, access control.
3. Collections, globals, blocks, migrations.
4. Design system: tokens, typography, base components.
5. Public site: layouts, all page templates, i18n routing, RTL.
6. Conversion layer: forms, WhatsApp, tracking, Server Actions, email.
7. SEO layer: metadata, JSON-LD, sitemap, robots, breadcrumbs.
8. Seed script: navigation, settings, and clearly-marked placeholder pages.
9. README + deployment guide + tracking documentation.
10. Local verification, then deployment testing against production.
