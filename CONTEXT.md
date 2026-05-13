# Session Context

The current branch is `codex/fan-hero-generation-pipeline`, tracking `origin/codex/fan-hero-generation-pipeline`.

This session redesigned the frontend into the approved Kitface direction after the darker sports-tech concept was rejected as too gamer-oriented. The accepted direction is a softer, inclusive football keepsake app: warm ivory backgrounds, deep green typography, burgundy primary actions, soft blue status surfaces, editorial spacing, and gentle photo/poster language.

The main flow still uses the same application behavior: capture steps, local storage, Supabase capture upload, create job submission, provider polling, and result sharing. The implementation changed shared shell/components and the primary screens at `/`, `/capture`, `/review`, `/create`, `/generating/[jobId]`, and `/result/[jobId]`.

The home poster preview is intentionally CSS-based for now. The first fake portrait attempts looked poor, so it was changed to a cleaner kit-preview motif. If a more premium hero image is needed, create a real generated/photographic asset rather than drawing a fake person with CSS.

Verification passed locally with `npm run typecheck`, `npm run lint`, and `npm run build`. Playwright captured mobile screenshots at `430x932`, a desktop screenshot at `1280x900`, and a full Create page screenshot. A smoke test confirmed Start navigates to `/capture`, the Create page VS match toggle reveals team fields, and the Create poster button remains present.

Generated design extraction artifacts are ignored via `design-extract-output/`; they are useful as local reference output but should not be committed.

Latest uncommitted work improves VS poster reliability and sharing. Create mode now passes home/away ids and kit variants into match context, supports an optional uploaded `opponent_front` image for a second featured person, and includes available home/away kit reference images in generation requests. Prompt building now separates `[img1]` and `[img2]`, keeps home on the left and away on the right, blocks trophy/competition bleed for Premier League posters, uses richer club personality notes where available, and adds model-specific joyful keepsake direction for Nano Banana 2 and GPT Image 2.

Kit data now includes broader 2025/26 Premier League home metadata with image references only where curated. Team news now works without `FOOTBALL_DATA_API_KEY` by returning fallback team-only notes; live squad data still requires the key. Result sharing now proxies completed poster images through `/api/jobs/[jobId]/image` so native share can send an image file instead of only a provider URL.

Verification passed after the latest banana pass with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`. `npm test` now runs all `tests/*.test.ts` files.
