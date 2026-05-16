import { NextResponse } from "next/server";
import { PrintfulFulfillmentProvider, readPrintfulDraftOrderConfig } from "@/lib/fulfillment/printful";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type FulfillmentRequest = {
  jobId?: string;
};

type JobRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FulfillmentRequest;

    if (!body.jobId) {
      return NextResponse.json({ error: "jobId is required." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select("id,status,output_url")
      .eq("id", body.jobId)
      .single<JobRow>();

    if (error || !job) {
      return NextResponse.json({ error: error?.message ?? "Job not found." }, { status: 404 });
    }

    if (job.status !== "completed" || !job.output_url) {
      return NextResponse.json({ error: "Only completed jobs with an output image can be sent to Printful." }, { status: 409 });
    }

    const config = readPrintfulDraftOrderConfig();
    const provider = new PrintfulFulfillmentProvider();
    const order = await provider.createDraftOrder({
      externalId: `kitface-${job.id}`,
      recipient: config.recipient,
      catalogVariantId: config.catalogVariantId,
      printFileUrl: job.output_url,
      placement: config.placement,
      technique: config.technique
    });

    return NextResponse.json({
      provider: "printful",
      orderId: String(order.id),
      status: order.status ?? "draft"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Printful fulfillment failed.";
    const isSetupError =
      message.includes("PRINTFUL_") ||
      message.includes("Printful test recipient") ||
      message.includes("must be configured");

    return NextResponse.json(
      { error: message, setupRequired: isSetupError },
      { status: isSetupError ? 503 : 500 }
    );
  }
}
