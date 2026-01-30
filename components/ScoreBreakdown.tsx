'use client';

import type { EthosUser, OnChainData } from '@/types';

interface ScoreBreakdownProps {
  data: EthosUser;
  onChainData?: OnChainData | null;
}

// Protocol category colors and icons
const categoryStyles = {
  defi: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    icon: '💰',
    activeIcon: '💰',
  },
  nft: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    glow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    icon: '🖼️',
    activeIcon: '🖼️',
  },
  governance: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    icon: '🗳️',
    activeIcon: '🗳️',
  },
  bridging: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    icon: '🌉',
    activeIcon: '🌉',
  },
};

// Known protocol categories for badge coloring
const protocolCategories: Record<string, keyof typeof categoryStyles> = {
  'Uniswap V2': 'defi',
  'Uniswap V3': 'defi',
  'Uniswap Universal Router': 'defi',
  'Uniswap V3 Positions': 'defi',
  'Aerodrome': 'defi',
  'BaseSwap': 'defi',
  'SushiSwap': 'defi',
  '1inch': 'defi',
  '0x Protocol': 'defi',
  'Compound': 'defi',
  'Aave': 'defi',
  'Metamask Swap': 'defi',
  'OpenSea Seaport': 'nft',
  'OpenSea': 'nft',
  'LooksRare': 'nft',
  'X2Y2': 'nft',
  'Blur': 'nft',
  'MintFun': 'nft',
  'mint.fun': 'nft',
  'Base Bridge': 'bridging',
  'Optimism Bridge': 'bridging',
  'Wormhole': 'bridging',
  'zkSync Bridge': 'bridging',
  'Across Bridge': 'bridging',
  'Synapse Bridge': 'bridging',
  'Hop Protocol': 'bridging',
  'Orbiter Finance': 'bridging',
  'LayerZero': 'bridging',
  'LayerZero V2': 'bridging',
  'Circle CCTP': 'bridging',
  'Stargate': 'bridging',
  'StarkGate': 'bridging',
  'ENS': 'governance',
  'Nouns DAO': 'governance',
  'Arbitrum DAO': 'governance',
  'Compound Governor': 'governance',
  'Snapshot': 'governance',
};

export function ScoreBreakdown({ data, onChainData }: ScoreBreakdownProps) {
  // On-chain data - now from the separate prop
  const walletAge = onChainData?.walletAgeDays || 0;
  const txCount = onChainData?.transactionCount || 0;
  const protocols = onChainData?.protocols || [];
  const diversity = onChainData?.activityDiversity || {
    defi: false,
    nft: false,
    governance: false,
    bridging: false
  };

  // Calculate percentages
  const walletAgePercent = Math.min((walletAge / 365) * 100, 100);
  const txPercent = Math.min((txCount / 500) * 100, 100);
  const protocolPercent = Math.min((protocols.length / 10) * 100, 100);
  
  // Count diversity score
  const diversityCount = Object.values(diversity).filter(Boolean).length;
  const diversityPercent = (diversityCount / 4) * 100;

  // Ethos data
  const vouchCount = data.stats.vouch.received.count;

  // Format wallet age
  const formatWalletAge = (days: number): string => {
    if (days === 0) return 'New Wallet';
    if (days < 30) return `${days} days old`;
    if (days < 365) return `${Math.floor(days / 30)} months old`;
    return `${(days / 365).toFixed(1)} years old`;
  };

  // Status checks
  const isActive = data.status === 'ACTIVE';
  const hasProfile = data.profileId !== null;

  // Get category for a protocol
  const getProtocolCategory = (protocol: string): keyof typeof categoryStyles => {
    return protocolCategories[protocol] || 'defi';
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800/40 via-gray-900/50 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl space-y-6 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-base-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="relative">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-base-blue/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-base-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20V10M18 20V4M6 20v-4"/>
            </svg>
          </div>
          Why This Score?
        </h4>
        <p className="text-xs text-gray-400">
          The reputation score is calculated based on on-chain activity and community feedback.
        </p>
      </div>

      {/* Main Factors Grid */}
      <div className="relative grid grid-cols-2 gap-3">
        {/* Wallet Age */}
        <div className="group relative bg-gray-900/60 rounded-xl p-4 border border-gray-700/40 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Wallet Age</p>
              <p className="text-base font-semibold text-white">{formatWalletAge(walletAge)}</p>
            </div>
          </div>
          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${walletAgePercent}%` }}
            />
          </div>
        </div>

        {/* Transaction Count */}
        <div className="group relative bg-gray-900/60 rounded-xl p-4 border border-gray-700/40 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Transactions</p>
              <p className="text-base font-semibold text-white">{txCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${txPercent}%` }}
            />
          </div>
        </div>

        {/* Protocols Used */}
        <div className="group relative bg-gray-900/60 rounded-xl p-4 border border-gray-700/40 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Protocols Used</p>
              <p className="text-base font-semibold text-white">{protocols.length} protocols</p>
            </div>
          </div>
          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${protocolPercent}%` }}
            />
          </div>
        </div>

        {/* Activity Diversity */}
        <div className="group relative bg-gray-900/60 rounded-xl p-4 border border-gray-700/40 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Diversity Score</p>
              <p className="text-base font-semibold text-white">{diversityCount}/4 categories</p>
            </div>
          </div>
          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${diversityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Activity Diversity Breakdown */}
      <div className="relative bg-gray-900/40 rounded-xl p-4 border border-gray-700/30">
        <p className="text-xs text-gray-400 mb-3 font-medium">On-Chain Activity Types</p>
        <div className="grid grid-cols-4 gap-2">
          {(['defi', 'nft', 'governance', 'bridging'] as const).map((type) => {
            const isActive = diversity[type];
            const style = categoryStyles[type];
            const labels = { defi: 'DeFi', nft: 'NFTs', governance: 'Governance', bridging: 'Bridging' };
            
            return (
              <div 
                key={type}
                className={`relative text-center p-3 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? `${style.bg} ${style.border} ${style.glow}` 
                    : 'bg-gray-800/30 border-gray-700/30 opacity-40'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent" />
                )}
                <span className="relative text-2xl block mb-1">{isActive ? style.activeIcon : '○'}</span>
                <p className={`relative text-xs font-medium ${isActive ? style.text : 'text-gray-500'}`}>
                  {labels[type]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trusted Protocols List - Color coded badges */}
      {protocols.length > 0 && (
        <div className="relative bg-gray-900/40 rounded-xl p-4 border border-gray-700/30">
          <p className="text-xs text-gray-400 mb-3 font-medium">Interacted Protocols</p>
          <div className="flex flex-wrap gap-2">
            {protocols.map((protocol, index) => {
              const category = getProtocolCategory(protocol);
              const style = categoryStyles[category];
              
              return (
                <span 
                  key={index}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${style.bg} ${style.text} border ${style.border} ${style.glow} transition-all duration-300 cursor-default`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="text-sm">{style.icon}</span>
                  {protocol}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Ethos Community Data */}
      <div className="relative bg-gray-900/40 rounded-xl p-4 border border-gray-700/30">
        <p className="text-xs text-gray-400 mb-3 font-medium">Ethos Community Feedback</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <p className="text-xs text-gray-500 mb-1">Reviews Received</p>
            <p className="text-xl font-bold text-white">
              <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">+{data.stats.review.received.positive}</span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-red-400 group-hover:text-red-300 transition-colors">-{data.stats.review.received.negative}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Trust Vouches</p>
            <p className="text-xl font-bold text-white">{vouchCount} <span className="text-sm font-normal text-gray-400">vouches</span></p>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="relative flex flex-wrap gap-2">
        <span className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 ${isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></span>
          {isActive ? 'Active on Ethos' : 'Not Active'}
        </span>
        <span className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 ${hasProfile ? 'bg-base-blue/15 text-base-blue border border-base-blue/30 hover:bg-base-blue/20' : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'}`}>
          <span className={`w-2 h-2 rounded-full ${hasProfile ? 'bg-base-blue' : 'bg-gray-400'}`}></span>
          {hasProfile ? 'Verified Profile' : 'No Profile'}
        </span>
        {onChainData?.firstTransaction && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-2 hover:bg-purple-500/20 transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Since {new Date(onChainData.firstTransaction).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
