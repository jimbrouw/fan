import type { CaptureStep } from "@/types/capture";

export const captureSteps: CaptureStep[] = [
  {
    type: "neutral_front",
    title: "Face the camera",
    shortLabel: "Front",
    instruction: "Look straight ahead and hold still.",
    purpose: "Baseline facial structure",
    overlay: "portrait"
  },
  {
    type: "smiling_front",
    title: "Smile",
    shortLabel: "Smile",
    instruction: "Stay in the same spot and smile.",
    purpose: "Smile lines and mouth structure",
    overlay: "portrait"
  }
];
