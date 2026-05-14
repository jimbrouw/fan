# Session Context

The current work is being prepared for commit on a new Codex branch from `codex/fan-hero-generation-pipeline`.

Kitface is a mobile-first football poster app. The current brand direction is the new `BRANDING.md` system: official, electric, playful football media. The UI should feel like a light sports broadcast package with deep indigo ink, cyan CTAs, white panels, and translucent diagonal gradient beams. Avoid returning to the previous warm ivory / sage / burgundy / serif keepsake direction unless the user explicitly asks.

This session completed the rebrand implementation pass that was already partly started in the dirty worktree:

- `app/globals.css` now defines the light broadcast palette, `--ramp`, ramp text/fill utilities, and gradient-border utility.
- `app/layout.tsx` uses Geist weights through 900 and the updated metadata/theme colour.
- Shared chrome, buttons, progress, capture, review, create, generating, and result surfaces use the new tokens and no longer depend on `--mist` or `--accent-green`.
- The homepage hero uses the approved short copy: “Pick your kit. Make it yours.” with “Turn your photos into official-style football posters.”
- Result poster display uses a gradient-bordered frame and deep-indigo watermark badge.
- `lib/ai/promptBuilder.ts`, `lib/posterTemplates.ts`, and prompt-demo scripts now point generated output toward clean light football broadcast campaign art rather than dark cinematic fog or plain off-white studio art.
- Prompt tests were updated for the new media-day language, and VS prompts were shortened to stay under the MuAPI prompt budget.
- Generated prompt-output folders are ignored: `Prompts-vs/` and `test-images/`.

Existing in-progress work also includes VS poster reliability improvements, `/api/jobs/[jobId]/image` sharing, and Printful draft-order fulfillment. Those changes were preserved and verified as part of this handover.

Verification completed:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- Playwright smoke checks for `/`, `/capture`, `/review`, `/create`, `/generating/demo-job`, and `/result/demo-job` at `430x932`

Open questions remain around real provider credentials, deployed webhook behavior, Printful credentials/catalog variants, and phone camera testing.
