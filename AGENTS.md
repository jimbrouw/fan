# Codex Project Instructions

## Project Snapshot

- Product: Kitface, a mobile-first football keepsake poster app.
- Stack: Next.js 16, React 19, Tailwind CSS v4, lucide-react, Supabase, MUAPI/FAL image providers.
- Current UI direction: warm editorial, inclusive, family-friendly football memory studio. Avoid dark gamer/sports-bro styling unless explicitly requested.
- Primary flow: `/` -> `/capture` -> `/review` -> `/create` -> `/generating/[jobId]` -> `/result/[jobId]`.
- Generated reference extraction output belongs in `design-extract-output/` and must stay ignored.

## Workflow Orchestration

### 1. Plan Before Non-Trivial Work
- For any non-trivial task involving 3+ steps, cross-file changes, data model changes, or architectural decisions, write a short plan before implementation.
- Verify the plan with the user before implementation unless the user explicitly asked for an autonomous bug fix or a very small direct change.
- If the plan becomes wrong, stop, explain what changed, and re-plan before continuing.
- Do not skip planning just to save time.

### 2. Subagent Usage
- Use subagents only when the user explicitly asks for subagents, delegation, or parallel agent work.
- When subagents are allowed, use them for research, parallel exploration, independent verification, or large data processing.
- Keep implementation in the main context unless context pressure or a clearly isolated workstream makes delegation worthwhile.
- Give each subagent one focused tack and a concrete output.

### 3. Verification Before Done
- Never mark a task complete without proving it works.
- Run the most relevant tests, type checks, linters, builds, or smoke checks for the change.
- Diff behavior before and after the change when relevant.
- Check logs or command output when debugging.
- Report exactly what was verified and what was not.
- Before finalizing, ask internally: "Would a staff engineer approve this?"

### 4. Elegant Solutions When It Matters
- For changes that touch multiple files or will likely be modified again, pause and ask: "Is there a more elegant way?"
- Prefer simple, local fixes for one-off bugs and obvious changes.
- Refactor opportunistically when it reduces real complexity or matches existing patterns; do not refactor proactively without a clear reason.

### 5. Autonomous Bug Fixing
- When given a bug report, investigate and fix it without asking for hand-holding.
- Point at logs, errors, failing tests, or repro steps, then resolve the issue.
- Minimize context switching for the user.

### 6. Self-Improvement
- After significant corrections, note the pattern in project handover docs or session memory when available.
- Build rules that prevent the same mistake from recurring.
- Update working principles when the same issue appears two or more times.

## Session Protocol

### `commit`
When the user says `commit`, run the full BANANAS handover loop before declaring the session closed:

1. Hunt bananas repeatedly until a full pass finds none.
2. Fix each banana found, then scan again.
3. Report each pass in this format: `Pass 1: Found 4 bananas -> fixed ...`
4. Update `AGENTS.md`, `TASK.md`, `CONTEXT.md`, and `BANANAS.md`.
5. Only after a clean pass and updated docs, say: `Session closed. Say resume to pick up.`

See `BANANAS.md` for the full protocol and banana definitions.

### `resume`
When the user says `resume`:

1. Read `AGENTS.md`, `TASK.md`, and `CONTEXT.md` in that order.
2. Brief the user on:
   - What the project is
   - What was last finished
   - The next concrete action
3. Ask: `Ready to go?`
4. Wait for confirmation before touching code or running implementation commands.

## Handover Files

- `AGENTS.md` - Codex project instructions, workflow rules, stack notes, constraints, and key decisions.
- `TASK.md` - Finished work, ordered next steps, and blockers.
- `CONTEXT.md` - Current session summary: what changed, why, and open questions.
- `BANANAS.md` - The full banana hunt and session handover protocol.
