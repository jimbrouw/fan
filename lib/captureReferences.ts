import type { CaptureStepType } from "@/types/capture";

export type CaptureReferenceCandidate = {
  type: CaptureStepType;
  imageUrl?: string;
};

export const primaryReferencePriority: CaptureStepType[] = ["smiling_front", "celebration", "torso", "neutral_front"];

export function choosePrimaryReferenceCapture<T extends CaptureReferenceCandidate>(captures: T[]) {
  return primaryReferencePriority
    .map((type) => captures.find((capture) => capture.type === type && capture.imageUrl))
    .find(Boolean);
}

export function choosePrimaryReferenceType(captures: CaptureReferenceCandidate[]) {
  return choosePrimaryReferenceCapture(captures)?.type
    ?? primaryReferencePriority.find((type) => captures.some((capture) => capture.type === type));
}

export function chooseSupportingReferenceUrls(captures: CaptureReferenceCandidate[], primaryUrl?: string) {
  return primaryReferencePriority
    .map((type) => captures.find((capture) => capture.type === type && capture.imageUrl)?.imageUrl)
    .filter((url): url is string => Boolean(url) && url !== primaryUrl)
    .slice(0, 2);
}
