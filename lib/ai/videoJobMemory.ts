import type { VideoJobStatus } from "@/lib/ai/videoTypes";

export type MemoryVideoJob = {
  id: string;
  generation_job_id: string;
  user_id: string;
  source_poster_url: string;
  provider: string;
  provider_job_id: string | null;
  status: VideoJobStatus;
  output_url: string | null;
  error: string | null;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
};

const globalKey = "__kitfaceMemoryVideoJobs";

type VideoJobGlobal = typeof globalThis & {
  [globalKey]?: Map<string, MemoryVideoJob>;
};

function getStore() {
  const storeGlobal = globalThis as VideoJobGlobal;
  if (!storeGlobal[globalKey]) {
    storeGlobal[globalKey] = new Map<string, MemoryVideoJob>();
  }

  return storeGlobal[globalKey];
}

export function isMissingVideoJobsTable(error: { message?: string } | null | undefined) {
  const message = error?.message ?? "";
  return (
    /Could not find the table 'public\.video_jobs'/i.test(message) ||
    /schema cache/i.test(message) && /video_jobs/i.test(message) ||
    /relation .*video_jobs.* does not exist/i.test(message)
  );
}

export function saveMemoryVideoJob(job: MemoryVideoJob) {
  getStore().set(job.id, job);
  return job;
}

export function getMemoryVideoJob(id: string) {
  return getStore().get(id) ?? null;
}

export function findMemoryVideoJobByProviderJobId(providerJobId: string) {
  for (const job of getStore().values()) {
    if (job.provider_job_id === providerJobId) return job;
  }

  return null;
}

export function updateMemoryVideoJob(id: string, patch: Partial<MemoryVideoJob>) {
  const current = getMemoryVideoJob(id);
  if (!current) return null;

  const updated = { ...current, ...patch, updated_at: new Date().toISOString() };
  saveMemoryVideoJob(updated);
  return updated;
}
