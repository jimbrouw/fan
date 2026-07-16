import { NextResponse } from "next/server";
import { getMemoryVideoJob, isMissingVideoJobsTable } from "@/lib/ai/videoJobMemory";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";

type VideoJobFileRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  user_id: string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ videoJobId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to download this animation." }, { status: 401 });
    }

    const { videoJobId } = await params;
    const supabase = createServerSupabaseClient();
    const { data: videoJob, error } = await supabase
      .from("video_jobs")
      .select("id,status,output_url,user_id")
      .eq("id", videoJobId)
      .single<VideoJobFileRow>();

    const resolvedVideoJob =
      error && isMissingVideoJobsTable(error)
        ? getMemoryVideoJob(videoJobId)
        : videoJob;

    if ((error && !isMissingVideoJobsTable(error)) || !resolvedVideoJob) {
      return NextResponse.json({ error: error?.message ?? "Video job not found." }, { status: 404 });
    }

    if (resolvedVideoJob.user_id !== user.id) {
      return NextResponse.json({ error: "You can only download your own animations." }, { status: 403 });
    }

    if (resolvedVideoJob.status !== "completed" || !resolvedVideoJob.output_url) {
      return NextResponse.json({ error: "Animated poster is not ready." }, { status: 409 });
    }

    const videoResponse = await fetch(resolvedVideoJob.output_url, { cache: "no-store" });
    if (!videoResponse.ok || !videoResponse.body) {
      return NextResponse.json({ error: "Animated poster is unavailable." }, { status: 502 });
    }

    const contentType = videoResponse.headers.get("content-type") ?? "video/mp4";
    if (!contentType.startsWith("video/") && contentType !== "application/octet-stream") {
      return NextResponse.json({ error: "Animation output is not a video." }, { status: 502 });
    }

    return new Response(videoResponse.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="kitface-${resolvedVideoJob.id}.mp4"`,
        "Content-Type": contentType === "application/octet-stream" ? "video/mp4" : contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Animated poster lookup failed." },
      { status: 500 }
    );
  }
}
