import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

type JobImageRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

type PaidDownloadOrderRow = {
  stripe_session_id: string;
};

// Pre-baked PNG tile — avoids SVG/font rendering issues on Vercel's Linux environment.
function loadWatermarkTile(): Buffer {
  const tilePath = path.join(process.cwd(), "public", "watermark-tile.png");
  return fs.readFileSync(tilePath);
}

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const url = new URL(request.url);
    const supabase = createServerSupabaseClient();
    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select("id,status,output_url")
      .eq("id", jobId)
      .single<JobImageRow>();

    if (error || !job) {
      return NextResponse.json({ error: error?.message ?? "Job not found." }, { status: 404 });
    }

    if (job.status !== "completed" || !job.output_url) {
      return NextResponse.json({ error: "Poster image is not ready." }, { status: 409 });
    }

    const imageResponse = await fetch(job.output_url, { cache: "no-store" });
    if (!imageResponse.ok || !imageResponse.body) {
      return NextResponse.json({ error: "Poster image is unavailable." }, { status: 502 });
    }

    const contentType = imageResponse.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Poster output is not an image." }, { status: 502 });
    }

    const rawBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const wantsDownload = url.searchParams.get("download") === "1";
    const wantsNoWatermark = url.searchParams.get("noWatermark") === "1";
    const disposition = wantsDownload ? "attachment" : "inline";

    if (wantsNoWatermark) {
      const paidAccess = await hasPaidDownloadAccess({
        supabase,
        jobId: job.id,
        stripeSessionId: url.searchParams.get("session_id"),
      });

      if (!paidAccess) {
        return NextResponse.json({ error: "Paid download not found for this poster." }, { status: 403 });
      }

      return new Response(new Uint8Array(rawBuffer), {
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Disposition": `${disposition}; filename="kitface-${job.id}${extensionForContentType(contentType)}"`,
          "Content-Type": contentType,
        },
      });
    }

    const image = sharp(rawBuffer);

    const watermarked = await image
      .composite([{ input: loadWatermarkTile(), tile: true, blend: "over" }])
      .png()
      .toBuffer();

    return new Response(new Uint8Array(watermarked), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${disposition}; filename="kitface-${job.id}.png"`,
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Poster image lookup failed." },
      { status: 500 }
    );
  }
}

async function hasPaidDownloadAccess(input: {
  supabase: ReturnType<typeof createServerSupabaseClient>;
  jobId: string;
  stripeSessionId: string | null;
}) {
  if (!input.stripeSessionId) return false;

  const { data: order } = await input.supabase
    .from("purchase_orders")
    .select("stripe_session_id")
    .eq("stripe_session_id", input.stripeSessionId)
    .eq("generation_job_id", input.jobId)
    .eq("option_id", "download")
    .eq("status", "fulfilled")
    .maybeSingle<PaidDownloadOrderRow>();

  if (order) return true;

  const session = await retrieveStripeSession(input.stripeSessionId);
  return (
    session?.payment_status === "paid" &&
    session.metadata?.jobId === input.jobId &&
    session.metadata?.optionId === "download"
  );
}

async function retrieveStripeSession(stripeSessionId: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripeSessionId.startsWith("cs_")) return null;

  try {
    return await getStripe().checkout.sessions.retrieve(stripeSessionId);
  } catch (error) {
    console.error("Paid download Stripe lookup failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

function extensionForContentType(contentType: string) {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("png")) return ".png";
  return ".png";
}
