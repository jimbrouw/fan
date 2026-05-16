# Task Handover

## Finished

- Shifted Kitface from the previous warm editorial keepsake direction to the new `BRANDING.md` system: official football media, light broadcast canvas, deep indigo ink, cyan CTA accents, and translucent lime/cyan/blue/violet gradient beams.
- Restyled shared chrome and the main app flow across `/`, `/capture`, `/review`, `/create`, `/generating/[jobId]`, and `/result/[jobId]` so the UI no longer depends on old `--mist`, `--accent-green`, paper, sage, burgundy, or serif-era tokens.
- Updated homepage copy and poster preview language to “official football media” and removed leftover “made to keep” / “matchday memories” wording from the live hero.
- Updated generated-poster prompt direction toward clean light football broadcast composition while preserving identity, kit accuracy, VS side separation, and `[img1]` / `[img2]` prompt separation.
- Added toggleable Kitface brand placement mode via `KITFACE_BRAND_PLACEMENT_MODE=kitface`: replaces main shirt sponsors with `kitface.app` and adds subtle pitch-side LED boards, while `original` mode keeps real kit sponsors.
- Added Google auth flow, auth callback hardening, user/profile preference setup, notification routes, in-app notification bell, email notification records, and future push-notification preference plumbing.
- Added poster correction, video animation jobs, video webhook/status/file routes, and result-page image/video sharing actions.
- Improved the generating screen with clearer loading copy, notification preference controls, and localhost-only `Regenerate test` controls for iteration.
- Added `gpt-image-2-fast` MuAPI mapping for low-cost 1K/low-quality test generations while keeping `gpt-image-2` at 2K/high-quality settings.
- Added compatibility fallbacks for local Supabase schemas that are missing newer `user_id` columns or notification/profile tables, so testing can continue before migrations are applied.
- Reworked SVG poster previews to use a light base, translucent diagonal ramp beams, indigo text, and club colours as content accents.
- Added Printful draft-order fulfillment plumbing from the previous in-progress work and kept result-page sharing via `/api/jobs/[jobId]/image`.
- Ignored generated prompt-output folders (`Prompts-vs/`, `test-images/`) so regenerated demo prompt packs do not enter source control by accident.
- Added back-facing camera flip button (↔) on `/capture`: switches between `user` and `environment` facing modes, removes mirror flip for back camera. Pending real-device test for stream switching and image orientation.
- Added optional shirt name and team slogan fields on `/create`, flowing through `buildPosterPrompt` as a `PERSONALISATION` section. Pending live generation test to verify model adherence.
- Added accessibility/mobility-aid checkbox on `/create`: when checked, injects an `ACCESSIBILITY` section into the poster prompt instructing the model to represent the fan naturally with their wheelchair or mobility aid — no forced standing or running poses. Optional free-text detail field expands when checked.
- Verified this commit with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`.

## Next

### UI fixes (high priority — broken or confusing)
1. **Fix kit preview on homepage** — kit preview graphic is broken; replace abstract icon with a working visual that matches the electric football broadcast look.
2. **Fix camera layout on iPhone** — `/capture` is too tall for phone screens and layout jumps as state changes. Pin shutter button to bottom, lock viewport height, prevent scroll, keep controls stable throughout capture → retake → use-photo flow.
3. **Simplify onboarding** — flow must be understandable to a first-timer with no context. Audit every screen for jargon, reduce steps, add plain-language labels and hints. Target: a 6-year-old could follow it.

### Notifications
4. **Pick email provider and wire up** — no provider chosen yet. Options: Resend (simple, good Next.js DX), SendGrid, Postmark. Pick one, add API key to env, send a real completion email when generation finishes. Hook into existing notification record insert.
5. **Pick push provider and wire up** — no push service chosen. Options: web-native Push API + VAPID keys (free, no third party), or OneSignal/Notix (managed). VAPID approach: generate keys, store subscription in `user_notification_preferences`, send push from server on job completion.

### Analytics
6. **Add generation analytics** — log each poster generation to an analytics table or service: user id, team, model, kit variant, timestamp, success/fail. Goal: know which teams and modes get used. Options: Supabase table (already available) or Vercel Analytics + custom events. Use Supabase table first — no extra service needed.
7. **User history page** — Google login exists; add a `/history` page showing the logged-in user's past generations with thumbnail, team, and date. Data already in `generation_jobs` table filtered by `user_id`.

### Rate limiting
8. **Rate limit `/api/generate` per user** — tie to Google login (user id). Limit: e.g. 5 generations per hour per user while testing. Use Supabase to count recent jobs for the user before accepting new submission. Return 429 with clear message if exceeded.

### Monetization groundwork
9. **Design credit/paywall model** — still in testing phase, but define: free tier limit (e.g. 3 free posters), paid tier unlock mechanism, where credit balance lives (Supabase `users` table), and which flow enforces it. No Stripe integration yet — just document the model and add the balance field to schema so it's ready.

### Existing backlog
10. Test end-to-end poster generation with real MUAPI, Supabase, and Football Data credentials.
11. Apply latest `supabase/schema.sql` to live project so notifications, video_jobs, and generation_jobs.user_id exist without fallbacks.
12. Verify webhook completion, `/result/[jobId]`, native sharing, notification records, and Printful draft-order path on deployed URL.
13. Smoke test VS mode with uploaded opponent photo.
14. Test `KITFACE_BRAND_PLACEMENT_MODE=kitface` vs `original` on real generations using `gpt-image-2-fast`.
15. Live camera walkthrough on real phone on secure URL.
16. Tighten photo privacy: private Supabase bucket, signed URLs to providers, retention window.
17. Fix result downloads to include Kitface watermark overlay.
18. Fix WhatsApp sharing to use public URL, not localhost.
19. Decide: keep CSS hero poster preview or replace with real generated image.

## Blockers

- Live generation verification depends on valid `.env.local` credentials and provider access.
- The local/live Supabase schema may be behind `supabase/schema.sql`; compatibility fallbacks are in code, but notifications, user history, and video ownership require the migration.
- Live team-news verification depends on `FOOTBALL_DATA_API_KEY`; without it, the API intentionally falls back to team-only notes.
- Real camera verification needs a secure device/browser path when testing outside localhost.
- Printful verification requires valid Printful credentials and a confirmed catalog variant mapping.
