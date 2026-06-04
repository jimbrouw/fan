import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

type JobImageRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

// Pre-baked PNG tile — avoids SVG/font rendering issues on Vercel's Linux environment.
function loadWatermarkTile(): Buffer {
  const tilePath = path.join(process.cwd(), "public", "watermark-tile.png");
  return fs.readFileSync(tilePath);
}

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
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
    const image = sharp(rawBuffer);

    const watermarked = await image
      .composite([{ input: loadWatermarkTile(), tile: true, blend: "over" }])
      .png()
      .toBuffer();

    return new Response(new Uint8Array(watermarked), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="kitface-${job.id}.png"`,
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
