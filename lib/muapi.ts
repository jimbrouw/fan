const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

type MuapiUploadResponse = {
  url?: string;
  file_url?: string;
  data?: {
    url?: string;
    file_url?: string;
  };
};

type MuapiPredictionResponse = {
  request_id?: string;
  id?: string;
  status?: string;
  output?: string | string[];
  error?: string;
};

function getApiKey() {
  const apiKey = process.env.MUAPI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MUAPI_API_KEY.");
  }
  return apiKey;
}

export async function uploadFileToMuapi(file: Blob, filename: string) {
  const form = new FormData();
  form.append("file", file, filename);

  const response = await fetch(`${MUAPI_BASE_URL}/upload_file`, {
    method: "POST",
    headers: {
      "x-api-key": getApiKey()
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`MUAPI upload failed with ${response.status}.`);
  }

  const payload = (await response.json()) as MuapiUploadResponse;
  const url = payload.url ?? payload.file_url ?? payload.data?.url ?? payload.data?.file_url;

  if (!url) {
    throw new Error("MUAPI upload response did not include a file URL.");
  }

  return url;
}

export async function createMuapiImageFaceSwap(input: {
  sourceImageUrl: string;
  targetImageUrl: string;
  webhookUrl?: string;
}) {
  const response = await fetch(`${MUAPI_BASE_URL}/ai-image-face-swap`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": getApiKey()
    },
    body: JSON.stringify({
      source_image: input.sourceImageUrl,
      target_image: input.targetImageUrl,
      webhook: input.webhookUrl
    })
  });

  if (!response.ok) {
    throw new Error(`MUAPI face swap failed with ${response.status}.`);
  }

  return (await response.json()) as MuapiPredictionResponse;
}

export async function getMuapiPredictionResult(requestId: string) {
  const response = await fetch(`${MUAPI_BASE_URL}/predictions/${requestId}/result`, {
    headers: {
      "x-api-key": getApiKey()
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`MUAPI result lookup failed with ${response.status}.`);
  }

  return (await response.json()) as MuapiPredictionResponse;
}
