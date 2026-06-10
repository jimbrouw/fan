import type { GenerationJobStatus, GenerationProvider, GenerationResponse } from "../types";

const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

type MuapiPredictionResponse = {
  request_id?: string;
  id?: string;
  status: string;
  outputs?: string[];
  error?: string;
  message?: string;
};

type MuapiSubmitBody = {
  prompt: string;
  aspect_ratio: "3:4";
  image_url?: string;
  images_list?: string[];
  resolution?: MuapiImageResolution;
  quality?: MuapiImageQuality;
};

export type MuapiImageResolution = "1K" | "2K";
export type MuapiImageQuality = "low" | "medium" | "high";
export type MuapiGptImageTestMode = "fast-1k-low" | "draft-1k-medium" | "final-2k-high";

export function getMuapiGptImageSettings(testMode?: MuapiGptImageTestMode): {
  resolution: MuapiImageResolution;
  quality: MuapiImageQuality;
} {
  if (testMode === "draft-1k-medium") {
    return { resolution: "1K", quality: "medium" };
  }

  if (testMode === "final-2k-high") {
    return { resolution: "2K", quality: "high" };
  }

  return { resolution: "1K", quality: "low" };
}

function getMuapiErrorMessage(payload: Partial<MuapiPredictionResponse>) {
  return payload.error || payload.message;
}

export function isTransientMuapiStatusError(status: number, payload: Partial<MuapiPredictionResponse>) {
  const message = getMuapiErrorMessage(payload) ?? "";
  return (
    status === 429 ||
    status >= 500 ||
    /internal error|try again later|temporar|timeout|timed out|rate limit/i.test(message)
  );
}

export function buildMuapiSubmitRequest(input: {
  prompt: string;
  referenceImageUrls: string[];
  model?: string;
  gptImageTestMode?: MuapiGptImageTestMode;
}): { endpoint: string; body: MuapiSubmitBody } {
  const model = input.model || "wan2.7-image-edit";
  const isFastGptImage = model === "gpt-image-2-fast";
  const gptImageSettings = getMuapiGptImageSettings(isFastGptImage ? "fast-1k-low" : input.gptImageTestMode);
  const body: MuapiSubmitBody = {
    prompt: input.prompt,
    aspect_ratio: "3:4",
  };

  if (model === "wan2.7-image-edit") {
    return {
      endpoint: "wan2.7-image-edit",
      body: {
        ...body,
        images_list: input.referenceImageUrls,
      }
    };
  }

  if (model === "nano-banana-2") {
    return {
      endpoint: "nano-banana-2-edit",
      body: {
        ...body,
        images_list: input.referenceImageUrls,
      }
    };
  }

  if (model === "gpt-image-2" || isFastGptImage) {
    return {
      endpoint: "gpt-image-2-image-to-image",
      body: {
        ...body,
        images_list: input.referenceImageUrls,
        resolution: gptImageSettings.resolution,
        quality: gptImageSettings.quality,
      }
    };
  }

  return {
    endpoint: "flux-pulid",
    body: {
      ...body,
      image_url: input.referenceImageUrls[0],
    }
  };
}

export class MuapiGenerationProvider implements GenerationProvider {
  private getApiKey() {
    const apiKey = process.env.MUAPI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing MUAPI_API_KEY environment variable.");
    }
    return apiKey;
  }

  async submitJob(input: {
    prompt: string;
    referenceImageUrls: string[];
    model?: string;
    gptImageTestMode?: MuapiGptImageTestMode;
    webhookUrl?: string;
  }): Promise<{ providerJobId: string }> {
    const { endpoint, body } = buildMuapiSubmitRequest(input);

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
      throw new Error(`MuAPI submission failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as MuapiPredictionResponse;
    const providerJobId = payload.request_id || payload.id;

    if (!providerJobId) {
      throw new Error("MuAPI did not return a request_id.");
    }

    return { providerJobId };
  }

  async getJobStatus(providerJobId: string): Promise<GenerationResponse> {
    const response = await fetch(`${MUAPI_BASE_URL}/predictions/${providerJobId}/result`, {
      headers: {
        "x-api-key": this.getApiKey(),
      },
      cache: "no-store",
    });

    const body = await response.json().catch(() => ({}));
    const payload = (body.detail || body) as MuapiPredictionResponse;

    if (!response.ok) {
      if (isTransientMuapiStatusError(response.status, payload)) {
        return {
          jobId: providerJobId,
          status: "processing",
        };
      }

      return {
        jobId: providerJobId,
        status: "failed",
        error: getMuapiErrorMessage(payload) || `MuAPI status check failed: ${response.status}`,
      };
    }

    let mappedStatus: GenerationJobStatus = "processing";
    const status = (payload.status || "failed").toLowerCase();

    if (status === "queued" || status === "pending") {
      mappedStatus = "queued";
    } else if (status === "processing") {
      mappedStatus = "processing";
    } else if (status === "completed") {
      mappedStatus = "completed";
    } else if (status === "failed" || status === "cancelled") {
      mappedStatus = "failed";
    }

    return {
      jobId: providerJobId,
      status: mappedStatus,
      outputUrl: payload.outputs && payload.outputs.length > 0 ? payload.outputs[0] : undefined,
      error: getMuapiErrorMessage(payload) || (mappedStatus === "failed" ? "MuAPI processing failed without a specific error message." : undefined),
    };
  }
}
