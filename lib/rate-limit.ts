import { kv } from '@vercel/kv';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(identifier: string, limit: number): Promise<RateLimitResult> {
  // If KV not configured, allow all
  if (!process.env.KV_REST_API_URL) {
    return { success: true, limit, remaining: limit - 1, reset: 0 };
  }

  const window = Math.floor(Date.now() / 60000); // 1-min window
  const key = `rate:${identifier}:${window}`;

  try {
    const count = await kv.incr(key);
    if (count === 1) {
      await kv.expire(key, 60);
    }

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: (window + 1) * 60000,
    };
  } catch (err) {
    console.error('[rate-limit] KV error, failing open:', err);
    return { success: true, limit, remaining: limit - 1, reset: 0 };
  }
}
