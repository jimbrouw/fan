import { NextResponse } from "next/server";
import { buildSlopPrompt } from "@/lib/slop/promptBuilder";
import { styleReel, colourReel, chaosReel } from "@/lib/slop/reelData";
import { createServerSupabaseClient, captureBucket } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

type GenerateBody = {
  styleId: string;
  colourId: string;
  chaosId: string;
  imageBase64: string;
};

function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function uploadSlopImage(base64Data: string): Promise<string> {
  const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image data.");

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  if (buffer.byteLength > 6 * 1024 * 1024) {
    throw new Error("Image too large. Max 6MB.");
  }

  const supabase = createServerSupabaseClient();
  const fileName = `slop-uploads/${crypto.randomUUID()}/upload.jpg`;

  const { error } = await supabase.storage
    .from(captureBucket)
    .upload(fileName, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: signedUrlData, error: signError } = await supabase.storage
    .from(captureBucket)
    .createSignedUrl(fileName, 3600);

  if (signError || !signedUrlData?.signedUrl) {
    throw new Error("Could not create signed URL for uploaded image.");
  }

  return signedUrlData.signedUrl;
}

async function callMuapi(prompt: string, imageUrl: string): Promise<string> {
  const apiKey = process.env.MUAPI_API_KEY;
  if (!apiKey) throw new Error("Missing MUAPI_API_KEY.");

  const response = await fetch(`${MUAPI_BASE_URL}/nano-banana-2-edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: "3:4",
      images_list: [imageUrl],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MUAPI failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as { request_id?: string; id?: string };
  const jobId = payload.request_id || payload.id;
  if (!jobId) throw new Error("MUAPI did not return a job ID.");

  return jobId;
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const rateLimitResponse = checkRateLimit(ip, "slop-generate", { limit: 5, windowMs: 60 * 1000 });
  if (rateLimitResponse) return rateLimitResponse;

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { styleId, colourId, chaosId, imageBase64 } = body;

  if (!styleId || !colourId || !chaosId || !imageBase64) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const style = styleReel.find((r) => r.id === styleId);
  const colour = colourReel.find((r) => r.id === colourId);
  const chaos = chaosReel.find((r) => r.id === chaosId);

  if (!style || !colour || !chaos) {
    return NextResponse.json({ error: "Invalid reel selection." }, { status: 400 });
  }

  try {
    const imageUrl = await uploadSlopImage(imageBase64);
    const prompt = buildSlopPrompt({ style, colour, chaos });
    const jobId = await callMuapi(prompt, imageUrl);

    return NextResponse.json({ jobId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    console.error("Slop generate failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
