import type { CaptureValidationStatus } from "@/types/capture";

export type ClientValidationResult = {
  status: CaptureValidationStatus;
  checks: {
    brightness: number;
    blurScore: number;
  };
  messages: string[];
};

export async function validateImageBlob(blob: Blob): Promise<ClientValidationResult> {
  const sample = await sampleImageBlob(blob).catch(() => ({
    brightness: 0,
    blurScore: 0
  }));

  const messages: string[] = [];
  if (sample.brightness < 42) {
    messages.push("Try a brighter spot.");
  }

  if (sample.blurScore < 7) {
    messages.push("Hold still and retake the photo.");
  }

  return {
    status: messages.length ? "needs_retake" : "manual_review",
    checks: sample,
    messages: messages.length ? messages : ["Image captured. Face checks need provider setup."]
  };
}

async function sampleImageBlob(blob: Blob) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      const sample = sampleImageSource(bitmap, 160, 160);
      bitmap.close();
      return sample;
    } catch {
      // Safari can reject some user-selected files here even when <img> can decode them.
    }
  }

  return sampleImageElement(blob, 160, 160);
}

async function sampleImageElement(blob: Blob, width: number, height: number) {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image decode failed."));
      image.decoding = "async";
      image.src = objectUrl;
    });

    return sampleImageSource(image, width, height);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function sampleImageSource(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return { brightness: 0, blurScore: 0 };
  }

  context.drawImage(source, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  let brightness = 0;
  let contrast = 0;
  let previous = 0;

  for (let index = 0; index < data.length; index += 4) {
    const luminance = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    brightness += luminance;
    contrast += Math.abs(luminance - previous);
    previous = luminance;
  }

  const pixels = data.length / 4;

  return {
    brightness: Math.round(brightness / pixels),
    blurScore: Math.round(contrast / pixels)
  };
}
