import { fal } from "@fal-ai/client";
import type { VideoGenerationProvider, VideoGenerationResponse, VideoJobStatus, SubmitVideoJobInput } from "../videoTypes";

export const FAL_SEEDANCE_VIDEO_MODEL = "fal-ai/bytedance/seedance-2.0/image-to-video";

type FalVideoResult = {
  video?: {
    url?: string;
  };
  videos?: Array<{
    url?: string;
  }>;
};

export function buildFalSeedanceVideoInput(input: SubmitVideoJobInput) {
  return {
    prompt: input.prompt,
    image_url: input.sourceImageUrl,
    duration: String(input.durationSeconds ?? 4),
    aspect_ratio: "auto",
    resolution: "720p",
    generate_audio: false,
  };
}

export function getFalVideoOutputUrl(data: FalVideoResult): string | undefined {
  return data.video?.url ?? data.videos?.find((video) => video.url)?.url;
}

export class FalSeedanceVideoProvider implements VideoGenerationProvider {
  readonly id = "fal-seedance-2";

  async submitVideoJob(input: SubmitVideoJobInput): Promise<{ providerJobId: string }> {
    const { request_id } = await fal.queue.submit(FAL_SEEDANCE_VIDEO_MODEL, {
      input: buildFalSeedanceVideoInput(input),
      webhookUrl: input.webhookUrl,
    });

    if (!request_id) {
      throw new Error("Failed to receive request ID from FAL Seedance.");
    }

    return { providerJobId: request_id };
  }

  async getVideoJobStatus(providerJobId: string): Promise<VideoGenerationResponse> {
    const statusResult = await fal.queue.status(FAL_SEEDANCE_VIDEO_MODEL, {
      requestId: providerJobId,
      logs: false,
    });

    let mappedStatus: VideoJobStatus = "processing";
    if (statusResult.status === "IN_QUEUE") mappedStatus = "queued";
    if (statusResult.status === "IN_PROGRESS") mappedStatus = "processing";
    if (statusResult.status === "COMPLETED") mappedStatus = "completed";

    let outputUrl: string | undefined;
    let error: string | undefined;

    if (mappedStatus === "completed") {
      try {
        const result = await fal.queue.result(FAL_SEEDANCE_VIDEO_MODEL, {
          requestId: providerJobId,
        });

        outputUrl = getFalVideoOutputUrl(result.data as FalVideoResult);
        if (!outputUrl) {
          mappedStatus = "failed";
          error = "FAL Seedance completed without an MP4 output URL.";
        }
      } catch (err) {
        mappedStatus = "failed";
        error = err instanceof Error ? err.message : "Failed to fetch FAL Seedance result.";
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
