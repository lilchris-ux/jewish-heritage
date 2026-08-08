# Start here — getting the site online

Written for someone who has never deployed a website. No terminal required.

You need **two free accounts**: Neon (the database) and Netlify (the hosting).
Everything else is optional and can wait until the site is already live.

Total time: about 15 minutes.

---

## Step 1 — Neon (the database)

This is where tours, pages and inquiries are stored. It has to exist before
anything else, because the site has nowhere to keep data without it.

1. Go to **https://neon.tech** and click **Sign up**. Signing in with GitHub is
   the quickest route.
2. It will offer to create a project. Accept the defaults and click
   **Create project**. Any region is fine; one close to Morocco or Europe is
   marginally faster.
3. You will land on a page showing a **connection string**. It looks like:

   ```
   postgresql://neondb_owner:AbC123@ep-cool-name-12345-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

4. **Check it contains the word `-pooler`.** If there is a dropdown labelled
   *Pooled connection* or a **Pooled connection** toggle, switch it on. This
   matters: the non-pooled string will cause errors under real traffic.
5. Copy that whole string somewhere safe. This is your **`DATABASE_URI`**.

---

## Step 2 — Netlify (the hosting)

1. Go to **https://netlify.com** and sign up **with GitHub**, so it can see
   your repositories.
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub**, then authorise Netlify if it asks.
4. Pick the repository **`jewish-heritage`**.
5. On the settings screen:
   - **Branch to deploy** — choose `claude/jewish-heritage-morocco-site-a8epp8`
   - **Build command** and **Publish directory** — leave them exactly as they
     are. The repository already tells Netlify what to do.
6. Find **Add environment variables** on that same screen and add these two:

   | Key | Value |
   |---|---|
   | `DATABASE_URI` | the Neon string from Step 1 |
   | `PAYLOAD_SECRET` | the long random value you were given |

7. Click **Deploy**.

The first build takes roughly three to five minutes. It is normal for it to sit
on "Building" for a while.

---

## Step 3 — Your admin account

1. When the deploy finishes, Netlify shows a URL like
   `https://sparkly-name-123456.netlify.app`. Copy it.
2. Visit that URL with **`/admin`** on the end:
   `https://sparkly-name-123456.netlify.app/admin`
3. Because nobody has ever logged in, it offers to **create the first user**.
   That is you. Use a real email and a strong password.
4. You are now in the CMS.

**This is the moment that matters.** If you can log in here, the thing that
broke on your previous site is working.

---

## Step 4 — Tell the site its own address

1. In Netlify, go to **Site configuration → Environment variables**.
2. Add one more:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SERVER_URL` | your full site URL, no slash at the end |

   For example `https://sparkly-name-123456.netlify.app`
3. Go to **Deploys** and click **Trigger deploy → Deploy site**.

This makes search-engine tags and language links point at the right place. The
site works without it, but do it before showing anyone.

---

## You are live

Everything below is optional and can be done any time.

---

## Later: image uploads

Until you do this, you cannot upload photographs. Everything else works.

You need a **Cloudflare** account (free) with an **R2** bucket, then add these
in Netlify exactly as in Step 2:

`S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION` (use
`auto`), `S3_ENDPOINT`, `NEXT_PUBLIC_S3_PUBLIC_URL`

**The part people miss:** in the bucket's **Settings → CORS policy**, paste
this, with your real address:

```json
[{ "AllowedOrigins": ["https://yourdomain.com"],
   "AllowedMethods": ["PUT", "GET"],
   "AllowedHeaders": ["*"] }]
```

Without it, uploads fail with an error message that explains nothing.

Full detail is in [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## Later: email notifications

To be emailed when an inquiry arrives, create a free **Resend** account, verify
your domain, then add `RESEND_API_KEY`, `EMAIL_FROM` and `INQUIRY_NOTIFY_TO`.

Inquiries are saved in the CMS either way — email is only a convenience, and
nothing is lost without it.

---

## Later: your own domain

In Netlify, **Domain management → Add a domain**, then follow its DNS
instructions. HTTPS is set up automatically. Afterwards update
`NEXT_PUBLIC_SERVER_URL` to the new address and redeploy.

---

## If something goes wrong

| What you see | What it means |
|---|---|
| Build fails mentioning `DATABASE_URI` or Postgres | The Neon string is wrong, or is the non-pooled one. Recopy it. |
| `/admin` shows a 500 error | `PAYLOAD_SECRET` is missing or was pasted with a stray space. |
| Build fails and the log mentions `migrate` | Same as the first row — it cannot reach the database. |
| Uploads fail silently | The R2 CORS rule is missing or has the wrong address. |

Copy the failing part of the Netlify build log and send it over — the error
text says exactly what is wrong.
