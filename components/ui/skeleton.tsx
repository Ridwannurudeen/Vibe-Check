'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-800/50',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
    />
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Score Gauge Skeleton */}
      <div className="relative bg-gradient-to-br from-gray-800/30 via-gray-900/40 to-gray-800/30 rounded-3xl p-8 border border-gray-700/30 overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
        
        <div className="flex flex-col items-center">
          {/* Gauge circle */}
          <div className="relative w-72 h-72">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/30" />
            {/* Animated ring */}
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#skeletonGradient)"
                strokeWidth="2"
                strokeDasharray="20 30"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0052FF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#0052FF" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-12 w-24 rounded-lg bg-gray-700/50 mb-2 animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-700/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Score Level Indicators Skeleton */}
      <div className="flex justify-center gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="relative h-16 w-20 rounded-xl bg-gray-800/40 border border-gray-700/30 overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          </div>
        ))}
      </div>

      {/* Why This Score Skeleton */}
      <div className="relative bg-gradient-to-br from-gray-800/30 to-gray-900/40 rounded-2xl p-6 border border-gray-700/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-gray-700/50 animate-pulse" />
          <div className="h-5 w-32 rounded bg-gray-700/50 animate-pulse" />
        </div>
        <div className="h-3 w-3/4 rounded bg-gray-700/40 mb-4 animate-pulse" />
        
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="relative h-24 rounded-xl bg-gray-800/50 border border-gray-700/30 overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="relative h-24 rounded-2xl overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/60 to-gray-800/60 backdrop-blur-xl" />
            <div className="absolute inset-0 rounded-2xl border border-gray-700/30" />
            
            {/* Shimmer */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer"
              style={{ animationDelay: `${i * 150}ms` }}
            />
            
            {/* Content placeholder */}
            <div className="relative p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-700/50 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-gray-700/40 animate-pulse" />
                <div className="h-5 w-20 rounded bg-gray-700/50 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Analysis Skeleton */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 via-gray-900/50 to-gray-800/40 backdrop-blur-xl" />
        <div className="absolute inset-0 rounded-2xl border border-gray-700/30" />
        
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700/60 to-gray-700/40 animate-pulse" />
            <div className="h-5 w-40 rounded bg-gray-700/50 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-gray-700/40 rounded-full w-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="h-4 bg-gray-700/40 rounded-full w-11/12 animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="h-4 bg-gray-700/40 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="h-4 bg-gray-700/40 rounded-full w-3/4 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          
          {/* Typing indicator */}
          <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-700/30">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-base-blue/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-base-blue/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-base-blue/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-500 ml-2">Analyzing wallet...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
