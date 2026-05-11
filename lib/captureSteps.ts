import type { CaptureStep } from "@/types/capture";

export const captureSteps: CaptureStep[] = [
  {
    type: "neutral_front",
    title: "Neutral Front",
    shortLabel: "Front",
    instruction: "Look straight ahead with a relaxed expression.",
    purpose: "Baseline facial structure",
    overlay: "portrait"
  },
  {
    type: "smiling_front",
    title: "Natural Smile",
    shortLabel: "Smile",
    instruction: "Keep your head level and smile naturally.",
    purpose: "Smile lines and mouth structure",
    overlay: "portrait"
  },
  {
    type: "left_45",
    title: "Left 45°",
    shortLabel: "Left",
    instruction: "Turn slightly left and keep your eyes on the guide.",
    purpose: "Facial depth and jawline",
    overlay: "angle-left"
  },
  {
    type: "right_45",
    title: "Right 45°",
    shortLabel: "Right",
    instruction: "Turn slightly right and keep your eyes on the guide.",
    purpose: "Facial depth and ear structure",
    overlay: "angle-right"
  },
  {
    type: "side_profile",
    title: "Side Profile",
    shortLabel: "Profile",
    instruction: "Face the side and keep your full profile inside the frame.",
    purpose: "Nose silhouette and head shape",
    overlay: "profile"
  },
  {
    type: "full_body",
    title: "Full Body",
    shortLabel: "Body",
    instruction: "Step back until your full body fits inside the guide.",
    purpose: "Body proportions and posture",
    overlay: "body"
  },
  {
    type: "arms_folded",
    title: "Arms Folded",
    shortLabel: "Folded",
    instruction: "Fold your arms and stand confidently.",
    purpose: "Footballer body language",
    overlay: "body"
  },
  {
    type: "celebration",
    title: "Celebration",
    shortLabel: "Celebrate",
    instruction: "Give a clean celebration pose with your face visible.",
    purpose: "Dynamic sports expression",
    overlay: "action"
  }
];
