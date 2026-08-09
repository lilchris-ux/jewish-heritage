# Handoff to a local agent

Written for a Claude Code instance running on the owner's own machine, with
filesystem and browser access. It replaces the conversation that produced this
repository — you should not need any of that history.

---

## 1. What this is

A Jewish heritage travel platform for a Morocco-based tour operator: a premium
public website in three languages plus a production CMS at `/admin`, designed
for Netlify from the first line.

The owner's previous attempt had a React frontend with a Python backend. The
frontend deployed; the admin panel never worked in production. Avoiding a
repeat of that is the single most important constraint on this project.

## 2. Stack, and why

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js **16** | Payload 3.87 peer range excludes Next 15.5.x |
| CMS | Payload 3 | Installs *into* the Next app — `/admin` and `/api` are routes in the same build, so there is no second thing to deploy |
| Database | Neon Postgres | Serverless-friendly pooling |
| Storage | Cloudflare R2 via `@payloadcms/storage-s3` | `@payloadcms/storage-r2` binds to Workers and does **not** work on Netlify |
| Email | Resend, called over `fetch` | No SDK dependency |
| Styling | Tailwind v4, logical properties | Hebrew RTL works without a second stylesheet |

Languages: English at the root, French and Hebrew prefixed (`/fr`, `/he`),
Hebrew right-to-left, untranslated fields falling back to English.

## 3. Current state

**The application is complete.** It has never been deployed.

Verified locally against a real Postgres instance and headless Chromium:

- `payload migrate` builds **113 tables** on an empty database
- `/admin` shows the create-first-user screen on a fresh database
- Tour create → publish → public page render, including slug generation
- Edits propagate; unpublishing removes the page from the public site
- French locale writes; Hebrew falls back to English
- An editor is blocked from publishing; anonymous users see no drafts
- Inquiry form submitted in a real browser lands in the CMS with UTM
  attribution intact
- `GET` and `POST /api/inquiries` both return 403
- All routes 200 across three locales; `/nope` 404s
- 24-URL trilingual sitemap, valid `robots.txt`, canonicals, hreflang with
  `x-default`
- Production build passes with all locales prerendered

**Not verified:** image uploads. They need real R2 credentials. The code sets
`clientUploads: true` — mandatory on Netlify, whose function bodies cap around
4.5MB after base64 — but nobody has uploaded a file yet.

## 4. Known gaps — do not assume these are done

1. **Cloudflare Turnstile is not implemented.** `.env.example` lists
   `TURNSTILE_*` and the architecture doc promises it. The form actually has a
   honeypot field, a 3-second timing trap and Zod validation. Those work but
   are weaker than Turnstile. The env vars are currently unused.
2. **No automated tests.** Verification was done by scripts written and
   discarded during the build.
3. **Deploy previews share the production database** unless Neon branching is
   configured with a separate `DATABASE_URI` for the preview context.
4. **Seeding needs a terminal.** `npm run seed` cannot be triggered from the
   browser. Consider a protected route if the owner wants that.
5. **No live preview** for drafts; the config references a preview URL but the
   draft-token route was not built.

## 5. Traps already hit — do not rediscover these

- **`robots.ts` does not work inside a route group.** It silently produces no
  route. It lives at `src/app/robots.ts`, outside `(frontend)`, deliberately.
  `sitemap.ts` *does* work inside the group. Do not "tidy" robots.ts into it.
- **Next 16 changed `revalidateTag`** to require a cache-profile second
  argument. Revalidation here is path-based (`src/hooks/revalidate.ts`) and
  wrapped in try/catch so CLI scripts calling the same hooks do not crash.
- **`package.json` must keep `"type": "module"`.** Without it the Payload CLI
  dies with `ERR_REQUIRE_ASYNC_MODULE`.
- **Never declare `_status` by hand** on a collection with
  `versions: { drafts: true }`. Payload owns that field; a manual declaration
  collides on the Postgres enum and Payload will not start. Publishing
  permission is enforced by `src/hooks/publishGuard.ts` instead — which is
  stronger anyway, since it also covers REST and GraphQL.
- **The build needs database access**, because pages are prerendered. A build
  with an unreachable database fails by design.

## 6. Content rules — these are hard requirements

The owner was explicit, repeatedly: **invent nothing.** No tours, prices,
dates, testimonials, reviews, awards, years of experience, visitor numbers,
partnerships or historical claims.

Anything not supplied is written as `[PLACEHOLDER — client to supply]`.

Two rules are enforced by the schema rather than by convention:

- `media.alt` is **required** — no image can ship without alt text.
- `tours.showPrice` defaults to **off** — an unpriced tour renders
  "Request a quote" rather than an empty or invented figure.

`heritage-sites.historicalSources` exists so historical claims can be cited.
Encourage its use; do not write history without it.

## 7. What the owner needs next, in order

They are not a developer. Prefer doing things for them over instructing them.

**You cannot create their accounts** — signup needs a human with an email
inbox. You *can* do everything after that.

1. **Neon** — they sign up at neon.tech and create a project. You need the
   **pooled** connection string (contains `-pooler`). The non-pooled one fails
   under load.
2. **Secret** — generate a fresh one: `openssl rand -hex 32`. Do **not** reuse
   any secret that appeared in a chat transcript.
3. **Netlify** — they sign up and connect GitHub. From there you can drive the
   CLI: `netlify link`, `netlify env:set`, `netlify deploy --build --prod`.
   Deploy branch is `claude/jewish-heritage-morocco-site-a8epp8`.
   Minimum variables for a first deploy: `DATABASE_URI`, `PAYLOAD_SECRET`.
   Add `NEXT_PUBLIC_SERVER_URL` once the URL exists, then redeploy.
4. **First login** — they visit `/admin` and create the super admin themselves.
   Never create it for them or set their password.
5. **Seed** — `npm run seed` against the production `DATABASE_URI` creates the
   page skeleton, navigation and settings. Placeholders only. Safe to re-run.
6. **R2** — optional until they want photographs. The CORS `PUT` rule on the
   bucket is the step everyone misses; without it uploads fail with an opaque
   browser error.

Storage, email and Turnstile variables are all conditional in the code: blank
means the feature switches off cleanly rather than breaking the build. A
two-variable deploy is a supported path, not a workaround.

## 8. Repository map

```
src/
  payload.config.ts      collections, localization, storage, database
  collections/           Tours, HeritageSites, Destinations, Experiences,
                         Posts, Categories, Faqs, Departures, Pages,
                         Inquiries, Media, Users
  globals/               SiteSettings (incl. WhatsApp number), Navigation
  blocks/                page-builder blocks for Pages
  access/roles.ts        super-admin | client-admin | editor
  hooks/                 publishGuard, revalidate
  actions/               submitInquiry server action
  components/            design system, forms, WhatsApp, JSON-LD
  lib/                   i18n, metadata, whatsapp, tracking, seo, slug
  app/(frontend)/[locale]/   public site
  app/(payload)/             /admin and /api
  app/robots.ts              must stay here, see §5
  migrations/            committed SQL — Netlify runs these at build
scripts/seed.mts
docs/  ARCHITECTURE.md  DEPLOYMENT.md  START-HERE.md  TRACKING.md  HANDOFF.md
```

## 9. Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local development |
| `npm run ci` | What Netlify runs: `payload migrate && next build` |
| `npm run seed` | Page skeleton, navigation, settings |
| `npm run generate:types` | After any schema change |
| `npm run generate:importmap` | After adding admin components |
| `npm run migrate:create` | New SQL migration — **commit it** |

After changing any collection: regenerate types, create a migration, commit it.
Production runs migrations only; it never alters its own schema.

## 10. Design

"Desert & Indigo" — indigo `#22346E` / `#131E44` on warm sand `#FAF6EF` /
`#F3EDE1`, with terracotta `#B5502F` and brass `#9A7838` as restrained accents.
Fraunces + Inter for Latin, Frank Ruhl Libre + Heebo for Hebrew, loaded per
locale so English visitors never download Hebrew glyphs. Tokens are in
`src/app/(frontend)/styles.css`.

Keep ornament at the edges; photography carries the design. No animation
library.
