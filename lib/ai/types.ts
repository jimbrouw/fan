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
    webhookUrl?: string;
  }): Promise<{ providerJobId: string }>;

  /**
   * Check the status of an existing job.
   */
  getJobStatus(providerJobId: string): Promise<GenerationResponse>;
}
