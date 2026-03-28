'use client';

import { useState } from 'react';
import { BaseLogo } from '@/components/ui/base-logo';
import type { EthosUser } from '@/types';

interface ShareResultsProps {
  address: string;
  score: number;
  summary: string;
  isContract: boolean;
  contractName?: string;
  knownProtocol?: string;
  ethosData: EthosUser;
  basename?: string;
}

// Score emoji based on score range
function getScoreEmoji(score: number): string {
  if (score >= 2000) return '🟢';
  if (score >= 1600) return '🟢';
  if (score >= 1200) return '🟡';
  if (score >= 800) return '🟠';
  return '🔴';
}

// Get vibe text based on score
function getVibeText(score: number): string {
  if (score >= 2000) return 'Excellent';
  if (score >= 1600) return 'Good';
  if (score >= 1200) return 'Neutral';
  if (score >= 800) return 'Questionable';
  return 'Risky';
}

export function ShareResults({
  address,
  score,
  summary,
  isContract,
  contractName,
  knownProtocol,
  ethosData,
  basename,
}: ShareResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Format address for display
  const shortAddress = address.includes('.') 
    ? address 
    : `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Use Ethos identity as source of truth
  const hasEthosProfile = ethosData.profileId !== null;
  const displayName = ethosData.displayName || shortAddress;
  const username = ethosData.username;
  const avatarUrl = ethosData.avatarUrl;
  const ethosProfileUrl = ethosData.links?.profile;

  // Determine what to call this address
  const addressLabel = isContract 
    ? (knownProtocol || contractName || 'Contract')
    : (username || displayName);

  // Build share text
  const emoji = getScoreEmoji(score);
  const vibeText = getVibeText(score);
  
  // Include Ethos attribution in share text
  const identityNote = hasEthosProfile
    ? `\n🔗 Identity linked via @EthosNetwork`
    : '';

  const basenameNote = basename
    ? `\n🔵 Basename: ${basename}`
    : '';

  const shareText = isContract
    ? `${emoji} Vibe Check: ${addressLabel}\n\nScore: ${score}/2800 (${vibeText})\nType: Smart Contract\n\nCheck any wallet or contract on Base 👇`
    : `${emoji} Vibe Check: ${addressLabel}\n\nScore: ${score}/2800 (${vibeText})\nSummary: ${summary}${basenameNote}${identityNote}\n\nCheck your wallet's vibe 👇`;

  // Share URL points to the page (which has generateMetadata that sets OG image)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vibecheck.base.org';
  const shareUrl = `${baseUrl}/?address=${encodeURIComponent(address)}`;

  // Build the full OG image URL for direct use (e.g. embedding in forums)
  const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams({
    address,
    score: String(score),
    tier: vibeText.toLowerCase(),
    ...(isContract ? { contract: 'true' } : {}),
  }).toString()}`;

  // Twitter/X share
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  // Farcaster share (Warpcast)
  const handleFarcasterShare = () => {
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(farcasterUrl, '_blank', 'width=550,height=520');
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy full results as text
  const handleCopyResults = () => {
    const fullText = `${shareText}\n\n${shareUrl}`;
    navigator.clipboard.writeText(fullText);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16,6 12,2 8,6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          Share Results
        </h3>
        <span className="text-xs text-gray-500">Spread the word!</span>
      </div>

      {/* Preview Card with Ethos Identity */}
      <div className="bg-gray-900/60 rounded-xl p-4 mb-4 border border-white/5">
        <div className="flex items-start gap-3">
          {/* Ethos Avatar */}
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-xl border-2 border-purple-500/30">
              {emoji}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {basename && (
              <div className="flex items-center gap-1.5 mb-1">
                <BaseLogo size={14} />
                <span className="text-base-blue font-mono text-sm">{basename}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{addressLabel}</p>
              {hasEthosProfile && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Score: {score}/2800 • {vibeText}
            </p>
            {hasEthosProfile && (
              <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Identity linked via Ethos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Twitter/X */}
        <button
          onClick={handleTwitterShare}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 rounded-xl font-medium transition-all border border-white/10 hover:border-white/20"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>Share on X</span>
        </button>

        {/* Farcaster */}
        <button
          onClick={handleFarcasterShare}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl font-medium transition-all border border-purple-500/30 hover:border-purple-500/50 text-purple-300"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.08 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"/>
          </svg>
          <span>Farcaster</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all border border-white/10 hover:border-white/20"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Ethos Profile Link & Copy Results */}
      <div className="mt-4 flex items-center justify-between">
        {hasEthosProfile && ethosProfileUrl && (
          <a 
            href={ethosProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View full Ethos profile
          </a>
        )}
        
        <div className="relative ml-auto">
          <button
            onClick={handleCopyResults}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            📋 Copy results as text
          </button>
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-1 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30 whitespace-nowrap">
              Copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
