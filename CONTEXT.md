# Session Context

The current branch is `codex/fan-hero-generation-pipeline`, tracking `origin/codex/fan-hero-generation-pipeline`.

This session is closing out the Fan Hero generation pipeline work. The repo has app changes around MUAPI submission, remote image validation, result sharing, and Supabase-related agent skills. During the commit handover pass, local `.claude/worktrees/` gitlinks were identified as accidental repo noise and excluded from version control.

Verification passed locally with `npm run typecheck`, `npm run lint`, `npm run test:kits`, and `npm run build`. Live provider behavior still needs a credentialed smoke test after deployment or with a valid local tunnel for webhooks.
