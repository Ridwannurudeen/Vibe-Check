'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Footer } from '@/components';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'overview' | 'score' | 'ethos' | 'contracts'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#141428] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Vibe Check
            </span>
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/how-it-works" className="text-white font-medium">
              How It Works
            </Link>
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
              Blog
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            How Vibe Check Works
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Understanding on-chain reputation, trust scores, and how we help you make safer decisions in Web3.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Start Checking
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'overview', label: 'Overview', icon: '🎯' },
              { id: 'score', label: 'Score Breakdown', icon: '📊' },
              { id: 'ethos', label: 'Ethos Network', icon: '🌐' },
              { id: 'contracts', label: 'Smart Contracts', icon: '📜' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">🔍</span>
                  What is Vibe Check?
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Vibe Check is a free tool that helps you analyze the reputation and trustworthiness of any wallet address or smart contract on Base and Ethereum. Before you send funds, trade NFTs, or interact with a contract, you can check its "vibe" to make more informed decisions.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl mb-2">👛</div>
                    <h3 className="font-semibold mb-1">Wallet Analysis</h3>
                    <p className="text-sm text-gray-400">Check any wallet's reputation, transaction history, and community trust signals.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl mb-2">📜</div>
                    <h3 className="font-semibold mb-1">Contract Analysis</h3>
                    <p className="text-sm text-gray-400">Verify smart contracts, check if they're verified, and assess security signals.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="font-semibold mb-1">AI Insights</h3>
                    <p className="text-sm text-gray-400">Get human-readable analysis powered by AI that explains what the data means.</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">📈</span>
                  Data Sources
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  We aggregate data from multiple trusted sources to give you a comprehensive view:
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-xl">🏛️</div>
                    <div>
                      <h3 className="font-semibold text-green-400">Ethos Network</h3>
                      <p className="text-sm text-gray-400">Community-driven reputation scores based on vouches, reviews, and on-chain interactions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">⛓️</div>
                    <div>
                      <h3 className="font-semibold text-blue-400">On-Chain Data</h3>
                      <p className="text-sm text-gray-400">Transaction history, wallet age, protocol interactions, and activity patterns from Basescan/Etherscan.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">🔐</div>
                    <div>
                      <h3 className="font-semibold text-purple-400">Contract Verification</h3>
                      <p className="text-sm text-gray-400">Source code verification status, proxy detection, and known protocol identification.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Breakdown Tab */}
          {activeTab === 'score' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Understanding the Score (0-2800)
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  The credibility score is calculated by Ethos Network and ranges from 0 to 2800. Here's what each range means:
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl p-4 border-l-4 border-emerald-500">
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-emerald-400">2000+</div>
                      <div className="text-xs text-gray-500">Excellent</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-400">Excellent Reputation</h3>
                      <p className="text-sm text-gray-400">Highly trusted community member with strong positive track record. Multiple vouches and positive reviews.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl p-4 border-l-4 border-green-500">
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-green-400">1600+</div>
                      <div className="text-xs text-gray-500">Good</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-400">Good Reputation</h3>
                      <p className="text-sm text-gray-400">Positive track record with established on-chain history. Generally trustworthy.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-xl p-4 border-l-4 border-yellow-500">
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-yellow-400">1200+</div>
                      <div className="text-xs text-gray-500">Neutral</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-400">Neutral / Average</h3>
                      <p className="text-sm text-gray-400">Limited history or mixed signals. Exercise normal caution.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl p-4 border-l-4 border-orange-500">
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-orange-400">800+</div>
                      <div className="text-xs text-gray-500">Caution</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-400">Questionable</h3>
                      <p className="text-sm text-gray-400">Some concerning patterns detected. Proceed with extra caution.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl p-4 border-l-4 border-red-500">
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-red-400">0-799</div>
                      <div className="text-xs text-gray-500">Risky</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-400">Risky</h3>
                      <p className="text-sm text-gray-400">Significant red flags or negative feedback. High risk of issues.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">⚖️</span>
                  What Affects the Score?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <span>✅</span> Positive Factors
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Receiving vouches from trusted accounts
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Positive reviews from community members
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Long wallet history (older = more trusted)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Consistent, legitimate transaction activity
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Verified social media connections
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Giving vouches to other trusted accounts
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <span>❌</span> Negative Factors
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        Negative reviews or reported scams
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        Very new wallet with no history
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        Suspicious transaction patterns
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        Slash events (broken trust commitments)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        Association with known bad actors
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        No Ethos profile or verification
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ethos Network Tab */}
          {activeTab === 'ethos' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">🌐</span>
                  What is Ethos Network?
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Ethos Network is a decentralized reputation protocol built on Base that enables trust and accountability in Web3. It provides the underlying reputation data that powers Vibe Check.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-blue-400 mb-2">Key Features</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• <strong>Vouches:</strong> Stake ETH to vouch for someone's trustworthiness</li>
                    <li>• <strong>Reviews:</strong> Leave positive, neutral, or negative feedback</li>
                    <li>• <strong>Attestations:</strong> Verify social accounts (Twitter, Discord, etc.)</li>
                    <li>• <strong>Credibility Score:</strong> Aggregated trust score from 0-2800</li>
                  </ul>
                </div>
                <a 
                  href="https://ethos.network" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Visit Ethos Network
                  <span>↗</span>
                </a>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">🤝</span>
                  How Vouching Works
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Vouching is a way to stake your reputation (and ETH) on someone else's trustworthiness. It's a powerful signal of trust.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-5">
                    <h3 className="font-semibold mb-3">Giving a Vouch</h3>
                    <ol className="space-y-2 text-sm text-gray-400">
                      <li>1. Find someone you trust on Ethos</li>
                      <li>2. Stake ETH as collateral for your vouch</li>
                      <li>3. Your reputation backs their reputation</li>
                      <li>4. If they behave badly, you could lose stake</li>
                    </ol>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5">
                    <h3 className="font-semibold mb-3">Receiving Vouches</h3>
                    <ol className="space-y-2 text-sm text-gray-400">
                      <li>1. Build trust through positive interactions</li>
                      <li>2. Community members vouch for you</li>
                      <li>3. More vouches = higher credibility score</li>
                      <li>4. Quality of vouchers matters too</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  Reviews & Feedback
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Reviews allow anyone to leave feedback about their experience with an address. Reviews are categorized as:
                </p>
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full">
                    <span className="text-green-400">👍</span>
                    <span className="text-sm">Positive</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-500/10 px-4 py-2 rounded-full">
                    <span className="text-gray-400">😐</span>
                    <span className="text-sm">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full">
                    <span className="text-red-400">👎</span>
                    <span className="text-sm">Negative</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">📜</span>
                  Smart Contract Analysis
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  When you enter a smart contract address, Vibe Check performs a different type of analysis focused on security signals rather than personal reputation.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-lg">✓</div>
                    <div>
                      <h3 className="font-semibold">Verification Status</h3>
                      <p className="text-sm text-gray-400">Is the source code verified on Basescan/Etherscan? Verified contracts are more transparent.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">⏱</div>
                    <div>
                      <h3 className="font-semibold">Contract Age</h3>
                      <p className="text-sm text-gray-400">How long has this contract been deployed? Older contracts have more proven track records.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">👥</div>
                    <div>
                      <h3 className="font-semibold">Usage Statistics</h3>
                      <p className="text-sm text-gray-400">How many unique users and interactions? High usage suggests community trust.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-lg">🔄</div>
                    <div>
                      <h3 className="font-semibold">Proxy Detection</h3>
                      <p className="text-sm text-gray-400">Is this a proxy contract? Proxies can be upgraded, which introduces additional risk.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-lg">🏷</div>
                    <div>
                      <h3 className="font-semibold">Known Protocols</h3>
                      <p className="text-sm text-gray-400">Is this a known protocol like USDC, Uniswap, or Aerodrome? Established protocols have proven track records.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">🪙</span>
                  Token Contract Analysis
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  For token contracts (ERC20, ERC721, ERC1155), we provide additional information:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-medium text-emerald-400 mb-2">ERC20 Tokens</h4>
                    <p className="text-sm text-gray-400">Name, symbol, decimals, total supply</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-medium text-pink-400 mb-2">ERC721 NFTs</h4>
                    <p className="text-sm text-gray-400">Collection name, symbol, total supply</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-medium text-purple-400 mb-2">ERC1155 Multi-Token</h4>
                    <p className="text-sm text-gray-400">Collection name, symbol, token types</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-medium text-blue-400 mb-2">Creator Info</h4>
                    <p className="text-sm text-gray-400">Deployer address, creation date, creation tx</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-white/10 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Check a Vibe?</h2>
          <p className="text-gray-400 mb-8">
            Enter any wallet address or smart contract to get instant reputation analysis.
          </p>
          
          {/* Quick Search Box */}
          <div className="mb-8">
            <div className="relative bg-gray-900/80 rounded-2xl border border-purple-500/30 p-2 shadow-lg shadow-purple-500/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x... or ENS name (e.g. vitalik.eth)"
                  className="flex-1 bg-gray-800/50 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget.value.trim();
                      if (input) {
                        window.location.href = `/?address=${encodeURIComponent(input)}`;
                      }
                    }
                  }}
                  id="quick-search-input"
                />
                <button
                  onClick={() => {
                    const input = (document.getElementById('quick-search-input') as HTMLInputElement)?.value.trim();
                    if (input) {
                      window.location.href = `/?address=${encodeURIComponent(input)}`;
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
                >
                  Check Vibe ✨
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Press Enter or click the button to analyze
            </p>
          </div>

          {/* Or browse examples */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-gray-500">Try:</span>
            <button 
              onClick={() => window.location.href = '/?address=paradigm.eth'}
              className="text-blue-400 hover:text-blue-300 font-mono transition-colors"
            >
              paradigm.eth
            </button>
            <span className="text-gray-600">|</span>
            <button 
              onClick={() => window.location.href = '/?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'}
              className="text-purple-400 hover:text-purple-300 font-mono transition-colors"
            >
              USDC Contract
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
