'use client';

import type { ContractInfo } from '@/types';

interface ContractInfoCardProps {
  contractInfo: ContractInfo;
}

export function ContractInfoCard({ contractInfo }: ContractInfoCardProps) {
  if (!contractInfo.isContract) return null;

  const formatSupply = (supply: string, decimals: number): string => {
    const num = parseFloat(supply) / Math.pow(10, decimals);
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getTokenTypeColor = (type: string) => {
    switch (type) {
      case 'ERC20': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'ERC721': return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
      case 'ERC1155': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-indigo-900/30 via-gray-900/50 to-purple-900/30 rounded-2xl p-6 border border-indigo-500/30 backdrop-blur-xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
            <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Smart Contract
              {contractInfo.isProxy && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Proxy
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400">
              {contractInfo.contractName || 'Unnamed Contract'}
            </p>
          </div>
        </div>
        
        {/* Verification Badge */}
        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
          contractInfo.isVerified 
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
            : 'bg-red-500/15 text-red-400 border-red-500/30'
        }`}>
          {contractInfo.isVerified ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
              Verified
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Unverified
            </>
          )}
        </div>
      </div>

      {/* Token Info (if applicable) */}
      {contractInfo.tokenInfo && (
        <div className="relative bg-gray-900/50 rounded-xl p-4 border border-gray-700/40 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div>
                <p className="text-sm font-semibold text-white">{contractInfo.tokenInfo.name}</p>
                <p className="text-xs text-gray-400">${contractInfo.tokenInfo.symbol}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${getTokenTypeColor(contractInfo.tokenInfo.type)}`}>
              {contractInfo.tokenInfo.type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total Supply</p>
              <p className="text-sm font-semibold text-white">
                {formatSupply(contractInfo.tokenInfo.totalSupply, contractInfo.tokenInfo.decimals)}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Decimals</p>
              <p className="text-sm font-semibold text-white">{contractInfo.tokenInfo.decimals}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Stats Grid */}
      <div className="relative grid grid-cols-2 gap-3 mb-4">
        {/* Contract Age */}
        <div className="group bg-gray-900/50 rounded-xl p-4 border border-gray-700/40 hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Contract Age</p>
              <p className="text-sm font-semibold text-white">
                {contractInfo.contractAgeDays !== undefined 
                  ? contractInfo.contractAgeDays > 365 
                    ? `${(contractInfo.contractAgeDays / 365).toFixed(1)} years`
                    : `${contractInfo.contractAgeDays} days`
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div className="group bg-gray-900/50 rounded-xl p-4 border border-gray-700/40 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Interactions</p>
              <p className="text-sm font-semibold text-white">
                {contractInfo.interactionCount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Unique Users */}
        <div className="group bg-gray-900/50 rounded-xl p-4 border border-gray-700/40 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Unique Users</p>
              <p className="text-sm font-semibold text-white">
                {contractInfo.uniqueUsers?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Compiler */}
        {contractInfo.compilerVersion && (
          <div className="group bg-gray-900/50 rounded-xl p-4 border border-gray-700/40 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16,18 22,12 16,6"/>
                  <polyline points="8,6 2,12 8,18"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">Compiler</p>
                <p className="text-xs font-semibold text-white truncate">
                  {contractInfo.compilerVersion.split('+')[0]}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Creator Info */}
      {contractInfo.creator && (
        <div className="relative bg-gray-900/40 rounded-xl p-4 border border-gray-700/30">
          <p className="text-xs text-gray-400 mb-2">Created By</p>
          <div className="flex items-center justify-between">
            <code className="text-sm text-indigo-400 font-mono bg-indigo-500/10 px-2 py-1 rounded">
              {formatAddress(contractInfo.creator)}
            </code>
            {contractInfo.creationDate && (
              <span className="text-xs text-gray-500">
                {new Date(contractInfo.creationDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Proxy Implementation */}
      {contractInfo.isProxy && contractInfo.implementation && (
        <div className="relative bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-xs text-amber-400 font-medium">Proxy Contract</p>
          </div>
          <p className="text-xs text-gray-400">
            Implementation: <code className="text-amber-300 font-mono">{formatAddress(contractInfo.implementation)}</code>
          </p>
        </div>
      )}
    </div>
  );
}
