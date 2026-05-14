# BANANAS - Session Handover & Quality Loop Protocol

Last reviewed: 2026-05-14 during the Kitface official-football-media rebrand handover.

> A "banana" is any mistake, inconsistency, leftover mess, or silent failure that could cause the next session to slip up. Named after the classic banana peel: invisible until someone falls.

## What This Is

A two-command session management system for Codex:

- `commit` - wrap up, do housekeeping, hunt for bananas, write handover docs
- `resume` - read all handover docs, brief the user on state, and identify the next action before touching anything

## The COMMIT Sequence

When the user says `commit`, run this sequence in full before declaring the session closed.

### 1. Banana Hunt

Run repeatedly until no bananas remain:

```text
SCAN -> FIND bananas -> FIX bananas -> REPORT -> SCAN AGAIN
```

Do not stop after one pass. Keep looping until a full scan returns zero bananas.

What counts as a banana:

- Broken imports or references to files that do not exist
- TODO/FIXME left in code without a ticket or note
- Hardcoded secrets, paths, or dev-only values
- Stale comments that contradict current code
- Markdown files that reference old filenames or structures
- Incomplete refactors where old and new implementations both remain unintentionally
- Missing or outdated entries in `AGENTS.md` or task lists
- `console.log` calls left in production paths
- Anything that would make the next session start wrong

Report format after each pass:

```text
Pass 1: Found 4 bananas -> fixed [list them briefly]
Pass 2: Found 2 bananas -> fixed [list them briefly]
Pass 3: No bananas found. Hunt complete.
```

Only after a clean pass, proceed to step 2.

### 2. Update Handover Docs

Write or update these files in the repo root:

| File | Purpose |
| ---- | ------- |
| `AGENTS.md` | Codex project instructions, workflow rules, stack, constraints, key decisions |
| `TASK.md` | What finished, what is next in order, blockers |
| `CONTEXT.md` | Current session summary: what changed, why, and open questions |
| `BANANAS.md` | This protocol for the next Codex session |

Keep each file lean. `AGENTS.md` is a navigation file, not a novel. Point to other files instead of duplicating them.

### 3. Confirm Close

Only say "Session closed. Say `resume` to pick up." after:

- Clean banana pass
- Handover docs updated

## The RESUME Sequence

When the user says `resume`:

1. Read `AGENTS.md`, `TASK.md`, and `CONTEXT.md` in that order.
2. State briefly:
   - What the project is
   - What was last finished
   - The next concrete action
3. Ask: "Ready to go?" and wait for confirmation before touching anything.

This works across machines because the docs live in the repo, not in the context window.

## Why This Works

Codex sessions should not rely on memory between runs. The docs are the memory. The banana hunt keeps those docs accurate when written, not aspirationally accurate.

The loop matters: one pass is not enough. Bugs hide behind bugs.

## One-Line Summary for AGENTS.md

> On `commit`: hunt bananas until clean, update `AGENTS.md` / `TASK.md` / `CONTEXT.md` / `BANANAS.md`.
> On `resume`: read those files, brief the user, wait for go-ahead.
