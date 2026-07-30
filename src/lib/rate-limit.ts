// Minimal in-memory rate limiter. Fine for a single Vercel instance during
// early traffic; once you're on multiple regions/instances, swap this for
// Upstash Redis (`@upstash/ratelimit`), the call signature below is
// deliberately compatible so that swap is a one-file change.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}
