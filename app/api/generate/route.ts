import { NextResponse } from "next/server";
import { getPosterStyle } from "@/lib/posterTemplates";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { FalGptImage2GenerationProvider } from "@/lib/ai/providers/fal";
import { buildPosterPrompt, normalizeKitBrandPlacementMode } from "@/lib/ai/promptBuilder";
import { getKitSpec, type KitVariant } from "@/lib/kitSpecs";
import { buildUsableReferenceImageUrls } from "@/lib/remoteImages";
import { upsertUserProfile } from "@/lib/users";
import type { TeamProfile } from "@/lib/teamProfiles";
import type { MatchContext } from "@/lib/ai/promptBuilder";
import type { MuapiGptImageTestMode } from "@/lib/ai/providers/muapi";
import { FREE_TIER_GENERATIONS, isExemptEmail, isValidMarketingKey } from "@/lib/credits";
import { validatePosterPersonalisation } from "@/lib/safety/profanity";

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

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  return new RegExp(`Could not find the '${column}' column`, "i").test(error.message ?? "");
}

function normalizeGptImageMode(mode?: string): MuapiGptImageTestMode {
  return mode === "draft-1k-medium" || mode === "fast-1k-low" ? mode : "final-2k-high";
}

function uniqueUrls(urls: string[]) {
  return [...new Set(urls)];
}

export async function POST(request: Request) {
  let consumeCreditAfterSuccess = false;
  let userId: string | null = null;

  try {
    const marketingKey = request.headers.get("x-marketing-key");
    const isMarketingServiceRequest = isValidMarketingKey(marketingKey);

    const user = isMarketingServiceRequest ? null : await getCurrentUser();
    if (!isMarketingServiceRequest && !user) {
      return NextResponse.json({ error: "Sign in with Google before generating your poster." }, { status: 401 });
    }
    userId = isMarketingServiceRequest ? "marketing-service" : user!.id;
    if (!isMarketingServiceRequest) await upsertUserProfile(user!);

    const isExempt = isMarketingServiceRequest || isExemptEmail(user?.email);
    if (!isExempt) {
      const usageClient = createServerSupabaseClient();
      const { count, error: usageError } = await usageClient
        .from("generation_jobs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);

      // Fail open if the user_id column isn't migrated yet so we never falsely block.
      if (!usageError && (count ?? 0) >= FREE_TIER_GENERATIONS) {
        // Free posters used up — this generation must be paid for with a credit.
        const { data: profile } = await usageClient
          .from("users")
          .select("credits")
          .eq("id", user!.id)
          .single<{ credits: number }>();

        if ((profile?.credits ?? 0) <= 0) {
          return NextResponse.json(
            {
              error: `You've used all ${FREE_TIER_GENERATIONS} of your free posters. Add credits to keep creating.`,
              code: "free_tier_exhausted",
            },
            { status: 402 }
          );
        }
        consumeCreditAfterSuccess = true; // We will consume the credit before submission
      }
    }

    const body = (await request.json()) as GenerateBody;
    if (!body.sessionId || !body.sourceImageUrl || !body.teamName || !body.kitNotes || !body.teamProfile) {
      return NextResponse.json(
        { error: "Missing sessionId, sourceImageUrl, teamName, kitNotes, or teamProfile." },
        { status: 400 }
      );
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
    const brandPlacementMode = normalizeKitBrandPlacementMode(process.env.KITFACE_BRAND_PLACEMENT_MODE);
    if (body.matchContext?.opponentMode === "another-person" && !body.matchContext.opponentSourceImageUrl) {
      return NextResponse.json(
        { error: "Add the other person's photo before generating this VS poster." },
        { status: 400 }
      );
    }

    // Spend the credit securely before submission
    if (consumeCreditAfterSuccess) {
      const usageClient = createServerSupabaseClient();
      const { data: newCredits, error: creditError } = await usageClient.rpc("consume_user_credit", { p_user_id: user!.id });
      if (creditError || newCredits === null) {
        return NextResponse.json(
          {
            error: `You've used all ${FREE_TIER_GENERATIONS} of your free posters. Add credits to keep creating.`,
            code: "free_tier_exhausted",
          },
          { status: 402 }
        );
      }
    }

    const requestedGptImageMode = normalizeGptImageMode(body.gptImageTestMode);
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
      model: body.model,
      correctionPrompt: body.correctionPrompt,
      brandPlacementMode,
      shirtName: body.shirtName,
      teamSlogan: body.teamSlogan,
      accessibilityNote: body.accessibilityNote,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/generation` : undefined;

    const { providerJobId, provider: jobProvider } = await submitStaticGenerationJob({
      prompt,
      referenceImageUrls,
      model: body.model,
      gptImageTestMode: requestedGptImageMode,
      webhookUrl,
    });

    // Marketing service requests skip DB tracking — tracking happens in the marketing repo.
    if (isMarketingServiceRequest) {
      return NextResponse.json({ requestId: providerJobId, provider: jobProvider, status: "processing" });
    }

    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();
    const jobId = crypto.randomUUID();
    const jobInsert = {
      id: jobId,
      session_id: body.sessionId,
      user_id: userId as string,
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
        `Model: ${body.model || "wan2.7-image-edit"}`,
        body.model === "gpt-image-2" || body.model === "gpt-image-2-fast" ? `GPT Image test mode: ${requestedGptImageMode}` : undefined,
        `Poster style: ${posterStyle.name}`
      ].filter(Boolean).join("\n"),
      target_poster_url: "", // Not used in this generation mode, but required by schema
      provider_job_id: providerJobId, // Storing the provider job ID
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

    // Analytics logging
    const analyticsInsert = {
      generation_job_id: jobId,
      user_id: userId as string,
      team_name: body.teamName,
      kit_variant: kitVariant,
      poster_style: posterStyle.name,
      model: body.model || "wan2.7-image-edit",
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
      .update({ user_id: userId as string, status: "generating" })
      .eq("id", body.sessionId);

    if (sessionUpdate.error && isMissingSchemaColumn(sessionUpdate.error, "user_id")) {
      await supabase
        .from("capture_sessions")
        .update({ status: "generating" })
        .eq("id", body.sessionId);
    }

    return NextResponse.json({ jobId, requestId: providerJobId, status: "processing" });
  } catch (error) {
    if (consumeCreditAfterSuccess && userId) {
      // Refund the credit if generation failed synchronously
      const supabase = createServerSupabaseClient();
      await supabase.rpc("add_user_credits", { p_user_id: userId, p_amount: 1 });
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

async function submitStaticGenerationJob(input: {
  prompt: string;
  referenceImageUrls: string[];
  model?: string;
  gptImageTestMode?: MuapiGptImageTestMode;
  webhookUrl?: string;
}): Promise<{ providerJobId: string; provider: "fal" | "muapi" }> {
  const isGptImage = input.model === "gpt-image-2" || input.model === "gpt-image-2-fast";
  const useFalPrimary = process.env.FAL_KEY && isGptImage;

  if (useFalPrimary) {
    try {
      const falProvider = new FalGptImage2GenerationProvider();
      const { providerJobId } = await falProvider.submitJob({
        prompt: input.prompt,
        referenceImageUrls: input.referenceImageUrls,
      });
      return { providerJobId, provider: "fal" };
    } catch (error) {
      console.warn("FAL GPT Image 2 submission failed; falling back to MUAPI.", {
        error: error instanceof Error ? error.message : String(error),
      });
      const muapiProvider = new MuapiGenerationProvider();
      const { providerJobId } = await muapiProvider.submitJob(input);
      return { providerJobId, provider: "muapi" };
    }
  }

  // Default MUAPI behavior for other models
  const muapiProvider = new MuapiGenerationProvider();
  try {
    const { providerJobId } = await muapiProvider.submitJob(input);
    return { providerJobId, provider: "muapi" };
  } catch (error) {
    const shouldFallbackToFal =
      input.model === "gpt-image-2" &&
      input.gptImageTestMode === "final-2k-high" &&
      Boolean(process.env.FAL_KEY);

    if (!shouldFallbackToFal) {
      throw error;
    }

    console.warn("MUAPI 2K GPT Image 2 submission failed; falling back to fal GPT Image 2.", {
      error: error instanceof Error ? error.message : String(error),
    });

    const falProvider = new FalGptImage2GenerationProvider();
    const { providerJobId } = await falProvider.submitJob({
      prompt: input.prompt,
      referenceImageUrls: input.referenceImageUrls,
    });
    return { providerJobId, provider: "fal" };
  }
}
