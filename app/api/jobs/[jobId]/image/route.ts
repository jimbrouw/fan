import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import sharp from "sharp";

type JobImageRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  output_url: string | null;
};

function buildWatermarkSvg(width: number, height: number): Buffer {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="wm" x="0" y="0" width="300" height="180"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-40 ${width / 2} ${height / 2})">
        <text x="10" y="120"
          font-family="Arial, Helvetica, sans-serif"
          font-size="34"
          font-weight="bold"
          fill="white"
          fill-opacity="0.32"
          letter-spacing="3">kitface.app</text>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#wm)"/>
  </svg>`;
  return Buffer.from(svg);
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
    const { width = 1200, height = 1600 } = await image.metadata();

    const watermarked = await image
      .composite([{ input: buildWatermarkSvg(width, height), blend: "over" }])
      .png()
      .toBuffer();

    return new Response(watermarked.buffer as ArrayBuffer, {
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
