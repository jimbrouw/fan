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

1. Test an end-to-end poster generation with real MUAPI, Supabase, and Football Data credentials.
2. Apply the latest `supabase/schema.sql` to the live Supabase project so `users`, `user_notification_preferences`, `notifications`, `video_jobs`, and `generation_jobs.user_id` exist without compatibility fallbacks.
3. Verify webhook completion updates, `/result/[jobId]`, native image/video sharing, notification records, and the Printful draft-order path on a deployed URL.
4. Smoke test `/create` VS mode with an uploaded `opponent_front` image and confirm the generated payload contains the correct home/away teams, kit variants, and second-person source.
5. Test `KITFACE_BRAND_PLACEMENT_MODE=kitface` against real generations and compare with `original` sponsor mode before making a product decision. Use `gpt-image-2-fast` for cheap proofing where quality is not the target.
6. Do a live camera walkthrough on an actual phone against a secure local or deployed URL to check camera permissions, framing, and capture ergonomics.
7. Tighten photo privacy before using strong “private photos” claims: move captures to a private Supabase bucket, send providers short-lived signed URLs, and consider deleting captures after generation or a retention window.
8. Redesign the abstract homepage/flow icon artwork, especially the kit preview graphic, because the current icons feel too abstract and do not match the official electric football broadcast design brief. Replace with clearer football-media visuals that feel integrated with the Kitface UI.
9. Redesign the `/capture` camera page for iPhone-sized screens: clean up the shutter/retake/use-photo controls, keep the camera button fixed and visible as UI state changes, prevent layout jumps when preview/status elements update, and make the full capture workflow fit without forcing the user to scroll to reach the camera icon.
10. Make the generating-page email and push notifications actually work instead of showing unavailable/off states: wire up user preferences, browser permission flow, push subscription handling, email delivery provider, completion triggers, and failure feedback.
11. Fix result downloads so the saved poster image includes the Kitface watermark/branding overlay, not just the raw provider output.
12. Fix WhatsApp/result sharing so it shares a usable public image or public result URL, not a `localhost` URL that only works on the developer machine.
13. Add an inclusive option for disabled people: support accessibility-aware capture guidance, UI controls, and prompt language so disabled fans can be represented naturally in posters without being excluded, distorted, or forced into unrealistic athletic poses.
14. Decide whether the CSS hero poster preview should remain or be replaced with a generated/photographic brand asset.
15. Add Facebook login as an optional Supabase auth provider: configure the Meta app, add the Supabase callback URL, enable Facebook in Supabase, and add a Facebook sign-in button on `/login`.

## Blockers

- Live generation verification depends on valid `.env.local` credentials and provider access.
- The local/live Supabase schema may be behind `supabase/schema.sql`; compatibility fallbacks are in code, but notifications, user history, and video ownership require the migration.
- Live team-news verification depends on `FOOTBALL_DATA_API_KEY`; without it, the API intentionally falls back to team-only notes.
- Real camera verification needs a secure device/browser path when testing outside localhost.
- Printful verification requires valid Printful credentials and a confirmed catalog variant mapping.
