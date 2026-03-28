import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibecheck.base.org';

interface Props {
  searchParams: Promise<{ address?: string; score?: string; tier?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const address = params.address || '';
  const score = params.score || '1200';
  const tier = params.tier || 'Neutral';

  const ogImageUrl = `${BASE_URL}/api/og?address=${encodeURIComponent(address)}&score=${score}&tier=${encodeURIComponent(tier)}`;
  const postUrl = `${BASE_URL}/api/frames/check`;

  const shortAddr = address.includes('.')
    ? address
    : address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : 'any wallet';

  return {
    title: `Vibe Check: ${shortAddr}`,
    description: `Score: ${score}/2800 (${tier})`,
    openGraph: {
      title: `Vibe Check: ${shortAddr}`,
      description: `Score: ${score}/2800 (${tier})`,
      images: [ogImageUrl],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': ogImageUrl,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': 'View Full Report',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': `${BASE_URL}/?address=${encodeURIComponent(address)}`,
      'fc:frame:button:2': 'Check Another',
      'fc:frame:button:2:action': 'post',
      'fc:frame:post_url': postUrl,
      'fc:frame:input:text': 'Enter wallet address or ENS...',
    },
  };
}

export default function FrameCheckPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold mb-4">Vibe Check Frame</h1>
        <p className="text-gray-400 mb-6">
          This page is a Farcaster Frame. Share it on Warpcast to see the interactive card.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Go to Vibe Check
        </a>
      </div>
    </div>
  );
}
