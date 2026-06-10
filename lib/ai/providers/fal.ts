import { fal } from "@fal-ai/client";
import type { GenerationProvider, GenerationResponse, GenerationJobStatus } from "../types.ts";

export const FAL_GPT_IMAGE_PROVIDER_PREFIX = "fal:gpt-image-2-edit:";

export function encodeFalGptImageProviderJobId(providerJobId: string) {
  return `${FAL_GPT_IMAGE_PROVIDER_PREFIX}${providerJobId}`;
}

export function decodeFalGptImageProviderJobId(providerJobId: string) {
  return providerJobId.startsWith(FAL_GPT_IMAGE_PROVIDER_PREFIX)
    ? providerJobId.slice(FAL_GPT_IMAGE_PROVIDER_PREFIX.length)
    : null;
}

export function buildFalGptImage2EditInput(input: {
  prompt: string;
  referenceImageUrls: string[];
}) {
  return {
    prompt: input.prompt,
    image_urls: input.referenceImageUrls.slice(0, 2),
    image_size: {
      width: 2496,
      height: 3312,
    },
    quality: "high",
    output_format: "png",
  } as const;
}

export class FalGenerationProvider implements GenerationProvider {
  async submitJob(input: {
    prompt: string;
    referenceImageUrls: string[];
    webhookUrl?: string;
  }): Promise<{ providerJobId: string }> {
    const { request_id } = await fal.queue.submit("fal-ai/flux-pulid", {
      input: {
        prompt: input.prompt,
        // Using the best photo for identity mapping.
        reference_image_url: input.referenceImageUrls[0]
      },
      webhookUrl: input.webhookUrl,
    });

    if (!request_id) {
      throw new Error("Failed to receive request ID from FAL.");
    }

    return { providerJobId: request_id };
  }

  async getJobStatus(providerJobId: string): Promise<GenerationResponse> {
    const statusResult = await fal.queue.status("fal-ai/flux-pulid", {
      requestId: providerJobId,
      logs: false,
    });

    let mappedStatus: GenerationJobStatus = "processing";
    if (statusResult.status === "IN_QUEUE") mappedStatus = "queued";
    if (statusResult.status === "IN_PROGRESS") mappedStatus = "processing";
    if (statusResult.status === "COMPLETED") mappedStatus = "completed";

    let outputUrl: string | undefined;
    let error: string | undefined;

    if (mappedStatus === "completed") {
      try {
        const result = await fal.queue.result("fal-ai/flux-pulid", {
          requestId: providerJobId,
        });

        if (result.data && result.data.images && result.data.images.length > 0) {
          outputUrl = result.data.images[0].url;
        }
      } catch (err) {
        mappedStatus = "failed";
        error = err instanceof Error ? err.message : "Failed to fetch FAL result";
      }
    }

    return {
      jobId: providerJobId,
      status: mappedStatus,
      outputUrl,
      error,
    };
  }
}

export class FalGptImage2GenerationProvider implements GenerationProvider {
  async submitJob(input: {
    prompt: string;
    referenceImageUrls: string[];
  }): Promise<{ providerJobId: string }> {
    const { request_id } = await fal.queue.submit("openai/gpt-image-2/edit", {
      input: buildFalGptImage2EditInput(input),
    });

    if (!request_id) {
      throw new Error("Failed to receive request ID from FAL GPT Image 2.");
    }

    return { providerJobId: encodeFalGptImageProviderJobId(request_id) };
  }

  async getJobStatus(providerJobId: string): Promise<GenerationResponse> {
    const requestId = decodeFalGptImageProviderJobId(providerJobId) ?? providerJobId;
    const statusResult = await fal.queue.status("openai/gpt-image-2/edit", {
      requestId,
      logs: false,
    });

    let mappedStatus: GenerationJobStatus = "processing";
    if (statusResult.status === "IN_QUEUE") mappedStatus = "queued";
    if (statusResult.status === "IN_PROGRESS") mappedStatus = "processing";
    if (statusResult.status === "COMPLETED") mappedStatus = "completed";

    let outputUrl: string | undefined;
    let error: string | undefined;

    if (mappedStatus === "completed") {
      try {
        const result = await fal.queue.result("openai/gpt-image-2/edit", {
          requestId,
        });

        const images = result.data?.images;
        if (Array.isArray(images) && images.length > 0) {
          outputUrl = typeof images[0] === "string" ? images[0] : images[0]?.url;
        }
      } catch (err) {
        mappedStatus = "failed";
        error = err instanceof Error ? err.message : "Failed to fetch FAL GPT Image 2 result";
      }
    }

    return {
      jobId: providerJobId,
      status: mappedStatus,
      outputUrl,
      error,
    };
  }
}
