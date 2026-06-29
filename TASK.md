# Task Handover

## Finished

- Created AI Bingo as an isolated worktree at `/Users/standard/Developer/ai-bingo-app`.
- Created branch `feat/ai-bingo-muapi-pwa` from the current committed Kitface branch state so the original `/Users/standard/Developer/fan` checkout remains untouched.
- Re-scoped project metadata and instructions from Kitface to AI Bingo.
- Sanitized `.env.example` so it no longer points at the Kitface Supabase project or Kitface/commerce-specific services.

## Next

1. Remove or quarantine football/poster/commerce routes and libraries that AI Bingo will not use.
2. Add the AI Bingo domain model:
   - `events`
   - `event_players`
   - `portrait_generations`
   - `bingo_cards`
   - `called_portraits`
   - `bingo_claims`
3. Convert the capture flow into event-player selfie capture.
4. Replace Kitface poster prompt building with a portrait-stylization MUAPI prompt.
5. Build player card, host controller, and display views.
6. Add focused tests for bingo card generation, bingo validation, and MUAPI request mapping.
7. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`.

## Blockers

- AI Bingo needs its own Supabase project or explicit approval to reuse an existing one.
- AI Bingo needs its own Vercel project before deployment.
- Current code still contains Kitface football/poster/product surfaces and should be treated as a starting point, not a finished AI Bingo app.
