import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient, videoTestBucket } from "@/lib/supabase/server";
import { listSignedVideoTestImages } from "@/lib/supabase/videoTestImages";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to load test images." }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const images = await listSignedVideoTestImages(supabase, videoTestBucket, { limit: 30 });

    return NextResponse.json({ bucket: videoTestBucket, images });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load Supabase test images." },
      { status: 500 },
    );
  }
}
