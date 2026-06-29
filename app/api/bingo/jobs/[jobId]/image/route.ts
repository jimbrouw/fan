import { NextResponse } from "next/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const provider = new MuapiGenerationProvider();
    const result = await provider.getJobStatus(jobId);

    if (result.status !== "completed" || !result.outputUrl) {
      return NextResponse.json({ error: "Portrait not ready yet." }, { status: 409 });
    }

    const imageRes = await fetch(result.outputUrl, { cache: "no-store" });
    if (!imageRes.ok || !imageRes.body) {
      return NextResponse.json({ error: "Portrait image unavailable." }, { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Output is not an image." }, { status: 502 });
    }

    const buffer = await imageRes.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image fetch failed.";
    console.error("[bingo/jobs/image]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
