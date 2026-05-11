type MuapiJobPayload = {
  status?: string;
  output?: string | string[];
  error?: string;
};

export type AppJobStatus = "queued" | "processing" | "completed" | "failed";

export function normalizeMuapiStatus(status?: string): AppJobStatus {
  if (status === "completed" || status === "succeeded" || status === "success") {
    return "completed";
  }

  if (status === "failed" || status === "error" || status === "canceled") {
    return "failed";
  }

  return "processing";
}

export function getMuapiOutputUrl(payload: MuapiJobPayload) {
  return Array.isArray(payload.output) ? payload.output[0] : payload.output;
}
