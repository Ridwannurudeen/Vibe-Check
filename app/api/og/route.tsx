import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function getScoreColor(score: number): string {
  if (score >= 2000) return '#22c55e'; // Excellent - green
  if (score >= 1600) return '#3b82f6'; // Good - blue
  if (score >= 1200) return '#eab308'; // Neutral - yellow
  if (score >= 800) return '#f97316';  // Questionable - orange
  return '#ef4444';                     // Risky - red
}

function getTierLabel(tier: string): string {
  const map: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    neutral: 'Neutral',
    questionable: 'Questionable',
    risky: 'Risky',
  };
  return map[tier.toLowerCase()] || tier;
}

function getTierFromScore(score: number): string {
  if (score >= 2000) return 'Excellent';
  if (score >= 1600) return 'Good';
  if (score >= 1200) return 'Neutral';
  if (score >= 800) return 'Questionable';
  return 'Risky';
}

function truncateAddress(address: string): string {
  if (address.includes('.')) return address; // ENS name
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const address = searchParams.get('address') || '0x0000...0000';
  const scoreStr = searchParams.get('score');
  const tierParam = searchParams.get('tier');
  const isContract = searchParams.get('contract') === 'true';

  const score = scoreStr ? parseInt(scoreStr, 10) : 1400;
  const tier = tierParam ? getTierLabel(tierParam) : getTierFromScore(score);
  const scoreColor = getScoreColor(score);
  const displayAddress = truncateAddress(address);

  // Score circle math
  const maxScore = 2800;
  const percentage = Math.min(score / maxScore, 1);
  const circumference = 2 * Math.PI * 80; // radius 80
  const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
  // Rotate so arc starts at top (-90deg offset). SVG dashoffset shifts the start.
  const strokeDashoffset = circumference * 0.25; // 25% = 90 degrees clockwise = top

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200',
          height: '630',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a14 0%, #141428 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.06) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
            display: 'flex',
          }}
        />

        {/* Top branding bar */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 32 }}>✨</span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Vibe Check
          </span>
        </div>

        {/* Contract badge (top right) */}
        {isContract && (
          <div
            style={{
              position: 'absolute',
              top: 36,
              right: 48,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 20,
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            <span style={{ fontSize: 14, color: '#818cf8', fontWeight: 500 }}>
              Smart Contract
            </span>
          </div>
        )}

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 64,
            marginTop: 16,
          }}
        >
          {/* Score circle */}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              width: 220,
              height: 220,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {/* Background circle */}
              <circle
                cx="110"
                cy="110"
                r="80"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="12"
              />
              {/* Score arc */}
              <circle
                cx="110"
                cy="110"
                r="80"
                fill="none"
                stroke={scoreColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            {/* Score text */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: 4,
                }}
              >
                / {maxScore}
              </span>
            </div>
          </div>

          {/* Right side: address + tier */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 16,
            }}
          >
            {/* Address */}
            <span
              style={{
                fontSize: 28,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              {displayAddress}
            </span>

            {/* Tier badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 24px',
                borderRadius: 16,
                background: `${scoreColor}1a`,
                border: `2px solid ${scoreColor}40`,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: scoreColor,
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: scoreColor,
                }}
              >
                {tier}
              </span>
            </div>

            {/* Subtitle */}
            <span
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {isContract
                ? 'Contract reputation on Base'
                : 'Wallet reputation on Base'}
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: 48,
            right: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            Powered by Ethos Network
          </span>
          <span
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            vibecheck.base.org
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
