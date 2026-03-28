import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CompareView } from '@/components/CompareView';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function truncateAddress(address: string): string {
  if (address.includes('.')) return address;
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const a = typeof params.a === 'string' ? params.a : undefined;
  const b = typeof params.b === 'string' ? params.b : undefined;

  const title = 'Compare Wallets | Vibe Check';
  const description = a && b
    ? `Head-to-head reputation comparison: ${truncateAddress(a)} vs ${truncateAddress(b)} on Base.`
    : 'Compare two wallet reputations side by side on Base. Powered by Ethos Network.';

  const ogSearchParams = new URLSearchParams();
  if (a) ogSearchParams.set('a', a);
  if (b) ogSearchParams.set('b', b);
  const ogImageUrl = `/api/og?${ogSearchParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Vibe Check',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Compare Wallets on Vibe Check',
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

function CompareLoading() {
  return (
    <div className="min-h-screen bg-base-dark text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-base-blue border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Loading comparison...</p>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareLoading />}>
      <CompareView />
    </Suspense>
  );
}
