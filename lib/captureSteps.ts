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
    type: "celebration",
    title: "Now celebrate!",
    shortLabel: "Celebrate",
    instruction: "Big open-mouth shout, arms up, fist pump — your best winning reaction.",
    purpose: "Celebration expression reference",
    overlay: "portrait"
  },
  {
    type: "torso",
    title: "Show us your upper body",
    shortLabel: "Torso",
    instruction: "Step back until your torso fits in the guide. Hit the button and strike a pose!",
    purpose: "Body build and posture reference",
    overlay: "torso",
    autoCapture: true,
    countdownSeconds: 5
  }
];
