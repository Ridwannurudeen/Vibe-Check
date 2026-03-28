// Ethos Network API Types

export interface EthosUserStats {
  review: {
    received: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  vouch: {
    given: {
      count: number;
      amountWeiTotal: number;
    };
    received: {
      count: number;
      amountWeiTotal: number;
    };
  };
}

// On-Chain Data Type (exported separately)
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

// Contract Info Type (for smart contracts)
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

export interface EthosUser {
  onChainData?: OnChainData;
  id: number;
  profileId: number | null;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  description: string | null;
  score: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MERGED';
  userkeys: string[];
  xpTotal: number;
  xpStreakDays: number;
  xpRemovedDueToAbuse: boolean;
  influenceFactor: number;
  influenceFactorPercentile: number;
  links: {
    profile: string;
    scoreBreakdown: string;
  };
  stats: EthosUserStats;
}

// AI Analysis Types

export type ScoreLevel = 'Excellent' | 'Good' | 'Neutral' | 'Questionable' | 'Risky';

export interface VibeAnalysis {
  oneWordSummary: ScoreLevel;
  analysis: string;
  recommendation: string;
}

// API Response Types

export interface KnownProtocol {
  name: string;
  category: 'defi' | 'nft' | 'governance' | 'bridging';
}

export interface CheckVibeResponse {
  ethosData: EthosUser;
  onChainData: OnChainData;
  contractInfo?: ContractInfo;
  knownProtocol?: KnownProtocol;
  aiAnalysis: VibeAnalysis;
  timestamp: string;
  basename?: string;
}

// Full reputation result from getReputation()
export interface ReputationResult {
  ethosData: EthosUser;
  onChainData: OnChainData;
  contractInfo?: ContractInfo;
  knownProtocol?: KnownProtocol;
  aiAnalysis: VibeAnalysis;
  address: string;
  inputAddress: string;
  timestamp: string;
  sybilRisk?: SybilRisk;
  basename?: string;
}

// Sybil risk assessment
export interface SybilRisk {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high';
  indicators: SybilIndicator[];
}

export interface SybilIndicator {
  name: string;
  triggered: boolean;
  description: string;
  weight: number;
}

// Historical tracking
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

export interface CheckVibeError {
  error: string;
  code?: string;
}

// Score Level Configuration

export interface ScoreLevelConfig {
  level: ScoreLevel;
  color: string;
  bg: string;
  min: number;
  max: number;
}

// Component Props

export interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  animate?: boolean;
}

export interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  delay?: number;
}

export interface BadgeProps {
  label: string;
  type?: 'positive' | 'neutral' | 'negative' | 'default' | 'base';
}

export interface AttestationBadge {
  label: string;
  type: BadgeProps['type'];
}
