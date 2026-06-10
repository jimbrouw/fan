# Kitface Project Handover

This document provides a comprehensive snapshot of the work completed on **June 10, 2026**, for the Kitface mobile-first football poster application. It is designed to allow another agent or engineer to quickly resume development.

---

## 1. Project & Stack Snapshot

*   **Product**: Kitface — a mobile-first football poster app turning personal photos into official-style broadcast football media.
*   **Stack**: Next.js 16, React 19, Tailwind CSS v4, `lucide-react`, Supabase, MUAPI & FAL AI image providers.
*   **Current UI/Brand Direction** (from `BRANDING.md`):
    *   **Theme**: Light, official, electric, playful football broadcast media.
    *   **Colors**: Light canvas (`#F5F5F7`), deep indigo ink, vibrant cyan CTAs, white panels, and translucent diagonal gradient beams (lime, cyan, blue, violet).
    *   **Style**: Avoid the old warm ivory/sage/burgundy/serif keepsake styling and dark "gamer" aesthetics.
*   **Primary Flow**: `/` (Home) $\rightarrow$ `/capture` (Camera) $\rightarrow$ `/review` (Review photos) $\rightarrow$ `/create` (Configure details) $\rightarrow$ `/generating/[jobId]` (Loading status) $\rightarrow$ `/result/[jobId]` (Final poster).
*   **Deployments**:
    *   **Production Custom Domain**: [https://app.kitface.app](https://app.kitface.app)
    *   **Latest Production Vercel Deploy**: [https://kitface-qfh15vgj3-jims-projects-b7cb6c2e.vercel.app](https://kitface-qfh15vgj3-jims-projects-b7cb6c2e.vercel.app)

---

## 2. Key Accomplishments Today (June 10, 2026)

### 2.1 Fulfillment Migration (Printful $\rightarrow$ Prodigi)
*   **Replaced Printful with Prodigi**: Fully migrated print-on-demand fulfillment provider. Removed the Printful client wrapper (`lib/fulfillment/printful.ts`) and tests, replacing them with a custom Prodigi client (`lib/fulfillment/prodigi.ts`) and integration tests (`tests/prodigiProvider.test.ts`).
*   **Order Webhooks**: Added `app/api/webhooks/prodigi/route.ts` to process order status updates (e.g., transit, delivery, cancellation) from Prodigi.
*   **Stripe Webhook Update**: Updated `app/api/webhooks/stripe/route.ts` to call the new Prodigi order creation logic upon successful checkout sessions.
*   **Product Map**: Configured Prodigi custom product definitions (cards and posters) in `lib/checkout/products.ts`.

### 2.2 Security Hardening & Vulnerability Remediation
*   **Unauthenticated IDOR Fix**: Secured `/api/jobs/[jobId]/image/route.ts` to ensure users cannot download or view generated poster images belonging to other users unless the request matches an active paid Stripe checkout success session.
*   **Credit Race Condition Mitigation**: Moved the atomic `consume_user_credit` RPC call in `/api/generate/route.ts` to execute *before* calling the external image generation providers, preventing infinite free generations. Added a robust refund mechanism to return the credit on generation failure.
*   **SSRF Protection**: Secured remote image downloads in `lib/remoteImages.ts` by introducing an `isSafeRemoteUrl` blocklist that blocks fetching private/internal IPs, localhost, and non-HTTP schemes.

### 2.3 VS Mode & Generator Reliability
*   **VS Layout Balance**: Adjusted the prompt builder instructions to enforce using `[img2]` as the identity source for all away-side players and explicitly instructed the image generator to mirror the home-side structure, correcting visual layout imbalances.
*   **Reference Image Limit**: Capped the maximum number of person reference images sent to MUAPI at 2, avoiding prediction failures due to heavy payloads.
*   **FAL Test Mode**: Standardized dynamic test routing to use FAL as a primary engine for GPT Image 2 when debugging prompt quality.
*   **Error Recovery UI**: Updated generating status client and result screens to show detailed, recoverable error logs and retry actions instead of leaving users stuck.

### 2.4 UI Polish & Paid Traffic (Designer.md) Alignment
*   **Landing Page Upgrade**: Replaced CSS-only poster preview boxes on the homepage with high-quality pre-rendered poster images (`/kitface-hero-poster-test.jpg`).
*   **Kit Selection Controls**: Hid Away and Retro kit buttons for International teams (since national teams typically only use Home and Away patterns).
*   **Notification UI Polish**: Reverted the generic `GlobalToast` element back to the custom, theme-compliant `NotificationBell` layout, and fixed layout/aspect-ratio calculations for poster previews.
*   **Team Configurations**: Added Premier League 2026/27 teams and Notts County to the application team selector configurations.

### 2.5 Personalisation Safety Filter
*   **Server-Side Content Filtering**: Added `lib/safety/profanity.ts` utilizing base64-encoded NSFW/abusive word maps. Intercepts custom slogans, names, match notes, and correction prompts. Enforces validation client-side in the form fields and server-side in `/api/generate`.

---

## 3. Database Schema Status (`supabase/schema.sql`)

All credit tracking and session storage tables have been migrated successfully in the live Supabase SQL editor:
1.  **`users` / `profiles`**: Holds user profiles and active notification preferences.
2.  **`credits` & `credit_purchases`**: Implements credits balance, atomic RPC credit deductions (`consume_user_credit`), and Stripe purchase mapping.
3.  **`generation_jobs` & `capture_sessions`**: Tie generation tasks and captured images securely to `user_id` values.
4.  **`generation_analytics`**: Logs statistics on poster generation (model used, target team, success rate, latency).

---

## 4. Operational Next Steps & Blockers

*   **Prodigi Webhook Verification**: Ensure the live webhook listener route `/api/webhooks/prodigi` is registered in the Prodigi dashboard to receive shipping and print status updates.
*   **Physical Product Test Orders**: While Stripe digital checkouts are verified, the physical card/poster draft fulfillment via Prodigi needs a test purchase to confirm the print vendor receives correct dimensions and layout instructions.
*   **Vercel secrets checklist**:
    *   Ensure `PRODIGI_API_KEY` and `PRODIGI_BASE_URL` are configured on Vercel.
    *   Ensure `KITFACE_HEALTH_CHECK_SECRET` matches monitoring integrations.
    *   Verify `ANTHROPIC_API_KEY` is present in GitHub repo secrets (used in PR readiness checks).
*   **Health Checks**: Integrate monitoring checks on `/api/health` using the authorization headers.

---

## 5. Verification Commands

Run these standard verification checks before making changes or committing:
```bash
npm run typecheck    # Verify TypeScript compiles without issues
npm run lint         # Run ESLint validation
npm test             # Run unit tests (including authz and Prodigi providers)
npm run build        # Build Next.js application locally
git diff --check     # Inspect code style and formatting anomalies
```
