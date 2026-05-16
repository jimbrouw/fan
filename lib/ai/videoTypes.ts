export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

export type VideoGenerationResponse = {
  jobId: string;
  status: VideoJobStatus;
  outputUrl?: string;
  error?: string;
};

export type SubmitVideoJobInput = {
  prompt: string;
  sourceImageUrl: string;
  durationSeconds?: number;
  model?: string;
  webhookUrl?: string;
};

export interface VideoGenerationProvider {
  readonly id: string;
  submitVideoJob(input: SubmitVideoJobInput): Promise<{ providerJobId: string }>;
  getVideoJobStatus(providerJobId: string): Promise<VideoGenerationResponse>;
}

export const KITFACE_VIDEO_PROMPT_2_SECONDS =
  "Create a subtle 2-second looping animated version of this football poster. Preserve the exact composition, face identity, kit colours, text, layout, and watermark. Add only restrained sports-broadcast motion: a very slow camera push, soft moving light beams, slight fabric movement, gentle background particle drift, and a single subtle pulse on key graphic elements. Do not change the person's face, kit, team colours, poster text, badge-like details, sponsor-like details, or watermark. Do not invent new logos or words. Keep the poster sharp, premium, and social-media ready. First and last frames should feel loop-compatible.";

export const KITFACE_VIDEO_PROMPT_4_SECONDS =
  "Create a seamlessly looping 4-second animation of this football poster. The first and last frames must match exactly so it plays as a perfect loop with no jump cut. Use only restrained sports-broadcast motion that naturally cycles: a slow breathing camera push that returns to its start, soft light beams that drift and reset, gentle fabric movement that eases back, background particle drift on a smooth loop, and a single subtle pulse on key graphic elements. Preserve the exact composition, face identity, kit colours, text, layout, and watermark throughout. Do not change the person's face, kit, team colours, poster text, badge-like details, sponsor-like details, or watermark. Do not invent new logos or words. Keep the poster sharp, premium, and social-media ready.";

export const KITFACE_VS_VIDEO_PROMPT_4_SECONDS =
  "Create a seamlessly looping 4-second animation for this VS match poster. The first and last frames must match exactly so it plays as a perfect loop with no jump cut. Both players should feel alive with light banter energy — like two mates squaring up before a big game, not a fight. Use motion that naturally cycles: a cheeky confidence bounce or lean between the characters that eases back to its start, a soft glowing spark or crackle between them that pulses and resets, background crowd atmosphere that breathes in a smooth loop. Keep the tone fun and shareable — the kind of clip you'd send in a WhatsApp group chat to wind up your mates before kick-off. Preserve both faces, kit colours, crests, names, text, and watermark exactly. No violence, no aggression — pure football banter.";
