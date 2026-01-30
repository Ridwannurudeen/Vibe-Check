'use client';

import { Badge } from '@/components/ui/badge';
import type { VibeAnalysis as VibeAnalysisType } from '@/types';

interface VibeAnalysisProps {
  analysis: VibeAnalysisType;
  loading?: boolean;
}

export function VibeAnalysis({ analysis, loading = false }: VibeAnalysisProps) {
  const getBadgeType = (summary: string) => {
    if (['Excellent', 'Good'].includes(summary)) return 'positive';
    if (summary === 'Neutral') return 'neutral';
    return 'negative';
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-700/50 rounded w-3/4" />
        <div className="h-4 bg-gray-700/50 rounded w-full" />
        <div className="h-4 bg-gray-700/50 rounded w-5/6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Summary */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Overall:</span>
        <Badge label={analysis.oneWordSummary} type={getBadgeType(analysis.oneWordSummary)} />
      </div>

      {/* Analysis */}
      <div>
        <p className="text-sm text-gray-300 leading-relaxed">{analysis.analysis}</p>
      </div>

      {/* Recommendation */}
      <div className="pt-4 border-t border-gray-700/50">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-base-blue flex-shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-sm text-blue-300">{analysis.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
