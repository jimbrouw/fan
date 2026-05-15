import type { GenerationJobStatus, GenerationProvider, GenerationResponse } from "../types";

const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

type MuapiPredictionResponse = {
  request_id?: string;
  id?: string;
  status: string;
  outputs?: string[];
  error?: string;
};

type MuapiSubmitBody = {
  prompt: string;
  aspect_ratio: "3:4";
  image_url?: string;
  images_list?: string[];
  resolution?: "1K" | "2K";
  quality?: "low" | "high";
};

export function buildMuapiSubmitRequest(input: {
  prompt: string;
  referenceImageUrls: string[];
  model?: string;
}): { endpoint: string; body: MuapiSubmitBody } {
  const model = input.model || "wan2.7-image-edit";
  const isFastGptImage = model === "gpt-image-2-fast";
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
        resolution: isFastGptImage ? "1K" : "2K",
        quality: isFastGptImage ? "low" : "high",
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
      return {
        jobId: providerJobId,
        status: "failed",
        error: payload.error || `MuAPI status check failed: ${response.status}`,
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
      error: payload.error || (mappedStatus === "failed" ? "MuAPI processing failed without a specific error message." : undefined),
    };
  }
}
