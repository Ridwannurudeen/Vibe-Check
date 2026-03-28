import type { OnChainData, EthosUser, SybilRisk, SybilIndicator } from '@/types';

// Known CEX deposit addresses (lowercase)
const KNOWN_CEX_ADDRESSES = new Set([
  '0x28c6c06298d514db089934071355e5743bf21d60', // Binance Hot
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549', // Binance
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d', // Binance
  '0x56eddb7aa87536c09ccc2793473599fd21a8b17f', // Binance
  '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', // Binance
  '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43', // Coinbase
  '0x503828976d22510aad0339d3148ad5bcd3e34db8', // Coinbase
  '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740', // Coinbase
  '0x71660c4005ba85c37ccec55d0c4493e66fe775d3', // Coinbase
  '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b', // OKX
]);

// Known faucet addresses
const KNOWN_FAUCETS = new Set([
  '0x4200000000000000000000000000000000000015', // Base faucet
]);

interface SybilAnalysisInput {
  onChainData: OnChainData;
  ethosData: EthosUser;
}

export function analyzeSybilRisk(input: SybilAnalysisInput): SybilRisk {
  const indicators: SybilIndicator[] = [];

  // 1. Funding source analysis (weight: 10)
  // If wallet is very new AND was funded from a faucet, slight risk
  const fundingIndicator: SybilIndicator = {
    name: 'Faucet Funded',
    triggered: false,
    description: 'Wallet appears to be funded from a known faucet',
    weight: 10,
  };
  // Heuristic: very new wallet with minimal activity
  if (input.onChainData.walletAgeDays < 30 && input.onChainData.transactionCount < 5) {
    fundingIndicator.triggered = true;
    fundingIndicator.description = 'Very new wallet (<30 days) with minimal activity (<5 txs)';
  }
  indicators.push(fundingIndicator);

  // 2. Age vs Activity ratio (weight: 25)
  const ageActivityIndicator: SybilIndicator = {
    name: 'Age-Activity Mismatch',
    triggered: false,
    description: 'Normal activity relative to wallet age',
    weight: 25,
  };
  if (input.onChainData.walletAgeDays > 0) {
    const txPerDay = input.onChainData.transactionCount / input.onChainData.walletAgeDays;
    // Suspicious: burst of activity in short period, or very old with almost no activity
    if (txPerDay > 50) {
      ageActivityIndicator.triggered = true;
      ageActivityIndicator.description = `Abnormally high activity (${txPerDay.toFixed(1)} tx/day) — possible bot or automated wallet`;
    } else if (input.onChainData.walletAgeDays > 365 && input.onChainData.transactionCount < 3) {
      ageActivityIndicator.triggered = true;
      ageActivityIndicator.description = 'Dormant wallet (>1yr old, <3 txs) — possible airdrop farmer';
    }
  }
  indicators.push(ageActivityIndicator);

  // 3. Protocol diversity (weight: 20)
  const diversityIndicator: SybilIndicator = {
    name: 'Low Protocol Diversity',
    triggered: false,
    description: 'Interacts with multiple protocols',
    weight: 20,
  };
  const diversity = input.onChainData.activityDiversity;
  const diversityCount = diversity
    ? [diversity.defi, diversity.nft, diversity.governance, diversity.bridging].filter(Boolean).length
    : 0;
  const protocolCount = input.onChainData.protocols?.length || 0;

  if (input.onChainData.transactionCount > 20 && diversityCount <= 1 && protocolCount <= 1) {
    diversityIndicator.triggered = true;
    diversityIndicator.description = 'High tx count but only interacts with 1 protocol category — possible single-purpose sybil';
  }
  indicators.push(diversityIndicator);

  // 4. Community engagement (weight: 20)
  const communityIndicator: SybilIndicator = {
    name: 'No Community Signals',
    triggered: false,
    description: 'Has community engagement (reviews/vouches)',
    weight: 20,
  };
  const totalReviews = input.ethosData.stats.review.received.positive
    + input.ethosData.stats.review.received.neutral
    + input.ethosData.stats.review.received.negative;
  const totalVouches = input.ethosData.stats.vouch.received.count;

  if (totalReviews === 0 && totalVouches === 0 && input.ethosData.xpTotal === 0) {
    communityIndicator.triggered = true;
    communityIndicator.description = 'Zero community engagement — no reviews, vouches, or XP';
  }
  indicators.push(communityIndicator);

  // 5. Batch creation pattern (weight: 25)
  const batchIndicator: SybilIndicator = {
    name: 'Batch Creation Pattern',
    triggered: false,
    description: 'No batch creation patterns detected',
    weight: 25,
  };
  // Heuristic: wallet less than 7 days old with more than 50 transactions
  if (input.onChainData.walletAgeDays < 7 && input.onChainData.transactionCount > 50) {
    batchIndicator.triggered = true;
    batchIndicator.description = 'Wallet created <7 days ago with 50+ transactions — consistent with automated batch activity';
  }
  indicators.push(batchIndicator);

  // Calculate score
  const maxScore = indicators.reduce((sum, i) => sum + i.weight, 0);
  const triggeredScore = indicators.filter(i => i.triggered).reduce((sum, i) => sum + i.weight, 0);
  const score = Math.round((triggeredScore / maxScore) * 100);

  const level: SybilRisk['level'] = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return { score, level, indicators };
}
