import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Check if it's the stage changed event and that the stage is "Shipped"
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

    // Grab the first shipment's details
    const shipment = shipments[0];
    const trackingUrl = shipment.trackingUrl || shipment.tracking_url;
    const carrier = shipment.carrier;
    const trackingNumber = shipment.trackingNumber || shipment.tracking_number;

    if (!trackingUrl) {
      return NextResponse.json({ received: true, message: "No tracking URL present" });
    }

    const supabase = createServerSupabaseClient();

    // Look up the order in our database. We map Prodigi's order ID to the printful_order_id column.
    const { data: purchaseOrder } = await supabase
      .from("purchase_orders")
      .select("customer_email, generation_job_id")
      .eq("printful_order_id", String(orderId))
      .maybeSingle();

    if (!purchaseOrder?.customer_email) {
      return NextResponse.json({ error: "Order not found or missing email" }, { status: 404 });
    }

    // Send the tracking email
    await sendTransactionalEmail({
      to: purchaseOrder.customer_email,
      subject: "Your Kitface order has shipped!",
      text: `Great news! Your Kitface order has shipped via ${carrier || "courier"}.\n\nTrack your package here: ${trackingUrl}`,
      html: `
        <div style="margin:0;padding:24px;background:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1936;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #E4E4E7;border-radius:20px;overflow:hidden;">
            <div style="padding:28px 24px;background:#1C1936;color:#fff;text-align:center;">
              <h1 style="margin:0;font-size:26px;line-height:1.2;">Kitface</h1>
              <p style="margin:6px 0 0;color:#31F0D5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Order Shipped</p>
            </div>
            <div style="padding:28px 24px;text-align:center;">
              <h2 style="margin:0 0 10px;font-size:22px;line-height:1.25;">It's on the way!</h2>
              <p style="margin:0 0 22px;color:#69697A;font-size:14px;line-height:1.6;">Your package has been handed over to <strong>${carrier || "courier"}</strong>. ${trackingNumber ? `Your tracking number is ${trackingNumber}.` : ''}</p>
              <a href="${trackingUrl}" style="display:inline-block;background:#00CDAC;color:#1C1936;text-decoration:none;font-weight:800;font-size:15px;padding:14px 28px;border-radius:14px;">Track Package</a>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Prodigi webhook failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
