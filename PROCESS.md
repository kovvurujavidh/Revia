# Processing Notes
- Changes applied with metadata headers preserved
- All edits use 4-line header: Importers/Callers, Affected API, Data Schemas, User Verbatim Instruction
- If another AI continues: preserve these headers, never delete, build green first
- Env: .env.local contains live Supabase keys (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY)
- Brand: "Customer Return SaaS" -> "Revia" across all user-facing text
- Auth: clicking free trial or upgrade redirects to /auth/login first, then continue to onboarding
- Schema must be deployed: run `supabase/schema.sql` in Supabase SQL Editor before first use

## Latest: Dark Theme Redesign + Onboarding RLS Fix (Sep 2026)
- **Dark theme redesign**: All pages (landing, login, signup, onboarding, app header) now use premium dark theme (#09090b base) with purple/blue gradient accents, glassmorphism cards, and smooth animations.
- **Brand highlighting**: "Revia" name uses `brand-gradient-text` (purple-to-cyan gradient) in landing nav and app header for maximum visibility.
- **Overflow fixes**: Added `overflow-x-hidden` to body, `overflow-hidden` to landing page sections with absolute-positioned decorative elements (grid-bg, radial-glow). Inter font imported via next/font.
- **RLS fix for onboarding**: Created `/api/onboarding` server-side API route that uses service role key to bypass RLS when creating business + user records. This eliminates the "new row violates row-level security policy for table 'businesses'" error that occurred because the browser client had no established session during onboarding.
- **Signup session fix**: After server-side signup, client now calls `signInWithPassword()` to establish a browser session before redirecting to onboarding.
- **Animations**: Added fade-in, fade-in-up, slide-in, scale-in, float, pulse-glow, shimmer, and stagger animations in globals.css.
- **v1 backups**: Saved to `v1-backup/` folder (page, login, signup, onboarding, globals.css).
- Auth: email/password via Supabase Auth. Login auto-creates account if email not found. Signup uses server-side API to bypass rate limits.
- Onboarding: uses `getSession()` with `useEffect` mount check. Redirects to login if no session.
- Forgot Password: "Forgot Password?" link on login page sends reset email via server-side `/api/auth/reset`.
- Staff data isolation: each user only sees their own business data via RLS policies.
- Build passes clean.
