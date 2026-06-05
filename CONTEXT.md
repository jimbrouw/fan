# Session Context

The current work is being committed on branch `codex/kitface-sponsor-experiment`.

Kitface is a mobile-first football poster app. The current brand direction is the new `BRANDING.md` system: official, electric, playful football media. The UI should feel like a light sports broadcast package with deep indigo ink, cyan CTAs, white panels, and translucent diagonal gradient beams. Avoid returning to the previous warm ivory / sage / burgundy / serif keepsake direction unless the user explicitly asks.

This branch started from the completed broadcast rebrand and added the Kitface sponsor/auth/testing experiment:

- `app/globals.css` now defines the light broadcast palette, `--ramp`, ramp text/fill utilities, and gradient-border utility.
- `app/layout.tsx` uses Geist weights through 900 and the updated metadata/theme colour.
- Shared chrome, buttons, progress, capture, review, create, generating, and result surfaces use the new tokens and no longer depend on `--mist` or `--accent-green`.
- The homepage hero uses the approved short copy: “Pick your kit. Make it yours.” with “Turn your photos into official-style football posters.”
- Result poster display uses a gradient-bordered frame and deep-indigo watermark badge.
- `lib/ai/promptBuilder.ts`, `lib/posterTemplates.ts`, and prompt-demo scripts now point generated output toward clean light football broadcast campaign art rather than dark cinematic fog or plain off-white studio art.
- Prompt tests were updated for the new media-day language, and VS prompts were shortened to stay under the MuAPI prompt budget.
- Generated prompt-output folders are ignored: `Prompts-vs/` and `test-images/`.
- `lib/ai/promptBuilder.ts` now supports `KitBrandPlacementMode` with `original` and `kitface` modes. `KITFACE_BRAND_PLACEMENT_MODE=kitface` replaces real main chest sponsors with exact `kitface.app` text and adds subtle pitch-side LED boards. Default/no flag remains original sponsors.
- Google sign-in now uses the SSR-aware Supabase browser client, an auth callback, session checking on the login page, and hardened profile setup so missing optional profile/preference tables do not crash auth.
- The generating screen now has clearer loading language, email/push preference controls, graceful unavailable messaging for local schemas without notification tables, and localhost-only `Regenerate test`.
- The result page has image/video sharing, video animation flow, correction flow, Printful draft-order action, and localhost-only `Regenerate test`. The previous `alert()` approval placeholder was replaced with inline status.
- `supabase/schema.sql` includes users, notification preferences, notifications, video jobs, and user ownership columns. Runtime fallbacks tolerate older local/live schemas missing `generation_jobs.user_id`, `capture_sessions.user_id`, profile tables, or notification tables.
- The live Supabase database migration was applied successfully in the Supabase SQL editor: `supabase/schema.sql` first, then `supabase/migrations/0001_add_credits_and_fix_drift.sql`. Free-tier enforcement and credits no longer need to fail open for missing live columns/functions.
- MuAPI now supports `gpt-image-2-fast` as a low-cost test mode mapped to GPT Image 2 image-to-image with `resolution: "1K"` and `quality: "low"`; standard `gpt-image-2` remains `2K`/`high`.

Existing in-progress work also includes VS poster reliability improvements, `/api/jobs/[jobId]/image` sharing, and Printful draft-order fulfillment. Those changes were preserved and verified as part of this handover.

Verification completed:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

Banana hunt before commit:

- Pass 1: Found 2 bananas -> fixed stale “Private photos” homepage copy and removed a production `alert()` from result approval.
- Pass 2: No bananas found. Hunt complete.

Open questions remain around real provider credentials, deployed webhook behavior, Printful credentials/catalog variants, push subscription implementation, and phone camera testing.
