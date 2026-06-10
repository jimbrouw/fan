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
- Applied the live Supabase schema/credits migration via the Supabase SQL editor: `supabase/schema.sql` followed by `supabase/migrations/0001_add_credits_and_fix_drift.sql`. The editor reported success, so `generation_jobs.user_id`, `capture_sessions.user_id`, `users.credits`, credit RPCs, and `credit_purchases` should now exist live.
- Ignored generated prompt-output folders (`Prompts-vs/`, `test-images/`) so regenerated demo prompt packs do not enter source control by accident.
- Added back-facing camera flip button (↔) on `/capture`: switches between `user` and `environment` facing modes, removes mirror flip for back camera. Pending real-device test for stream switching and image orientation.
- Added optional shirt name and team slogan fields on `/create`, flowing through `buildPosterPrompt` as a `PERSONALISATION` section. Pending live generation test to verify model adherence.
- Added accessibility/mobility-aid checkbox on `/create`: when checked, injects an `ACCESSIBILITY` section into the poster prompt instructing the model to represent the fan naturally with their wheelchair or mobility aid — no forced standing or running poses. Optional free-text detail field expands when checked.
- Reduced the active capture flow to two photos and verified live that the app no longer asks for six captures.
- Verified live free-tier enforcement with a non-exempt user: after 3 generations, the app reached the out-of-credits/paywall state.
- Verified this commit with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`.
- Added 50k-user rollout safety assets: PR readiness CI, required AI architecture review gate, `/api/health` liveness/deep health endpoint, and `docs/production-readiness-50k.md` canary runbook.
- Tightened capture privacy plumbing: the Supabase capture bucket is now configured private, uploaded captures are stored as `supabase://bucket/path` references, provider/UI access uses short-lived signed URLs, and restored capture sessions re-sign URLs through an owner-checked API route.
- Result downloads now request the watermarked image route as an attachment, and WhatsApp sharing builds the image URL from `NEXT_PUBLIC_APP_URL` instead of localhost.
- Enabled GitHub branch protection for `main` on `jimbrouw/fan` requiring `quality gate` and `AI architecture review`, one approving review, stale-review dismissal, conversation resolution, and admin enforcement.
- Added `KITFACE_HEALTH_CHECK_SECRET` to Vercel Production and the `feat/football-waiting-messages` Preview branch.
- Tuned poster prompts so repeated same-person figures ask for more silly, memeable emotional variety while preserving identity: grin, roaring joy, badge-kiss pride/love, wild happiness, and comic mock-anger.
- Fixed MuAPI provider failure handling for image jobs: transient status-check failures no longer become terminal failed jobs, failed internal-provider states now show a clearer retry path, and normal `/create` jobs now submit GPT Image 2 at `final-2k-high` instead of unstable `final-4k-high`.
- Deployed the current verified build to Vercel Production with CLI `54.11.0`.
  - Live app: https://app.kitface.app
  - Latest production deployment: https://kitface-5e5qeu6wp-jims-projects-b7cb6c2e.vercel.app
  - Deployment inspect URL: https://vercel.com/jims-projects-b7cb6c2e/kitface-app/BF9nkMJjkcWNjaqPWHMGsmJANvVL
- Completed the must-fix Kitface design review pass from `designer.md`: clearer homepage flow, small-phone hero poster proof, simpler `/create` required path, recoverable failed-generation/result copy, safer upgrade/download wording, customer-facing order success copy, CTA label cleanup, and visible focus/disabled-state guidance.
- User confirmed on production that the new design/copy works.
- User confirmed end-to-end poster generation works on production with real services.
- User confirmed Stripe Apple Pay checkout works for the digital download product and payment reached Stripe.
- Fixed and deployed a VS poster stability pass after a production VS failure: GPT Image 2 generation is clamped to 2K, server-side `4K` request modes are no longer accepted, duplicate VS kit references are removed, and the VS prompt now uses a simpler one-hero-plus-limited-actions structure.
  - Live app: https://app.kitface.app
  - Latest production deployment: https://kitface-btheeedqp-jims-projects-b7cb6c2e.vercel.app
  - Deployment inspect URL: https://vercel.com/jims-projects-b7cb6c2e/kitface-app/5NKyeeeFjGEqnyxz4EGSQgE23ZHt
- Added and deployed personalisation safety filtering for shirt names and slogans. The filter blocks encoded NSFW abusive/sexual/extremist/violent/tragedy-abuse terms server-side and shows a neutral user-facing message.
  - Live app: https://app.kitface.app
  - Latest production deployment: https://kitface-qfh15vgj3-jims-projects-b7cb6c2e.vercel.app
  - Deployment inspect URL: https://vercel.com/jims-projects-b7cb6c2e/kitface-app/8kfURkxY136JVhVeVUfxADKeUy4j

## Next

### UI fixes (high priority — broken or confusing)
1. ✅ Done — **Check the paid download delivery** — Apple Pay took payment successfully. Next, confirm the customer can actually download the no-watermark file from the success page and email link.
2. ✅ Done — **Fix camera layout on iPhone** — live capture works, but the camera screen can still feel too tall or jumpy on phones. Keep the shutter and controls stable at the bottom.
3. ✅ Done — **Continue onboarding polish** — the homepage and `/create` are clearer. Keep checking the full signed-in flow on a real phone for any confusing wording.

### Notifications
4. **Pick email provider and wire up** — no provider chosen yet. Options: Resend (simple, good Next.js DX), SendGrid, Postmark. Pick one, add API key to env, send a real completion email when generation finishes. Hook into existing notification record insert.
5. **Pick push provider and wire up** — no push service chosen. Options: web-native Push API + VAPID keys (free, no third party), or OneSignal/Notix (managed). VAPID approach: generate keys, store subscription in `user_notification_preferences`, send push from server on job completion.

### Analytics
6. **Add generation analytics** — log each poster generation to an analytics table or service: user id, team, model, kit variant, timestamp, success/fail. Goal: know which teams and modes get used. Options: Supabase table (already available) or Vercel Analytics + custom events. Use Supabase table first — no extra service needed.
7. **Keep an eye on MuAPI reliability** — new production jobs should now use `final-2k-high`; confirm the next Mexico/Star Player retry submits `resolution: "2K"` and not `"4K"`.

### Existing backlog
8. ✅ Done — end-to-end poster generation works in production with real services.
9. ✅ Partly done — Stripe Apple Pay payment works for digital download and payment reached Stripe. Still confirm download delivery/email link and any credits flow separately if credits are still sold.
10. Verify webhook completion, `/result/[jobId]`, native sharing, notification records, and Printful draft-order path on deployed URL.
11. Retest VS mode on production after the 2K/prompt simplification deploy.
12. Extend text safety filtering to custom team name, custom kit notes, match notes, and correction prompts if those fields become user-visible in output.
13. Test `KITFACE_BRAND_PLACEMENT_MODE=kitface` vs `original` on real generations using `gpt-image-2-fast`.
14. ✅ Done — Live camera walkthrough on real phone on secure URL.
15. Add a retention job/window for old private capture objects. Bucket privacy and signed provider URLs are implemented.
17. ✅ Done — Decide: keep CSS hero poster preview or replace with real generated image. (Replaced with a real generated image `/kitface-hero-poster-test.jpg`).
19. Configure Vercel Rolling Releases for production canaries after upgrading the Vercel plan to Pro or Enterprise; current plan returns 403 for Rolling Releases.

## Blockers

- **Old failed posters will stay failed.** If a poster failed before the latest fixes, it will not repair itself. Make a new poster to test the current system.
- **The failed VS poster needs a fresh retry.** The VS prompt/settings fix is live now, but the failed job on screen will stay failed. Start a new VS poster to test the fix.
- ✅ Done — **Digital payment works, but delivery still needs one final check.** You paid with Apple Pay and Stripe received it. Now check that the success page or email gives the correct no-watermark download.
- **Printed cards/posters still need a real test.** The digital download was tested. The printed product path still needs a test order to prove the print partner receives the order correctly.
- **Team-news notes may not be live.** If the football data API key is missing or wrong, the app still works, but it uses basic team notes instead of live squad/news details.
- ✅ Done — **Camera needs real-phone layout QA.** Capture works on device, but the screen still needs checking for awkward height, browser bars, and button position on iPhone Safari.
- **Old private photo cleanup is not automated yet.** Photos are stored privately, but we still need a scheduled cleanup rule so old captures are deleted after a sensible period.
- **Production rollout controls need a paid Vercel plan.** Gradual/canary releases cannot be enabled on the current Vercel plan. Vercel says Pro or Enterprise is required.
- **Health-check monitoring needs a known secret.** The current health-check secret in Vercel is hidden after creation. For an external monitor, create a new known secret and use the same value in Vercel and the monitor.
