import type { SubmitVideoJobInput, VideoGenerationProvider, VideoGenerationResponse, VideoJobStatus } from "../videoTypes";

const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

export type MuapiVideoModelId =
  | "seedance-lite-i2v"
  | "wan2.7-image-to-video"
  | "kling-v2.1-standard-i2v"
  | "veo3-fast-image-to-video";

export type MuapiVideoModelOption = {
  id: MuapiVideoModelId;
  name: string;
  description: string;
};

export const MUAPI_VIDEO_MODELS: MuapiVideoModelOption[] = [
  {
    id: "seedance-lite-i2v",
    name: "Seedance Lite",
    description: "Cheapest first pass for poster motion: 480p, 5 seconds.",
  },
  {
    id: "wan2.7-image-to-video",
    name: "WAN 2.7 I2V",
    description: "Good low-cost motion test: 720p, 5 seconds, stronger prompt control.",
  },
  {
    id: "kling-v2.1-standard-i2v",
    name: "Kling 2.1 Standard",
    description: "Balanced quality test for smooth poster animation.",
  },
  {
    id: "veo3-fast-image-to-video",
    name: "Veo 3 Fast",
    description: "Higher-cost speed/quality comparison for final-style motion.",
  },
];

type MuapiVideoSubmitBody = {
  prompt: string;
  image_url?: string;
  images_list?: string[];
  aspect_ratio?: "9:16";
  resolution?: "480p" | "720p";
  duration?: number;
  camera_fixed?: boolean;
  generate_audio?: boolean;
  negative_prompt?: string;
};

type MuapiVideoPredictionResponse = {
  request_id?: string;
  id?: string;
  status?: string;
  outputs?: string[];
  output?: {
    video?: string;
    video_url?: string;
  };
  video?: string | { url?: string };
  error?: string;
  detail?: MuapiVideoPredictionResponse;
};

export function isMuapiVideoModelId(value?: string): value is MuapiVideoModelId {
  return MUAPI_VIDEO_MODELS.some((model) => model.id === value);
}

export function getDefaultMuapiVideoModel(): MuapiVideoModelId {
  return "seedance-lite-i2v";
}

export function buildMuapiVideoSubmitRequest(input: SubmitVideoJobInput): {
  endpoint: MuapiVideoModelId;
  body: MuapiVideoSubmitBody;
} {
  const endpoint = isMuapiVideoModelId(input.model) ? input.model : getDefaultMuapiVideoModel();
  const duration = input.durationSeconds ?? 5;
  const base = {
    prompt: input.prompt,
  };

  if (endpoint === "veo3-fast-image-to-video") {
    return {
      endpoint,
      body: {
        ...base,
        images_list: [input.sourceImageUrl],
        aspect_ratio: "9:16",
      },
    };
  }

  if (endpoint === "kling-v2.1-standard-i2v") {
    return {
      endpoint,
      body: {
        ...base,
        image_url: input.sourceImageUrl,
        aspect_ratio: "9:16",
        duration: duration <= 5 ? 5 : 10,
      },
    };
  }

  if (endpoint === "wan2.7-image-to-video") {
    return {
      endpoint,
      body: {
        ...base,
        image_url: input.sourceImageUrl,
        resolution: "720p",
        duration: Math.min(Math.max(duration, 2), 15),
        negative_prompt: "Do not alter the face, kit, sponsor, crest, text, watermark, or poster layout.",
      },
    };
  }

  return {
    endpoint,
    body: {
      ...base,
      image_url: input.sourceImageUrl,
      resolution: "480p",
      duration: Math.min(Math.max(duration, 3), 12),
      camera_fixed: false,
    },
  };
}

export function getMuapiVideoOutputUrl(payload: MuapiVideoPredictionResponse): string | undefined {
  const detail = payload.detail ?? payload;
  if (detail.outputs?.length) return detail.outputs[0];
  if (typeof detail.output?.video === "string") return detail.output.video;
  if (typeof detail.output?.video_url === "string") return detail.output.video_url;
  if (typeof detail.video === "string") return detail.video;
  if (typeof detail.video?.url === "string") return detail.video.url;
  return undefined;
}

export class MuapiVideoGenerationProvider implements VideoGenerationProvider {
  readonly id: string;
  private readonly model: MuapiVideoModelId;

  constructor(model: string = getDefaultMuapiVideoModel()) {
    this.model = isMuapiVideoModelId(model) ? model : getDefaultMuapiVideoModel();
    this.id = `muapi:${this.model}`;
  }

  private getApiKey() {
    const apiKey = process.env.MUAPI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing MUAPI_API_KEY environment variable.");
    }
    return apiKey;
  }

  async submitVideoJob(input: SubmitVideoJobInput): Promise<{ providerJobId: string }> {
    const { endpoint, body } = buildMuapiVideoSubmitRequest({ ...input, model: this.model });
    const url = new URL(`${MUAPI_BASE_URL}/${endpoint}`);
    if (input.webhookUrl) {
      url.searchParams.set("webhook", input.webhookUrl);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.getApiKey(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MuAPI video submission failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as MuapiVideoPredictionResponse;
    const providerJobId = payload.request_id ?? payload.id;
    if (!providerJobId) {
      throw new Error("MuAPI video did not return a request_id.");
    }

    return { providerJobId };
  }

  async getVideoJobStatus(providerJobId: string): Promise<VideoGenerationResponse> {
    const response = await fetch(`${MUAPI_BASE_URL}/predictions/${providerJobId}/result`, {
      headers: {
        "x-api-key": this.getApiKey(),
      },
      cache: "no-store",
    });

    const body = await response.json().catch(() => ({}));
    const payload = (body.detail ?? body) as MuapiVideoPredictionResponse;
    const status = (payload.status ?? "failed").toLowerCase();

    if (!response.ok) {
      return {
        jobId: providerJobId,
        status: "failed",
        error: payload.error ?? `MuAPI video status check failed: ${response.status}`,
      };
    }

    let mappedStatus: VideoJobStatus = "processing";
    if (status === "queued" || status === "pending") mappedStatus = "queued";
    if (status === "completed" || status === "succeeded" || status === "success") mappedStatus = "completed";
    if (status === "failed" || status === "cancelled" || status === "canceled") mappedStatus = "failed";

    const outputUrl = getMuapiVideoOutputUrl(payload);
    if (mappedStatus === "completed" && !outputUrl) {
      return {
        jobId: providerJobId,
        status: "failed",
        error: "MuAPI video completed without an MP4 output URL.",
      };
    }

    return {
      jobId: providerJobId,
      status: mappedStatus,
      outputUrl,
      error: payload.error,
    };
  }
}
