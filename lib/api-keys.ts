import { kv } from '@vercel/kv';

interface ApiKeyInfo {
  tier: 'free' | 'pro' | 'enterprise';
  rateLimit: number; // requests per minute
  owner?: string;
}

const TIER_LIMITS: Record<string, number> = {
  free: 30,
  pro: 100,
  enterprise: 500,
};

const UNAUTHED_LIMIT = 10;

export async function validateApiKey(apiKey: string | null): Promise<{ valid: boolean; info: ApiKeyInfo }> {
  // Master key bypass
  if (apiKey && apiKey === process.env.VIBE_CHECK_MASTER_API_KEY) {
    return { valid: true, info: { tier: 'enterprise', rateLimit: TIER_LIMITS.enterprise, owner: 'master' } };
  }

  // No key = unauthed
  if (!apiKey) {
    return { valid: true, info: { tier: 'free', rateLimit: UNAUTHED_LIMIT } };
  }

  // Lookup in KV
  if (process.env.KV_REST_API_URL) {
    try {
      const info = await kv.get<ApiKeyInfo>(`apikey:${apiKey}`);
      if (info) {
        return { valid: true, info: { ...info, rateLimit: TIER_LIMITS[info.tier] || UNAUTHED_LIMIT } };
      }
    } catch (err) {
      console.error('[api-keys] KV lookup error:', err);
    }
  }

  // Unknown key - treat as invalid
  return { valid: false, info: { tier: 'free', rateLimit: UNAUTHED_LIMIT } };
}
