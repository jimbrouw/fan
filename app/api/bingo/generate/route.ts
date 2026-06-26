import { NextResponse } from "next/server";
import { createServerSupabaseClient, captureBucket } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { getStyleById } from "@/lib/bingo/portraitStyles";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    // Basic rate limit by IP — no auth required for bingo
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkRateLimit(ip, "bingo-generate", { limit: 6, windowMs: 60 * 1000 });
    if (limited) return limited;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const styleId = formData.get("styleId") as string | null;

    if (!file || !styleId) {
      return NextResponse.json({ error: "Missing file or styleId." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Image must be JPEG, PNG, or WebP." }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });
    }

    const style = getStyleById(styleId);
    if (!style) {
      return NextResponse.json({ error: `Unknown style: ${styleId}` }, { status: 400 });
    }

    // Upload selfie to Supabase storage
    const supabase = createServerSupabaseClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const storagePath = `bingo/${crypto.randomUUID()}/selfie.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(captureBucket)
      .upload(storagePath, bytes, { contentType: file.type, upsert: false });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Signed URL valid for 90 minutes — enough for MUAPI to fetch during generation
    const { data: signed, error: signError } = await supabase.storage
      .from(captureBucket)
      .createSignedUrl(storagePath, 5400);

    if (signError || !signed?.signedUrl) {
      throw new Error("Could not create signed URL for selfie.");
    }

    // Submit to MUAPI — wan2.7-image-edit is the cheapest image-edit model
    const provider = new MuapiGenerationProvider();
    const { providerJobId } = await provider.submitJob({
      prompt: style.prompt,
      referenceImageUrls: [signed.signedUrl],
      model: "wan2.7-image-edit",
    });

    return NextResponse.json({ jobId: providerJobId, styleId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    console.error("[bingo/generate]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
