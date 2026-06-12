import type { ProdigiProductOptionId } from "@/lib/fulfillment/prodigi";
import { NextResponse } from "next/server";
import { getCheckoutProduct } from "@/lib/checkout/products";
import { getStripe } from "@/lib/stripe/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth-server";
import { decideOwnedResourceAccess } from "@/lib/authz";
import { isExemptEmail } from "@/lib/credits";

type CheckoutRequest = {
  jobId?: string;
  optionId?: ProdigiProductOptionId;
  cardMessage?: string;
  demoMode?: boolean;
};

type JobRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
  user_id: string | null;
};

function isMissingSchemaColumn(error: { message?: string }, column: string) {
  return new RegExp(`Could not find the '${column}' column`, "i").test(error.message ?? "");
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to order." }, { status: 401 });
    }

    const body = (await request.json()) as CheckoutRequest;

    if (!body.jobId || !body.optionId) {
      return NextResponse.json(
        { error: "jobId and optionId are required." },
        { status: 400 }
      );
    }

    const product = getCheckoutProduct(body.optionId);

    if (!product) {
      return NextResponse.json(
        { error: "Unknown checkout option." },
        { status: 400 }
      );
    }

    const isDemoCheckout = Boolean(body.demoMode);
    if (isDemoCheckout && (!isExemptEmail(user.email) || body.optionId !== "birthday-card")) {
      return NextResponse.json(
        { error: "Demo checkout is only enabled for the internal greeting-card test account." },
        { status: 403 }
      );
    }

    const cardMessage = typeof body.cardMessage === "string" ? body.cardMessage.trim() : "";

    if (cardMessage.length > 240) {
      return NextResponse.json(
        { error: "Card message must be 240 characters or fewer." },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: error?.message ?? "Job not found." },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Poster generation must be completed to order." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL is not configured." },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: isDemoCheckout ? 50 : product.unitAmount,
            product_data: {
              name: isDemoCheckout ? `Demo ${product.name}` : product.name,
              description: isDemoCheckout ? "Temporary low-price live fulfillment test." : product.description
            }
          }
        }
      ],
      metadata: {
        jobId: job.id,
        optionId: product.id,
        userId: user.id,
        ...(isDemoCheckout ? { demoMode: "1" } : {}),
        ...(cardMessage ? { cardMessage } : {})
      },
      payment_intent_data: {
        metadata: {
          jobId: job.id,
          optionId: product.id,
          userId: user.id,
          ...(isDemoCheckout ? { demoMode: "1" } : {}),
          ...(cardMessage ? { cardMessage } : {})
        }
      },
      customer_email: user.email ?? undefined,
      customer_creation: "if_required",
      phone_number_collection: {
        enabled: product.requiresShipping
      },
      shipping_address_collection: product.requiresShipping
        ? {
            allowed_countries: ["GB"]
          }
        : undefined,
      success_url: `${appUrl}/order/success?session_id={CHECKOUT_SESSION_ID}&optionId=${product.id}`,
      cancel_url: `${appUrl}/upgrade/${job.id}`
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
