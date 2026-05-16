import type { CaptureStep } from "@/types/capture";

export const captureSteps: CaptureStep[] = [
  {
    type: "neutral_front",
    title: "Look straight at the camera",
    shortLabel: "Front",
    instruction: "Hold still and look right into the camera.",
    purpose: "Baseline facial structure",
    overlay: "portrait"
  },
  {
    type: "smiling_front",
    title: "Now give a big smile!",
    shortLabel: "Smile",
    instruction: "Same spot — this time show us your best smile.",
    purpose: "Smile lines and mouth structure",
    overlay: "portrait"
  },
  {
    type: "left_45",
    title: "Turn a little to the left",
    shortLabel: "Left",
    instruction: "Just a small turn — like you're looking at something nearby.",
    purpose: "Facial depth and jawline",
    overlay: "angle-left"
  },
  {
    type: "right_45",
    title: "Now turn a little to the right",
    shortLabel: "Right",
    instruction: "Same thing, other side.",
    purpose: "Facial depth and ear structure",
    overlay: "angle-right"
  },
  {
    type: "full_body",
    title: "Step back so we can see all of you",
    shortLabel: "Full body",
    instruction: "Back up until your whole body fits in the guide. Hit the button and strike a pose!",
    purpose: "Body proportions and posture",
    overlay: "body",
    autoCapture: true,
    countdownSeconds: 5
  }
];
