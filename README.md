# Mini CRM (PropPilot take-home)

Minimal multi-tenant lead inbox: public form per agency slug, agent login, `/inbox` with realtime updates. **Starter:** generic Vite scaffold (`npm create vite` → React + TypeScript), then Tailwind, Router, and Supabase wired in—not a copied full template repo.

## Run locally

1. **Node** 18+ recommended.
2. Copy env: `cp .env.example .env` (Windows: copy the file manually).
3. Set **`VITE_SUPABASE_URL`** to your **Project URL** only, e.g. `https://xxxx.supabase.co` — **do not** append `/rest/v1`.
4. Set **`VITE_SUPABASE_ANON_KEY`** (Dashboard → Project Settings → API → anon key).
5. In Supabase **SQL Editor**, run `supabase/schema.sql` once (policies, function, realtime). If public `/c/:slug` shows “agency not found” while rows exist, run `supabase/fix-agencies-public-read.sql`.
6. `npm install` → `npm run dev` → open the printed localhost URL.

## RLS and the two audiences

| Audience | What they do | How it’s enforced |
|----------|----------------|-------------------|
| **Anonymous** (public form) | Load agency by slug; submit name / email / message | **`agencies`:** `SELECT` for `anon` so the slug lookup works. **`contacts`:** no broad anon `INSERT` that trusts client-supplied `agency_id` (that would let anyone POST leads into any tenant). Instead **`submit_public_contact(slug, …)`** is **`SECURITY DEFINER`**, resolves **slug → `agency_id` in SQL**, then inserts into **`contacts`**. |
| **Authenticated agents** | `SELECT` / `UPDATE` their agency’s contacts | **`profiles`** maps `auth.uid()` → **`agency_id`**. **`contacts`** RLS: `SELECT` and `UPDATE` only where `contacts.agency_id` equals that profile’s `agency_id`. No “security by filtering in React”—PostgREST only returns allowed rows. |

**Considered but not used:** raw anon `INSERT` on `contacts` with only `WITH CHECK (agency_id exists)`—that does **not** tie a submission to “this page’s slug,” so cross-tenant spam would be possible.

## Avoiding duplicate rows (initial fetch + realtime)

`useContacts` loads an ordered list, then subscribes to **`postgres_changes`** on **`contacts`** (filtered by `agency_id`). On **`INSERT`**, the handler merges the new row only if **`prev` does not already contain that `id`** (dedupe for races / StrictMode / duplicate events). On **`UPDATE`**, merge by `id` or append+sort if missing. List is kept sorted by **`created_at`** descending.

## What we left out (and why)

- **Sign-up / self-serve onboarding** — rubric only asks agent login; **`profiles`** are created administratively (SQL or dashboard).
- **Password reset, magic links, OAuth** — email/password only.
- **Pagination, search, exports, notifications** — not required; keeps scope to “inbox + status + realtime.”
- **Strict “anon-only SELECT by slug”** — we allow anon `SELECT` on all **`agencies`** rows (small table). Tightening to a single-row RPC would be easy but wasn’t required.

## Where AI helped vs hurt

- **Helped:** Faster wiring of Vite + Tailwind + Router + Supabase client/hooks; RLS/RPC shape for safe public submit; realtime merge/dedupe pattern; deploy snippets (`vercel.json`, Cloudflare `_redirects`).
- **Hurt / gotchas:** Early confusion if **`VITE_SUPABASE_URL`** included **`/rest/v1`** (PostgREST “invalid path”). If **`agencies`** has RLS on but **no** `anon` **`SELECT`** policy, the API returns **no rows without an error**, which looks like “slug not found”—documented in `fix-agencies-public-read.sql`.

---

## Deploy (GitHub → Vercel)

1. **GitHub**
   - Create a **new public** repo (no secrets in the repo).
   - In your project folder: `git init` (if needed), commit all files **except** `.env` (it should be gitignored).
   - Add remote, push: `git remote add origin https://github.com/YOU/REPO.git` → `git push -u origin main` (use `main` or `master` consistently).

2. **Vercel**
   - Sign in at [vercel.com](https://vercel.com) with GitHub.
   - **Add New Project** → **Import** that repo.
   - **Framework Preset:** Vite (auto-detected).
   - **Environment Variables** (required for Vite at **build** time):
     - `VITE_SUPABASE_URL` = `https://YOUR_REF.supabase.co` (no `/rest/v1`)
     - `VITE_SUPABASE_ANON_KEY` = anon key
   - Deploy. After the first deploy, changing env vars requires **Redeploy**.

3. **Smoke-test production**
   - Open `https://YOUR_VERCEL_APP.vercel.app/c/<slug>` and submit a lead.
   - Log in at `/login`, open `/inbox`, confirm realtime if possible.

`vercel.json` rewires all routes to `index.html` so React Router deep links (`/c/...`, `/inbox`) work on refresh.

---

## Deliverables checklist (for reviewers)

| Item | Your value |
|------|------------|
| **Public GitHub repo** | `https://github.com/YOU/REPO` *(replace)* |
| **Deployed URL** | `https://YOUR_APP.vercel.app` *(replace after deploy)* |
| **Demo account — Agency 1** | e.g. slug `first-one` — email: `…` password: `…` *(set in Supabase Auth; share securely with PropPilot)* |
| **Demo account — Agency 2** | e.g. slug `second-one` — email: `…` password: `…` |

Ensure each user has a row in **`profiles`** with the correct **`agency_id`**. Do **not** commit real passwords to this README—paste the table in your email/submission or use passwords you rotate after the review.
