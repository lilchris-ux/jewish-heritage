# Deployment

From an empty Netlify account to a live site with a working CMS. Roughly 20–30
minutes, all of it clicking through dashboards — no servers, no SSH.

## 1. Database — Neon

1. Create an account at https://neon.tech and start a project.
2. Copy the **pooled** connection string (the one containing `-pooler`). The
   pooled string is what makes the database safe under serverless concurrency,
   where each function invocation may open its own connection.
3. Save it as `DATABASE_URI`.

## 2. File storage — Cloudflare R2

1. In the Cloudflare dashboard, create an **R2** bucket.
2. Create an **S3 API token** with read and write access. Note the access key
   ID, the secret access key, and your account endpoint, which looks like
   `https://<account-id>.r2.cloudflarestorage.com`.
3. **Add a CORS rule to the bucket** allowing `PUT` and `GET` from your site's
   domain. This step is not optional: uploads go directly from the browser to
   R2, and without the rule every upload fails with an opaque browser error.

   ```json
   [
     {
       "AllowedOrigins": ["https://www.yourdomain.com"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

4. Optionally connect a custom domain such as `media.yourdomain.com` and use it
   as `NEXT_PUBLIC_S3_PUBLIC_URL`.

## 3. Secret

```sh
openssl rand -hex 32
```

Save the output as `PAYLOAD_SECRET`. Changing it later invalidates every
existing login session.

## 4. Netlify

1. **Add new site → Import an existing project**, and choose this repository.
2. Netlify reads `netlify.toml`, so the build command and publish directory are
   already correct. Leave them alone.
3. Add the environment variables below under **Site configuration →
   Environment variables**.
4. Deploy.

| Variable | Value |
|---|---|
| `DATABASE_URI` | Neon pooled connection string |
| `PAYLOAD_SECRET` | The generated secret |
| `NEXT_PUBLIC_SERVER_URL` | Your final site URL, no trailing slash |
| `S3_BUCKET` | R2 bucket name |
| `S3_ACCESS_KEY_ID` | R2 access key |
| `S3_SECRET_ACCESS_KEY` | R2 secret |
| `S3_REGION` | `auto` |
| `S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `NEXT_PUBLIC_S3_PUBLIC_URL` | Public bucket or custom media domain |

## 5. First login

Visit `https://your-site.netlify.app/admin`. Because the users table is empty,
Payload shows a create-first-user screen. Set your own password there — no
credentials ship in this repository.

Then create accounts for the client and the marketing agency from inside the
admin panel, choosing the appropriate role for each. They never need access to
Netlify, Neon or Cloudflare.

## 6. Custom domain

Add the domain in Netlify under **Domain management** and point DNS as
instructed. HTTPS is provisioned automatically. Afterwards, update
`NEXT_PUBLIC_SERVER_URL` and the R2 CORS rule to the real domain.

## Deploy previews

Preview deploys share the production database unless you give them their own.
Use Neon's branching feature and set a different `DATABASE_URI` for the deploy
preview context, so previews cannot write into live data.

## Roles

| | Super Admin | Client Admin | Editor |
|---|:--:|:--:|:--:|
| Create and edit content | yes | yes | yes |
| Publish and unpublish | yes | yes | no |
| Delete content | yes | yes | no |
| Manage users | yes | no | no |

Publishing is blocked server-side, not merely hidden in the interface, so the
restriction holds against direct API calls too.

## Troubleshooting

**Build fails on `payload migrate`.** `DATABASE_URI` is missing or wrong.
Confirm it is the pooled string and that the Neon project is awake.

**`/admin` returns 500.** Almost always a missing `PAYLOAD_SECRET`.

**Uploads fail silently in the admin panel.** The R2 CORS rule is missing or
lists the wrong origin. See step 2.
