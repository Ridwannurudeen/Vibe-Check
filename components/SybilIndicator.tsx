'use client';

import { useState, useEffect } from 'react';
import type { SybilRisk } from '@/types';

interface SybilIndicatorProps {
  sybilRisk: SybilRisk;
}

const levelConfig = {
  low: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    barColor: 'from-emerald-500 to-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  medium: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    barColor: 'from-amber-500 to-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  high: {
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    barColor: 'from-red-500 to-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
};

export function SybilIndicator({ sybilRisk }: SybilIndicatorProps) {
  const [animProgress, setAnimProgress] = useState(0);
  const config = levelConfig[sybilRisk.level];
  const isClean = sybilRisk.score === 0;

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
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

  const animatedScore = Math.round(sybilRisk.score * animProgress);
  const triggeredIndicators = sybilRisk.indicators.filter(i => i.triggered);
  const passedIndicators = sybilRisk.indicators.filter(i => !i.triggered);

  return (
    <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-base-blue/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-base-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white">Sybil Risk Analysis</h3>
        </div>

        {/* Risk level badge */}
        {isClean ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Clean
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${config.bg} ${config.color} ${config.border} border`}>
            {sybilRisk.level === 'high' && (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            {sybilRisk.level.charAt(0).toUpperCase() + sybilRisk.level.slice(1)} Risk
          </span>
        )}
      </div>

      {/* Score bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Risk Score</span>
          <span className={`text-sm font-mono font-semibold ${config.color}`}>{animatedScore}/100</span>
        </div>

        {/* Background bar with gradient track */}
        <div className="relative h-2.5 bg-gray-800/60 rounded-full overflow-hidden border border-gray-700/40">
          {/* Gradient background showing the full spectrum */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />

          {/* Filled portion */}
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.barColor} rounded-full transition-all duration-100`}
            style={{ width: `${animatedScore}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-gray-600">0 - Safe</span>
          <span className="text-[10px] text-gray-600">100 - Sybil</span>
        </div>
      </div>

      {/* Triggered indicators */}
      {triggeredIndicators.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs text-gray-400 font-medium">Flagged Indicators</p>
          {triggeredIndicators.map((indicator) => (
            <div
              key={indicator.name}
              className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} ${config.border} transition-all duration-300`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${config.bg} border ${config.border}`}>
                <svg className={`w-3 h-3 ${config.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-semibold ${config.color}`}>{indicator.name}</p>
                  <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">w:{indicator.weight}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{indicator.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Passed indicators */}
      {passedIndicators.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium">Passed Checks</p>
          {passedIndicators.map((indicator) => (
            <div
              key={indicator.name}
              className="flex items-start gap-3 p-3 rounded-xl border bg-gray-800/20 border-gray-700/30 opacity-50 transition-all duration-300 hover:opacity-70"
            >
              <div className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-gray-300">{indicator.name}</p>
                  <span className="text-[10px] text-gray-600 font-mono flex-shrink-0">w:{indicator.weight}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{indicator.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
