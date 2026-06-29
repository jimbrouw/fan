import { NextResponse } from "next/server";
import { isExemptEmail } from "@/lib/credits";
import { getDefaultMuapiVideoModel, isMuapiVideoModelId } from "@/lib/ai/providers/muapiVideo";
import { createVideoProvider } from "@/lib/ai/providers/videoProvider";
import { isMissingVideoJobsTable, saveMemoryVideoJob } from "@/lib/ai/videoJobMemory";
import { KITFACE_VIDEO_PROMPT_4_SECONDS, KITFACE_VS_VIDEO_PROMPT_4_SECONDS, type VideoJobStatus } from "@/lib/ai/videoTypes";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient, videoTestBucket } from "@/lib/supabase/server";
import {
  buildSupabaseStorageUri,
  createSignedVideoTestImageUrl,
  isSupportedVideoTestImagePath,
} from "@/lib/supabase/videoTestImages";
import { checkRateLimit } from "@/lib/rateLimit";

type CreateVideoBody = {
  generationJobId?: string;
  videoModel?: string;
  testSourceImagePath?: string;
  posterType?: "single" | "vs";
};

type GenerationJobRow = {
  id: string;
  user_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  const message = error.message ?? "";
  return (
    new RegExp(`Could not find the '${column}' column`, "i").test(message) ||
    new RegExp(`column .*\\.${column} does not exist`, "i").test(message)
  );
}

export async function POST(request: Request) {
  let shouldRefundCredit = false;
  let userId: string | null = null;
  let userEmail: string | null = null;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to animate this poster." }, { status: 401 });
    }
    userId = user.id;
    userEmail = user.email ?? null;

    // Rate Limit (authenticated or IP)
    const limitResponse = checkRateLimit(userId, "video-jobs", { limit: 10, windowMs: 60 * 1000 });
    if (limitResponse) return limitResponse;

    const body = (await request.json()) as CreateVideoBody;
    if (!body.generationJobId) {
      return NextResponse.json({ error: "Missing generationJobId." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    let imageJobQuery = await supabase
      .from("generation_jobs")
      .select("id,user_id,status,output_url")
      .eq("id", body.generationJobId)
      .single<GenerationJobRow>();

    if (imageJobQuery.error && isMissingSchemaColumn(imageJobQuery.error, "user_id")) {
      const fallback = await supabase
        .from("generation_jobs")
        .select("id,status,output_url")
        .eq("id", body.generationJobId)
        .single<Omit<GenerationJobRow, "user_id">>();

      imageJobQuery = {
        ...fallback,
        data: fallback.data ? { ...fallback.data, user_id: null } : null,
      } as typeof imageJobQuery;
    }

    const { data: imageJob, error: imageJobError } = imageJobQuery;

    if (imageJobError || !imageJob) {
      return NextResponse.json({ error: imageJobError?.message ?? "Poster job not found." }, { status: 404 });
    }

    if (imageJob.user_id && imageJob.user_id !== userId) {
      return NextResponse.json({ error: "You can only animate your own posters." }, { status: 403 });
    }

    if (imageJob.status !== "completed" || !imageJob.output_url) {
      return NextResponse.json({ error: "The static poster must finish before animation can start." }, { status: 409 });
    }

    const videoModel = isMuapiVideoModelId(body.videoModel) ? body.videoModel : getDefaultMuapiVideoModel();
    const provider = createVideoProvider(`muapi:${videoModel}`);
    let sourceImageUrl = imageJob.output_url;
    let sourcePosterUrl = imageJob.output_url;
    const testSourceImagePath = body.testSourceImagePath?.trim();

    if (testSourceImagePath) {
      if (process.env.VERCEL_ENV === "production") {
        return NextResponse.json({ error: "Test source images are not available in production." }, { status: 403 });
      }
      if (!isSupportedVideoTestImagePath(testSourceImagePath)) {
        return NextResponse.json({ error: "Test source image must be a JPG, PNG, or WebP file." }, { status: 400 });
      }

      sourceImageUrl = await createSignedVideoTestImageUrl(supabase, videoTestBucket, testSourceImagePath);
      sourcePosterUrl = buildSupabaseStorageUri(videoTestBucket, testSourceImagePath);
    }

    const existing = await supabase
      .from("video_jobs")
      .select("id,status,output_url,error")
      .eq("generation_job_id", imageJob.id)
      .eq("provider", provider.id)
      .eq("source_poster_url", sourcePosterUrl)
      .in("status", ["queued", "processing", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; status: string; output_url: string | null; error: string | null }>();

    if (existing.data) {
      return NextResponse.json({
        videoJobId: existing.data.id,
        provider: provider.id,
        status: existing.data.status,
        outputUrl: existing.data.output_url,
        error: existing.data.error,
      });
    }

    // Spend the credit securely before submission
    if (!isExemptEmail(userEmail)) {
      const { data: newCredits, error: creditError } = await supabase.rpc("consume_user_credit", { p_user_id: userId });
      if (creditError || newCredits === null) {
        return NextResponse.json(
          { error: "Buy 3 more posters to animate this result.", code: "credits_required" },
          { status: 402 }
        );
      }
      shouldRefundCredit = true;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/video` : undefined;
    const videoPrompt = body.posterType === "vs" ? KITFACE_VS_VIDEO_PROMPT_4_SECONDS : KITFACE_VIDEO_PROMPT_4_SECONDS;
    const { providerJobId } = await provider.submitVideoJob({
      sourceImageUrl,
      prompt: videoPrompt,
      durationSeconds: 5,
      model: videoModel,
      webhookUrl,
    });

    const videoJobId = crypto.randomUUID();
    const now = new Date().toISOString();
    const videoJobInsert = {
      id: videoJobId,
      generation_job_id: imageJob.id,
      user_id: userId,
      source_poster_url: sourcePosterUrl,
      provider: provider.id,
      provider_job_id: providerJobId,
      status: "processing" as VideoJobStatus,
      output_url: null,
      error: null,
      duration_seconds: 5,
      created_at: now,
      updated_at: now,
    };

    let insert = await supabase.from("video_jobs").insert(videoJobInsert);

    if (insert.error && isMissingSchemaColumn(insert.error, "user_id")) {
      const legacyVideoJobInsert: Omit<typeof videoJobInsert, "user_id"> = { ...videoJobInsert };
      delete (legacyVideoJobInsert as Partial<typeof videoJobInsert>).user_id;
      insert = await supabase.from("video_jobs").insert(legacyVideoJobInsert);
    }

    if (insert.error && isMissingVideoJobsTable(insert.error)) {
      saveMemoryVideoJob(videoJobInsert);
      return NextResponse.json({ videoJobId, providerJobId, provider: provider.id, status: "processing" });
    }

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({ videoJobId, providerJobId, provider: provider.id, status: "processing" });
  } catch (error) {
    if (shouldRefundCredit && userId) {
      const fallbackSupabase = createServerSupabaseClient();
      await fallbackSupabase.rpc("add_user_credits", { p_user_id: userId, p_amount: 1 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video job creation failed." },
      { status: 500 }
    );
  }
}
