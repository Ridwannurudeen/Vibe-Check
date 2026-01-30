'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getAllBlogPosts, type BlogPost } from '@/lib/blog';
import { Footer } from '@/components';

const categoryColors = {
  security: 'bg-red-500/20 text-red-400 border-red-500/30',
  guides: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  news: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  education: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const categoryLabels = {
  security: '🔐 Security',
  guides: '📚 Guides',
  news: '📰 News',
  education: '🎓 Education',
};

export default function BlogPage() {
  const allPosts = getAllBlogPosts();
  const [filter, setFilter] = useState<BlogPost['category'] | 'all'>('all');
  
  const filteredPosts = filter === 'all' 
    ? allPosts 
    : allPosts.filter(post => post.category === filter);

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
            <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/blog" className="text-white font-medium">
              Blog
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vibe Check Blog
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn about wallet safety, on-chain reputation, and how to stay safe in Web3.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              All Posts
            </button>
            {(['education', 'security', 'guides', 'news'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                  filter === cat
                    ? categoryColors[cat]
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-transparent'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group glass-card p-6 hover:bg-white/5 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs px-3 py-1 rounded-full border ${categoryColors[post.category]}`}>
                        {categoryLabels[post.category]}
                      </span>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  <div className="md:self-center">
                    <span className="text-gray-500 group-hover:text-blue-400 transition-colors">
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 border-t border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-6">
            Get the latest Web3 security tips and reputation insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 text-white placeholder-gray-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-medium hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Quick Search CTA */}
      <section className="py-16 px-4 border-t border-white/10 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Check a Vibe Now</h2>
          <p className="text-gray-400 mb-6">
            Enter any wallet or contract address to analyze instantly.
          </p>
          
          <div className="flex gap-2 bg-gray-900/80 rounded-2xl border border-purple-500/30 p-2 shadow-lg shadow-purple-500/10 mb-6">
            <input
              type="text"
              placeholder="0x... or ENS name"
              className="flex-1 bg-gray-800/50 rounded-xl px-5 py-4 font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget.value.trim();
                  if (input) {
                    window.location.href = `/?address=${encodeURIComponent(input)}`;
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement)?.value.trim();
                if (input) {
                  window.location.href = `/?address=${encodeURIComponent(input)}`;
                } else {
                  window.location.href = '/';
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
            >
              Check ✨
            </button>
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <span className="text-gray-500">Try:</span>
            <button 
              onClick={() => window.location.href = '/?address=paradigm.eth'}
              className="text-purple-400 font-mono hover:text-purple-300 transition-colors"
            >
              paradigm.eth
            </button>
            <span className="text-gray-600">|</span>
            <button 
              onClick={() => window.location.href = '/?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'}
              className="text-blue-400 font-mono hover:text-blue-300 transition-colors"
            >
              USDC
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
