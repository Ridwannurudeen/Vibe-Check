import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HomePageContent } from '@/components/HomePageContent';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getTierFromScore(score: number): string {
  if (score >= 2000) return 'Excellent';
  if (score >= 1600) return 'Good';
  if (score >= 1200) return 'Neutral';
  if (score >= 800) return 'Questionable';
  return 'Risky';
}

function truncateAddress(address: string): string {
  if (address.includes('.')) return address;
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const address = typeof params.address === 'string' ? params.address : undefined;

  // Default metadata (no address in URL)
  if (!address) {
    return {};
  }

  // Address-specific OG metadata
  const displayAddress = truncateAddress(address);
  const title = `Vibe Check: ${displayAddress}`;
  const description = `Check the reputation and trust score of ${displayAddress} on Base. Powered by Ethos Network.`;

  // Build the OG image URL with address params
  // Score and tier will be populated when the share link is crafted with those params
  const ogSearchParams = new URLSearchParams({ address });
  const ogImageUrl = `/api/og?${ogSearchParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://vibecheck.base.org/?address=${encodeURIComponent(address)}`,
      siteName: 'Vibe Check',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Vibe Check score for ${displayAddress}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

// Loading fallback for Suspense
function HomePageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#141428] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageContent />
    </Suspense>
  );
}
