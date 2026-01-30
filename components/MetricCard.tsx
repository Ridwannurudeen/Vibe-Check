'use client';

import { useState, useEffect } from 'react';
import type { MetricCardProps } from '@/types';

export function MetricCard({ icon, label, value, subtext, delay = 0 }: MetricCardProps) {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/60 to-gray-800/60 backdrop-blur-xl" />
      
      {/* Animated border gradient */}
      <div 
        className="absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(0,82,255,0.3) 0%, transparent 50%, rgba(0,82,255,0.1) 100%)',
          opacity: isHovered ? 1 : 0,
        }}
      />
      
      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-gray-700/50 group-hover:border-base-blue/30 transition-colors duration-300" />
      
      {/* Shine effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.6s ease-out',
        }}
      />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Icon container with glow */}
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-xl blur-lg transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, #0052FF 0%, #0066FF 100%)',
                opacity: isHovered ? 0.4 : 0,
              }}
            />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-base-blue/20 via-blue-500/15 to-base-blue/10 flex items-center justify-center text-base-blue border border-base-blue/20 group-hover:border-base-blue/40 group-hover:from-base-blue/30 group-hover:to-blue-500/20 transition-all duration-300">
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 group-hover:text-gray-300 transition-colors duration-300">
              {label}
            </p>
            <p className="text-xl font-bold text-white truncate group-hover:text-base-blue-light transition-colors duration-300">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-gray-500 mt-1 truncate group-hover:text-gray-400 transition-colors duration-300">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-base-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}
