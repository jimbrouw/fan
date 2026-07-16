import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/notifications";
import { buildAuthenticatedAppUrl, getAppUrl } from "@/lib/appLinks";

type ProdigiWebhookPayload = {
  type?: string;
  data?: {
    id?: string | number;
    status?: {
      stage?: string;
    };
    shipments?: Array<{
      carrier?: string | null;
      trackingNumber?: string | null;
      tracking_number?: string | null;
      trackingUrl?: string | null;
      tracking_url?: string | null;
    }>;
  };
};

type PurchaseOrderDispatchRow = {
  stripe_session_id: string;
  customer_email: string | null;
  generation_job_id: string;
  option_id: string;
};

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const expectedSecret = process.env.PRODIGI_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error("PRODIGI_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Webhook signature secret is not configured" }, { status: 500 });
    }

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as ProdigiWebhookPayload;

    const isStageChanged = payload.type === "com.prodigi.order.status.stage.changed";
    const orderData = payload.data;
    const stage = orderData?.status?.stage;

    if (!isStageChanged || stage !== "Shipped") {
      return NextResponse.json({ received: true, message: "Ignored event type or stage" });
    }

    const orderId = orderData?.id;
    const shipments = orderData?.shipments;

    if (!orderId || !shipments || !Array.isArray(shipments) || shipments.length === 0) {
      return NextResponse.json({ error: "Missing order id or shipment details" }, { status: 400 });
    }

    const shipment = shipments[0];
    const trackingUrl = shipment.trackingUrl || shipment.tracking_url;
    const carrier = shipment.carrier;
    const trackingNumber = shipment.trackingNumber || shipment.tracking_number;

    const supabase = createServerSupabaseClient();
    const sentAt = new Date().toISOString();

    const { data: purchaseOrder, error: claimError } = await supabase
      .from("purchase_orders")
      .update({
        dispatch_email_sent_at: sentAt,
        tracking_carrier: carrier ?? null,
        tracking_number: trackingNumber ?? null,
        tracking_url: trackingUrl ?? null,
        updated_at: sentAt
      })
      .eq("printful_order_id", String(orderId))
      .is("dispatch_email_sent_at", null)
      .select("stripe_session_id,customer_email,generation_job_id,option_id")
      .maybeSingle<PurchaseOrderDispatchRow>();

    if (claimError) {
      throw new Error(claimError.message);
    }

    if (!purchaseOrder) {
      return NextResponse.json({ received: true, message: "Dispatch email already sent or order not found" });
    }

    if (!purchaseOrder?.customer_email) {
      return NextResponse.json({ received: true, message: "Order has no customer email" });
    }

    await sendTransactionalEmail({
      to: purchaseOrder.customer_email,
      ...buildDispatchEmail({
        carrier,
        generationJobId: purchaseOrder.generation_job_id,
        optionId: purchaseOrder.option_id,
        trackingNumber,
        trackingUrl
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Prodigi webhook failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

function buildDispatchEmail(input: {
  carrier?: string | null;
  generationJobId: string;
  optionId: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  const productName = getProductName(input.optionId);
  const carrier = input.carrier?.trim() || "courier";
  const trackingNumber = input.trackingNumber?.trim();
  const trackingUrl = input.trackingUrl?.trim();
  const appUrl = getAppUrl();
  const resultUrl = buildAuthenticatedAppUrl(`/result/${input.generationJobId}`, appUrl);
  const trackingCopy = trackingNumber ? ` Your tracking number is ${trackingNumber}.` : "";
  const actionUrl = trackingUrl || resultUrl;
  const actionLabel = trackingUrl ? "Track Package" : "View Order";

  return {
    subject: "Your Kitface order has shipped!",
    text: trackingUrl
      ? `Great news! Your ${productName} has been dispatched via ${carrier}.${trackingNumber ? ` Tracking number: ${trackingNumber}.` : ""}\n\nTrack your package: ${trackingUrl}\n\nView your poster: ${resultUrl}`
      : `Great news! Your ${productName} has been dispatched via ${carrier}.${trackingNumber ? ` Tracking number: ${trackingNumber}.` : ""}\n\nTracking details are not available yet, but your order is on the way.\n\nView your poster: ${resultUrl}`,
    html: `
      <div style="margin:0;padding:24px;background:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1936;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #E4E4E7;border-radius:20px;overflow:hidden;">
          <div style="padding:28px 24px;background:#1C1936;color:#fff;text-align:center;">
            <h1 style="margin:0;font-size:26px;line-height:1.2;">Kitface</h1>
            <p style="margin:6px 0 0;color:#31F0D5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Order Shipped</p>
          </div>
          <div style="padding:28px 24px;text-align:center;">
            <h2 style="margin:0 0 10px;font-size:22px;line-height:1.25;">It's on the way.</h2>
            <p style="margin:0 0 22px;color:#69697A;font-size:14px;line-height:1.6;">Your ${escapeHtml(productName)} has been handed over to <strong>${escapeHtml(carrier)}</strong>.${escapeHtml(trackingCopy)}</p>
            <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#00CDAC;color:#1C1936;text-decoration:none;font-weight:800;font-size:15px;padding:14px 28px;border-radius:14px;">${actionLabel}</a>
            ${trackingUrl ? `<p style="margin:18px 0 0;color:#9A9AB0;font-size:12px;line-height:1.5;">You can also view your poster in Kitface: <a href="${escapeHtml(resultUrl)}" style="color:#00A88D;font-weight:700;text-decoration:none;">open poster</a>.</p>` : ""}
          </div>
        </div>
      </div>
    `,
  };
}

function getProductName(optionId: string) {
  if (optionId === "poster") return "A3 Poster";
  if (optionId === "mug") return "Mug";
  if (optionId === "sticker") return "Sticker";
  if (optionId === "magnet") return "Magnet";
  return "Greeting Card";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
