// Types

export interface EthosUserStats {
  review: {
    received: { positive: number; neutral: number; negative: number };
  };
  vouch: {
    given: { count: number; amountWeiTotal: number };
    received: { count: number; amountWeiTotal: number };
  };
}

export interface OnChainData {
  transactionCount: number;
  firstTransaction: string | null;
  walletAgeDays: number;
  protocols?: string[];
  activityDiversity?: {
    defi: boolean;
    nft: boolean;
    governance: boolean;
    bridging: boolean;
  };
  chain?: 'base' | 'ethereum';
}

export interface ContractInfo {
  isContract: boolean;
  contractName?: string;
  compilerVersion?: string;
  isVerified: boolean;
  isProxy: boolean;
  implementation?: string;
  creator?: string;
  creationTxHash?: string;
  creationDate?: string;
  contractAgeDays?: number;
  tokenInfo?: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    type: 'ERC20' | 'ERC721' | 'ERC1155' | 'Unknown';
  };
  interactionCount?: number;
  uniqueUsers?: number;
  detectedChain?: number;
}

export interface VibeAnalysis {
  oneWordSummary: string;
  analysis: string;
  recommendation: string;
}

export interface SybilIndicator {
  name: string;
  triggered: boolean;
  description: string;
  weight: number;
}

export interface SybilRisk {
  score: number;
  level: 'low' | 'medium' | 'high';
  indicators: SybilIndicator[];
}

export interface KnownProtocol {
  name: string;
  category: 'defi' | 'nft' | 'governance' | 'bridging';
}

export interface EthosUser {
  id: number;
  profileId: number | null;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  description: string | null;
  score: number;
  status: string;
  userkeys: string[];
  xpTotal: number;
  xpStreakDays: number;
  influenceFactor: number;
  influenceFactorPercentile: number;
  links: { profile: string; scoreBreakdown: string };
  stats: EthosUserStats;
}

export interface ReputationResult {
  ethosData: EthosUser;
  onChainData: OnChainData;
  contractInfo?: ContractInfo;
  knownProtocol?: KnownProtocol;
  aiAnalysis: VibeAnalysis;
  sybilRisk?: SybilRisk;
  address: string;
  inputAddress: string;
  timestamp: string;
  basename?: string;
}

export interface ScoreSnapshot {
  score: number;
  tier: string;
  transactionCount: number;
  timestamp: number;
}

export interface HistoryResponse {
  address: string;
  snapshots: ScoreSnapshot[];
  firstSeen: number | null;
  lastSeen: number | null;
}

export interface CompareResult {
  wallet_a: ReputationResult;
  wallet_b: ReputationResult;
}

// Client options

export interface VibeCheckOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

// Errors

export class VibeCheckError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'VibeCheckError';
  }
}

// Client

const DEFAULT_BASE_URL = 'https://vibecheck.base.org';
const DEFAULT_TIMEOUT = 30000;

export class VibeCheck {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(options: VibeCheckOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
  }

  private async request<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new VibeCheckError(
          body.error || `HTTP ${res.status}`,
          res.status,
          body.code,
        );
      }

      return res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Get full reputation analysis for a wallet address or ENS name.
   */
  async getReputation(address: string): Promise<ReputationResult> {
    return this.request<ReputationResult>(
      `/api/v1/reputation/${encodeURIComponent(address)}`
    );
  }

  /**
   * Get historical score snapshots for an address.
   */
  async getHistory(address: string, limit?: number): Promise<HistoryResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<HistoryResponse>(
      `/api/v1/history/${encodeURIComponent(address)}${params}`
    );
  }

  /**
   * Compare two wallets side by side.
   */
  async compare(addressA: string, addressB: string): Promise<CompareResult> {
    const [a, b] = await Promise.all([
      this.getReputation(addressA),
      this.getReputation(addressB),
    ]);
    return { wallet_a: a, wallet_b: b };
  }
}

// Convenience: default export + named export
export default VibeCheck;
