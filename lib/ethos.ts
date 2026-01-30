import type { EthosUser } from '@/types';

const ETHOS_API_BASE = 'https://api.ethos.network/api/v2';
const ETHOS_CLIENT_HEADER = 'vibe-check@1.0.0';

// Default profile for addresses not found in Ethos
export function getDefaultProfile(address: string): EthosUser {
  return {
    id: 0,
    profileId: null,
    displayName: 'Unknown Profile',
    username: null,
    avatarUrl: null,
    description: null,
    score: 1200, // Neutral default score
    status: 'INACTIVE',
    userkeys: [`address:${address}`],
    xpTotal: 0,
    xpStreakDays: 0,
    xpRemovedDueToAbuse: false,
    influenceFactor: 0,
    influenceFactorPercentile: 0,
    links: {
      profile: `https://app.ethos.network/profile/${address}`,
      scoreBreakdown: `https://app.ethos.network/profile/${address}/score`,
    },
    stats: {
      review: {
        received: { positive: 0, neutral: 0, negative: 0 },
      },
      vouch: {
        given: { count: 0, amountWeiTotal: 0 },
        received: { count: 0, amountWeiTotal: 0 },
      },
    },
  };
}

// Fetch user profile from Ethos Network API
export async function getEthosProfile(address: string): Promise<EthosUser> {
  try {
    const response = await fetch(
      `${ETHOS_API_BASE}/user/by/address/${address}`,
      {
        method: 'GET',
        headers: {
          'X-Ethos-Client': ETHOS_CLIENT_HEADER,
          'Content-Type': 'application/json',
        },
        // Cache for 60 seconds
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Address not found in Ethos - return default profile
        console.log(`Address ${address} not found in Ethos, returning default profile`);
        return getDefaultProfile(address);
      }
      
      throw new Error(`Ethos API error: ${response.status} ${response.statusText}`);
    }

    const data: EthosUser = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching Ethos profile:', error);
    
    // Return default profile on error to gracefully handle failures
    return getDefaultProfile(address);
  }
}

// Batch fetch multiple profiles (for future use)
export async function getEthosProfiles(addresses: string[]): Promise<EthosUser[]> {
  try {
    const response = await fetch(
      `${ETHOS_API_BASE}/users/by/address`,
      {
        method: 'POST',
        headers: {
          'X-Ethos-Client': ETHOS_CLIENT_HEADER,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses }),
      }
    );

    if (!response.ok) {
      throw new Error(`Ethos API error: ${response.status}`);
    }

    const data: EthosUser[] = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching Ethos profiles:', error);
    return addresses.map(addr => getDefaultProfile(addr));
  }
}
