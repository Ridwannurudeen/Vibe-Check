'use client';

import { useState, useEffect } from 'react';
import { getScoreLevel } from '@/lib/utils';
import type { ScoreGaugeProps } from '@/types';

export function ScoreGauge({ score, maxScore = 2800, animate = true }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [rotation, setRotation] = useState(-135);
  const [isLoaded, setIsLoaded] = useState(false);
  const scoreInfo = getScoreLevel(score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      setRotation(-135 + (score / maxScore) * 270);
      setIsLoaded(true);
      return;
    }

    // Small delay before starting animation
    const startDelay = setTimeout(() => {
      const duration = 2000;
      const startTime = Date.now();
      const startScore = 0;
      const startRotation = -135;
      const targetRotation = -135 + (score / maxScore) * 270;

      const animateScore = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo for smoother feel
        const eased = 1 - Math.pow(2, -10 * progress);

        setDisplayScore(Math.round(startScore + (score - startScore) * eased));
        setRotation(startRotation + (targetRotation - startRotation) * eased);

        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          setIsLoaded(true);
        }
      };

      requestAnimationFrame(animateScore);
    }, 300);

    return () => clearTimeout(startDelay);
  }, [score, maxScore, animate]);

  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Ambient glow behind gauge */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-opacity duration-1000"
        style={{ 
          background: `radial-gradient(circle, ${scoreInfo.color} 0%, transparent 70%)`,
          opacity: isLoaded ? 0.4 : 0,
        }}
      />
      
      {/* SVG Gauge */}
      <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 200 200">
        <defs>
          {/* Enhanced gradient for the gauge arc */}
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444">
              <animate attributeName="stop-color" values="#ef4444;#f87171;#ef4444" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="75%" stopColor="#0052FF" />
            <stop offset="100%" stopColor="#10b981">
              <animate attributeName="stop-color" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          {/* Stronger glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Needle glow */}
          <filter id="needleGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Track gradient */}
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>

        {/* Outer decorative ring */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />

        {/* Background track with subtle gradient */}
        <path
          d="M 25 145 A 75 75 0 1 1 175 145"
          fill="none"
          stroke="url(#trackGradient)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = -135 + i * 67.5;
          const rad = (angle * Math.PI) / 180;
          const innerR = 62;
          const outerR = 68;
          const x1 = 100 + innerR * Math.cos(rad);
          const y1 = 100 + innerR * Math.sin(rad);
          const x2 = 100 + outerR * Math.cos(rad);
          const y2 = 100 + outerR * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Gradient arc (progress) */}
        <path
          d="M 25 145 A 75 75 0 1 1 175 145"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="353"
          strokeDashoffset={353 - (displayScore / maxScore) * 353}
          filter="url(#glow)"
          className="transition-all duration-100"
        />

        {/* Animated pulse ring on load complete */}
        {isLoaded && (
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="none"
            stroke={scoreInfo.color}
            strokeWidth="2"
            opacity="0"
            className="animate-ping"
            style={{ transformOrigin: 'center', animationDuration: '2s', animationIterationCount: '1' }}
          />
        )}

        {/* Needle shadow */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '100px 100px',
          }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="40"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="4"
            strokeLinecap="round"
            transform="translate(2, 2)"
          />
        </g>

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '100px 100px',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="40"
            stroke={scoreInfo.color}
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#needleGlow)"
          />
          {/* Needle base outer */}
          <circle
            cx="100"
            cy="100"
            r="12"
            fill={`${scoreInfo.color}33`}
            className={isLoaded ? 'animate-pulse' : ''}
          />
          {/* Needle base */}
          <circle
            cx="100"
            cy="100"
            r="8"
            fill={scoreInfo.color}
            filter="url(#needleGlow)"
          />
          <circle cx="100" cy="100" r="4" fill="#0a0a0f" />
        </g>

        {/* Score labels */}
        <text x="30" y="165" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">0</text>
        <text x="160" y="165" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">{maxScore}</text>
      </svg>

      {/* Score display overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <div className="relative">
          {/* Score glow */}
          <span
            className="absolute inset-0 blur-lg opacity-50"
            style={{ color: scoreInfo.color }}
          >
            {displayScore}
          </span>
          <span
            className="relative text-6xl font-bold tabular-nums font-mono tracking-tight"
            style={{ color: scoreInfo.color }}
          >
            {displayScore}
          </span>
        </div>
        <span className="text-sm text-gray-500 mt-1 font-mono">Your Score: <span className="text-gray-400">{displayScore}</span></span>
        <div
          className={`mt-3 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-500 ${isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
          style={{ 
            backgroundColor: `${scoreInfo.color}15`, 
            color: scoreInfo.color,
            borderColor: `${scoreInfo.color}40`,
            boxShadow: isLoaded ? `0 0 20px ${scoreInfo.color}30` : 'none',
          }}
        >
          {scoreInfo.level}
        </div>
      </div>
    </div>
  );
}
