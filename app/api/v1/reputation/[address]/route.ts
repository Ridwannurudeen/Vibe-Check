import { NextRequest, NextResponse } from 'next/server';
import { getReputation, isENSName } from '@/lib/reputation';
import { isValidAddress } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';
import { validateApiKey } from '@/lib/api-keys';

export const runtime = 'nodejs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  // --- Validate input ---
  if (!address || typeof address !== 'string') {
    return NextResponse.json(
      { error: 'Address is required', code: 'MISSING_ADDRESS' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const trimmed = address.trim();
  if (!isENSName(trimmed) && !isValidAddress(trimmed)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address or ENS name', code: 'INVALID_ADDRESS' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // --- API key validation ---
  const apiKey =
    req.headers.get('x-api-key') ||
    req.nextUrl.searchParams.get('key') ||
    null;

  const { valid, info } = await validateApiKey(apiKey);

  if (!valid) {
    return NextResponse.json(
      { error: 'Invalid API key', code: 'INVALID_API_KEY' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  // --- Rate limiting ---
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const identifier = apiKey || ip;
  const rl = await rateLimit(identifier, info.rateLimit);

  const rateLimitHeaders = {
    'X-RateLimit-Limit': String(rl.limit),
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Reset': String(rl.reset),
  };

  if (!rl.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
      {
        status: 429,
        headers: { ...CORS_HEADERS, ...rateLimitHeaders, 'Retry-After': '60' },
      }
    );
  }

  // --- Fetch reputation ---
  try {
    const result = await getReputation(trimmed);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        ...rateLimitHeaders,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const isUserError =
      message.includes('Could not resolve') || message.includes('Invalid');

    return NextResponse.json(
      { error: message, code: isUserError ? 'BAD_REQUEST' : 'INTERNAL_ERROR' },
      {
        status: isUserError ? 400 : 500,
        headers: { ...CORS_HEADERS, ...rateLimitHeaders },
      }
    );
  }
}
