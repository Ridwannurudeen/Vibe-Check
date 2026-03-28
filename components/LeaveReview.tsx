'use client';

import { useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { base } from 'viem/chains';
import {
  ETHOS_REVIEW_CONTRACT,
  ETHOS_REVIEW_ABI,
  REVIEW_RATINGS,
  type ReviewRating,
  getEthosProfileUrl,
} from '@/lib/ethos-write';

interface LeaveReviewProps {
  targetAddress: string;
  targetName?: string;
}

const ratingOptions: { key: ReviewRating; label: string; color: string; selectedBg: string; selectedBorder: string; icon: JSX.Element }[] = [
  {
    key: 'positive',
    label: 'Positive',
    color: 'text-green-400',
    selectedBg: 'bg-green-500/20',
    selectedBorder: 'border-green-500/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
    ),
  },
  {
    key: 'neutral',
    label: 'Neutral',
    color: 'text-amber-400',
    selectedBg: 'bg-amber-500/20',
    selectedBorder: 'border-amber-500/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    key: 'negative',
    label: 'Negative',
    color: 'text-red-400',
    selectedBg: 'bg-red-500/20',
    selectedBorder: 'border-red-500/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 14V2" />
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
      </svg>
    ),
  },
];

export function LeaveReview({ targetAddress, targetName }: LeaveReviewProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [rating, setRating] = useState<ReviewRating | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isOnBase = chainId === base.id;

  const handleSubmit = async () => {
    if (!walletClient || !rating) return;
    setState('submitting');
    setError('');

    try {
      const metadata = JSON.stringify({
        source: 'vibe-check',
        version: '1.0.0',
        timestamp: Date.now(),
      });

      const hash = await walletClient.writeContract({
        address: ETHOS_REVIEW_CONTRACT,
        abi: ETHOS_REVIEW_ABI,
        functionName: 'addReview',
        args: [
          targetAddress as `0x${string}`,
          comment || '',
          REVIEW_RATINGS[rating],
          metadata,
        ],
      });

      setTxHash(hash);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      setState('error');
    }
  };

  const handleReset = () => {
    setRating(null);
    setComment('');
    setState('idle');
    setTxHash(null);
    setError('');
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <h3 className="font-semibold text-white">Leave a Review</h3>
          <span className="text-xs text-gray-500 ml-auto">via Ethos Network</span>
        </div>
        <p className="text-sm text-gray-400">
          Connect wallet on Base to leave a review
        </p>
      </div>
    );
  }

  // Wrong chain
  if (!isOnBase) {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <h3 className="font-semibold text-white">Leave a Review</h3>
          <span className="text-xs text-gray-500 ml-auto">via Ethos Network</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Switch to Base to leave a review on-chain.
        </p>
        <button
          onClick={() => switchChain({ chainId: base.id })}
          className="px-5 py-2.5 bg-gradient-to-r from-base-blue to-blue-600 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Switch to Base
        </button>
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/30">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="font-semibold text-white text-lg">Review submitted!</h3>
          <p className="text-sm text-gray-400">
            Your review for{' '}
            <span className="font-mono text-gray-300">
              {targetName || `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`}
            </span>{' '}
            is now on-chain.
          </p>
          <div className="flex items-center gap-3 mt-2">
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-base-blue hover:text-blue-300 transition-colors"
              >
                View transaction
              </a>
            )}
            <span className="text-gray-600">|</span>
            <a
              href={getEthosProfileUrl(targetAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View on Ethos
            </a>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Leave another review
          </button>
        </div>
      </div>
    );
  }

  // Main review form
  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
      <div className="flex items-center gap-3 mb-5">
        <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <h3 className="font-semibold text-white">Leave a Review</h3>
        <span className="text-xs text-gray-500 ml-auto">via Ethos Network</span>
      </div>

      {targetName && (
        <p className="text-sm text-gray-400 mb-4">
          Reviewing{' '}
          <span className="text-white font-medium">{targetName}</span>
        </p>
      )}

      {/* Rating buttons */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {ratingOptions.map((opt) => {
          const isSelected = rating === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setRating(opt.key)}
              className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? `${opt.selectedBg} ${opt.selectedBorder} ${opt.color}`
                  : 'bg-gray-800/40 border-gray-700/50 text-gray-400 hover:border-gray-600/60 hover:text-gray-300'
              }`}
            >
              <span className={isSelected ? opt.color : ''}>{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Comment textarea */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (optional)..."
        rows={3}
        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/40 transition-colors resize-none mb-5"
      />

      {/* Error message */}
      {state === 'error' && error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!rating || state === 'submitting'}
        className="w-full py-3 px-6 bg-gradient-to-r from-base-blue to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {state === 'submitting' ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>

      {state === 'error' && (
        <button
          onClick={handleSubmit}
          className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
