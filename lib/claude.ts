import type { EthosUser, VibeAnalysis, ScoreLevel, ContractInfo, OnChainData } from '@/types';
import { getScoreLevel } from './utils';

interface KnownProtocol {
  name: string;
  category: 'defi' | 'nft' | 'governance' | 'bridging';
}

interface AnalysisInput extends EthosUser {
  onChainData?: OnChainData;
  contractInfo?: ContractInfo | null;
  knownProtocol?: KnownProtocol | null;
}

// System prompt for wallet analysis
const WALLET_SYSTEM_PROMPT = `You are "VibeBot," a senior Web3 security analyst specializing in the Base blockchain ecosystem. Your purpose is to analyze WALLET reputation data and provide clear, balanced assessments.

Key principles:
- Be objective and balanced
- Never make definitive statements of "safe" or "unsafe"
- Speak in terms of risk signals and reputation indicators
- Consider both positive and negative factors
- Keep language accessible to non-technical users
- Focus on actionable insights

Score interpretation (0-2800 scale):
- 2000-2800: Excellent reputation - highly trusted, active community member
- 1600-1999: Good reputation - positive track record
- 1200-1599: Neutral/Average - limited history or mixed signals
- 800-1199: Questionable - some concerning patterns
- 0-799: Risky - significant red flags`;

// System prompt for contract analysis
const CONTRACT_SYSTEM_PROMPT = `You are "VibeBot," a senior Web3 security analyst specializing in smart contract analysis on Base and Ethereum. Your purpose is to analyze SMART CONTRACT data and provide clear security assessments.

Key principles:
- Focus on contract security indicators (verified, proxy status, age)
- Assess usage patterns (unique users, interaction count)
- Consider token details if it's a token contract
- Highlight protocol reputation if it's a known protocol
- Never make definitive statements of "safe" or "unsafe"
- Provide actionable security insights

Contract assessment factors:
- Verified source code = positive (transparent, auditable)
- Unverified = caution (can't inspect code)
- Proxy contract = note upgradeability risks
- High unique users = established usage
- Known protocol = mention reputation
- Token contracts = assess supply, decimals, type`;

// Build prompt for WALLET analysis
function buildWalletPrompt(data: AnalysisInput): string {
  const walletData = {
    score: data.score,
    status: data.status,
    displayName: data.displayName,
    username: data.username,
    reviews: data.stats.review.received,
    vouchesReceived: {
      count: data.stats.vouch.received.count,
      totalEth: (data.stats.vouch.received.amountWeiTotal / 1e18).toFixed(3),
    },
    vouchesGiven: {
      count: data.stats.vouch.given.count,
      totalEth: (data.stats.vouch.given.amountWeiTotal / 1e18).toFixed(3),
    },
    xpTotal: data.xpTotal,
    xpStreakDays: data.xpStreakDays,
    influenceFactor: data.influenceFactor,
    hasProfile: data.profileId !== null,
    onChain: data.onChainData ? {
      transactionCount: data.onChainData.transactionCount,
      walletAgeDays: data.onChainData.walletAgeDays,
      protocolsUsed: data.onChainData.protocols || [],
      activityDiversity: data.onChainData.activityDiversity,
      chain: data.onChainData.chain,
    } : null,
  };

  return `Analyze this WALLET's reputation data from Ethos Network and on-chain activity.

IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no explanation.

The JSON must have this exact structure:
{
  "oneWordSummary": "Excellent" | "Good" | "Neutral" | "Questionable" | "Risky",
  "analysis": "2-3 sentences analyzing wallet reputation, on-chain activity, protocol usage, and trust signals",
  "recommendation": "Single actionable sentence for users considering interaction"
}

Wallet Data:
${JSON.stringify(walletData, null, 2)}`;
}

// Build prompt for CONTRACT analysis
function buildContractPrompt(data: AnalysisInput): string {
  const contractData = {
    contractInfo: data.contractInfo ? {
      contractName: data.contractInfo.contractName || 'Unknown',
      isVerified: data.contractInfo.isVerified,
      isProxy: data.contractInfo.isProxy,
      implementation: data.contractInfo.implementation,
      compilerVersion: data.contractInfo.compilerVersion,
      contractAgeDays: data.contractInfo.contractAgeDays,
      creator: data.contractInfo.creator,
      interactionCount: data.contractInfo.interactionCount,
      uniqueUsers: data.contractInfo.uniqueUsers,
      tokenInfo: data.contractInfo.tokenInfo,
    } : null,
    knownProtocol: data.knownProtocol ? {
      name: data.knownProtocol.name,
      category: data.knownProtocol.category,
    } : null,
    ethosScore: data.score,
    onChain: data.onChainData ? {
      transactionCount: data.onChainData.transactionCount,
      ageDays: data.onChainData.walletAgeDays,
      chain: data.onChainData.chain,
    } : null,
  };

  const protocolContext = data.knownProtocol 
    ? `This is a KNOWN PROTOCOL: ${data.knownProtocol.name} (${data.knownProtocol.category}). Consider its established reputation.`
    : 'This contract is NOT a well-known protocol. Evaluate based on verification and usage metrics.';

  return `Analyze this SMART CONTRACT's security and trustworthiness.

${protocolContext}

IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no explanation.

The JSON must have this exact structure:
{
  "oneWordSummary": "Excellent" | "Good" | "Neutral" | "Questionable" | "Risky",
  "analysis": "2-3 sentences focusing on: verification status, protocol reputation (if known), usage stats, token details (if token), and any security considerations",
  "recommendation": "Single actionable sentence about interacting with this contract"
}

Contract Data:
${JSON.stringify(contractData, null, 2)}`;
}

// Parse Claude's response into VibeAnalysis
function parseAnalysisResponse(responseText: string, fallbackScore: number, isContract: boolean): VibeAnalysis {
  try {
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```json\s*/i, '');
    cleanJson = cleanJson.replace(/^```\s*/i, '');
    cleanJson = cleanJson.replace(/\s*```$/i, '');
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    
    if (!parsed.oneWordSummary || !parsed.analysis || !parsed.recommendation) {
      throw new Error('Missing required fields in response');
    }

    const validLevels: ScoreLevel[] = ['Excellent', 'Good', 'Neutral', 'Questionable', 'Risky'];
    if (!validLevels.includes(parsed.oneWordSummary)) {
      parsed.oneWordSummary = getScoreLevel(fallbackScore).level;
    }

    return parsed as VibeAnalysis;
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Raw response:', responseText);
    return getFallbackAnalysis(fallbackScore, isContract);
  }
}

// Fallback analysis
function getFallbackAnalysis(score: number, isContract: boolean = false): VibeAnalysis {
  const level = getScoreLevel(score);
  
  if (isContract) {
    return {
      oneWordSummary: level.level,
      analysis: `This smart contract has a credibility score of ${score} on Ethos Network. Review the verification status, age, and usage metrics before interacting.`,
      recommendation: 'Verify the contract source code and check usage statistics before proceeding with any transactions.',
    };
  }
  
  return {
    oneWordSummary: level.level,
    analysis: `This wallet has a credibility score of ${score} on Ethos Network, placing it in the "${level.level}" category. The score reflects on-chain reputation based on reviews, vouches, and trust signals.`,
    recommendation: 'Review the available metrics and consider the credibility score before proceeding with any transaction.',
  };
}

// Main function to analyze wallet OR contract with Claude AI
export async function analyzeWallet(data: AnalysisInput): Promise<VibeAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isContract = data.contractInfo?.isContract ?? false;
  
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set, using fallback analysis');
    return getFallbackAnalysis(data.score, isContract);
  }

  try {
    // Choose appropriate prompt based on contract vs wallet
    const systemPrompt = isContract ? CONTRACT_SYSTEM_PROMPT : WALLET_SYSTEM_PROMPT;
    const userPrompt = isContract ? buildContractPrompt(data) : buildWalletPrompt(data);

    console.log('[claude] Analyzing as:', isContract ? 'CONTRACT' : 'WALLET');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return getFallbackAnalysis(data.score, isContract);
    }

    const responseData = await response.json();
    
    const textContent = responseData.content?.find((block: any) => block.type === 'text');
    if (!textContent?.text) {
      console.error('No text content in Claude response');
      return getFallbackAnalysis(data.score, isContract);
    }

    return parseAnalysisResponse(textContent.text, data.score, isContract);
    
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return getFallbackAnalysis(data.score, isContract);
  }
}
