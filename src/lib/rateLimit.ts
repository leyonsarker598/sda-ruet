/**
 * In-Memory Token Bucket Rate Limiter
 * Provides distributed defensive rate limiting for public endpoints, authentication,
 * and contact inquiry submissions.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection for expired rate limit keys every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeMs: number;
}

/**
 * Checks and updates rate limit status for a given identifier
 * @param identifier Unique key (e.g. IP + action name)
 * @param maxRequests Maximum requests allowed within window
 * @param windowMs Time window in milliseconds (e.g. 60_000 for 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTimeMs: newRecord.resetAt,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTimeMs: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetTimeMs: existing.resetAt,
  };
}

/**
 * Extracts client IP from HTTP headers
 */
export function getClientIp(headers?: Headers): string {
  if (!headers) return "127.0.0.1";
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
