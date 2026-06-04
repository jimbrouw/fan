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
  },
  {
    type: "left_45",
    title: "Turn left",
    shortLabel: "Left",
    instruction: "Turn your head a little to the left.",
    purpose: "Facial depth and jawline",
    overlay: "angle-left"
  },
  {
    type: "right_45",
    title: "Turn right",
    shortLabel: "Right",
    instruction: "Turn your head a little to the right.",
    purpose: "Facial depth and ear structure",
    overlay: "angle-right"
  },
  {
    type: "celebration",
    title: "Celebrate",
    shortLabel: "Celebrate",
    instruction: "Show your best winning reaction.",
    purpose: "Celebration expression reference",
    overlay: "portrait"
  },
  {
    type: "torso",
    title: "Step back",
    shortLabel: "Torso",
    instruction: "Fit your upper body in the guide. Tap once, then pose.",
    purpose: "Body build and posture reference",
    overlay: "torso",
    autoCapture: true,
    countdownSeconds: 5
  }
];
