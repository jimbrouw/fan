import { GenerationProvider, GenerationResponse, GenerationJobStatus } from "../types";

const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

type MuapiPredictionResponse = {
  request_id?: string;
  id?: string;
  status: string;
  outputs?: string[];
  error?: string;
};

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
    webhookUrl?: string;
  }): Promise<{ providerJobId: string }> {
    const url = new URL(`${MUAPI_BASE_URL}/flux-pulid`);
    if (input.webhookUrl) {
      url.searchParams.set("webhook", input.webhookUrl);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.getApiKey(),
      },
      body: JSON.stringify({
        prompt: input.prompt,
        image_url: input.referenceImageUrls[0],
        aspect_ratio: "3:4", // Matching our SVG poster dimensions (1200x1600)
      }),
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MuAPI status check failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as MuapiPredictionResponse;

    let mappedStatus: GenerationJobStatus = "processing";
    const status = payload.status.toLowerCase();

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
      error: payload.error,
    };
  }
}
