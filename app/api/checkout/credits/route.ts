import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { CREDIT_PACK } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to buy credits." }, { status: 401 });
    }

    // Rate Limit (authenticated or IP)
    const limitResponse = checkRateLimit(user.id, "checkout-credits", { limit: 10, windowMs: 60 * 1000 });
    if (limitResponse) return limitResponse;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL is not configured." }, { status: 503 });
    }

    const creditMetadata = {
      kind: "credits",
      userId: user.id,
      credits: String(CREDIT_PACK.credits),
    };

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CREDIT_PACK.currency,
            unit_amount: CREDIT_PACK.unitAmount,
            product_data: {
              name: CREDIT_PACK.name,
              description: CREDIT_PACK.description,
            },
          },
        },
      ],
      metadata: creditMetadata,
      payment_intent_data: { metadata: creditMetadata },
      customer_email: user.email ?? undefined,
      success_url: `${appUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}&kind=credits`,
      cancel_url: `${appUrl}/create?credits=cancel`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Credit checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
