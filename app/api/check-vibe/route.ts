import { NextRequest, NextResponse } from 'next/server';
import { getReputation, isENSName } from '@/lib/reputation';
import { isValidAddress } from '@/lib/utils';
import type { CheckVibeError } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json<CheckVibeError>(
        { error: 'Address is required', code: 'MISSING_ADDRESS' },
        { status: 400 }
      );
    }

    const trimmed = address.trim();
    if (!isENSName(trimmed) && !isValidAddress(trimmed)) {
      return NextResponse.json<CheckVibeError>(
        { error: 'Invalid Ethereum address or ENS name', code: 'INVALID_ADDRESS' },
        { status: 400 }
      );
    }

    const result = await getReputation(trimmed);

    // Map to existing CheckVibeResponse shape for backward compat
    return NextResponse.json({
      ethosData: result.ethosData,
      onChainData: result.onChainData,
      contractInfo: result.contractInfo,
      knownProtocol: result.knownProtocol,
      aiAnalysis: result.aiAnalysis,
      timestamp: result.timestamp,
      basename: result.basename,
      sybilRisk: result.sybilRisk,
      address: result.address,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const isUserError = message.includes('Could not resolve') || message.includes('Invalid');
    return NextResponse.json<CheckVibeError>(
      { error: message, code: isUserError ? 'BAD_REQUEST' : 'INTERNAL_ERROR' },
      { status: isUserError ? 400 : 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
