'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Confetti } from '@/components/Confetti';
import {
  Badge,
  BaseLogo,
  ResultsSkeleton,
  ScoreGauge,
  MetricCard,
  VibeAnalysis,
  ThumbsUpIcon,
  ShieldIcon,
  DollarIcon,
  BoltIcon,
  SearchIcon,
  SpinnerIcon,
  AnalyticsIcon,
  ScoreExplainer,
  ScoreBreakdown,
  ActivityRadar,
  ContractInfoCard,
  ShareResults,
  Footer,
  LeaveReview,
  AttestButton,
  SybilIndicator,
  ScoreHistory,
} from '@/components';
import { isValidAddress, formatWei, getAttestationBadges } from '@/lib/utils';
import Link from 'next/link';
import type { CheckVibeResponse, ScoreSnapshot } from '@/types';

export function HomePageContent() {
  const searchParams = useSearchParams();
  const { address: connectedAddress, isConnected } = useAccount();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckVibeResponse | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [historySnapshots, setHistorySnapshots] = useState<ScoreSnapshot[]>([]);

  // Check my own vibe (when wallet connected)
  const checkMyVibe = () => {
    if (connectedAddress) {
      setAddress(connectedAddress);
      checkVibe(connectedAddress);
    }
  };

  const checkVibe = async (addressToCheck?: string) => {
    const input = addressToCheck || address;
    if (!input.trim()) {
      setError('Please enter a Base wallet address, ENS name, or contract address');
      return;
    }

    const trimmedInput = input.trim();
    const looksLikeENS =
      trimmedInput.includes('.') &&
      (trimmedInput.endsWith('.eth') ||
        trimmedInput.endsWith('.xyz') ||
        trimmedInput.endsWith('.base.eth') ||
        trimmedInput.endsWith('.cb.id'));

    if (!looksLikeENS && !isValidAddress(trimmedInput)) {
      setError('Invalid Ethereum address or ENS name');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/check-vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: trimmedInput }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze address');
      }

      const data: CheckVibeResponse = await res.json();
      setResult(data);

      // Fetch history in background (non-blocking)
      const resolvedAddr = (data as any).address || input;
      if (resolvedAddr && /^0x[a-fA-F0-9]{40}$/i.test(resolvedAddr)) {
        fetch(`/api/v1/history/${resolvedAddr}`)
          .then(r => r.ok ? r.json() : null)
          .then(h => { if (h?.snapshots) setHistorySnapshots(h.snapshots); })
          .catch(() => {});
      }

      if (data.ethosData.score >= 2000) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Check for URL parameter on mount
  useEffect(() => {
    const addressParam = searchParams.get('address');
    if (addressParam && !initialCheckDone) {
      setAddress(addressParam);
      setInitialCheckDone(true);
      // Small delay to ensure state is set
      setTimeout(() => checkVibe(addressParam), 100);
    }
  }, [searchParams, initialCheckDone]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') checkVibe();
  };

  const tryExample = () => {
    const addr = 'paradigm.eth';
    setAddress(addr);
    checkVibe(addr);
  };

  const tryContractExample = () => {
    // USDC on Base
    const addr = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    setAddress(addr);
    checkVibe(addr);
  };

  // Check if this is a contract
  const isContract = result?.contractInfo?.isContract ?? false;

  return (
    <div className="min-h-screen bg-base-dark text-white overflow-hidden flex flex-col">
      <Confetti trigger={showConfetti} />

      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Vibe Check
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white font-medium hidden sm:block">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              How It Works
            </Link>
            <Link href="/compare" className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              Compare
            </Link>
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              Blog
            </Link>
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="px-4 py-2 bg-gradient-to-r from-base-blue to-blue-600 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-800/60 rounded-xl text-sm hover:bg-gray-700/60 transition-colors"
                          >
                            {chain.hasIcon && (
                              <div className="w-4 h-4">
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                              </div>
                            )}
                          </button>
                          <button
                            onClick={openAccountModal}
                            className="px-3 py-2 bg-gray-800/60 rounded-xl text-sm font-mono hover:bg-gray-700/60 transition-colors"
                          >
                            {account.displayName}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-base-blue/10 border border-base-blue/20 mb-6">
              <BaseLogo size={20} />
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                Built on Base • Powered by Ethos Network
              </span>
            </div>

            <h1 className="text-5xl font-bold mb-4 gradient-text">Vibe Check</h1>
            <p className="text-gray-400">
              Instant trust & reputation analysis for wallets and contracts on Base
            </p>
          </header>

          {/* Input */}
          <div className="mb-8">
            <div className="bg-gray-900/80 rounded-2xl border border-base-blue/30 p-2">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="0x... wallet, contract, or ENS name"
                  className="flex-1 bg-gray-800/50 rounded-xl px-5 py-4 font-mono text-sm outline-none"
                />
                <button
                  onClick={() => checkVibe()}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-base-blue to-blue-600 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <SpinnerIcon size={18} />
                      Checking...
                    </span>
                  ) : (
                    'Check Vibe'
                  )}
                </button>
              </div>
            </div>
            {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}

            {/* Check My Vibe - shown when wallet connected */}
            {isConnected && connectedAddress && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={checkMyVibe}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Check My Vibe
                  <span className="text-gray-400 font-mono text-xs">
                    ({connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)})
                  </span>
                </button>
              </div>
            )}
          </div>

          {loading && <ResultsSkeleton />}

          {/* RESULTS */}
          {result && result.ethosData && (
            <div className="space-y-6">

              {/* Contract Badge (if applicable) */}
              {isContract && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <span className="text-sm text-indigo-400 font-medium">Smart Contract Detected</span>
                  </div>
                </div>
              )}

              {/* Score */}
              <div className="bg-gray-900/40 rounded-3xl p-8 border border-base-blue/20">
                <ScoreGauge score={result.ethosData.score} />
              </div>

              {/* SAFE EXPLANATION */}
              <ScoreExplainer score={result.ethosData.score} />

              {/* Contract Info Card (if it's a contract) */}
              {isContract && result.contractInfo && (
                <ContractInfoCard contractInfo={result.contractInfo} />
              )}

              {/* Reputation Radar Chart (for wallets) */}
              {!isContract && (
                <ActivityRadar ethosData={result.ethosData} onChainData={result.onChainData} />
              )}

              {/* Score History */}
              {historySnapshots.length > 0 && (
                <ScoreHistory snapshots={historySnapshots} />
              )}

              {/* Sybil Risk Analysis (for wallets) */}
              {!isContract && (result as any).sybilRisk && (
                <SybilIndicator sybilRisk={(result as any).sybilRisk} />
              )}

              {/* Score Breakdown (for wallets) - only show full breakdown for EOA */}
              {!isContract && (
                <ScoreBreakdown data={result.ethosData} onChainData={result.onChainData} />
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={<ThumbsUpIcon />}
                label="Reviews"
                value={`+${result.ethosData.stats.review.received.positive} / -${result.ethosData.stats.review.received.negative}`}
                subtext={`${result.ethosData.stats.review.received.neutral} neutral`}
                delay={0}
              />
              <MetricCard
                icon={<ShieldIcon />}
                label="Vouches Received"
                value={result.ethosData.stats.vouch.received.count}
                subtext={formatWei(result.ethosData.stats.vouch.received.amountWeiTotal)}
                delay={100}
              />
              <MetricCard
                icon={<DollarIcon />}
                label="Vouches Given"
                value={result.ethosData.stats.vouch.given.count}
                subtext={formatWei(result.ethosData.stats.vouch.given.amountWeiTotal)}
                delay={200}
              />
              <MetricCard
                icon={<BoltIcon />}
                label="XP"
                value={result.ethosData.xpTotal.toLocaleString()}
                subtext={
                  result.ethosData.xpStreakDays
                    ? `${result.ethosData.xpStreakDays} day streak`
                    : undefined
                }
                delay={300}
              />
            </div>

            {/* AI */}
            <div className="bg-gray-900/40 rounded-2xl p-6 border border-base-blue/20">
              <div className="flex items-center gap-3 mb-4">
                <AnalyticsIcon />
                <h3 className="font-semibold">
                  {isContract ? 'Contract Analysis' : 'Vibe Check Analysis'}
                </h3>
              </div>
              <VibeAnalysis analysis={result.aiAnalysis} />
            </div>

            {/* Social Sharing - Uses Ethos as identity source */}
            <ShareResults
              address={address}
              score={result.ethosData.score}
              summary={result.aiAnalysis.oneWordSummary}
              isContract={isContract}
              contractName={result.contractInfo?.contractName}
              knownProtocol={result.knownProtocol?.name}
              ethosData={result.ethosData}
              basename={result.basename}
            />

            {/* Compare with another wallet */}
            <Link
              href={`/compare?a=${encodeURIComponent(address)}`}
              className="block text-center py-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Compare with another wallet →
            </Link>

            {/* On-Chain Attestation */}
            <AttestButton
              targetAddress={address}
              score={result.ethosData.score}
              tier={result.aiAnalysis.oneWordSummary}
            />

            {/* Leave Review (wallet targets only) */}
            {!isContract && (
              <LeaveReview
                targetAddress={address}
                targetName={result.ethosData.displayName}
              />
            )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <div className="py-8 space-y-5 animate-fade-in">
              <p className="text-center text-gray-500 text-sm">See it in action -- tap any example to run a live analysis</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* vitalik.eth */}
                <button
                  onClick={() => { setAddress('vitalik.eth'); checkVibe('vitalik.eth'); }}
                  className="group relative bg-gray-900/60 rounded-xl p-4 border border-gray-700/40 hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/10 flex items-center justify-center text-lg border border-purple-500/20 group-hover:scale-110 transition-transform">
                      V
                    </div>
                    <div>
                      <p className="font-mono text-sm text-white group-hover:text-purple-300 transition-colors">vitalik.eth</p>
                      <p className="text-[10px] text-gray-500">Ethereum Creator</p>
                    </div>
                  </div>
                  <span className="relative inline-flex items-center gap-1 text-[10px] text-gray-500 group-hover:text-purple-400 transition-colors">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>
                    Run analysis
                  </span>
                </button>

                {/* paradigm.eth */}
                <button
                  onClick={tryExample}
                  className="group relative bg-gray-900/60 rounded-xl p-4 border border-gray-700/40 hover:border-base-blue/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,82,255,0.12)] text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-base-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-base-blue/30 to-blue-600/10 flex items-center justify-center text-lg border border-base-blue/20 group-hover:scale-110 transition-transform">
                      P
                    </div>
                    <div>
                      <p className="font-mono text-sm text-white group-hover:text-blue-300 transition-colors">paradigm.eth</p>
                      <p className="text-[10px] text-gray-500">Top DeFi Fund</p>
                    </div>
                  </div>
                  <span className="relative inline-flex items-center gap-1 text-[10px] text-gray-500 group-hover:text-blue-400 transition-colors">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>
                    Run analysis
                  </span>
                </button>

                {/* USDC Contract */}
                <button
                  onClick={tryContractExample}
                  className="group relative bg-gray-900/60 rounded-xl p-4 border border-gray-700/40 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-white group-hover:text-emerald-300 transition-colors">USDC</p>
                      <p className="text-[10px] text-gray-500">Base Stablecoin</p>
                    </div>
                  </div>
                  <span className="relative inline-flex items-center gap-1 text-[10px] text-gray-500 group-hover:text-emerald-400 transition-colors">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>
                    Run analysis
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
