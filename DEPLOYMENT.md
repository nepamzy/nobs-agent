# Go-Live Guide

A complete, ordered walkthrough to take NOBS AGENT from this folder to
a live URL. Follow it top to bottom — later steps depend on earlier ones.

Estimated time: 45–90 minutes, most of it waiting on account signups.

---

## What you'll need before starting

Free-tier accounts on all of these (no payment provider needed yet — that's
intentionally last):

| Service | Why | Cost to start |
|---|---|---|
| [GitHub](https://github.com) | Hosts the code, triggers deploys | Free |
| [Vercel](https://vercel.com) | Runs the site | Free |
| [Neon](https://neon.tech) or [Supabase](https://supabase.com) | Postgres database | Free |
| [Cloudinary](https://cloudinary.com) | Image/file uploads | Free |
| [Brevo](https://brevo.com) | Sends contact/booking/payment emails | Free (300/day) |
| [Paystack](https://paystack.com) | Deposit payments | Free to set up |
| A domain (optional) | e.g. from Namecheap, Porkbun, GoDaddy | ~$10–15/yr |

---

## Step 1 — Push the code to GitHub

```bash
cd nobs-agent
git init
git add .
git commit -m "Initial commit: NOBS AGENT"
```

Then either:
```bash
gh repo create nobs-agent --private --source=. --push
```
or manually: create an empty repo at github.com/new, then:
```bash
git remote add origin https://github.com/<your-username>/nobs-agent.git
git branch -M main
git push -u origin main
```

`.env.local` is git-ignored on purpose — you'll never commit real secrets.
`.env.example` **is** committed so the required variables are documented.

---

## Step 2 — Create the database (Neon)

1. neon.tech → sign up → **Create a project**.
2. Name it (e.g. `nobs-agent`), pick a region close to your users.
3. Once created, copy the **connection string** it shows you — it looks like:
   ```
   postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
   This is your `DATABASE_URL`. Save it somewhere for Step 6.

*(Supabase works identically if you'd rather use it — Settings → Database
→ Connection string.)*

---

## Step 3 — Create your Cloudinary account

1. cloudinary.com → sign up.
2. Your **Dashboard** immediately shows three values you need:
   - `Cloud name`
   - `API Key`
   - `API Secret` (click "reveal")
3. Save all three for Step 6. Nothing else to configure — the app signs
   its own uploads using these.

---

## Step 4 — Create your Brevo account

1. brevo.com → sign up (free tier: 300 emails/day).
2. Left sidebar → **SMTP & API** → **API Keys** → **Generate a new API key** → copy it. Save for Step 6.
3. Sending works immediately from Brevo's default sending domain. To send
   from your real domain (e.g. `no-reply@nobsagent.com`, matching what the
   code uses by default in `src/lib/brevo.ts`), verify a domain under
   **Senders, Domains & Dedicated IPs** — this can happen after launch,
   the site works either way.

## Step 4b — Create your Paystack Starter Business account

1. paystack.com → sign up → choose **Starter Business** (no CAC/company
   registration document needed — just a government ID, your personal bank
   account, and a bank confirmation letter).
2. Once activated, go to **Settings → API Keys & Webhooks** and copy your
   **Secret Key** and **Public Key**. Save for Step 6.
3. Note: Starter Business has a ₦2,000,000 *lifetime* collections cap —
   once total payments received hit that, you'll need to submit CAC
   documents to upgrade. Fine to start with, worth knowing about ahead of time.

---

## Step 5 — Generate your auth secret

Run locally:
```bash
openssl rand -base64 32
```
Copy the output. This is `AUTH_SECRET` — it signs login sessions. Treat it
like a password; never commit it.

---

## Step 6 — Import into Vercel and set environment variables

1. vercel.com → **Add New → Project** → import your GitHub repo.
2. Framework preset: Next.js (auto-detected — leave everything default).
3. Before clicking Deploy, expand **Environment Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | from Step 2 |
| `AUTH_SECRET` | from Step 5 |
| `NEXTAUTH_URL` | your Vercel URL, e.g. `https://nobs-agent.vercel.app` (update after custom domain in Step 9) |
| `CLOUDINARY_CLOUD_NAME` | from Step 3 |
| `CLOUDINARY_API_KEY` | from Step 3 |
| `CLOUDINARY_API_SECRET` | from Step 3 |
| `BREVO_API_KEY` | from Step 4 |
| `BREVO_SENDER_EMAIL` | e.g. `no-reply@nobsagent.com` |
| `PAYSTACK_SECRET_KEY` | from Step 4b |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | from Step 4b |
| `STUDIO_NOTIFICATION_EMAIL` | the inbox that should receive contact/booking notifications |
| `NEXT_PUBLIC_SITE_URL` | same as `NEXTAUTH_URL` for now |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | your WhatsApp number, digits only with country code, e.g. `2348012345678` |

4. Click **Deploy**. The `postinstall` script runs `prisma generate`
   automatically as part of the build — nothing extra needed for that.
5. Wait for the build to finish. If it fails, check **Deployment → Build
   Logs** — the most common cause is a missing/misspelled env variable.

Your site is now live at the Vercel URL, but the database is still empty
and unmigrated — pages will render, forms will fail until Step 7.

> **Note on Prisma version:** this project runs Prisma 7, which moved
> database connection settings out of `schema.prisma` and into
> `prisma.config.ts` at the project root (a change Prisma made in late
> 2025). You don't need to touch that file — it already reads
> `DATABASE_URL` from your `.env` automatically. Just know it's there if
> you're ever troubleshooting and wondering why the connection string
> isn't in the schema file itself.

---

## Step 7 — Run migrations and seed the database

From your own machine (not Vercel — it doesn't run this for you):

```bash
DATABASE_URL="<paste your Neon connection string>" npx prisma migrate deploy
DATABASE_URL="<paste your Neon connection string>" npm run prisma:seed
```

The seed creates:
- An admin login: `admin@nobsagent.com` / `ChangeMe123!`
- A sample client login: `client@gracecommunityschools.example` / `ChangeMe123!`
- One sample project, testimonial, blog post, and pricing plans

---

## Step 8 — Change the seeded admin password immediately

The seed password is public (it's in this guide). Before anyone else could
plausibly find your URL:

1. Go to `https://<your-site>/login`, sign in with the seeded admin credentials.
2. There's no self-service password change UI yet (see Security Hardening
   in the README's roadmap) — for now, change it directly in the database:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YOUR-NEW-PASSWORD', 12))"
   ```
   Then, using a Postgres client (Neon's SQL editor works fine) run:
   ```sql
   UPDATE "User" SET "passwordHash" = '<paste the hash above>'
   WHERE email = 'admin@nobsagent.com';
   ```
3. Delete or repurpose the sample client account the same way, or leave it
   — it can't reach `/admin`, only `/portal`.

---

## Step 9 — Custom domain (optional, can do anytime after launch)

1. Vercel → your project → **Settings → Domains** → add your domain.
2. Vercel shows you either an A record or a CNAME to add at your
   registrar (Namecheap, Porkbun, wherever you bought it). Add it there.
3. DNS can take a few minutes to a few hours to propagate.
4. Once it's live on the custom domain, go back to **Environment
   Variables** in Vercel and update `NEXTAUTH_URL` and
   `NEXT_PUBLIC_SITE_URL` to the real domain, then redeploy (Vercel →
   Deployments → ⋯ → Redeploy) so auth callback URLs and the sitemap match.

---

## Step 10 — Verify everything actually works

Go through this on the live URL, not localhost:

- [ ] Homepage loads, 3D hero renders, dark/light toggle works
- [ ] `/portfolio`, `/blog`, `/pricing`, `/clients`, `/testimonials` show the seeded content
- [ ] Submit `/contact` → email arrives at `STUDIO_NOTIFICATION_EMAIL` → message appears in `/admin/inquiries`
- [ ] Submit `/booking` → same check, appears in `/admin/bookings`
- [ ] Log in at `/login` with your **new** admin password → lands on `/admin`
- [ ] `/admin/content` → edit a field → homepage reflects it immediately
- [ ] `/admin/portfolio/new` → upload a cover image → it appears on the public `/portfolio` page
- [ ] Log out, log in with the client account → `/portal` shows the sample project
- [ ] `/sitemap.xml` and `/robots.txt` both load

If every box checks, the site is genuinely live — not just deployed.

---

## Ongoing workflow after launch

- Every push to `main` auto-deploys to production.
- Every pull request gets its own preview URL.
- `.github/workflows/ci.yml` runs lint/typecheck/build on every push and
  PR — a red check is a stop sign before merging, since Vercel will still
  deploy whatever's on `main` regardless.
- Schema changes: edit `schema.prisma` → `npx prisma migrate dev --name
  <change>` locally → commit → `DATABASE_URL="<prod-url>" npx prisma
  migrate deploy` before or right after the Vercel deploy that uses it.

---

## What "live" does and doesn't mean yet

After this guide, the site is genuinely live: real forms, real emails,
real admin editing, real client login, real image uploads. What it still
doesn't have — by design, per your call to build it last — is payment
checkout. `/pricing` and `/booking` work as lead-generation and scheduling
tools; nothing charges a card yet. Security hardening (2FA, automated
backups) is also still ahead. Both are next on the roadmap in the README.
