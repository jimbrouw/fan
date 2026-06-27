import { NextResponse } from "next/server";
import { createServerSupabaseClient, captureBucket } from "@/lib/supabase/server";
import { MuapiGenerationProvider } from "@/lib/ai/providers/muapi";
import { buildSlopPrompt } from "@/lib/slop/promptBuilder";
import { styleReel, colourReel, chaosReel } from "@/lib/slop/reelData";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkRateLimit(ip, "bingo-generate", { limit: 6, windowMs: 60 * 1000 });
    if (limited) return limited;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const styleId = formData.get("styleId") as string | null;
    const colourId = formData.get("colourId") as string | null;
    const chaosId = formData.get("chaosId") as string | null;

    if (!file || !styleId || !colourId || !chaosId) {
      return NextResponse.json({ error: "Missing file or reel selections." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Image must be JPEG, PNG, or WebP." }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });
    }

    const style = styleReel.find((r) => r.id === styleId);
    const colour = colourReel.find((r) => r.id === colourId);
    const chaos = chaosReel.find((r) => r.id === chaosId);

    if (!style || !colour || !chaos) {
      return NextResponse.json({ error: "Invalid reel selection." }, { status: 400 });
    }

    // Upload selfie to Supabase storage
    const supabase = createServerSupabaseClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const storagePath = `bingo/${crypto.randomUUID()}/selfie.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(captureBucket)
      .upload(storagePath, bytes, { contentType: file.type, upsert: false });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: signed, error: signError } = await supabase.storage
      .from(captureBucket)
      .createSignedUrl(storagePath, 5400);

    if (signError || !signed?.signedUrl) {
      throw new Error("Could not create signed URL for selfie.");
    }

    const prompt = buildSlopPrompt({ style, colour, chaos });

    const provider = new MuapiGenerationProvider();
    const { providerJobId } = await provider.submitJob({
      prompt,
      referenceImageUrls: [signed.signedUrl],
      model: "wan2.7-image-edit",
    });

    return NextResponse.json({ jobId: providerJobId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    console.error("[bingo/generate]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
