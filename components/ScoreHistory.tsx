'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ScoreSnapshot } from '@/types';

interface ScoreHistoryProps {
  snapshots: ScoreSnapshot[];
}

// Score tier color mapping
function getTierColor(score: number): string {
  if (score >= 2100) return '#22c55e'; // green - Excellent
  if (score >= 1500) return '#3b82f6'; // blue - Good
  if (score >= 900) return '#f59e0b';  // amber - Neutral
  if (score >= 400) return '#f97316';  // orange - Questionable
  return '#ef4444';                     // red - Risky
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// SVG chart dimensions
const SVG_WIDTH = 600;
const SVG_HEIGHT = 200;
const PADDING = { top: 20, right: 20, bottom: 30, left: 50 };
const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;
const Y_MAX = 2800;
const Y_MIN = 0;

export function ScoreHistory({ snapshots }: ScoreHistoryProps) {
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (snapshots.length === 0) return;

    const start = performance.now();
    const duration = 1500;
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
  }, [snapshots]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (snapshots.length < 2 || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const chartX = mouseX - PADDING.left;

    if (chartX < 0 || chartX > CHART_WIDTH) {
      setHoveredIndex(null);
      return;
    }

    // Find closest data point
    const timeMin = snapshots[0].timestamp;
    const timeMax = snapshots[snapshots.length - 1].timestamp;
    const timeRange = timeMax - timeMin || 1;

    let closest = 0;
    let closestDist = Infinity;

    for (let i = 0; i < snapshots.length; i++) {
      const px = ((snapshots[i].timestamp - timeMin) / timeRange) * CHART_WIDTH;
      const dist = Math.abs(px - chartX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }

    setHoveredIndex(closest);
  }, [snapshots]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  if (snapshots.length === 0) {
    return (
      <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-base-blue/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-base-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white">Score History</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          No history yet. Check back after more lookups.
        </div>
      </div>
    );
  }

  // Compute data points
  const timeMin = snapshots[0].timestamp;
  const timeMax = snapshots[snapshots.length - 1].timestamp;
  const timeRange = timeMax - timeMin || 1;

  const points = snapshots.map((s, i) => {
    const x = PADDING.left + (snapshots.length === 1
      ? CHART_WIDTH / 2
      : ((s.timestamp - timeMin) / timeRange) * CHART_WIDTH);
    const y = PADDING.top + CHART_HEIGHT - ((s.score - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_HEIGHT;
    return { x, y, score: s.score, timestamp: s.timestamp, tier: s.tier, txCount: s.transactionCount };
  });

  // Build line path (animated)
  const visibleCount = Math.max(1, Math.ceil(points.length * animProgress));
  const visiblePoints = points.slice(0, visibleCount);

  const linePath = visiblePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Build gradient fill path (area under line)
  const fillPath = visiblePoints.length > 1
    ? `${linePath} L ${visiblePoints[visiblePoints.length - 1].x.toFixed(1)} ${PADDING.top + CHART_HEIGHT} L ${visiblePoints[0].x.toFixed(1)} ${PADDING.top + CHART_HEIGHT} Z`
    : '';

  // Y-axis labels
  const yTicks = [0, 700, 1400, 2100, 2800];

  // X-axis labels (up to 5)
  const xLabelCount = Math.min(5, snapshots.length);
  const xLabels: { x: number; label: string }[] = [];
  for (let i = 0; i < xLabelCount; i++) {
    const idx = snapshots.length <= 5
      ? i
      : Math.round((i / (xLabelCount - 1)) * (snapshots.length - 1));
    xLabels.push({
      x: points[idx].x,
      label: formatDate(snapshots[idx].timestamp),
    });
  }

  // Line gradient color (first to last score)
  const firstColor = getTierColor(snapshots[0].score);
  const lastColor = getTierColor(snapshots[snapshots.length - 1].score);

  return (
    <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-lg bg-base-blue/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-base-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Score History</h3>
        <span className="text-xs text-gray-500 ml-auto">{snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={firstColor} />
            <stop offset="100%" stopColor={lastColor} />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lastColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lastColor} stopOpacity="0.02" />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Y-axis grid lines and labels */}
        {yTicks.map((tick) => {
          const y = PADDING.top + CHART_HEIGHT - ((tick - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_HEIGHT;
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + CHART_WIDTH}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text
                x={PADDING.left - 8}
                y={y + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                fontFamily="monospace"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={PADDING.top + CHART_HEIGHT + 18}
            textAnchor="middle"
            fill="rgba(255,255,255,0.3)"
            fontSize="10"
            fontFamily="monospace"
          >
            {label.label}
          </text>
        ))}

        {/* Gradient fill under line */}
        {fillPath && (
          <path
            d={fillPath}
            fill="url(#fillGrad)"
            opacity={animProgress > 0 ? 1 : 0}
          />
        )}

        {/* Main line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlow)"
          opacity={animProgress > 0 ? 1 : 0}
        />

        {/* Data points */}
        {visiblePoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex === i ? 5 : 3}
            fill={getTierColor(p.score)}
            stroke="#0a0a0f"
            strokeWidth="2"
            opacity={animProgress > 0.2 ? 1 : 0}
            style={{ transition: 'r 0.15s ease' }}
          />
        ))}

        {/* Hover tooltip */}
        {hoveredIndex !== null && hoveredIndex < visiblePoints.length && (() => {
          const p = visiblePoints[hoveredIndex];
          const tooltipWidth = 130;
          const tooltipHeight = 52;
          let tx = p.x - tooltipWidth / 2;
          if (tx < PADDING.left) tx = PADDING.left;
          if (tx + tooltipWidth > SVG_WIDTH - PADDING.right) tx = SVG_WIDTH - PADDING.right - tooltipWidth;
          const ty = p.y - tooltipHeight - 12;

          return (
            <g>
              {/* Vertical line */}
              <line
                x1={p.x}
                y1={PADDING.top}
                x2={p.x}
                y2={PADDING.top + CHART_HEIGHT}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Tooltip background */}
              <rect
                x={tx}
                y={ty}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="6"
                fill="#1a1a2e"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              {/* Score */}
              <text
                x={tx + 10}
                y={ty + 18}
                fill={getTierColor(p.score)}
                fontSize="13"
                fontWeight="700"
                fontFamily="monospace"
              >
                {p.score}
              </text>
              {/* Tier */}
              <text
                x={tx + tooltipWidth - 10}
                y={ty + 18}
                textAnchor="end"
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
                fontFamily="system-ui, sans-serif"
              >
                {p.tier}
              </text>
              {/* Date */}
              <text
                x={tx + 10}
                y={ty + 36}
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                fontFamily="monospace"
              >
                {formatFullDate(p.timestamp)}
              </text>
              {/* Tx count */}
              <text
                x={tx + tooltipWidth - 10}
                y={ty + 36}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                fontFamily="monospace"
              >
                {p.txCount} txs
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
