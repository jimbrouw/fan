import { NextResponse } from "next/server";
import { getPosterStyle } from "@/lib/posterTemplates";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { buildPosterPrompt, normalizeKitBrandPlacementMode } from "@/lib/ai/promptBuilder";
import { getKitSpec, type KitVariant } from "@/lib/kitSpecs";
import { buildUsableReferenceImageUrls } from "@/lib/remoteImages";
import { upsertUserProfile } from "@/lib/users";
import type { TeamProfile } from "@/lib/teamProfiles";
import type { MatchContext } from "@/lib/ai/promptBuilder";

type GenerateBody = {
  sessionId: string;
  sourceImageUrl: string;
  teamId?: string;
  teamName: string;
  kitNotes: string;
  model?: string;
  correctionPrompt?: string;
  kitVariant?: KitVariant;
  posterStyleId?: string;
  matchContext?: MatchContext;
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

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in with Google before generating your poster." }, { status: 401 });
    }
    await upsertUserProfile(user);

    const body = (await request.json()) as GenerateBody;
    if (!body.sessionId || !body.sourceImageUrl || !body.teamName || !body.kitNotes || !body.teamProfile) {
      return NextResponse.json(
        { error: "Missing sessionId, sourceImageUrl, teamName, kitNotes, or teamProfile." },
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

    const referenceImageUrls = await buildUsableReferenceImageUrls({
      requiredSourceImageUrl: body.sourceImageUrl,
      optionalReferenceImageUrls: [
        body.matchContext?.opponentSourceImageUrl,
        kitSpec?.referenceImageUrl,
        homeKitSpec?.referenceImageUrl,
        awayKitSpec?.referenceImageUrl
      ].filter((url): url is string => Boolean(url)),
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
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl ? `${appUrl}/api/webhooks/generation` : undefined;

    const provider = new MuapiGenerationProvider();

    const { providerJobId } = await provider.submitJob({
      prompt,
      referenceImageUrls,
      model: body.model,
      webhookUrl,
    });

    if (!providerJobId) {
      return NextResponse.json({ error: "Provider did not return a job id." }, { status: 502 });
    }

    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();
    const jobId = crypto.randomUUID();
    const jobInsert = {
      id: jobId,
      session_id: body.sessionId,
      user_id: user.id,
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
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    const sessionUpdate = await supabase
      .from("capture_sessions")
      .update({ user_id: user.id, status: "generating" })
      .eq("id", body.sessionId);

    if (sessionUpdate.error && isMissingSchemaColumn(sessionUpdate.error, "user_id")) {
      await supabase
        .from("capture_sessions")
        .update({ status: "generating" })
        .eq("id", body.sessionId);
    }

    return NextResponse.json({ jobId, requestId: providerJobId, status: "processing" });
  } catch (error) {
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
