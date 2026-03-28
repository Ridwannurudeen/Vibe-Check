// Ethos Review Contract on Base
export const ETHOS_REVIEW_CONTRACT = '0xD3AaF3F3D4c110c9C7B7BfCcfb2714A6e630c9e0' as const;

// Minimal ABI for addReview function
export const ETHOS_REVIEW_ABI = [
  {
    name: 'addReview',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'subject', type: 'address' },
      { name: 'comment', type: 'string' },
      { name: 'rating', type: 'uint8' },
      { name: 'metadata', type: 'string' },
    ],
    outputs: [],
  },
] as const;

// Rating enum matching Ethos contract
export const REVIEW_RATINGS = {
  positive: 0,
  neutral: 1,
  negative: 2,
} as const;

export type ReviewRating = keyof typeof REVIEW_RATINGS;

export function getEthosProfileUrl(address: string): string {
  return `https://app.ethos.network/profile/${address}`;
}
