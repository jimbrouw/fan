# Fan Hero Web App Implementation Plan

## Phase 1: Image-Only MVP

Build a mobile-first web app that guides a fan through the capture sequence, stores usable reference images in Supabase, and starts an image-only MUAPI face swap job.

Included in this phase:

- Guided capture flow for the eight required angles.
- Client-side blur and brightness checks with manual-review status.
- Supabase session, capture, and generation job records.
- Public Supabase Storage URLs for MUAPI source image access.
- MUAPI image face swap request route.
- Job polling, webhook update handling, and result display.

Out of scope for this phase:

- Video generation.
- Payments.
- User accounts.
- Production-grade face detection checks.
- Admin moderation dashboard.

## Phase 2: Capture Quality

Add stronger client validation before upload.

- Detect no face, multiple faces, heavy sunglasses, cropped face, and low-confidence captures.
- Add per-step retake reasons.
- Store validation output in `captures.validation_results`.
- Add a reviewed/approved status path if manual moderation is needed.

## Phase 3: Generation Reliability

Harden the MUAPI job lifecycle.

- Confirm final MUAPI request and response field names against the live account docs.
- Persist provider raw responses for debugging.
- Add retry limits and clearer failed states.
- Add webhook request verification if MUAPI provides a signing mechanism.

## Phase 4: Production Readiness

Prepare the app for deployment.

- Configure Supabase project variables and run `supabase/schema.sql`.
- Set `NEXT_PUBLIC_APP_URL` to the deployed URL.
- Test camera capture on iPhone Safari and Android Chrome.
- Add basic rate limiting for upload and generation routes.
- Add retention cleanup for old capture sessions and storage objects.
