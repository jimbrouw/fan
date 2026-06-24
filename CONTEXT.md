# Session Context

AI Bingo is being built as a separate project from Kitface so the existing Fan/Kitface app is not broken.

The source checkout remains at `/Users/standard/Developer/fan` on branch `fix/pl-kit-preview-fallbacks`. It had no tracked or staged edits when this worktree was created, only untracked/generated local files. Those files were left untouched.

This project lives at `/Users/standard/Developer/ai-bingo-app` on branch `feat/ai-bingo-muapi-pwa`. It was branched from the current committed Kitface state because `origin/main` had the MUAPI provider but was missing the newer shared static generation helper.

The intended architecture is:

- PWA/web app first, native mobile wrapper later only if required.
- Supabase for auth/session data, private capture storage, events, players, portraits, cards, calls, and claims.
- MUAPI for stylized player portrait generation.
- Next.js route handlers for generation submission, job status, event/player/card APIs, and host controls.
- Vercel as a separate deployment from Kitface.

Reuse from Kitface:

- Supabase server/browser clients.
- Private capture storage and signed URL patterns.
- MUAPI provider and status polling patterns.
- Rate limiting, health checks, and verification scripts.

Replace from Kitface:

- Football teams, kits, match context, poster templates, Prodigi/Printful/Stripe product surfaces, and Kitface-specific copy.

Verification so far:

- Confirmed new worktree/branch exists.
- Confirmed original Fan worktree had no tracked/staged changes before branching.
- Updated project metadata/docs/env example only in `/Users/standard/Developer/ai-bingo-app`.
