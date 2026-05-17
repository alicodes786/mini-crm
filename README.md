# Mini CRM (PropPilot take-home)

Minimal multi-tenant lead inbox: public form per agency slug, agent login, `/inbox` with realtime updates.

Stack:
- Vite + React + TypeScript
- TailwindCSS
- Supabase (Auth, Postgres, RLS, Realtime)
- React Router

This project was built from a basic Vite scaffold (`npm create vite`) and extended with Supabase integration, routing, and realtime functionality.

---

## Run locally

1. **Node 18+ recommended**
2. Copy environment file:cp .env.example .env
3. Set environment variables:
- `VITE_SUPABASE_URL` = Supabase project URL (no `/rest/v1`)
- `VITE_SUPABASE_ANON_KEY` = Supabase anon key
4. Run database setup:
- Execute `supabase/schema.sql` in Supabase SQL editor
- If agencies are not visible from public route, run `supabase/fix-agencies-public-read.sql`
5. Install dependencies: npm install
6. Start development server: npm run dev


---

## RLS and the two audiences

This system has two distinct user types:

### 1. Anonymous users (public form)
- Access `/c/:agencySlug`
- Can submit a lead (name, email, message)
- Cannot read any data

**How it works:**
- The agency is resolved from the URL slug and mapped to `agency_id`
- The contact is inserted with the correct `agency_id` so it is always bound to the correct tenant
- This ensures users cannot inject leads into other agencies

---

### 2. Authenticated agents
- Access `/inbox`
- Can view and update only their own agency’s contacts

**How it works:**
- `profiles` maps `auth.uid()` → `agency_id`
- Supabase RLS enforces:
- SELECT: only contacts where `contacts.agency_id = user.agency_id`
- UPDATE: same restriction applies

All tenant isolation is enforced at the database level via RLS, not in frontend code.

---

## Avoiding duplicate rows (initial fetch + realtime)

Contacts are first loaded via an initial query, then updated in real-time using Supabase subscriptions.

To prevent duplicates:
- Each contact is uniquely identified by its `id`
- Incoming realtime INSERT events are merged into state only if the `id` does not already exist
- This avoids duplication caused by overlapping initial fetch + realtime events or React re-subscriptions

The list is kept sorted by `created_at` in descending order.

---

## What we left out (and why)

To keep the scope aligned with the take-home requirements:

- No pagination or search — not required in spec
- No onboarding flow — agents are pre-created for demo purposes
- No notifications or analytics — focus is on core inbox + RLS + realtime behavior
- No complex UI system — kept intentionally minimal to prioritize correctness and speed

---

## Where AI helped vs challenges

### Helped:
- Rapid scaffolding of Vite + Supabase + Tailwind setup
- Generating initial RLS patterns and data model structure
- Implementing realtime subscriptions and merge logic
- Debugging Supabase integration issues during setup

### Challenges:
- Initial RLS setup required iteration to correctly enforce tenant isolation
- Realtime merging needed refinement to avoid duplicate events in React state
- Some boilerplate was simplified to keep the codebase readable and focused

---

## Deliverables checklist

| Item | Value |
|------|------|
| GitHub repo | https://github.com/alicodes786/mini-crm |
| Deployed URL | https://mini-crm-iota-seven.vercel.app/ |


Each demo user is linked to a different `agency_id` via the `profiles` table to verify tenant isolation.

---

## Final note

This project focuses on:
- correct multi-tenant isolation
- secure data access via RLS
- realtime updates
- minimal and functional UI

No additional features were added beyond the scope of the assignment.