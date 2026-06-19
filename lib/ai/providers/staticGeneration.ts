import { FalGptImage2GenerationProvider } from "./fal.ts";
import { MuapiGenerationProvider, type MuapiGptImageTestMode } from "./muapi.ts";

export async function submitStaticGenerationJob(input: {
  prompt: string;
  referenceImageUrls: string[];
  model?: string;
  gptImageTestMode?: MuapiGptImageTestMode;
  webhookUrl?: string;
}) {
  const isGptImage = input.model === "gpt-image-2" || input.model === "gpt-image-2-fast";
  const requestedProvider = process.env.IMAGE_GENERATION_PROVIDER?.toLowerCase();
  const hasFalKey = Boolean(process.env.FAL_KEY || process.env.FAL_API_KEY);
  const useFalPrimary = shouldUseFalStaticGenerationProvider({
    isGptImage,
    hasFalKey,
    requestedProvider,
  });

  if (process.env.FAL_API_KEY && !process.env.FAL_KEY) {
    process.env.FAL_KEY = process.env.FAL_API_KEY;
  }

  if (requestedProvider === "fal" && !hasFalKey) {
    throw new Error("IMAGE_GENERATION_PROVIDER=fal requires FAL_KEY or FAL_API_KEY.");
  }

  if (useFalPrimary) {
    try {
      const falProvider = new FalGptImage2GenerationProvider();
      const { providerJobId } = await falProvider.submitJob({
        prompt: input.prompt,
        referenceImageUrls: input.referenceImageUrls,
      });
      return providerJobId;
    } catch (error) {
      if (requestedProvider === "fal") {
        throw error;
      }

      console.warn("FAL GPT Image 2 submission failed; falling back to MUAPI.", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const muapiProvider = new MuapiGenerationProvider();
  try {
    const { providerJobId } = await muapiProvider.submitJob(input);
    return providerJobId;
  } catch (error) {
    throw error;
  }
}

export function shouldUseFalStaticGenerationProvider(input: {
  isGptImage: boolean;
  hasFalKey: boolean;
  requestedProvider?: string;
}) {
  return input.isGptImage && input.hasFalKey && input.requestedProvider === "fal";
}
