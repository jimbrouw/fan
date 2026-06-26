import { NextResponse } from "next/server";

const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

type MuapiStatusResponse = {
  status: string;
  outputs?: string[];
  error?: string;
  message?: string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }

  const apiKey = process.env.MUAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  try {
    const response = await fetch(`${MUAPI_BASE_URL}/predictions/${jobId}/result`, {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });

    const raw = await response.json().catch(() => ({}));
    const payload = ((raw as { detail?: MuapiStatusResponse }).detail ?? raw) as MuapiStatusResponse;

    if (!response.ok) {
      const isTransient = response.status === 429 || response.status >= 500;
      if (isTransient) {
        return NextResponse.json({ status: "processing" });
      }
      return NextResponse.json(
        { status: "failed", error: payload.error ?? payload.message ?? "Status check failed." },
        { status: 200 }
      );
    }

    const rawStatus = (payload.status ?? "processing").toLowerCase();
    let status: "queued" | "processing" | "completed" | "failed" = "processing";
    if (rawStatus === "queued" || rawStatus === "pending") status = "queued";
    else if (rawStatus === "completed") status = "completed";
    else if (rawStatus === "failed" || rawStatus === "cancelled") status = "failed";

    const outputUrl = payload.outputs?.[0];

    return NextResponse.json({
      status,
      outputUrl: outputUrl ?? null,
      error: payload.error ?? payload.message ?? null,
    });
  } catch (error) {
    console.error("Slop status check failed:", error);
    return NextResponse.json({ status: "processing" });
  }
}
