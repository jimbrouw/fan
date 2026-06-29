import { NextResponse } from "next/server";

// Memory cache for rate limiting. Key is `identifier:endpoint`.
const rateLimitCache = new Map<string, number[]>();

export type RateLimitConfig = {
  limit: number;       // Number of allowed requests
  windowMs: number;    // Window size in milliseconds
};

export function isRateLimited(identifier: string, endpoint: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const key = `${identifier}:${endpoint}`;
  const timestamps = rateLimitCache.get(key) ?? [];

  // Filter out timestamps outside the window
  const validTimestamps = timestamps.filter((t) => now - t < config.windowMs);

  if (validTimestamps.length >= config.limit) {
    // Save the filtered timestamps even if limited
    rateLimitCache.set(key, validTimestamps);
    return true;
  }

  validTimestamps.push(now);

  // Clean up cache to prevent memory leaks
  if (rateLimitCache.size > 10000) {
    const firstKey = rateLimitCache.keys().next().value;
    if (firstKey !== undefined) {
      rateLimitCache.delete(firstKey);
    }
  }

  rateLimitCache.set(key, validTimestamps);
  return false;
}

export function getIpFromRequest(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): NextResponse | null {
  if (isRateLimited(identifier, endpoint, config)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
  return null;
}
