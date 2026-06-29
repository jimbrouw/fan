import { NextResponse } from "next/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const provider = new MuapiGenerationProvider();
    const result = await provider.getJobStatus(jobId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status check failed.";
    console.error("[bingo/jobs]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
