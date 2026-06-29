import { NextResponse } from "next/server";
import { isProdigiCardOption, ProdigiFulfillmentProvider, readProdigiDraftOrderConfig, type ProdigiProductOptionId } from "@/lib/fulfillment/prodigi";
import { createProdigiCardPrintAsset } from "@/lib/fulfillment/cardPrintAsset";
import { decideOwnedResourceAccess } from "@/lib/authz";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type FulfillmentRequest = {
  jobId?: string;
  optionId?: ProdigiProductOptionId;
  cardMessage?: string;
};

type JobRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  user_id: string | null;
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  const message = error.message ?? "";
  return (
    new RegExp(`Could not find the '${column}' column`, "i").test(message) ||
    new RegExp(`column .*\\.${column} does not exist`, "i").test(message)
  );
}

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Direct Prodigi test fulfillment is disabled." }, { status: 404 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to fulfill this order." }, { status: 401 });
    }

    const body = (await request.json()) as FulfillmentRequest;

    if (!body.jobId) {
      return NextResponse.json({ error: "jobId is required." }, { status: 400 });
    }

    if (body.optionId === "download") {
      return NextResponse.json({ error: "Download orders do not use Prodigi fulfillment." }, { status: 400 });
    }

    const cardMessage = typeof body.cardMessage === "string" ? body.cardMessage.trim() : "";
    if (cardMessage.length > 240) {
      return NextResponse.json({ error: "Card message must be 240 characters or fewer." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    let userIdColumnMissing = false;
    let jobResult = await supabase
      .from("generation_jobs")
      .select("id,status,output_url,user_id")
      .eq("id", body.jobId)
      .single<JobRow>();

    if (jobResult.error && isMissingSchemaColumn(jobResult.error, "user_id")) {
      userIdColumnMissing = true;
      const fallback = await supabase
        .from("generation_jobs")
        .select("id,status,output_url")
        .eq("id", body.jobId)
        .single<Omit<JobRow, "user_id">>();

      jobResult = {
        ...fallback,
        data: fallback.data ? { ...fallback.data, user_id: null } : null,
      } as typeof jobResult;
    }

    const { data: job, error } = jobResult;

    if (error || !job) {
      return NextResponse.json({ error: error?.message ?? "Job not found." }, { status: 404 });
    }

    const access = decideOwnedResourceAccess({
      ownerColumnAvailable: !userIdColumnMissing,
      resourceUserId: job.user_id,
      requesterUserId: user.id,
    });
    if (access === "deny") {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (job.status !== "completed" || !job.output_url) {
      return NextResponse.json({ error: "Only completed jobs with an output image can be sent to Prodigi." }, { status: 409 });
    }

    const optionId = body.optionId ?? "birthday-card";
    const config = readProdigiDraftOrderConfig(optionId);
    const printReadyImageURL = isProdigiCardOption(optionId)
      ? await createProdigiCardPrintAsset({
          supabase,
          posterUrl: job.output_url,
          message: cardMessage,
          assetKey: `${job.id}-development`,
        })
      : job.output_url;
    const provider = new ProdigiFulfillmentProvider();
    const order = await provider.createOrder({
      externalId: `kitface-${optionId}-${job.id}`,
      recipient: config.recipient,
      sku: config.sku,
      printReadyImageURL
    });

    return NextResponse.json({
      provider: "prodigi",
      productType: config.productType,
      orderId: String(order.id),
      status: order.status ?? "Created"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prodigi fulfillment failed.";
    const isSetupError =
      message.includes("PRODIGI_") ||
      message.includes("Prodigi test recipient") ||
      message.includes("must be configured");

    return NextResponse.json(
      { error: message, setupRequired: isSetupError },
      { status: isSetupError ? 503 : 500 }
    );
  }
}
