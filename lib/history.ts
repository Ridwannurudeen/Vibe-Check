import { kv } from '@vercel/kv';
import type { ScoreSnapshot, HistoryResponse } from '@/types';

const HISTORY_PREFIX = 'history:';
const MAX_SNAPSHOTS = 100;
const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

export async function storeReputationSnapshot(
  address: string,
  snapshot: ScoreSnapshot
): Promise<void> {
  if (!process.env.KV_REST_API_URL) return;

  const key = `${HISTORY_PREFIX}${address.toLowerCase()}`;

  try {
    // Add snapshot with timestamp as score for sorted ordering
    await kv.zadd(key, { score: snapshot.timestamp, member: JSON.stringify(snapshot) });

    // Trim to last MAX_SNAPSHOTS
    const count = await kv.zcard(key);
    if (count > MAX_SNAPSHOTS) {
      await kv.zremrangebyrank(key, 0, count - MAX_SNAPSHOTS - 1);
    }

    // Set TTL
    await kv.expire(key, TTL_SECONDS);
  } catch (err) {
    console.error('[history] Failed to store snapshot:', err);
  }
}

export async function getReputationHistory(
  address: string,
  limit: number = 100
): Promise<HistoryResponse> {
  const empty: HistoryResponse = {
    address: address.toLowerCase(),
    snapshots: [],
    firstSeen: null,
    lastSeen: null,
  };

  if (!process.env.KV_REST_API_URL) return empty;

  const key = `${HISTORY_PREFIX}${address.toLowerCase()}`;

  try {
    const members = await kv.zrange(key, 0, limit - 1);
    if (!members || members.length === 0) return empty;

    const snapshots: ScoreSnapshot[] = members.map((m: any) => {
      if (typeof m === 'string') return JSON.parse(m);
      return m;
    });

    return {
      address: address.toLowerCase(),
      snapshots,
      firstSeen: snapshots.length > 0 ? snapshots[0].timestamp : null,
      lastSeen: snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : null,
    };
  } catch (err) {
    console.error('[history] Failed to get history:', err);
    return empty;
  }
}
