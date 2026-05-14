# Task Handover

## Finished

- Shifted Kitface from the previous warm editorial keepsake direction to the new `BRANDING.md` system: official football media, light broadcast canvas, deep indigo ink, cyan CTA accents, and translucent lime/cyan/blue/violet gradient beams.
- Restyled shared chrome and the main app flow across `/`, `/capture`, `/review`, `/create`, `/generating/[jobId]`, and `/result/[jobId]` so the UI no longer depends on old `--mist`, `--accent-green`, paper, sage, burgundy, or serif-era tokens.
- Updated homepage copy and poster preview language to “official football media” and removed leftover “made to keep” / “matchday memories” wording from the live hero.
- Updated generated-poster prompt direction toward clean light football broadcast composition while preserving identity, kit accuracy, VS side separation, and `[img1]` / `[img2]` prompt separation.
- Reworked SVG poster previews to use a light base, translucent diagonal ramp beams, indigo text, and club colours as content accents.
- Added Printful draft-order fulfillment plumbing from the previous in-progress work and kept result-page sharing via `/api/jobs/[jobId]/image`.
- Ignored generated prompt-output folders (`Prompts-vs/`, `test-images/`) so regenerated demo prompt packs do not enter source control by accident.
- Verified with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`, and Playwright smoke checks for `/`, `/capture`, `/review`, `/create`, `/generating/demo-job`, and `/result/demo-job`.

## Next

1. Test an end-to-end poster generation with real MUAPI, Supabase, and Football Data credentials.
2. Verify webhook completion updates, `/result/[jobId]`, native image sharing, and the Printful draft-order path on a deployed URL.
3. Smoke test `/create` VS mode with an uploaded `opponent_front` image and confirm the generated payload contains the correct home/away teams, kit variants, and second-person source.
4. Do a live camera walkthrough on an actual phone against a secure local or deployed URL to check camera permissions, framing, and capture ergonomics.
5. Decide whether the CSS hero poster preview should remain or be replaced with a generated/photographic brand asset.

## Blockers

- Live generation verification depends on valid `.env.local` credentials and provider access.
- Live team-news verification depends on `FOOTBALL_DATA_API_KEY`; without it, the API intentionally falls back to team-only notes.
- Real camera verification needs a secure device/browser path when testing outside localhost.
- Printful verification requires valid Printful credentials and a confirmed catalog variant mapping.
