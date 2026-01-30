'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog';
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

// Simple markdown renderer
function renderMarkdown(content: string) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl font-bold mt-8 mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-semibold mt-8 mb-4 text-white">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-gray-200">
          {line.slice(4)}
        </h3>
      );
    }
    // Horizontal rule
    else if (line.startsWith('---')) {
      elements.push(<hr key={i} className="my-8 border-white/10" />);
    }
    // Blockquote / Italics paragraph
    else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(
        <p key={i} className="italic text-gray-400 my-4 pl-4 border-l-2 border-blue-500/50">
          {line.slice(1, -1)}
        </p>
      );
    }
    // Table
    else if (line.startsWith('|')) {
      const tableLines = [line];
      i++;
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      i--;
      
      const headers = tableLines[0].split('|').filter(Boolean).map(h => h.trim());
      const rows = tableLines.slice(2).map(row => 
        row.split('|').filter(Boolean).map(cell => cell.trim())
      );
      
      elements.push(
        <div key={i} className="my-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {headers.map((h, idx) => (
                  <th key={idx} className="text-left py-2 px-4 text-gray-300 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-white/5">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="py-2 px-4 text-gray-400">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // Unordered list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems = [line.slice(2)];
      i++;
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      i--;
      
      elements.push(
        <ul key={i} className="my-4 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-300">
              <span className="text-blue-400 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    // Ordered list
    else if (/^\d+\.\s/.test(line)) {
      const listItems = [line.replace(/^\d+\.\s/, '')];
      i++;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      i--;
      
      elements.push(
        <ol key={i} className="my-4 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-300">
              <span className="text-blue-400 font-semibold min-w-[20px]">{idx + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    }
    // Regular paragraph
    else if (line.trim()) {
      // Handle inline formatting
      let text = line;
      // Bold
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      // Links
      text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
      // Inline code
      text = text.replace(/`(.+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm text-pink-400">$1</code>');
      
      elements.push(
        <p 
          key={i} 
          className="my-4 text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    i++;
  }

  return elements;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getBlogPost(slug);
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://vibecheck.base.org/blog/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#141428] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-blue-400 hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const allPosts = getAllBlogPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

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

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-500 truncate">{post.title}</span>
        </nav>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 pb-16">
        {/* Meta */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-3 py-1 rounded-full border ${categoryColors[post.category]}`}>
              {categoryLabels[post.category]}
            </span>
            <span className="text-sm text-gray-500">{post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {renderMarkdown(post.content)}
        </div>

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-lg font-semibold mb-4">Share this article</h3>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://vibecheck.base.org/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
            >
              Share on X
            </a>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-white/10 grid md:grid-cols-2 gap-4">
          {prevPost && (
            <Link 
              href={`/blog/${prevPost.slug}`}
              className="glass-card p-4 hover:bg-white/5 transition-all"
            >
              <span className="text-xs text-gray-500">← Previous</span>
              <p className="font-medium mt-1 text-sm">{prevPost.title}</p>
            </Link>
          )}
          {nextPost && (
            <Link 
              href={`/blog/${nextPost.slug}`}
              className="glass-card p-4 hover:bg-white/5 transition-all md:text-right md:col-start-2"
            >
              <span className="text-xs text-gray-500">Next →</span>
              <p className="font-medium mt-1 text-sm">{nextPost.title}</p>
            </Link>
          )}
        </div>
      </article>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-white/10 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Check a Vibe?</h2>
          <p className="text-gray-400 mb-8">
            Put what you learned into practice. Check any wallet or contract instantly.
          </p>
          
          {/* Quick Search Box */}
          <div className="relative mb-8">
            <div className="flex gap-2 bg-gray-900/80 rounded-2xl border border-purple-500/30 p-2 shadow-lg shadow-purple-500/10">
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
                className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
              >
                Check Vibe ✨
              </button>
            </div>
          </div>

          {/* Quick Examples */}
          <p className="text-sm text-gray-500 mb-3">Try an example:</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => window.location.href = '/?address=paradigm.eth'}
              className="text-purple-400 font-mono text-sm hover:text-purple-300 hover:underline transition-colors"
            >
              paradigm.eth
            </button>
            <span className="text-gray-600">|</span>
            <button 
              onClick={() => window.location.href = '/?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'}
              className="text-blue-400 font-mono text-sm hover:text-blue-300 hover:underline transition-colors"
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
