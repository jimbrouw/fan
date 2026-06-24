# Codex Project Instructions

## Project Snapshot

- Product: AI Bingo, a mobile-first event app where players scan a QR code, upload/take a selfie, MUAPI turns it into a stylized portrait, and everyone plays bingo using the generated portrait pool.
- Origin: This project was created as an isolated `git worktree` from `/Users/standard/Developer/fan` on branch `feat/ai-bingo-muapi-pwa`. Do not edit the original Kitface checkout while working here.
- Stack: Next.js 16, React 19, Tailwind CSS v4, Supabase, MUAPI image generation, Vercel.
- Reuse boundary: keep Kitface infrastructure patterns for auth, private capture storage, MUAPI submission/status, rate limiting, health checks, and deployment. Replace football/poster/product-commerce domain code with event/player/card/controller concepts.
- Primary target flow: `/` -> `/event/[eventId]` -> `/event/[eventId]/capture` -> `/event/[eventId]/generating/[jobId]` -> `/event/[eventId]/card`; host views live under `/host/[eventId]` and `/display/[eventId]`.
- Default product shape: PWA/web app first. Native mobile wrappers can come later if installable app-store distribution is actually needed.
- Standard verification commands: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`.

## Workflow Orchestration

### 1. Plan Before Non-Trivial Work
- For any non-trivial task involving 3+ steps, cross-file changes, data model changes, or architectural decisions, write a short plan before implementation.
- Verify the plan with the user before implementation unless the user explicitly asks for autonomous execution.
- If the plan becomes wrong, stop, explain what changed, and re-plan before continuing.

### 2. Keep Fan Safe
- Work only in `/Users/standard/Developer/ai-bingo-app` unless explicitly told otherwise.
- Do not modify `/Users/standard/Developer/fan` as part of AI Bingo work.
- Do not reuse Kitface production Supabase/Vercel resources for AI Bingo unless the user explicitly approves it.
- Keep AI Bingo env vars, storage buckets, Vercel project, and database schema separate from Kitface.

### 3. Verification Before Done
- Never mark implementation complete without proving it works.
- Run the most relevant tests, type checks, lint, builds, or smoke checks for the change.
- Report exactly what was verified and what was not.

## Handover Files

- `AGENTS.md` - Project instructions, workflow rules, stack notes, constraints, and key decisions.
- `TASK.md` - Finished work, ordered next steps, and blockers.
- `CONTEXT.md` - Current session summary: what changed, why, and open questions.
