export type GenerationJobStatus = "queued" | "processing" | "completed" | "failed";

export type GenerationResponse = {
  jobId: string;
  status: GenerationJobStatus;
  outputUrl?: string;
  error?: string;
};

export interface GenerationProvider {
  /**
   * Submit a new generation request.
   */
  submitJob(input: {
    prompt: string;
    referenceImageUrls: string[];
    model?: string;
    gptImageTestMode?: "fast-1k-low" | "draft-1k-medium" | "final-2k-high";
    webhookUrl?: string;
  }): Promise<{ providerJobId: string }>;

  /**
   * Check the status of an existing job.
   */
  getJobStatus(providerJobId: string): Promise<GenerationResponse>;
}
