'use client';

import { useState, useEffect } from 'react';
import type { EthosUser, OnChainData } from '@/types';

interface ActivityRadarProps {
  ethosData: EthosUser;
  onChainData?: OnChainData | null;
}

interface Dimension {
  label: string;
  value: number; // 0-100
  color: string;
}

function computeDimensions(ethosData: EthosUser, onChainData?: OnChainData | null): Dimension[] {
  const age = onChainData?.walletAgeDays ?? 0;
  const txCount = onChainData?.transactionCount ?? 0;
  const protocols = onChainData?.protocols?.length ?? 0;
  const diversity = onChainData?.activityDiversity;
  const diversityCount = diversity
    ? [diversity.defi, diversity.nft, diversity.governance, diversity.bridging].filter(Boolean).length
    : 0;

  // Community: vouches + positive reviews
  const vouches = ethosData.stats.vouch.received.count;
  const posReviews = ethosData.stats.review.received.positive;
  const communitySignals = vouches + posReviews;

  return [
    {
      label: 'Wallet Age',
      value: Math.min((age / 730) * 100, 100), // 2 years = 100%
      color: '#a78bfa', // purple
    },
    {
      label: 'Activity',
      value: Math.min((txCount / 500) * 100, 100), // 500 txs = 100%
      color: '#22d3ee', // cyan
    },
    {
      label: 'Protocols',
      value: Math.min((protocols / 8) * 100, 100), // 8 protocols = 100%
      color: '#3b82f6', // blue
    },
    {
      label: 'Diversity',
      value: (diversityCount / 4) * 100, // 4 categories = 100%
      color: '#10b981', // emerald
    },
    {
      label: 'Community',
      value: Math.min((communitySignals / 20) * 100, 100), // 20 signals = 100%
      color: '#f59e0b', // amber
    },
  ];
}

// Convert polar to cartesian (angle in radians, 0 = top)
function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function ActivityRadar({ ethosData, onChainData }: ActivityRadarProps) {
  const [animProgress, setAnimProgress] = useState(0);
  const dims = computeDimensions(ethosData, onChainData);
  const n = dims.length;
  const cx = 150, cy = 150, maxR = 110;
  const angleStep = 360 / n;

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease out expo
      const eased = 1 - Math.pow(2, -10 * t);
      setAnimProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Build radar polygon points
  const radarPoints = dims.map((d, i) => {
    const angle = i * angleStep;
    const r = (d.value / 100) * maxR * animProgress;
    return polarToCart(cx, cy, r, angle);
  });

  const polygonStr = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-lg bg-base-blue/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-base-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Reputation Profile</h3>
      </div>

      <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto">
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0052FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0052FF" stopOpacity="0.05" />
          </radialGradient>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {rings.map((frac) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const p = polarToCart(cx, cy, maxR * frac, i * angleStep);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={frac}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {dims.map((_, i) => {
          const end = polarToCart(cx, cy, maxR, i * angleStep);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonStr}
          fill="url(#radarFill)"
          stroke="#0052FF"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#radarGlow)"
          opacity={animProgress > 0 ? 1 : 0}
        />

        {/* Data points */}
        {radarPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={dims[i].color}
            stroke="#0a0a0f"
            strokeWidth="2"
            opacity={animProgress > 0.3 ? 1 : 0}
          />
        ))}

        {/* Labels */}
        {dims.map((d, i) => {
          const labelR = maxR + 22;
          const p = polarToCart(cx, cy, labelR, i * angleStep);
          const anchor = p.x < cx - 5 ? 'end' : p.x > cx + 5 ? 'start' : 'middle';
          return (
            <g key={i}>
              <text
                x={p.x}
                y={p.y - 6}
                textAnchor={anchor}
                fill={d.color}
                fontSize="11"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {d.label}
              </text>
              <text
                x={p.x}
                y={p.y + 8}
                textAnchor={anchor}
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                fontFamily="monospace"
              >
                {Math.round(d.value)}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend row */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {dims.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
