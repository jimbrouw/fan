import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getCheckoutProduct, isPhysicalCheckoutOption } from "@/lib/checkout/products";
import {
  PrintfulFulfillmentProvider,
  readPrintfulProductConfig,
  type PrintfulProductOptionId,
  type PrintfulRecipient
} from "@/lib/fulfillment/printful";
import { getStripe } from "@/lib/stripe/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type JobRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

type PurchaseOrderRow = {
  stripe_session_id: string;
  status: "processing" | "fulfilled" | "failed";
  printful_order_id: string | null;
};

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe webhook handling failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const jobId = session.metadata?.jobId;
  const optionId = session.metadata?.optionId as PrintfulProductOptionId | undefined;
  const cardMessage = session.metadata?.cardMessage?.trim() || null;

  if (!jobId || !optionId) {
    throw new Error("Stripe session is missing jobId or optionId metadata.");
  }

  const product = getCheckoutProduct(optionId);
  if (!product) {
    throw new Error(`Unknown checkout option: ${optionId}.`);
  }

  const supabase = createServerSupabaseClient();
  const existingOrder = await readExistingOrder(supabase, session.id);

  if (existingOrder?.status === "fulfilled") {
    return;
  }

  const { error: orderUpsertError } = await supabase.from("purchase_orders").upsert(
    {
      stripe_session_id: session.id,
      generation_job_id: jobId,
      option_id: optionId,
      status: "processing",
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email ?? null,
      customer_message: cardMessage,
      updated_at: new Date().toISOString()
    },
    { onConflict: "stripe_session_id" }
  );

  if (orderUpsertError) {
    throw new Error(orderUpsertError.message);
  }

  if (!isPhysicalCheckoutOption(optionId)) {
    await markOrderFulfilled(supabase, session.id, null);
    return;
  }

  const { data: job, error } = await supabase
    .from("generation_jobs")
    .select("id,status,output_url")
    .eq("id", jobId)
    .single<JobRow>();

  if (error || !job) {
    throw new Error(error?.message ?? "Job not found for Stripe checkout session.");
  }

  if (job.status !== "completed" || !job.output_url) {
    throw new Error("Only completed jobs with an output image can be fulfilled.");
  }

  const recipient = buildPrintfulRecipient(session);
  const config = readPrintfulProductConfig(optionId);
  const provider = new PrintfulFulfillmentProvider();
  const order = await provider.createDraftOrder({
    externalId: `kitface-${optionId}-${job.id}-${session.id}`,
    recipient,
    catalogVariantId: config.catalogVariantId,
    printFileUrl: job.output_url,
    placement: config.placement,
    technique: config.technique
  });

  await markOrderFulfilled(supabase, session.id, String(order.id));
}

async function readExistingOrder(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  stripeSessionId: string
) {
  const { data } = await supabase
    .from("purchase_orders")
    .select("stripe_session_id,status,printful_order_id")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle<PurchaseOrderRow>();

  return data;
}

async function markOrderFulfilled(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  stripeSessionId: string,
  printfulOrderId: string | null
) {
  const { error } = await supabase
    .from("purchase_orders")
    .update({
      status: "fulfilled",
      printful_order_id: printfulOrderId,
      updated_at: new Date().toISOString()
    })
    .eq("stripe_session_id", stripeSessionId);

  if (error) {
    throw new Error(error.message);
  }
}

function buildPrintfulRecipient(session: Stripe.Checkout.Session): PrintfulRecipient {
  const shipping = session.collected_information?.shipping_details;
  const address = shipping?.address;

  if (!shipping?.name || !address?.line1 || !address.city || !address.country || !address.postal_code) {
    throw new Error("Stripe checkout session is missing a complete shipping address.");
  }

  return {
    name: shipping.name,
    address1: address.line1,
    address2: address.line2 ?? undefined,
    city: address.city,
    state_code: address.state ?? undefined,
    country_code: address.country,
    zip: address.postal_code,
    phone: session.customer_details?.phone ?? undefined,
    email: session.customer_details?.email ?? undefined
  };
}
