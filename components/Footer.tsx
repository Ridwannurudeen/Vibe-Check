'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [copied, setCopied] = useState(false);
  const ensAddress = 'gudman.eth';
  const xHandle = 'ggudman1';
  const xUrl = `https://x.com/${xHandle}`;

  const handleCopyENS = async () => {
    try {
      await navigator.clipboard.writeText(ensAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <footer className="relative mt-auto border-t border-white/10">
      {/* Glass-morphism background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-black/40 to-blue-900/10 backdrop-blur-md" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <Link href="/" className="font-bold text-lg hover:text-purple-400 transition-colors">
                Vibe Check
              </Link>
              <p className="text-xs text-gray-500">Powered by Ethos Network</p>
            </div>
          </div>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <a 
              href="https://ethos.network" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Ethos
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </nav>

          {/* Right: Creator & Support */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Creator Credit */}
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                Built by <span className="font-medium text-purple-400 group-hover:text-purple-300">@{xHandle}</span>
              </span>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* ENS Support Button */}
            <button
              onClick={handleCopyENS}
              className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
            >
              {/* Tip label */}
              <span className="text-[10px] text-purple-400 absolute -top-2 left-3 bg-[#0a0a14] px-1.5 rounded">
                Tip the Dev
              </span>
              
              {/* ETH Icon */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1.5l-8 14 8 4.5 8-4.5-8-14zm0 4.5l4.5 8-4.5 2.5-4.5-2.5 4.5-8zm0 12l-6-3.5 6 8.5 6-8.5-6 3.5z"/>
                </svg>
              </div>
              
              {/* ENS Address */}
              <span className="font-mono text-sm text-white group-hover:text-purple-300 transition-colors">
                {ensAddress}
              </span>
              
              {/* Copy Icon / Checkmark */}
              <div className="w-5 h-5 flex items-center justify-center">
                {copied ? (
                  <svg className="w-4 h-4 text-green-400 animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </div>

              {/* Copied tooltip */}
              {copied && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 whitespace-nowrap animate-fade-in">
                  Copied to clipboard!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Vibe Check. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with
            <span className="text-red-500 animate-pulse">❤️</span>
            on Base
            <svg className="w-4 h-4 text-blue-500 ml-1" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </p>
        </div>
      </div>

      {/* Animated gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </footer>
  );
}
