# Jewish Heritage Morocco

A Jewish heritage travel platform for Morocco: a premium public website plus a
production CMS at `/admin`, deployed to Netlify from this repository.

**Status: Stage 1 of 10.** The foundation is built and verified — Next.js +
Payload, the Tours model, role-based access, and trilingual content. The
remaining collections, page templates and conversion features follow in later
stages. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full plan.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 + React 19 + TypeScript |
| CMS | Payload 3 — runs inside the Next.js app, not beside it |
| Database | Neon serverless Postgres |
| File storage | Cloudflare R2 via the S3 adapter |
| Styling | Tailwind CSS v4 |
| Hosting | Netlify |

The admin panel, the content API and the public site are one application and
one deploy. There is no separate backend to deploy, which is the structural
reason `/admin` cannot work locally but break in production.

## Local development

```sh
cp .env.example .env      # then fill in DATABASE_URI and PAYLOAD_SECRET
npm install
npm run dev
```

Open http://localhost:3000/admin and create the first user. Leave the `S3_*`
variables blank locally and uploads fall back to disk automatically.

`PAYLOAD_SECRET` can be generated with `openssl rand -hex 32`.

## Deploying to Netlify

Step-by-step instructions, including the accounts to create and the exact
values to paste, are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

In short: create Neon, R2 and Netlify accounts, import this repo into Netlify,
paste the environment variables, deploy, then visit `/admin` and create the
super-admin account.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run ci` | What Netlify runs: migrations, then build |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after schema edits |
| `npm run generate:importmap` | Regenerate the admin import map |
| `npm run migrate:create` | Create a SQL migration from config changes |

## Schema changes

Locally, Payload pushes schema changes straight to your database. For
production, generate a migration and commit it:

```sh
npm run migrate:create
```

Netlify runs `payload migrate` before every build, so production schema never
drifts and is never altered automatically.

## Content principles

Two rules are enforced by the data model rather than by convention:

- **Alt text is required** on every uploaded image.
- **Prices are opt-in.** A tour shows "Request a quote" until someone
  explicitly enables `showPrice`, so an unpriced tour can never render an empty
  or invented figure.

Anywhere real content has not been supplied, the site shows a clearly marked
`[PLACEHOLDER — client to supply]`. Nothing is invented.
