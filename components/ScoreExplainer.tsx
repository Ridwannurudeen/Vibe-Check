'use client';

interface ScoreExplainerProps {
  score: number;
}

const SCORE_TIERS = [
  { 
    min: 2000, 
    max: 2800, 
    label: 'Excellent', 
    emoji: '🏆',
    description: 'Highly trusted wallet with exceptional reputation. This address has strong community endorsements and a proven track record.',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  { 
    min: 1600, 
    max: 1999, 
    label: 'Good', 
    emoji: '✅',
    description: 'Established wallet with positive history. This address shows consistent, trustworthy on-chain behavior.',
    color: '#0052FF',
    bgColor: 'rgba(0, 82, 255, 0.1)'
  },
  { 
    min: 1200, 
    max: 1599, 
    label: 'Neutral', 
    emoji: '➖',
    description: 'Average activity with no major red flags. This address has limited reputation data but nothing concerning.',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  { 
    min: 800, 
    max: 1199, 
    label: 'Questionable', 
    emoji: '⚠️',
    description: 'Limited history or some concerns flagged. Exercise caution and verify before transacting.',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.1)'
  },
  { 
    min: 0, 
    max: 799, 
    label: 'Risky', 
    emoji: '🚨',
    description: 'New wallet or flagged for suspicious activity. Proceed with extreme caution or avoid interaction.',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  },
];

export function ScoreExplainer({ score }: ScoreExplainerProps) {
  const currentTier = SCORE_TIERS.find(tier => score >= tier.min && score <= tier.max) || SCORE_TIERS[4];
  const scorePercentage = (score / 2800) * 100;
  
  return (
    <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50 space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-base-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          Understanding the Score
        </h4>
        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
          Scale: 0 - 2800
        </span>
      </div>

      {/* What does the score mean */}
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: currentTier.bgColor,
          borderColor: `${currentTier.color}30`
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{currentTier.emoji}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-lg font-bold"
                style={{ color: currentTier.color }}
              >
                {currentTier.label}
              </span>
              <span className="text-xs text-gray-400">
                ({currentTier.min} - {currentTier.max})
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {currentTier.description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Visual Score Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">0</span>
          <span className="text-xs text-gray-400">Your Score: <span className="text-white font-semibold">{score}</span></span>
          <span className="text-xs text-gray-500">2800</span>
        </div>
        <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden">
          {/* Gradient Background */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(to right, #ef4444 0%, #f97316 20%, #f59e0b 40%, #0052FF 70%, #10b981 100%)'
            }}
          />
          {/* Darkened overlay for unfilled portion */}
          <div 
            className="absolute inset-0 bg-gray-900/70 rounded-full transition-all duration-1000"
            style={{ 
              left: `${scorePercentage}%`,
            }}
          />
          {/* Score Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 shadow-lg transition-all duration-1000 flex items-center justify-center"
            style={{ 
              left: `calc(${scorePercentage}% - 10px)`,
              borderColor: currentTier.color
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentTier.color }}
            />
          </div>
        </div>
      </div>

      {/* Tier Legend */}
      <div className="grid grid-cols-5 gap-2">
        {SCORE_TIERS.slice().reverse().map((tier) => (
          <div 
            key={tier.label}
            className={`text-center p-2 rounded-lg transition-all ${
              currentTier.label === tier.label 
                ? 'ring-2 ring-offset-2 ring-offset-gray-900' 
                : 'opacity-40'
            }`}
            style={{
  backgroundColor: tier.bgColor,
  boxShadow:
    currentTier.label === tier.label
      ? `0 0 0 3px ${tier.color}`
      : 'none'
}}

          >
            <span className="text-lg">{tier.emoji}</span>
            <p 
              className="text-xs font-medium mt-1"
              style={{ color: tier.color }}
            >
              {tier.label}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}