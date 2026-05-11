# Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor for the project backing this app.

The app currently writes through Next.js API routes using `SUPABASE_SERVICE_ROLE_KEY`, so table RLS is enabled without public table policies. The storage bucket is public because MUAPI needs to fetch the source capture by URL for the image-only face swap.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=fan-hero-captures
MUAPI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For deployed webhooks, set `NEXT_PUBLIC_APP_URL` to the public app URL so MUAPI can call `/api/webhooks/muapi`.
