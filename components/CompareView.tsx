'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ScoreGauge } from '@/components/ScoreGauge';
import { BaseLogo } from '@/components/ui/base-logo';
import { SpinnerIcon } from '@/components/ui/icons';
import { Footer } from '@/components/Footer';
import type { ReputationResult, EthosUser, OnChainData } from '@/types';

/* ==========================================================================
   COMPARISON RADAR — overlaid two-wallet radar chart
   ========================================================================== */

interface CompareRadarProps {
  a: { ethosData: EthosUser; onChainData: OnChainData };
  b: { ethosData: EthosUser; onChainData: OnChainData };
  labelA: string;
  labelB: string;
}

interface Dimension {
  label: string;
  valueA: number;
  valueB: number;
}

function computeComparisonDimensions(
  ethosA: EthosUser,
  onChainA: OnChainData | undefined | null,
  ethosB: EthosUser,
  onChainB: OnChainData | undefined | null,
): Dimension[] {
  const calc = (ethos: EthosUser, oc: OnChainData | undefined | null) => {
    const age = oc?.walletAgeDays ?? 0;
    const txCount = oc?.transactionCount ?? 0;
    const protocols = oc?.protocols?.length ?? 0;
    const diversity = oc?.activityDiversity;
    const diversityCount = diversity
      ? [diversity.defi, diversity.nft, diversity.governance, diversity.bridging].filter(Boolean).length
      : 0;
    const communitySignals =
      ethos.stats.vouch.received.count + ethos.stats.review.received.positive;

    return {
      walletAge: Math.min((age / 730) * 100, 100),
      activity: Math.min((txCount / 500) * 100, 100),
      protocols: Math.min((protocols / 8) * 100, 100),
      diversity: (diversityCount / 4) * 100,
      community: Math.min((communitySignals / 20) * 100, 100),
    };
  };

  const vA = calc(ethosA, onChainA);
  const vB = calc(ethosB, onChainB);

  return [
    { label: 'Wallet Age', valueA: vA.walletAge, valueB: vB.walletAge },
    { label: 'Activity', valueA: vA.activity, valueB: vB.activity },
    { label: 'Protocols', valueA: vA.protocols, valueB: vB.protocols },
    { label: 'Diversity', valueA: vA.diversity, valueB: vB.diversity },
    { label: 'Community', valueA: vA.community, valueB: vB.community },
  ];
}

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function CompareRadar({ a, b, labelA, labelB }: CompareRadarProps) {
  const [animProgress, setAnimProgress] = useState(0);
  const dims = computeComparisonDimensions(a.ethosData, a.onChainData, b.ethosData, b.onChainData);
  const n = dims.length;
  const cx = 150, cy = 150, maxR = 110;
  const angleStep = 360 / n;
  const rings = [0.25, 0.5, 0.75, 1];

  const COLOR_A = '#0052FF'; // Base blue
  const COLOR_B = '#a855f7'; // Purple

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * t);
      setAnimProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const buildPoints = (getValue: (d: Dimension) => number) =>
    dims.map((d, i) => {
      const angle = i * angleStep;
      const r = (getValue(d) / 100) * maxR * animProgress;
      return polarToCart(cx, cy, r, angle);
    });

  const pointsA = buildPoints((d) => d.valueA);
  const pointsB = buildPoints((d) => d.valueB);

  const polyStr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-lg bg-base-blue/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-base-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Reputation Overlay</h3>
      </div>

      <svg viewBox="0 0 300 300" className="w-full max-w-[340px] mx-auto">
        <defs>
          <radialGradient id="compareRadarFillA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLOR_A} stopOpacity="0.25" />
            <stop offset="100%" stopColor={COLOR_A} stopOpacity="0.03" />
          </radialGradient>
          <radialGradient id="compareRadarFillB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLOR_B} stopOpacity="0.25" />
            <stop offset="100%" stopColor={COLOR_B} stopOpacity="0.03" />
          </radialGradient>
          <filter id="compareGlowA">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="compareGlowB">
            <feGaussianBlur stdDeviation="2" result="blur" />
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

        {/* Polygon A */}
        <polygon
          points={polyStr(pointsA)}
          fill="url(#compareRadarFillA)"
          stroke={COLOR_A}
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#compareGlowA)"
          opacity={animProgress > 0 ? 1 : 0}
        />

        {/* Polygon B */}
        <polygon
          points={polyStr(pointsB)}
          fill="url(#compareRadarFillB)"
          stroke={COLOR_B}
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#compareGlowB)"
          opacity={animProgress > 0 ? 1 : 0}
        />

        {/* Data points A */}
        {pointsA.map((p, i) => (
          <circle
            key={`a-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={COLOR_A}
            stroke="#0a0a0f"
            strokeWidth="2"
            opacity={animProgress > 0.3 ? 1 : 0}
          />
        ))}

        {/* Data points B */}
        {pointsB.map((p, i) => (
          <circle
            key={`b-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={COLOR_B}
            stroke="#0a0a0f"
            strokeWidth="2"
            opacity={animProgress > 0.3 ? 1 : 0}
          />
        ))}

        {/* Axis labels */}
        {dims.map((d, i) => {
          const labelR = maxR + 22;
          const p = polarToCart(cx, cy, labelR, i * angleStep);
          const anchor = p.x < cx - 5 ? 'end' : p.x > cx + 5 ? 'start' : 'middle';
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              fill="rgba(255,255,255,0.5)"
              fontSize="11"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_A }} />
          <span className="text-xs text-gray-400 font-mono truncate max-w-[140px]">{labelA}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_B }} />
          <span className="text-xs text-gray-400 font-mono truncate max-w-[140px]">{labelB}</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   CROWN ICON
   ========================================================================== */

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
    </svg>
  );
}

/* ==========================================================================
   CHECK BADGE (green checkmark for row winner)
   ========================================================================== */

function CheckBadge() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40">
      <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20,6 9,17 4,12" />
      </svg>
    </span>
  );
}

/* ==========================================================================
   DIFF TABLE
   ========================================================================== */

interface DiffRow {
  label: string;
  valueA: number;
  valueB: number;
  format?: (v: number) => string;
}

function DiffTable({ rows }: { rows: DiffRow[] }) {
  return (
    <div className="bg-gray-900/40 rounded-2xl border border-base-blue/20 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Head-to-Head</h3>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map((row) => {
          const fmt = row.format || ((v: number) => v.toLocaleString());
          const diff = row.valueA - row.valueB;
          const aWins = row.valueA > row.valueB;
          const bWins = row.valueB > row.valueA;
          const tied = row.valueA === row.valueB;

          return (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3 gap-4"
            >
              {/* Wallet A value */}
              <div className="flex items-center gap-2 justify-start">
                {aWins && <CheckBadge />}
                <span className={`text-sm font-mono ${aWins ? 'text-white' : 'text-gray-500'}`}>
                  {fmt(row.valueA)}
                </span>
              </div>

              {/* Label + diff */}
              <div className="text-center min-w-[120px]">
                <span className="text-xs text-gray-500 block">{row.label}</span>
                {!tied && (
                  <span
                    className={`text-[10px] font-mono ${
                      diff > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {diff > 0 ? '+' : ''}
                    {fmt(diff)}
                  </span>
                )}
                {tied && (
                  <span className="text-[10px] font-mono text-gray-600">TIE</span>
                )}
              </div>

              {/* Wallet B value */}
              <div className="flex items-center gap-2 justify-end">
                <span className={`text-sm font-mono ${bWins ? 'text-white' : 'text-gray-500'}`}>
                  {fmt(row.valueB)}
                </span>
                {bWins && <CheckBadge />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   TRUNCATE HELPER
   ========================================================================== */

function truncate(addr: string): string {
  if (addr.includes('.')) return addr;
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/* ==========================================================================
   COMPARE VIEW — main client component
   ========================================================================== */

export function CompareView() {
  const searchParams = useSearchParams();
  const [inputA, setInputA] = useState(searchParams.get('a') || '');
  const [inputB, setInputB] = useState(searchParams.get('b') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultA, setResultA] = useState<ReputationResult | null>(null);
  const [resultB, setResultB] = useState<ReputationResult | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const fetchReputation = async (address: string): Promise<ReputationResult> => {
    const res = await fetch(`/api/v1/reputation/${encodeURIComponent(address.trim())}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Failed to fetch reputation for ${address}`);
    }
    return res.json();
  };

  const runComparison = async (addrA?: string, addrB?: string) => {
    const a = (addrA || inputA).trim();
    const b = (addrB || inputB).trim();

    if (!a || !b) {
      setError('Please enter two addresses to compare.');
      return;
    }

    setError('');
    setLoading(true);
    setResultA(null);
    setResultB(null);

    try {
      const [dataA, dataB] = await Promise.all([
        fetchReputation(a),
        fetchReputation(b),
      ]);
      setResultA(dataA);
      setResultB(dataB);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Auto-compare if both params are in the URL
  useEffect(() => {
    const a = searchParams.get('a');
    const b = searchParams.get('b');
    if (a && b && !initialCheckDone) {
      setInputA(a);
      setInputB(b);
      setInitialCheckDone(true);
      setTimeout(() => runComparison(a, b), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initialCheckDone]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') runComparison();
  };

  const scoreA = resultA?.ethosData.score ?? 0;
  const scoreB = resultB?.ethosData.score ?? 0;
  const aWinsOverall = scoreA > scoreB;
  const bWinsOverall = scoreB > scoreA;

  return (
    <div className="min-h-screen bg-base-dark text-white overflow-hidden flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Vibe Check
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              How It Works
            </Link>
            <Link href="/compare" className="text-white font-medium hidden sm:block">
              Compare
            </Link>
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              Blog
            </Link>
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none' as const,
                        userSelect: 'none' as const,
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="px-4 py-2 bg-gradient-to-r from-base-blue to-blue-600 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-800/60 rounded-xl text-sm hover:bg-gray-700/60 transition-colors"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <div className="w-4 h-4">
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-4 h-4 rounded-full"
                                />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={openAccountModal}
                            className="px-3 py-2 bg-gray-800/60 rounded-xl text-sm font-mono hover:bg-gray-700/60 transition-colors"
                          >
                            {account.displayName}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-base-blue/10 border border-base-blue/20 mb-6">
              <BaseLogo size={20} />
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                Wallet Comparison
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-3 gradient-text">Compare Wallets</h1>
            <p className="text-gray-400 text-sm">
              Head-to-head reputation battle. Enter two addresses and see who vibes harder.
            </p>
          </header>

          {/* Inputs */}
          <div className="bg-gray-900/60 rounded-2xl border border-base-blue/20 p-5 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-mono">Wallet A</label>
                <input
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0x... or ENS name"
                  className="w-full bg-gray-800/50 rounded-xl px-4 py-3 font-mono text-sm outline-none border border-white/5 focus:border-base-blue/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-mono">Wallet B</label>
                <input
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0x... or ENS name"
                  className="w-full bg-gray-800/50 rounded-xl px-4 py-3 font-mono text-sm outline-none border border-white/5 focus:border-base-blue/40 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => runComparison()}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-base-blue to-blue-600 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon size={18} />
                  Comparing...
                </span>
              ) : (
                'Compare'
              )}
            </button>
            {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin w-10 h-10 border-2 border-base-blue border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Fetching reputation data...</p>
              </div>
            </div>
          )}

          {/* Results */}
          {resultA && resultB && (
            <div className="space-y-8 animate-fade-in">
              {/* Side-by-side Score Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Wallet A */}
                <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20 relative">
                  {aWinsOverall && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                        <CrownIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider">Winner</span>
                      </div>
                    </div>
                  )}
                  <p className="text-center text-xs text-gray-500 font-mono mb-2 truncate">
                    {truncate(resultA.inputAddress || resultA.address)}
                  </p>
                  <div className="scale-[0.85] origin-center">
                    <ScoreGauge score={scoreA} />
                  </div>
                </div>

                {/* Wallet B */}
                <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20 relative">
                  {bWinsOverall && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                        <CrownIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider">Winner</span>
                      </div>
                    </div>
                  )}
                  <p className="text-center text-xs text-gray-500 font-mono mb-2 truncate">
                    {truncate(resultB.inputAddress || resultB.address)}
                  </p>
                  <div className="scale-[0.85] origin-center">
                    <ScoreGauge score={scoreB} />
                  </div>
                </div>
              </div>

              {/* VS divider */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-base-blue/30 to-transparent" />
                <span className="text-lg font-bold text-gray-600">VS</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-base-blue/30 to-transparent" />
              </div>

              {/* Diff Table */}
              <DiffTable
                rows={[
                  {
                    label: 'Score',
                    valueA: scoreA,
                    valueB: scoreB,
                  },
                  {
                    label: 'Transaction Count',
                    valueA: resultA.onChainData.transactionCount,
                    valueB: resultB.onChainData.transactionCount,
                  },
                  {
                    label: 'Wallet Age (days)',
                    valueA: resultA.onChainData.walletAgeDays,
                    valueB: resultB.onChainData.walletAgeDays,
                  },
                  {
                    label: 'Protocols Used',
                    valueA: resultA.onChainData.protocols?.length ?? 0,
                    valueB: resultB.onChainData.protocols?.length ?? 0,
                  },
                  {
                    label: 'Reviews (positive)',
                    valueA: resultA.ethosData.stats.review.received.positive,
                    valueB: resultB.ethosData.stats.review.received.positive,
                  },
                  {
                    label: 'Vouches Received',
                    valueA: resultA.ethosData.stats.vouch.received.count,
                    valueB: resultB.ethosData.stats.vouch.received.count,
                  },
                  {
                    label: 'XP',
                    valueA: resultA.ethosData.xpTotal,
                    valueB: resultB.ethosData.xpTotal,
                  },
                ]}
              />

              {/* Overlaid Radar */}
              <CompareRadar
                a={{ ethosData: resultA.ethosData, onChainData: resultA.onChainData }}
                b={{ ethosData: resultB.ethosData, onChainData: resultB.onChainData }}
                labelA={truncate(resultA.inputAddress || resultA.address)}
                labelB={truncate(resultB.inputAddress || resultB.address)}
              />
            </div>
          )}

          {/* Empty state */}
          {!loading && !resultA && !resultB && (
            <div className="py-12 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900/60 border border-white/5 mb-4">
                <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                Enter two wallet addresses above to compare their reputations side by side.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
