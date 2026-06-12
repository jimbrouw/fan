import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getCheckoutProduct, isPhysicalCheckoutOption } from "@/lib/checkout/products";
import {
  ProdigiFulfillmentProvider,
  readProdigiProductConfig,
  type ProdigiProductOptionId,
} from "@/lib/fulfillment/prodigi";
import { buildAuthenticatedAppUrl, buildAppUrl, getAppUrl } from "@/lib/appLinks";
import { sendTransactionalEmail } from "@/lib/notifications";
import { buildProdigiRecipient } from "@/lib/stripe/checkoutRecipient";
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

type UserEmailRow = {
  email: string;
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
  if (session.metadata?.kind === "credits") {
    await handleCreditsPurchase(session);
    return;
  }

  const jobId = session.metadata?.jobId;
  const optionId = session.metadata?.optionId as ProdigiProductOptionId | undefined;
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
      customer_email: await resolveCheckoutEmail(supabase, session),
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
    if (optionId === "download") {
      await sendDownloadFulfillmentEmail(supabase, session, jobId);
    }
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

  const recipient = buildProdigiRecipient(session);
  const config = readProdigiProductConfig(optionId);
  const provider = new ProdigiFulfillmentProvider();
  const order = await provider.createOrder({
    externalId: `kitface-${optionId}-${job.id}-${session.id}`,
    recipient,
    sku: config.sku,
    printReadyImageURL: job.output_url
  });

  await markOrderFulfilled(supabase, session.id, String(order.id));
  await sendPrintFulfillmentEmail(supabase, session, job.id, optionId);
}

async function handleCreditsPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const credits = Number.parseInt(session.metadata?.credits ?? "", 10);

  if (!userId || !Number.isFinite(credits) || credits <= 0) {
    throw new Error("Stripe credits session is missing userId or a valid credits amount.");
  }

  const supabase = createServerSupabaseClient();

  // Record the purchase keyed by Stripe session id for exactly-once crediting.
  // A duplicate webhook delivery hits the primary-key conflict and is ignored.
  const inserted = await supabase
    .from("credit_purchases")
    .insert({
      stripe_session_id: session.id,
      user_id: userId,
      credits,
      amount_total: session.amount_total,
      currency: session.currency,
    })
    .select("stripe_session_id")
    .maybeSingle<{ stripe_session_id: string }>();

  if (inserted.error) {
    if (inserted.error.code === "23505") {
      return; // Already processed this session.
    }
    throw new Error(inserted.error.message);
  }

  const { error: creditError } = await supabase.rpc("add_user_credits", {
    p_user_id: userId,
    p_amount: credits,
  });

  if (creditError) {
    throw new Error(creditError.message);
  }
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

async function resolveCheckoutEmail(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;

  if (userId) {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .maybeSingle<UserEmailRow>();

    if (user?.email) return user.email;
  }

  return session.customer_details?.email ?? session.customer_email ?? null;
}

async function sendDownloadFulfillmentEmail(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  session: Stripe.Checkout.Session,
  jobId: string
) {
  const to = await resolveCheckoutEmail(supabase, session);
  const appUrl = getAppUrl();
  const downloadUrl = `${buildAppUrl(`/api/jobs/${jobId}/image`, appUrl)}?download=1&noWatermark=1&session_id=${encodeURIComponent(session.id)}`;
  const resultUrl = buildAuthenticatedAppUrl(`/result/${jobId}`, appUrl);

  if (!to) return;

  try {
    await sendTransactionalEmail({
      to,
      subject: "Your Kitface download is ready",
      text: `Your paid Kitface poster download is ready with no watermark.\n\nDownload: ${downloadUrl}\n\nView in app: ${resultUrl}`,
      html: `
        <div style="margin:0;padding:24px;background:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1936;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #E4E4E7;border-radius:20px;overflow:hidden;">
            <div style="padding:28px 24px;background:#1C1936;color:#fff;text-align:center;">
              <h1 style="margin:0;font-size:26px;line-height:1.2;">Kitface</h1>
              <p style="margin:6px 0 0;color:#31F0D5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Download ready</p>
            </div>
            <div style="padding:28px 24px;text-align:center;">
              <h2 style="margin:0 0 10px;font-size:22px;line-height:1.25;">Your no-watermark poster is ready.</h2>
              <p style="margin:0 0 22px;color:#69697A;font-size:14px;line-height:1.6;">Tap the button below to download the full-resolution image to your phone.</p>
              <a href="${downloadUrl}" style="display:inline-block;background:#00CDAC;color:#1C1936;text-decoration:none;font-weight:800;font-size:15px;padding:14px 28px;border-radius:14px;">Download</a>
              <p style="margin:18px 0 0;color:#9A9AB0;font-size:12px;line-height:1.5;">You can also view it in the app: <a href="${resultUrl}" style="color:#00A88D;font-weight:700;text-decoration:none;">open poster</a>.</p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Download fulfillment email failed:", error instanceof Error ? error.message : error);
  }
}

async function sendPrintFulfillmentEmail(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  session: Stripe.Checkout.Session,
  jobId: string,
  optionId: string
) {
  const to = await resolveCheckoutEmail(supabase, session);
  const appUrl = getAppUrl();
  const resultUrl = buildAuthenticatedAppUrl(`/result/${jobId}`, appUrl);
  const productName = optionId === "poster" ? "A3 Poster" : "Greeting Card";

  if (!to) return;

  try {
    await sendTransactionalEmail({
      to,
      subject: "We're printing your Kitface order!",
      text: `We've received your order for a printed ${productName}. It is currently being processed by our print partner. You will receive another email with tracking information once it has shipped.\n\nView your poster: ${resultUrl}`,
      html: `
        <div style="margin:0;padding:24px;background:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1936;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #E4E4E7;border-radius:20px;overflow:hidden;">
            <div style="padding:28px 24px;background:#1C1936;color:#fff;text-align:center;">
              <h1 style="margin:0;font-size:26px;line-height:1.2;">Kitface</h1>
              <p style="margin:6px 0 0;color:#31F0D5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Order Received</p>
            </div>
            <div style="padding:28px 24px;text-align:center;">
              <h2 style="margin:0 0 10px;font-size:22px;line-height:1.25;">Your ${productName} is being printed.</h2>
              <p style="margin:0 0 22px;color:#69697A;font-size:14px;line-height:1.6;">We've sent your order to our print partner. You'll receive another email with tracking information as soon as it ships.</p>
              <a href="${resultUrl}" style="display:inline-block;background:#00CDAC;color:#1C1936;text-decoration:none;font-weight:800;font-size:15px;padding:14px 28px;border-radius:14px;">View Poster</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Print fulfillment email failed:", error instanceof Error ? error.message : error);
  }
}
