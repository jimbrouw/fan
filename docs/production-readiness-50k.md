# Kitface 50k-User Production Readiness

This is the operating checklist for taking Kitface from feature-led iteration to a controlled 50,000-user rollout.

## Required Gates

Every pull request to `main` must pass:

- `quality gate`: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`.
- `AI architecture review`: production-risk review focused on business logic, auth, SQL injection, edge cases, N+1 queries, payments, credits, provider webhooks, data deletion, and privacy.

Configure GitHub branch protection for `main` and require both status checks:

- `quality gate`
- `AI architecture review`

Set repository secret `ANTHROPIC_API_KEY` before enabling the required AI check. The AI check fails closed when the secret is missing.

## Canary Rollout

Use Vercel Rolling Releases for production promotion. Do not jump from preview to 100% production traffic for changes that touch auth, payments, generation, storage, webhooks, or database access.

Rollout stages:

1. `5%` for 30 minutes.
2. `25%` for 60 minutes.
3. `50%` for 2 hours.
4. `100%` after all checks stay green.

Rollback immediately if any stop condition is hit.

Stop conditions:

- `/api/health?deep=1` returns non-200 twice in a row.
- Generation submission error rate is above 2% for 10 minutes.
- Stripe webhook failures or duplicate credit grants appear.
- Auth callback failures increase above baseline.
- Supabase connection errors, timeout spikes, or storage upload failures appear.
- Provider webhook completion drops or result pages show missing outputs.
- Any privacy issue involving capture URLs, signed URLs, or wrong-user access is observed.

## Health Checks

Public liveness:

```bash
curl https://kitface-app.vercel.app/api/health
```

Deep canary check:

```bash
curl -H "x-kitface-health-token: $KITFACE_HEALTH_CHECK_SECRET" \
  "https://kitface-app.vercel.app/api/health?deep=1"
```

Deep health verifies required production environment variables and Supabase access to `generation_jobs`. Keep `KITFACE_HEALTH_CHECK_SECRET` private in Vercel and monitoring tools.

## Pre-Canary Smoke Test

Run these against the branch preview URL before promoting:

- Sign in with Google.
- Start `/capture`, upload/take the two required photos, and reach `/review`.
- Generate a poster with `gpt-image-2-fast`.
- Confirm `/generating/[jobId]` reaches `/result/[jobId]`.
- Confirm `/api/jobs/[jobId]/image` returns the poster image.
- Confirm the free-tier credit count changes exactly once.
- Run one Stripe test credit purchase and verify the webhook grants credits exactly once.
- Run one Printful draft-order test only when credentials and catalog variants are configured.

## Monitoring Minimums

Before a 50k push, monitor these signals in Vercel, Supabase, Stripe, provider dashboards, and app logs:

- Request error rate and p95 latency by route.
- `/api/generate`, `/api/webhooks/generation`, `/api/webhooks/video`, `/api/webhooks/stripe`, and `/api/captures` failures.
- Supabase database connection saturation, slow queries, and storage failures.
- Generation queue time, completion time, failure rate, and provider status drift.
- Credit balances, duplicate credit purchases, and failed Stripe signature checks.
- Auth callback failures and session cookie errors.
- Capture storage growth and old-object retention.

## Capacity Notes

At 50,000 users, the risky paths are uploads, image generation, webhooks, and payment idempotency. Keep user-facing requests short and move slow provider work behind queued jobs/webhooks where possible. If generation traffic spikes, protect the provider and Supabase with rate limits, per-user credit checks, and clear retry states rather than synchronous retries from the browser.

## Deployment Links

- Production: https://kitface-app.vercel.app
- Active branch preview: https://kitface-app-git-feat-football-waiting-messages-jimbrouws-projects.vercel.app
