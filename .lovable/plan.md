
## Scope

Port the uploaded `kpb-agent-programme-bolt` app into this Lovable project. Source: Vite + React Router 7 + Supabase, 13 pages, agent/commercial/admin role dashboards, quiz flow, leaderboard, referral leads, round-robin lead assignment, ~4,500 lines of TSX + 11 SQL migrations. Target stack: TanStack Start + Tailwind 4 + Lovable Cloud (Supabase-backed).

## Step 1 — Backend (Lovable Cloud)

1. Enable Lovable Cloud.
2. Concatenate the 11 source SQL files in `supabase/migrations/` (in filename order) into a single new migration in this project, with these adaptations:
   - Add explicit `GRANT` blocks after every `CREATE TABLE public.*` (source assumed Supabase defaults).
   - Keep the existing `profiles.role` design from the source (the app reads it directly across all dashboards). Document it as legacy — moving to a `user_roles` table would mean rewriting all RLS policies and dashboard queries.
   - Replace the manual `update profiles set role = ...` seed step with admin promotion done via a one-off server function (calling user must already be admin), since we cannot hardcode staff emails in a public app.
3. Confirm the generated `src/integrations/supabase/types.ts` matches.

## Step 2 — Design system (Tailwind 4)

Source uses Tailwind 3 with a custom `navy` (50–950) + `gold` (50–900) palette and `font-display`/`font-sans`. Re-express as oklch CSS variables in `src/styles.css`:
- `--background` → navy-950, `--foreground` → near-white, `--primary` → gold, `--card` → navy-900, plus `--navy-*` and `--gold-*` scales for parity with existing component classes (`bg-navy-900`, `text-gold-400`, etc.).
- Map the scales into `@theme inline` so `bg-navy-900` / `text-gold-500` keep working without per-component rewrites.
- Install `@fontsource/inter` + a display font and import in `src/start.ts`.

## Step 3 — Routing (flat → TanStack file-based)

Move each `src/pages/*.tsx` to `src/routes/*.tsx` with `createFileRoute`. Mapping:

```text
LandingPage         → src/routes/index.tsx
CandidaterPage      → src/routes/candidater.tsx
RejoindrePage       → src/routes/rejoindre.tsx
ConfidentialitePage → src/routes/confidentialite.tsx
LoginPage           → src/routes/login.tsx
ForgotPasswordPage  → src/routes/mot-de-passe-oublie.tsx
ResetPasswordPage   → src/routes/reinitialiser-mot-de-passe.tsx
QuizPage            → src/routes/_authenticated/quiz.tsx
ResultatPage        → src/routes/_authenticated/resultat.tsx
DashboardPage       → src/routes/_authenticated/dashboard.tsx
CommercialPage      → src/routes/_authenticated/commercial.tsx
AdminPage           → src/routes/_authenticated/admin.tsx
NotFoundPage        → root notFoundComponent (already wired)
```

Auth is enforced by the integration-managed `_authenticated/route.tsx` layout. Role gating (agent vs commercial vs admin) moves from `<ProtectedRoute allowedRoles>` to a small in-component check using the `profiles.role` value loaded from Lovable Cloud — unauthorized roles get redirected to `/dashboard` (their default).

## Step 4 — Auth, hooks, and components

- Replace `src/lib/supabase.ts` and `src/hooks/useAuth.tsx` with usage of `@/integrations/supabase/client` (browser) and a small `useAuth` hook that subscribes to `onAuthStateChange` and reads the profile row.
- Replace `useToast` shim with `sonner` (already in template).
- Move components verbatim where possible:
  - `src/components/agent/*` → `src/components/agent/*`
  - `src/components/commercial/*` → `src/components/commercial/*`
  - `src/components/quiz/*` → `src/components/quiz/*`
  - `src/components/layout/NavBar.tsx` → kept; rewritten links to TanStack `<Link>`. `AppLayout` becomes part of `__root.tsx`. `ProtectedRoute` deleted.
- Swap `react-router-dom` imports (`Link`, `useNavigate`, `Navigate`, `useLocation`) for `@tanstack/react-router` equivalents across all files.
- Keep `quiz-data.ts`, `utils.ts`, `types/index.ts` unchanged.

## Step 5 — Verification

- Run the build (auto), fix typecheck/route errors.
- Smoke test: load `/`, `/candidater`, `/login`. Sign up an agent, run the quiz, view `/dashboard`. Promote a user to `commercial` via SQL and verify `/commercial` renders. Same for `admin` → `/admin`.

## Out of scope / explicit decisions

- Not migrating `profiles.role` to a dedicated `user_roles` table. The source app reads `role` from `profiles` in many places; moving it would be a separate refactor that the user can request afterward.
- Not porting the legacy `base docs/kpb_supabase_setup.sql` (README marks it as reference only).
- Not setting up React Helmet — using TanStack route `head()` per page.
- Not preserving the source's "Missing Supabase Config" splash — Lovable Cloud injects env vars automatically.
- Keeping the existing French UI copy as-is.

## Effort

This is a large port. I'll do it in one continuous pass and report back when the build is green and the main flows render. Expect 30–60 minutes of tool activity.
