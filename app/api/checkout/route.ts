import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutRequest = {
  jobId?: string;
  optionId?: "download" | "poster" | "bundle";
};

type JobRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;

    if (!body.jobId || !body.optionId) {
      return NextResponse.json(
        { error: "jobId and optionId are required." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select("id,status,output_url")
      .eq("id", body.jobId)
      .single<JobRow>();

    if (error || !job) {
      return NextResponse.json(
        { error: error?.message ?? "Job not found." },
        { status: 404 }
      );
    }

    if (job.status !== "completed" || !job.output_url) {
      return NextResponse.json(
        { error: "Poster generation must be completed to order." },
        { status: 400 }
      );
    }

    const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

    if (hasStripe) {
      // In the future, you will initialize Stripe here:
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      // const session = await stripe.checkout.sessions.create(...);
      // return NextResponse.json({ url: session.url });
    }

    // Graceful fallback: Simulator Checkout url
    const mockSessionId = `mock_sess_${job.id}_${body.optionId}`;
    const checkoutUrl = `/checkout/${mockSessionId}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
