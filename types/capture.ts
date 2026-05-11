export type CaptureStepType =
  | "neutral_front"
  | "smiling_front"
  | "left_45"
  | "right_45"
  | "side_profile"
  | "full_body"
  | "arms_folded"
  | "celebration";

export type CaptureValidationStatus =
  | "pending"
  | "passed"
  | "needs_retake"
  | "manual_review";

export type CaptureStep = {
  type: CaptureStepType;
  title: string;
  shortLabel: string;
  instruction: string;
  purpose: string;
  overlay: "portrait" | "angle-left" | "angle-right" | "profile" | "body" | "action";
  autoCapture?: boolean;
  countdownSeconds?: number;
};

export type Capture = {
  id: string;
  sessionId: string;
  type: CaptureStepType;
  imageUrl: string;
  validationStatus: CaptureValidationStatus;
  validationResults: Record<string, unknown>;
  createdAt: string;
};

export type CaptureSession = {
  id: string;
  status: "capturing" | "ready" | "generating" | "complete" | "failed";
  captures: Capture[];
  createdAt: string;
  updatedAt: string;
};

export type GenerationJob = {
  id: string;
  sessionId: string;
  teamName: string;
  kitNotes: string;
  targetPosterUrl: string;
  providerJobId?: string;
  status: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};
