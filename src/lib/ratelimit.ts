/**
 * Rate limiting using @upstash/ratelimit + Upstash Redis.
 * Falls back to an in-memory no-op when env vars are absent (local dev without Upstash).
 */

type RateLimitResult = { success: boolean; remaining: number; reset: number };

// ---- In-memory fallback (dev only, single process, non-distributed) ----
const inMemory = new Map<string, { count: number; resetAt: number }>();

function inMemoryLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const record = inMemory.get(key);
  if (!record || record.resetAt <= now) {
    inMemory.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
  }
  record.count += 1;
  const remaining = Math.max(0, maxRequests - record.count);
  return { success: record.count <= maxRequests, remaining, reset: record.resetAt };
}

// ---- Upstash-based limiter (production) ----
let _upstashLimiter: ((key: string) => Promise<RateLimitResult>) | null = null;

async function getUpstashLimiter() {
  if (_upstashLimiter) return _upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  // Dynamic import so the module isn't loaded on the client bundle.
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: false,
  });

  _upstashLimiter = async (key: string) => {
    const result = await limiter.limit(key);
    return { success: result.success, remaining: result.remaining, reset: result.reset };
  };
  return _upstashLimiter;
}

/**
 * Check the rate limit for a given key (e.g. "slug:ip").
 * @param key      Unique string to rate-limit on (e.g. `${slug}:${ip}`)
 * @param maxRequests Max requests per window (default 5)
 * @param windowMs  Window in milliseconds (default 15 min)
 */
export async function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 15 * 60 * 1000,
): Promise<RateLimitResult> {
  try {
    const limiter = await getUpstashLimiter();
    if (limiter) return await limiter(key);
  } catch {
    // If Upstash fails, fall through to in-memory
  }
  return inMemoryLimit(key, maxRequests, windowMs);
}
