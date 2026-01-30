import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://vibecheck.base.org'),
  title: 'Vibe Check | Base Wallet & Contract Reputation Analysis',
  description: 'Instantly analyze wallet and smart contract reputation on Base. Powered by Ethos Network trust scores, on-chain activity analysis, and AI insights. Check any address before transacting.',
  keywords: [
    'Base wallet checker',
    'wallet reputation',
    'smart contract analyzer',
    'Ethos Network',
    'Base blockchain',
    'crypto wallet safety',
    'on-chain reputation',
    'Web3 trust score',
    'contract verification',
    'DeFi safety'
  ],
  authors: [{ name: 'Vibe Check' }],
  creator: 'Vibe Check',
  publisher: 'Vibe Check',
  openGraph: {
    title: 'Vibe Check | Base Wallet & Contract Reputation Analysis',
    description: 'Instantly analyze wallet and smart contract reputation on Base. Check trust scores, on-chain activity, and get AI-powered insights before you transact.',
    url: 'https://vibecheck.base.org',
    siteName: 'Vibe Check',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vibe Check - Base Wallet Reputation Analyzer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Check | Base Wallet & Contract Reputation Analysis',
    description: 'Instantly analyze wallet and smart contract reputation on Base. Powered by Ethos Network.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://vibecheck.base.org" />
        <meta name="theme-color" content="#0052FF" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
