const supportedImageSignatures = [
  [0xff, 0xd8, 0xff],
  [0x89, 0x50, 0x4e, 0x47],
  [0x52, 0x49, 0x46, 0x46],
  [0x47, 0x49, 0x46, 0x38],
];

export function hasSupportedImageSignature(bytes: Uint8Array) {
  return supportedImageSignatures.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte)
  );
}

export async function isUsableRemoteImageUrl(url: string) {
  try {
    const response = await fetch(url, {
      headers: { Range: "bytes=0-31" },
      cache: "no-store",
    });

    if (!response.ok) return false;

    const bytes = new Uint8Array(await response.arrayBuffer());
    return hasSupportedImageSignature(bytes);
  } catch {
    return false;
  }
}

export async function buildUsableReferenceImageUrls(input: {
  requiredSourceImageUrl: string;
  optionalReferenceImageUrls?: string[];
}) {
  const sourceIsUsable = await isUsableRemoteImageUrl(input.requiredSourceImageUrl);
  if (!sourceIsUsable) {
    throw new Error("The selected face reference image is not a downloadable image. Please retake the scan.");
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
