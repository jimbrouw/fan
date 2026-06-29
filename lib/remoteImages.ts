const supportedImageSignatures = [
  [0xff, 0xd8, 0xff], // JPEG
  [0x89, 0x50, 0x4e, 0x47], // PNG
  [0x52, 0x49, 0x46, 0x46], // WebP (RIFF)
  [0x47, 0x49, 0x46, 0x38], // GIF
];

export function hasSupportedImageSignature(bytes: Uint8Array) {
  return supportedImageSignatures.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte)
  );
}

function isSafeRemoteUrl(url: string): boolean {
  if (!url || !url.startsWith("http")) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) {
      return false;
    }

    const isIpv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
    if (isIpv4) {
      const p1 = parseInt(isIpv4[1], 10);
      const p2 = parseInt(isIpv4[2], 10);
      if (
        p1 === 10 ||
        p1 === 127 ||
        (p1 === 169 && p2 === 254) ||
        (p1 === 192 && p2 === 168) ||
        (p1 === 172 && p2 >= 16 && p2 <= 31)
      ) {
        return false;
      }
    }

    if (host.includes(":") && (host.startsWith("[fd") || host.startsWith("[fc") || host.startsWith("[fe80"))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function isUsableRemoteImageUrl(url: string) {
  if (!isSafeRemoteUrl(url)) return false;

  try {
    // Try a HEAD request first to check content type without downloading
    // Some CDNs block HEAD, so we handle failure gracefully
    const headResponse = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      redirect: "error",
    }).catch(() => null);

    if (headResponse?.ok) {
      const contentType = headResponse.headers.get("content-type");
      // If it's explicitly not an image, we can stop early
      if (contentType && !contentType.startsWith("image/") && !contentType.startsWith("application/octet-stream")) {
        return false;
      }
    }

    // Now do a GET but only read the start of the body
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "error",
    });

    if (!response.ok) return false;

    // Check content-type again from the GET response
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.startsWith("image/") && !contentType.startsWith("application/octet-stream")) {
      return false;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      // Fallback for environments without stream support
      const buffer = await response.arrayBuffer();
      return hasSupportedImageSignature(new Uint8Array(buffer.slice(0, 32)));
    }

    try {
      const { value, done } = await reader.read();
      if (done || !value) return false;
      return hasSupportedImageSignature(value);
    } finally {
      reader.cancel().catch(() => {}); // Close the stream early
    }
  } catch (error) {
    console.error(`Error validating remote image URL ${url}:`, error);
    return false;
  }
}

export async function buildUsableReferenceImageUrls(input: {
  requiredSourceImageUrl: string;
  optionalReferenceImageUrls?: string[];
}) {
  // We assume the source image (usually from our own Supabase) is usable if it looks like a URL
  // but we still check it to be sure.
  const sourceIsUsable = await isUsableRemoteImageUrl(input.requiredSourceImageUrl);
  if (!sourceIsUsable) {
    throw new Error("The selected face reference image is not a downloadable image. Please retake the photo.");
  }

  const optionalResults = await Promise.all(
    (input.optionalReferenceImageUrls ?? []).map(async (url) => ({
      url,
      usable: await isUsableRemoteImageUrl(url),
    }))
  );

  return [
    input.requiredSourceImageUrl,
    ...optionalResults.filter((result) => result.usable).map((result) => result.url),
  ];
}
