import { NextResponse } from "next/server";
import { getPosterStyle } from "@/lib/posterTemplates";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient, captureBucket } from "@/lib/supabase/server";
import { buildPosterPrompt, normalizeKitBrandPlacementMode } from "@/lib/ai/promptBuilder";
import { getKitSpec, type KitVariant } from "@/lib/kitSpecs";
import { buildUsableReferenceImageUrls } from "@/lib/remoteImages";
import { upsertUserProfile } from "@/lib/users";
import type { TeamProfile } from "@/lib/teamProfiles";
import type { MatchContext } from "@/lib/ai/promptBuilder";
import type { MuapiGptImageTestMode } from "@/lib/ai/providers/muapi";
import { submitStaticGenerationJob } from "@/lib/ai/providers/staticGeneration";
import { FREE_TIER_GENERATIONS, isExemptEmail, isValidMarketingKey } from "@/lib/credits";
import { validatePosterPersonalisation } from "@/lib/safety/profanity";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseSupabaseStorageUri } from "@/lib/supabase/storage";

type GenerateBody = {
  sessionId: string;
  sourceImageUrl: string;
  personReferenceImageUrls?: string[];
  teamId?: string;
  teamName: string;
  kitNotes: string;
  model?: string;
  correctionPrompt?: string;
  kitVariant?: KitVariant;
  posterStyleId?: string;
  gptImageTestMode?: string;
  matchContext?: MatchContext;
  shirtName?: string;
  teamSlogan?: string;
  accessibilityNote?: string;
  teamProfile?: {
    name: string;
    primary: string;
    accent: string;
    kitNotes: string;
    trophy?: string;
    group: TeamProfile["group"];
    nickname?: string;
    visualMotifs?: string[];
  };
};

type CaptureSessionRow = {
  id: string;
  user_id: string | null;
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  return new RegExp(`Could not find the '${column}' column`, "i").test(error.message ?? "");
}

function normalizeGptImageMode(mode?: string): MuapiGptImageTestMode {
  return mode === "draft-1k-medium" || mode === "fast-1k-low" ? mode : "final-2k-high";
}

function uniqueUrls(urls: string[]) {
  return [...new Set(urls)];
}

function validateClientImageUrl(url: string, sessionId: string, supabaseUrl: string, bucket: string): boolean {
  if (!url) return true;

  const parsedUri = parseSupabaseStorageUri(url);
  if (parsedUri) {
    if (parsedUri.bucket !== bucket) return false;
    return parsedUri.path.startsWith(`${sessionId}/`);
  }

  if (url.startsWith(supabaseUrl)) {
    const expectedPrefix = `${bucket}/${sessionId}/`;
    return url.includes(expectedPrefix);
  }

  return false;
}

export async function POST(request: Request) {
  let consumeCreditAfterSuccess = false;
  let userId: string | null = null;
  let preInsertedJobId: string | null = null;

  try {
    const marketingKey = request.headers.get("x-marketing-key");
    const isMarketingServiceRequest = isValidMarketingKey(marketingKey);

    const user = isMarketingServiceRequest ? null : await getCurrentUser();
    if (!isMarketingServiceRequest && !user) {
      return NextResponse.json({ error: "Sign in with Google before generating your poster." }, { status: 401 });
    }
    userId = isMarketingServiceRequest ? "marketing-service" : user!.id;
    if (user) {
      await upsertUserProfile(user);
    }

    // Rate Limit (authenticated or IP)
    const limitResponse = checkRateLimit(userId, "generate", { limit: 10, windowMs: 60 * 1000 });
    if (limitResponse) return limitResponse;

    const body = (await request.json()) as GenerateBody;
    if (!body.sessionId || !body.sourceImageUrl || !body.teamName || !body.kitNotes || !body.teamProfile) {
      return NextResponse.json(
        { error: "Missing sessionId, sourceImageUrl, teamName, kitNotes, or teamProfile." },
        { status: 400 }
      );
    }

    // Validate capture session ownership
    const supabase = createServerSupabaseClient();
    const sessionQuery = await supabase
      .from("capture_sessions")
      .select("id,user_id")
      .eq("id", body.sessionId)
      .maybeSingle<CaptureSessionRow>();

    if (sessionQuery.error) {
      console.error("Session lookup error:", sessionQuery.error.message);
      return NextResponse.json({ error: "Service temporarily unavailable. Please try again." }, { status: 503 });
    }

    if (!sessionQuery.data) {
      return NextResponse.json({ error: "Capture session not found." }, { status: 404 });
    }

    const resourceUserId = sessionQuery.data.user_id;
    if (resourceUserId && resourceUserId !== userId) {
      return NextResponse.json({ error: "Capture session not found." }, { status: 404 });
    }

    // Validate client-supplied image URLs
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const clientUrls = [
      body.sourceImageUrl,
      ...(body.personReferenceImageUrls ?? []),
      body.matchContext?.opponentSourceImageUrl
    ].filter((url): url is string => Boolean(url));

    for (const url of clientUrls) {
      if (!validateClientImageUrl(url, body.sessionId, supabaseUrl, captureBucket)) {
        return NextResponse.json({ error: "Access denied to reference images." }, { status: 403 });
      }
    }

    const personalisationSafetyError = validatePosterPersonalisation({
      shirtName: body.shirtName,
      teamSlogan: body.teamSlogan,
      teamName: body.teamName,
      kitNotes: body.kitNotes,
      matchdayNotes: body.matchContext?.matchdayNotes,
    });

    if (personalisationSafetyError) {
      return NextResponse.json(
        {
          error: personalisationSafetyError.message,
          field: personalisationSafetyError.field,
          code: "unsafe_personalisation"
        },
        { status: 400 }
      );
    }

    const posterStyle = getPosterStyle(body.posterStyleId ?? "hero-card");
    const kitVariant = body.kitVariant ?? "home";
    const kitSpec = body.teamId ? getKitSpec(body.teamId, kitVariant) : undefined;
    const homeKitSpec = body.matchContext ? getKitSpec(body.matchContext.homeTeam.id, body.matchContext.homeTeam.kitVariant) : undefined;
    const awayKitSpec = body.matchContext ? getKitSpec(body.matchContext.awayTeam.id, body.matchContext.awayTeam.kitVariant) : undefined;
    const previewBrandPlacementMode = normalizeKitBrandPlacementMode(process.env.KITFACE_BRAND_PLACEMENT_MODE);
    if (body.matchContext?.opponentMode === "another-person" && !body.matchContext.opponentSourceImageUrl) {
      return NextResponse.json(
        { error: "Add the other person's photo before generating this VS poster." },
        { status: 400 }
      );
    }

    const brandPlacementMode = previewBrandPlacementMode;
    const requestedModel = body.model || "gpt-image-2";
    const requestedGptImageMode = normalizeGptImageMode(body.gptImageTestMode);

    const now = new Date().toISOString();
    let jobId = "";

    if (!isMarketingServiceRequest) {
      jobId = crypto.randomUUID();
      preInsertedJobId = jobId;

      const jobInsert = {
        id: jobId,
        session_id: body.sessionId,
        user_id: userId,
        team_name: body.teamName,
        kit_notes: [
          body.kitNotes,
          `Kit variant: ${kitVariant}`,
          kitSpec ? `Kit spec: ${kitSpec.season} ${kitSpec.team} ${kitSpec.variant}` : undefined,
          body.matchContext
            ? `Match: ${body.matchContext.homeTeam.name} vs ${body.matchContext.awayTeam.name}; user side: ${body.matchContext.userSide}; opponent mode: ${body.matchContext.opponentMode}`
            : undefined,
          body.matchContext?.matchdayNotes ? `Matchday notes: ${body.matchContext.matchdayNotes}` : undefined,
          `Brand placement mode: ${brandPlacementMode}`,
          `Model: ${requestedModel}`,
          requestedModel === "gpt-image-2" || requestedModel === "gpt-image-2-fast" ? `GPT Image test mode: ${requestedGptImageMode}` : undefined,
          `Poster style: ${posterStyle.name}`
        ].filter(Boolean).join("\n"),
        target_poster_url: "",
        provider_job_id: "pending",
        status: "processing",
        created_at: now,
        updated_at: now
      };

      let insert = await supabase.from("generation_jobs").insert(jobInsert);

      if (insert.error && isMissingSchemaColumn(insert.error, "user_id")) {
        const legacyJobInsert: Omit<typeof jobInsert, "user_id"> = { ...jobInsert };
        delete (legacyJobInsert as Partial<typeof jobInsert>).user_id;
        insert = await supabase.from("generation_jobs").insert(legacyJobInsert);
      }

      if (insert.error) {
        throw new Error(insert.error.message);
      }
    }

    const isExempt = isMarketingServiceRequest || isExemptEmail(user?.email);
    if (!isExempt) {
      // Get all jobs for the user ordered deterministically
      const { data: userJobs, error: jobsError } = await supabase
        .from("generation_jobs")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      if (jobsError) {
        console.error("Usage check failed:", jobsError.message);
        throw new Error("Service temporarily unavailable. Please try again.");
      }

      const jobIndex = userJobs ? userJobs.findIndex(j => j.id === jobId) : -1;
      if (jobIndex === -1) {
        throw new Error("Job verification failed.");
      }

      if (jobIndex >= FREE_TIER_GENERATIONS) {
        // Spend the credit securely before submission
        const { data: newCredits, error: creditError } = await supabase.rpc("consume_user_credit", { p_user_id: userId });

        if (creditError || newCredits === null) {
          await supabase.from("generation_jobs").delete().eq("id", jobId);
          preInsertedJobId = null;
          return NextResponse.json(
            {
              error: `You've used your free preview. Buy 3 more posters to keep creating.`,
              code: "free_tier_exhausted",
            },
            { status: 402 }
          );
        }
        consumeCreditAfterSuccess = true;
      }
    }

    const referenceImageUrls = await buildUsableReferenceImageUrls({
      requiredSourceImageUrl: body.sourceImageUrl,
      optionalReferenceImageUrls: uniqueUrls([
        ...(body.matchContext ? [] : body.personReferenceImageUrls ?? []),
        body.matchContext?.opponentSourceImageUrl,
        body.matchContext ? undefined : kitSpec?.referenceImageUrl,
        homeKitSpec?.referenceImageUrl,
        awayKitSpec?.referenceImageUrl
      ].filter((url): url is string => Boolean(url))),
    });

    const prompt = buildPosterPrompt({
      teamProfile: body.teamProfile,
      posterStyle,
      kitSpec,
      homeKitSpec,
      awayKitSpec,
      matchContext: body.matchContext,
      model: requestedModel,
      correctionPrompt: body.correctionPrompt,
      brandPlacementMode,
      shirtName: body.shirtName,
      teamSlogan: body.teamSlogan,
      accessibilityNote: body.accessibilityNote,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/generation` : undefined;

    const providerJobId = await submitStaticGenerationJob({
      prompt,
      referenceImageUrls,
      model: requestedModel,
      gptImageTestMode: requestedGptImageMode,
      webhookUrl,
    });

    if (!providerJobId) {
      throw new Error("Provider did not return a job id.");
    }

    if (isMarketingServiceRequest) {
      const provider = providerJobId.startsWith("muapi:") ? "muapi"
        : providerJobId.startsWith("fal:") ? "fal"
          : "muapi";
      return NextResponse.json({ requestId: providerJobId, provider, status: "processing" });
    }

    // Update pre-inserted job with providerJobId
    const jobUpdate = await supabase
      .from("generation_jobs")
      .update({ provider_job_id: providerJobId })
      .eq("id", jobId);

    if (jobUpdate.error) {
      throw new Error(jobUpdate.error.message);
    }

    // Analytics logging
    const analyticsInsert = {
      generation_job_id: jobId,
      user_id: userId,
      team_name: body.teamName,
      kit_variant: kitVariant,
      poster_style: posterStyle.name,
      model: requestedModel,
      status: "processing",
    };
    
    const analyticsRes = await supabase.from("generation_analytics").insert(analyticsInsert);
    if (analyticsRes.error && isMissingSchemaColumn(analyticsRes.error, "user_id")) {
      const legacyAnalyticsInsert: Omit<typeof analyticsInsert, "user_id"> = { ...analyticsInsert };
      delete (legacyAnalyticsInsert as Partial<typeof analyticsInsert>).user_id;
      await supabase.from("generation_analytics").insert(legacyAnalyticsInsert);
    }

    const sessionUpdate = await supabase
      .from("capture_sessions")
      .update({ user_id: userId, status: "generating" })
      .eq("id", body.sessionId);

    if (sessionUpdate.error && isMissingSchemaColumn(sessionUpdate.error, "user_id")) {
      await supabase
        .from("capture_sessions")
        .update({ status: "generating" })
        .eq("id", body.sessionId);
    }

    return NextResponse.json({ jobId, requestId: providerJobId, status: "processing" });
  } catch (error) {
    const supabase = createServerSupabaseClient();
    if (consumeCreditAfterSuccess && userId) {
      // Refund the credit if generation failed synchronously
      await supabase.rpc("add_user_credits", { p_user_id: userId, p_amount: 1 });
    }

    if (preInsertedJobId) {
      await supabase.from("generation_jobs").delete().eq("id", preInsertedJobId);
    }

    const message = error instanceof Error ? error.message : "Generation request failed.";
    if (message.includes("selected face reference image")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Generation request failed:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
