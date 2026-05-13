# Task Handover

## Finished

- Renamed the frontend product direction to Kitface and completed a full warm editorial redesign of the primary app flow.
- Restyled home, capture, review, create, generating, and result screens around the approved Kitface concept: ivory shell, serif wordmark/headings, deep green text, burgundy CTAs, soft blue status panels, kit swatches, and poster thumbnails.
- Preserved the existing capture, local storage, upload, job creation, provider polling, and result sharing behavior.
- Fixed the home poster preview after review: removed the awkward fake person illustration and replaced it with a clearer kit-preview motif.
- Ignored generated design extraction output so reference scrape artifacts do not enter source control or project checks.
- Improved VS poster generation: home/away side ids, richer 2025/26 kit metadata, optional second-person opponent uploads, team-news fallback behavior, stricter prompt constraints, and image-file sharing through `/api/jobs/[jobId]/image`.
- Broadened the default test script so `npm test` runs all node tests instead of only kit prompt tests.
- Verified with `npm run typecheck`, `npm run lint`, `npm run build`, Playwright mobile/desktop screenshots, and a smoke test for Start navigation plus Create page mode toggling.
- Re-verified the latest handover state with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`.

## Next

1. Smoke test `/create` VS mode in the browser, including the second-person opponent upload path and generated payload.
2. Test an end-to-end poster generation with real MUAPI, Supabase, and Football Data credentials.
3. Verify webhook completion updates, `/result/[jobId]`, and native image sharing on a deployed URL.
4. Do a live camera walkthrough on an actual phone against the local/network URL to check camera permissions, framing, and capture ergonomics.
5. Decide whether the home poster preview should remain CSS-based or become a generated/photographic brand asset.
6. Explore adding people and pets wearing the team kit in the keepsake poster, since football memories often include family pets as well as supporters.

## Blockers

- Live generation verification depends on valid local `.env.local` credentials and provider access.
- Live team-news verification depends on `FOOTBALL_DATA_API_KEY`; without it, the API intentionally falls back to team-only notes.
- Real camera verification needs a secure device/browser path if testing outside localhost.
