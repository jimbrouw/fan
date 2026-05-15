import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type VideoJobFileRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

export async function GET(_request: Request, { params }: { params: Promise<{ videoJobId: string }> }) {
  try {
    const { videoJobId } = await params;
    const supabase = createServerSupabaseClient();
    const { data: videoJob, error } = await supabase
      .from("video_jobs")
      .select("id,status,output_url")
      .eq("id", videoJobId)
      .single<VideoJobFileRow>();

    if (error || !videoJob) {
      return NextResponse.json({ error: error?.message ?? "Video job not found." }, { status: 404 });
    }

    if (videoJob.status !== "completed" || !videoJob.output_url) {
      return NextResponse.json({ error: "Animated poster is not ready." }, { status: 409 });
    }

    const videoResponse = await fetch(videoJob.output_url, { cache: "no-store" });
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
        "Content-Disposition": `inline; filename="kitface-${videoJob.id}.mp4"`,
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
