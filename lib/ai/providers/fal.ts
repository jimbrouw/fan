import { fal } from "@fal-ai/client";
import { GenerationProvider, GenerationResponse, GenerationJobStatus } from "../types";

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
