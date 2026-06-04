# Kitface Project Handover

This document provides a comprehensive snapshot of the current state of Kitface, the mobile-first football poster app, including recent implementations, architectural decisions, and the roadmap forward.

---

## 1. Project Snapshot

*   **Product**: Kitface — a mobile-first football poster app that turns personal photos into official-style football media.
*   **Stack**: Next.js 16, React 19, Tailwind CSS v4, `lucide-react`, Supabase, MUAPI (with fallback options).
*   **Current UI Direction**: Official, electric, playful football broadcast media.
    *   **Colors**: Light canvas (`#F5F5F7`), deep indigo ink, vibrant cyan CTAs, white cards/panels, and translucent gradient beams (lime, cyan, blue, violet).
    *   **Aesthetics**: Sleek, modern broadcast feel. Avoid previous dark gamer or vintage ivory/serif keepsake styling unless explicitly requested.
*   **Primary Flow**: `/` (Home) $\rightarrow$ `/capture` (Camera) $\rightarrow$ `/review` (Review photos) $\rightarrow$ `/create` (Configure details) $\rightarrow$ `/generating/[jobId]` (Loading status) $\rightarrow$ `/result/[jobId]` (Final poster).
*   **Vercel Deployments**:
    *   **Production / Canonical App Domain**: [app.kitface.app](https://app.kitface.app)
    *   **Vercel Production Alias**: [kitface-app.vercel.app](https://kitface-app.vercel.app) serves the same app but may redirect to the canonical custom domain in browsers.
    *   **Branch Preview**: No active working branch preview is confirmed right now. The previous preview hostname `kitface-app-git-feat-football-waiting-messages-jimbrouws-projects.vercel.app` no longer resolves in DNS.

---

## 2. Current Branch & Recent Changes

Working on branch `codex/smile-reference-generation`. Recent additions and fixes include:

### UI & Styling System (`BRANDING.md` alignment)
*   **Design Tokens**: Integrated a clean, light broadcast palette in `app/globals.css` using custom `--ramp` styles and diagonal gradient borders.
*   **Layout & Fonts**: Configured Geist sans-serif weights through `900` in `app/layout.tsx`.
*   **Flow Redesign**: Restyled `/`, `/capture`, `/review`, `/create`, `/generating/[jobId]`, and `/result/[jobId]` pages to omit legacy sage, burgundy, or serif tokens.
*   **Homepage Hero**: Set hero copy to "Pick your kit. Make it yours." with subtext "Turn your photos into official-style football posters."
*   **Homepage Preview Fix**: Replaced the fragile/abstract homepage preview with a poster-result style asset (`public/kitface-dad-poster-preview.svg`) showing a generic 48-year-old UK dad in a Kitface football poster, closer to the real output users are making.
*   **Mobile Capture Layout Fix**: Hardened `/capture` to use a fixed `100dvh` viewport with explicit safe-area padding, shorter controls, and a minimum camera frame so the shutter stays pinned on small iPhones without page scroll or visual jumps.
*   **Simplified Onboarding Copy**: Shortened the capture step titles/instructions and simplified `/review` and `/create` headers/status messages so the path reads as "take photos, check photos, choose poster."
*   **Kit Spec Test Fixture Repair**: Updated the metadata-only kit prompt test to construct a metadata-only fixture explicitly, because every current curated kit now has a `referenceImageUrl`.

### Core Application Logic & Prompting
*   **Sponsor Experiment**: Introduced `KITFACE_BRAND_PLACEMENT_MODE=kitface` mode. Replaces chest sponsors with `kitface.app` and displays subtle pitch-side LED boards in generated art. Unset or any other mode keeps original kit sponsors.
*   **Personalization Inputs**: Added team slogan, custom shirt name/number, and an **Accessibility / Mobility Aid** toggle. The accessibility toggle injects instructions into the prompt to represent the user naturally with their wheelchair or mobility aid without forcing running/standing poses.
*   **VS Mode (Separation)**: Shortened prompt length and enforced prompt isolation between `[img1]` and `[img2]` to respect MuAPI's budget and support two-person captures (`opponent_front`).
*   **Back Camera Toggle**: Implemented a lens switcher (↔) on `/capture` supporting both front (`user`) and back (`environment`) cameras. Disables mirror-flip automatically when using the rear camera.
*   **Card-First Printful Flow**: Result and upgrade pages now lead with cheaper printed cards instead of A3 posters. Father&apos;s Day and Birthday card options map to Printful Greeting Card product `568`, default variant `14457` (4x6), `front` placement, `digital` technique. A3 poster remains available as a secondary option using the existing poster env mapping.
*   **GPT Image 2 Variation Prompt**: Updated the MUAPI GPT Image 2 prompt to avoid repeated centre-face collage outputs. The active prompt now asks for fresh poster concepts, varied camera/lighting/layout/action choices, and strict identity/reference priority. The previous GPT Image 2 wording is preserved in `lib/ai/promptBuilder.ts` as a rollback reference.
*   **Homepage Hero Poster Test Asset**: Swapped the homepage preview from the temporary SVG illustration to `public/kitface-hero-poster-test.jpg`, using the approved Kitface-style dad poster image. The source prompt is documented in `docs/kitface-hero-poster-test-prompt.md`; the old SVG remains in `public/kitface-dad-poster-preview.svg` for rollback.
*   **Generation Prompt Aligned to Hero Poster**: Updated the active MUAPI GPT Image 2 generation prompt to match the approved Kitface tournament-poster prompt: huge 60-70% chest-up hero portrait, four to five same-person bottom action figures, international tournament media campaign styling, strict identity lock, exact kit-variable usage, and stronger negatives against single generic footballer portraits. Existing dynamic inputs remain in place: uploaded photos, kit specs/reference images, VS match context, Kitface/original sponsor mode, shirt name/slogan, accessibility, and correction prompts. The active test prompt is intentionally long for the experiment (~11k chars in the Nottingham Forest fixture) rather than shortened prematurely.
*   **Team Picker Ordering**: `/create` now orders team dropdowns with World Cup 2026 first, starting with England and Scotland, then major World Cup teams, followed by Premier League, International Giants, International, EFL League One, and Custom. The single-team select starts on a disabled grey "World Cup teams" placeholder instead of "Premier League". VS team selectors use the same ordering.
*   **VS Match Defaults & Kit Controls**: VS mode now defaults to England vs Scotland so native dropdowns open around World Cup teams instead of Premier League teams. The visible kit controls now show Home, Away, and Retro only; the internal `third` kit type remains for old data/curated specs but is no longer offered in the create form.
*   **World Cup Away Kit Fallbacks**: World Cup/international teams now receive generated away-kit metadata when no curated away reference exists. The fallback keeps sponsor as `none`, marks confidence low, avoids claiming an attached reference image, and uses contrasting national-team away colours instead of reusing home notes or showing unknown/blank away kit details.
*   **Primary Photo Reference Priority**: Generation now prefers the smile capture as the main identity reference, then celebration, torso, and only then neutral/front. This avoids using a badly lit or stern first photo as the hero face when better celebratory references exist.
*   **Multi-Reference Single-Team Generation**: Single-team poster requests now send the smile/primary person photo plus up to two supporting person references (celebration, torso, or neutral/front) before the kit reference. VS mode still keeps person separation strict and does not inject extra same-person references into the `[img1]` / `[img2]` contract.
*   **MUAPI GPT Image 2 Failure Mitigation**: Investigated failed job `280458bb-abc5-4ea7-a0c8-29bb07595294` / MUAPI prediction `bba90d98-850a-4177-a090-02d27e36ca3d`, which failed with `invalid_request_error` and trace id `69bd8d7f65d2b518a9f9354645e723a9`. The failed request used a ~12,041-character prompt and only two images: one person photo plus one kit reference. The active GPT Image 2 prompt is now compacted to preserve the tournament-poster structure, identity lock, lighting correction, expression guidance, kit accuracy, and negative prompt while reducing the reconstructed England request to ~9,554 prompt characters and four images (primary person, two supporting person refs, kit).
*   **Hero Head/Body Integration Prompt Fix**: Added a GPT Image 2 `PHYSICAL INTEGRATION` block after photo enhancement. It tells the model to make the head, neck, shoulders, and shirt look photographed together, match face lighting to stadium key/rim light, add chin/neck/collar contact shadows, preserve neck thickness/shoulder connection, and avoid pasted-on heads, cutout faces, mismatched head/body lighting, halo edges, missing neck shadow, and collar gaps.

### Backend, Auth, & Schema
*   **Supabase Auth**: Hardened Google Sign-In with `@supabase/ssr` cookies and an auth callback callback route. Prevents app crashes if optional tables (e.g. user profiles) are missing during signup.
*   **MuAPI Fast Engine**: Added `gpt-image-2-fast` mapping to GPT Image 2 image-to-image with `resolution: "1K"` and `quality: "low"` for fast and cost-effective testing.
*   **Schema Fallbacks**: Configured runtime fallbacks in API routes to handle local databases missing migration columns (e.g., `user_id` on jobs, notification preference tables). The full schema is detailed in `supabase/schema.sql`.

---

## 3. Current Database Schema (`supabase/schema.sql`)

Main entities configured or referenceable in the application:
1.  **Users & Profiles**: Google Auth mapped profiles.
2.  **Capture Sessions**: Tracking uploads and temporary capture images.
3.  **Generation Jobs**: Storing inputs, selected teams/kits, selected model engines, job statuses, and the final generated image URL.
4.  **Notifications & Preferences**: In-app notifications and user settings for email/push preferences.
5.  **Video Jobs**: Generation jobs for match-day/poster animation files.

---

## 4. Next Steps

### Completed High Priority UI Fixes
1.  **Homepage Kit Preview**: Fixed. The homepage now renders a poster-style Kitface result preview showing the kind of football poster the app creates.
2.  **iPhone Camera Layout**: Fixed. The `/capture` page is locked to the mobile viewport and keeps the shutter/control area anchored at the bottom.
3.  **Onboarding Flow Copy**: Fixed. Capture, review, and create copy now uses simpler first-time-user language.

### Notifications & Communication
4.  **Email Provider**: Choose and configure an email service (e.g., Resend, SendGrid, Postmark) for job completion alerts.
5.  **Web Push Notifications**: Wire up the web-native Push API with VAPID keys, save subscription data to `user_notification_preferences`, and fire pushes on job completion.

### Analytics & Rate Limiting
6.  **Generation Analytics**: Log poster details (user ID, team ID, model, success rate) to a Supabase analytics table.
7.  **User History Page**: Build a `/history` route for users to view, download, or share their previously generated posters.
8.  **Rate Limiting**: Implement a limit of e.g. 5 generations per hour per user on `/api/generate` by counting recent DB jobs.

### Monetization & Fulfillment
9.  **Stripe/IAP Planning**: Plan credit balance tracking in the database.
10. **Printful Verification**: Test card and poster draft-order fulfillment on deployed URLs. Printful catalog lookup found Greeting Card variants `14457` (4x6), `14458` (5x7), and `14460` (5.83x8.27). They are `in stock` for `europe`/`worldwide`, but `not fulfillable` for the strict `uk` selling region, so live fulfillment should be tested before promising UK-local production.
11. **Privacy Improvements**: Move capture storage to private buckets and issue short-lived signed URLs.

---

## 5. Verification Commands

Latest verification on `codex/smile-reference-generation`:
```bash
npm run typecheck    # passed
npm run lint         # passed
npm run build        # passed
git diff --check     # passed
npm test             # passed, 39 tests
```

Latest production deploy:
*   Deployed to Vercel production: `https://kitface-nd4i4r2as-jims-projects-b7cb6c2e.vercel.app`
*   Aliased live app: `https://app.kitface.app`
*   Live smoke check: `https://app.kitface.app/` returned 200 and `https://app.kitface.app/create` returned 200 after deployment. Browser check on `/create` passed: VS defaults are England vs Scotland, both team selects start with `World Cup 2026` and first options England, Scotland, Brazil, Argentina, and the visible kit buttons are Home/Away/Retro only.

Browser smoke-checks:
*   `/` at 390x844 and 1280x900: passed, no page errors, no horizontal overflow, new broadcast preview rendered.
*   `/` at 390x844 after hero swap: passed, no page errors, no horizontal overflow, image source resolves to `/kitface-hero-poster-test.jpg`.
*   `/review` at 390x844: passed, no page errors, simplified copy rendered.
*   `/create` at 390x844: passed, no page errors, simplified copy rendered.
*   `/create` team selects: passed. Single-team select starts with disabled "World Cup teams", then World Cup 2026 with England, Scotland, Brazil, Argentina, France, Germany, Spain, Portugal; VS selectors also start with World Cup 2026.
*   `/capture?restart=1` at 390x844: redirected to `/login?next=/capture?restart=1` in the unauthenticated local session. The protected capture viewport change was verified by typecheck/lint/build and code inspection.

Run these standard verification commands prior to any session commit:
```bash
npm run typecheck    # Verify TypeScript types
npm run lint         # Lint project files
npm test             # Run test suite
npm run build        # Verify production build builds cleanly
git diff --check     # Check for trailing whitespace
```

---

## 6. Session Protocols

*   **Commit Protocol**: When closing, run the full banana hunt loop in `BANANAS.md`. Fix any issues, and update `AGENTS.md`, `TASK.md`, `CONTEXT.md`, and `BANANAS.md`.
*   **Resume Protocol**: Read `AGENTS.md`, `TASK.md`, and `CONTEXT.md`. Brief the user on the project, previous progress, and next steps. Wait for confirmation before beginning implementation.
