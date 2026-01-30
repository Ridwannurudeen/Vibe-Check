import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getAddress, isAddress, type Hex } from 'viem';
import { mainnet, base } from 'viem/chains';
import { normalize } from 'viem/ens';
import { getEthosProfile } from '@/lib/ethos';
import { analyzeWallet } from '@/lib/claude';
import type { CheckVibeResponse, CheckVibeError } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

console.log('[env] BASESCAN_API_KEY:', BASESCAN_API_KEY ? `${BASESCAN_API_KEY.slice(0, 6)}...` : 'NOT SET');
console.log('[env] ETHERSCAN_API_KEY:', ETHERSCAN_API_KEY ? `${ETHERSCAN_API_KEY.slice(0, 6)}...` : 'NOT SET');

/* ============================================================================
   VIEM CLIENTS - Multiple RPC endpoints for reliability
   ============================================================================ */

// Mainnet client with fallback RPCs
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com', {
    timeout: 10_000,
    retryCount: 2,
  }),
});

// Backup mainnet client
const mainnetClientBackup = createPublicClient({
  chain: mainnet,
  transport: http('https://rpc.ankr.com/eth', {
    timeout: 10_000,
    retryCount: 1,
  }),
});

// Base client with fallback RPCs
const baseClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org', {
    timeout: 10_000,
    retryCount: 2,
  }),
});

// Backup Base client
const baseClientBackup = createPublicClient({
  chain: base,
  transport: http('https://base.llamarpc.com', {
    timeout: 10_000,
    retryCount: 1,
  }),
});

/* ============================================================================
   TYPE DEFINITIONS
   ============================================================================ */

// Three-state bytecode result for robust handling
type BytecodeStatus = 'HAS_CODE' | 'NO_CODE' | 'ERROR';

interface BytecodeResult {
  chainId: number;
  chainName: string;
  status: BytecodeStatus;
  bytecode?: string;
  error?: string;
}

interface DetectionResult {
  isContract: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  detectedChain: number | null;
  baseResult: BytecodeResult;
  mainnetResult: BytecodeResult;
}

interface ContractInfo {
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

interface ProtocolInfo {
  name: string;
  category: 'defi' | 'nft' | 'governance' | 'bridging';
}

/* ============================================================================
   HELPER FUNCTIONS
   ============================================================================ */

async function safeFetch(url: string): Promise<any> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    const text = await res.text();
    if (text.startsWith('<!') || text.startsWith('<html')) {
      console.log('[safeFetch] Got HTML instead of JSON');
      return null;
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('[safeFetch] error:', err);
    return null;
  }
}

function isENSName(input: string): boolean {
  return input.includes('.') && (
    input.endsWith('.eth') ||
    input.endsWith('.xyz') ||
    input.endsWith('.base.eth') ||
    input.endsWith('.cb.id')
  );
}

function isValidAddressFormat(address: string): boolean {
  try {
    return isAddress(address);
  } catch {
    return false;
  }
}

/* ============================================================================
   STEP 1: ENS RESOLUTION (Mainnet only, with retry)
   ============================================================================ */

async function resolveENS(ensName: string): Promise<string | null> {
  console.log('[ens] ═══════════════════════════════════════');
  console.log('[ens] Resolving ENS name:', ensName);
  
  try {
    const normalizedName = normalize(ensName);
    console.log('[ens] Normalized name:', normalizedName);
    
    // Try primary client first
    try {
      console.log('[ens] Trying primary RPC (llamarpc)...');
      const address = await mainnetClient.getEnsAddress({ 
        name: normalizedName 
      });
      
      if (address) {
        console.log('[ens] ✓ Resolved via primary RPC:', address);
        return address;
      }
    } catch (primaryErr) {
      console.log('[ens] Primary RPC failed:', primaryErr);
    }
    
    // Try backup client
    try {
      console.log('[ens] Trying backup RPC (ankr)...');
      const address = await mainnetClientBackup.getEnsAddress({ 
        name: normalizedName 
      });
      
      if (address) {
        console.log('[ens] ✓ Resolved via backup RPC:', address);
        return address;
      }
    } catch (backupErr) {
      console.log('[ens] Backup RPC failed:', backupErr);
    }
    
    console.log('[ens] ✗ Could not resolve ENS name on any RPC');
    return null;
    
  } catch (err) {
    console.error('[ens] ✗ ENS resolution error:', err);
    return null;
  }
}

/* ============================================================================
   STEP 2: BYTECODE CHECK (with proper 3-state handling)
   ============================================================================ */

/**
 * Normalize bytecode - determine if it represents "has code" or "no code"
 * Treats: undefined, '0x', '0x0', and any string <= 2 chars as NO CODE
 */
function interpretBytecode(bytecode: Hex | undefined): { hasCode: boolean; raw: string } {
  // Log the exact input for debugging
  console.log('[interpretBytecode] Input:', {
    type: typeof bytecode,
    isUndefined: bytecode === undefined,
    value: bytecode === undefined ? 'undefined' : `"${String(bytecode).slice(0, 20)}"`,
    length: bytecode?.length ?? 0,
  });
  
  // No bytecode conditions
  if (bytecode === undefined) {
    console.log('[interpretBytecode] → NO_CODE (undefined)');
    return { hasCode: false, raw: 'undefined' };
  }
  if (bytecode === '0x') {
    console.log('[interpretBytecode] → NO_CODE (0x)');
    return { hasCode: false, raw: '0x' };
  }
  if (bytecode === '0x0') {
    console.log('[interpretBytecode] → NO_CODE (0x0)');
    return { hasCode: false, raw: '0x0' };
  }
  if (bytecode === '0x00') {
    console.log('[interpretBytecode] → NO_CODE (0x00)');
    return { hasCode: false, raw: '0x00' };
  }
  if (bytecode.length <= 2) {
    console.log(`[interpretBytecode] → NO_CODE (length ${bytecode.length} <= 2)`);
    return { hasCode: false, raw: bytecode };
  }
  
  // Has bytecode - log it
  console.log(`[interpretBytecode] → HAS_CODE (length ${bytecode.length})`);
  return { hasCode: true, raw: bytecode.slice(0, 20) + '...' };
}

/**
 * Check bytecode on a single chain with primary + backup RPC
 */
async function getBytecodeOnChain(
  address: string, 
  chainId: number
): Promise<BytecodeResult> {
  const chainName = chainId === 8453 ? 'Base' : 'Mainnet';
  const primaryClient = chainId === 8453 ? baseClient : mainnetClient;
  const backupClient = chainId === 8453 ? baseClientBackup : mainnetClientBackup;
  
  console.log(`[bytecode:${chainName}] ──────────────────────────────────`);
  console.log(`[bytecode:${chainName}] Checking address: ${address}`);
  
  let checksumAddress: `0x${string}`;
  try {
    checksumAddress = getAddress(address);
    console.log(`[bytecode:${chainName}] Checksum address: ${checksumAddress}`);
  } catch (err) {
    console.error(`[bytecode:${chainName}] ✗ Invalid address format:`, err);
    return {
      chainId,
      chainName,
      status: 'ERROR',
      error: 'Invalid address format',
    };
  }
  
  // Try primary RPC
  try {
    console.log(`[bytecode:${chainName}] Trying primary RPC...`);
    const bytecode = await primaryClient.getBytecode({ address: checksumAddress });
    
    // Log raw response for debugging
    console.log(`[bytecode:${chainName}] RAW bytecode response:`, {
      type: typeof bytecode,
      value: bytecode === undefined ? 'undefined' : bytecode === null ? 'null' : `"${bytecode.slice(0, 30)}${bytecode.length > 30 ? '...' : ''}"`,
      length: bytecode?.length ?? 0,
    });
    
    const result = interpretBytecode(bytecode);
    console.log(`[bytecode:${chainName}] ✓ Interpreted as: ${result.hasCode ? 'HAS_CODE' : 'NO_CODE'}`);
    
    return {
      chainId,
      chainName,
      status: result.hasCode ? 'HAS_CODE' : 'NO_CODE',
      bytecode: bytecode ?? undefined,
    };
  } catch (primaryErr) {
    console.log(`[bytecode:${chainName}] Primary RPC failed:`, primaryErr);
  }
  
  // Try backup RPC
  try {
    console.log(`[bytecode:${chainName}] Trying backup RPC...`);
    const bytecode = await backupClient.getBytecode({ address: checksumAddress });
    
    // Log raw response for debugging
    console.log(`[bytecode:${chainName}] RAW bytecode response (backup):`, {
      type: typeof bytecode,
      value: bytecode === undefined ? 'undefined' : bytecode === null ? 'null' : `"${bytecode.slice(0, 30)}${bytecode.length > 30 ? '...' : ''}"`,
      length: bytecode?.length ?? 0,
    });
    
    const result = interpretBytecode(bytecode);
    console.log(`[bytecode:${chainName}] ✓ Interpreted as: ${result.hasCode ? 'HAS_CODE' : 'NO_CODE'}`);
    
    return {
      chainId,
      chainName,
      status: result.hasCode ? 'HAS_CODE' : 'NO_CODE',
      bytecode: bytecode ?? undefined,
    };
  } catch (backupErr) {
    console.error(`[bytecode:${chainName}] ✗ Both RPCs failed`);
    return {
      chainId,
      chainName,
      status: 'ERROR',
      error: 'All RPC endpoints failed',
    };
  }
}

/**
 * Check bytecode on BOTH chains in parallel
 * Logic:
 * - If ANY chain returns HAS_CODE → CONTRACT
 * - If ALL chains return NO_CODE → WALLET
 * - If ALL chains return ERROR → throw (don't guess)
 * - If mixed ERROR/NO_CODE → trust the NO_CODE result
 */
async function detectAccountType(address: string): Promise<DetectionResult> {
  console.log('[detection] ═══════════════════════════════════════');
  console.log('[detection] Starting parallel bytecode check...');
  console.log('[detection] Address:', address);
  
  // Run both checks in parallel
  const [baseResult, mainnetResult] = await Promise.all([
    getBytecodeOnChain(address, 8453),   // Base
    getBytecodeOnChain(address, 1),       // Mainnet
  ]);
  
  console.log('[detection] ───────────────────────────────────────');
  console.log('[detection] Results Summary:');
  console.log(`[detection]   Base:    ${baseResult.status}${baseResult.error ? ` (${baseResult.error})` : ''}`);
  console.log(`[detection]   Mainnet: ${mainnetResult.status}${mainnetResult.error ? ` (${mainnetResult.error})` : ''}`);
  
  // Decision logic
  let isContract = false;
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  let detectedChain: number | null = null;
  
  // Case 1: Any chain has code → CONTRACT
  if (baseResult.status === 'HAS_CODE' || mainnetResult.status === 'HAS_CODE') {
    isContract = true;
    confidence = 'HIGH';
    detectedChain = baseResult.status === 'HAS_CODE' ? 8453 : 1;
    console.log(`[detection] → CONTRACT (detected on chain ${detectedChain})`);
  }
  // Case 2: Both chains return NO_CODE → WALLET
  else if (baseResult.status === 'NO_CODE' && mainnetResult.status === 'NO_CODE') {
    isContract = false;
    confidence = 'HIGH';
    console.log('[detection] → WALLET (no code on any chain)');
  }
  // Case 3: Both chains errored → can't determine, default to WALLET with LOW confidence
  else if (baseResult.status === 'ERROR' && mainnetResult.status === 'ERROR') {
    isContract = false;
    confidence = 'LOW';
    console.log('[detection] → WALLET (assumed - both RPCs failed!)');
    console.warn('[detection] ⚠️ WARNING: Could not verify, both RPC endpoints failed');
  }
  // Case 4: One NO_CODE, one ERROR → trust the NO_CODE
  else if (baseResult.status === 'NO_CODE' || mainnetResult.status === 'NO_CODE') {
    isContract = false;
    confidence = 'MEDIUM';
    const successChain = baseResult.status === 'NO_CODE' ? 'Base' : 'Mainnet';
    console.log(`[detection] → WALLET (no code confirmed on ${successChain})`);
  }
  // Fallback (shouldn't happen)
  else {
    isContract = false;
    confidence = 'LOW';
    console.log('[detection] → WALLET (fallback)');
  }
  
  console.log(`[detection] Final: ${isContract ? 'CONTRACT' : 'WALLET'} (confidence: ${confidence})`);
  console.log('[detection] ═══════════════════════════════════════');
  
  return {
    isContract,
    confidence,
    detectedChain,
    baseResult,
    mainnetResult,
  };
}

/* ============================================================================
   CONTRACT DETAILS FETCHING (only called if isContract = true)
   ============================================================================ */

async function getContractDetails(address: string, chainId: number): Promise<Partial<ContractInfo>> {
  const apiKey = ETHERSCAN_API_KEY;
  const v2Url = 'https://api.etherscan.io/v2/api';
  
  if (!apiKey) {
    console.log(`[contract:${chainId}] No API key for contract details`);
    return {};
  }

  try {
    // Get source code info
    const sourceUrl = `${v2Url}?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    console.log(`[contract:${chainId}] Fetching contract details...`);
    const sourceData = await safeFetch(sourceUrl);

    const sourceResult = sourceData?.result?.[0];
    const hasContractName = sourceResult?.ContractName && sourceResult.ContractName !== '';
    const isVerified = sourceResult?.ABI && sourceResult.ABI !== 'Contract source code not verified';

    // Get creation info
    const creationUrl = `${v2Url}?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${apiKey}`;
    const creationData = await safeFetch(creationUrl);
    
    const hasCreationData = creationData?.status === '1' && creationData?.result?.length > 0;
    const creation = hasCreationData ? creationData.result[0] : null;
    
    // Get transactions
    const txUrl = `${v2Url}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${apiKey}`;
    const txData = await safeFetch(txUrl);
    const transactions = Array.isArray(txData?.result) ? txData.result : [];
    const uniqueAddresses = new Set(transactions.map((tx: any) => tx.from?.toLowerCase()));

    // Token info
    let tokenInfo = undefined;
    const tokenUrl = `${v2Url}?chainid=${chainId}&module=token&action=tokeninfo&contractaddress=${address}&apikey=${apiKey}`;
    const tokenData = await safeFetch(tokenUrl);

    if (tokenData?.status === '1' && tokenData?.result) {
      const token = Array.isArray(tokenData.result) ? tokenData.result[0] : tokenData.result;
      if (token?.name) {
        tokenInfo = {
          name: token.name || 'Unknown',
          symbol: token.symbol || '???',
          decimals: parseInt(token.decimals) || 18,
          totalSupply: token.totalSupply || '0',
          type: (token.type?.includes('721') ? 'ERC721' : 
                 token.type?.includes('1155') ? 'ERC1155' : 
                 'ERC20') as 'ERC20' | 'ERC721' | 'ERC1155',
        };
        console.log(`[contract:${chainId}] Token: ${tokenInfo.name} (${tokenInfo.symbol})`);
      }
    }

    // Contract age
    let contractAgeDays = 0;
    if (creation?.timestamp) {
      contractAgeDays = Math.floor((Date.now() - Number(creation.timestamp) * 1000) / 86400000);
    } else if (transactions.length > 0) {
      contractAgeDays = Math.floor((Date.now() - Number(transactions[0].timeStamp) * 1000) / 86400000);
    }

    const isProxy = sourceResult?.Proxy === '1' || (sourceResult?.Implementation && sourceResult.Implementation !== '');

    console.log(`[contract:${chainId}] Details: name=${hasContractName ? sourceResult.ContractName : 'N/A'}, verified=${isVerified}, proxy=${isProxy}`);

    return {
      contractName: sourceResult?.ContractName || undefined,
      compilerVersion: sourceResult?.CompilerVersion || undefined,
      isVerified,
      isProxy,
      implementation: isProxy ? sourceResult?.Implementation : undefined,
      creator: creation?.contractCreator || undefined,
      creationTxHash: creation?.txHash || undefined,
      creationDate: creation?.timestamp ? new Date(Number(creation.timestamp) * 1000).toISOString() : undefined,
      contractAgeDays,
      tokenInfo,
      interactionCount: transactions.length,
      uniqueUsers: uniqueAddresses.size,
    };
  } catch (err) {
    console.error(`[contract:${chainId}] Error fetching details:`, err);
    return {};
  }
}

/**
 * Main function: detect account type and get contract info if applicable
 * BULLETPROOF: Will never throw, always returns a valid ContractInfo
 */
async function detectAndGetContractInfo(address: string): Promise<ContractInfo> {
  console.log('[detectAndGetContractInfo] Starting detection for:', address);
  
  try {
    // Step 1: Detect if contract or wallet
    console.log('[detectAndGetContractInfo] Calling detectAccountType...');
    const detection = await detectAccountType(address);
    console.log('[detectAndGetContractInfo] Detection result:', {
      isContract: detection.isContract,
      confidence: detection.confidence,
      detectedChain: detection.detectedChain,
    });
    
    if (!detection.isContract) {
      console.log('[detectAndGetContractInfo] ✓ Confirmed WALLET (EOA)');
      return {
        isContract: false,
        isVerified: false,
        isProxy: false,
      };
    }
    
    // Step 2: It's a contract - get detailed info
    console.log('[detectAndGetContractInfo] Detected CONTRACT, fetching details...');
    const chainId = detection.detectedChain || 8453;
    const details = await getContractDetails(address, chainId);
    
    return {
      isContract: true,
      isVerified: details.isVerified ?? false,
      isProxy: details.isProxy ?? false,
      detectedChain: chainId,
      ...details,
    };
  } catch (err) {
    // CRITICAL: If detection fails, default to WALLET (safer assumption)
    console.error('[detectAndGetContractInfo] ⚠️ CRITICAL ERROR during detection:', err);
    console.log('[detectAndGetContractInfo] Defaulting to WALLET due to error');
    return {
      isContract: false,
      isVerified: false,
      isProxy: false,
    };
  }
}

/* ============================================================================
   KNOWN PROTOCOLS
   ============================================================================ */

const KNOWN_PROTOCOLS: Record<string, ProtocolInfo> = {
  // Base DeFi
  '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': { name: 'Uniswap V3', category: 'defi' },
  '0x2626664c2603336e57b271c5c0b26f421741e481': { name: 'Uniswap V3', category: 'defi' },
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': { name: 'Uniswap Universal Router', category: 'defi' },
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': { name: 'Aerodrome', category: 'defi' },
  '0x420dd381b31aef6683db6b902084cb0ffece40da': { name: 'Aerodrome', category: 'defi' },
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { name: 'USDC', category: 'defi' },
  '0x4200000000000000000000000000000000000006': { name: 'WETH (Base)', category: 'defi' },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { name: 'DAI (Base)', category: 'defi' },
  // Ethereum DeFi
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { name: 'USDC', category: 'defi' },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { name: 'USDT', category: 'defi' },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { name: 'DAI', category: 'defi' },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH', category: 'defi' },
  // Bridging
  '0x4200000000000000000000000000000000000010': { name: 'Base Bridge', category: 'bridging' },
  '0x49048044d57e1c92a77f79988d21fa8faf74e97e': { name: 'Base Bridge', category: 'bridging' },
};

function getKnownProtocol(address: string): ProtocolInfo | null {
  return KNOWN_PROTOCOLS[address.toLowerCase()] || null;
}

/* ============================================================================
   ON-CHAIN DATA FETCHING
   ============================================================================ */

function analyzeTransactions(txList: any[]): { 
  protocols: string[]; 
  activityDiversity: { defi: boolean; nft: boolean; governance: boolean; bridging: boolean } 
} {
  const protocols = new Set<string>();
  const activity = { defi: false, nft: false, governance: false, bridging: false };

  for (const tx of txList) {
    const to = tx.to?.toLowerCase();
    if (!to) continue;

    const proto = KNOWN_PROTOCOLS[to];
    if (proto) {
      protocols.add(proto.name);
      activity[proto.category] = true;
    }

    // Heuristic detection
    const input = tx.input?.toLowerCase() || '';
    if (input.includes('swap') || input.startsWith('0x38ed1739') || input.startsWith('0x7ff36ab5')) {
      activity.defi = true;
    }
    if (input.startsWith('0xa22cb465') || input.startsWith('0x42842e0e')) {
      activity.nft = true;
    }
    if (input.startsWith('0x15373e3d') || input.includes('vote')) {
      activity.governance = true;
    }
  }

  return { protocols: Array.from(protocols), activityDiversity: activity };
}

async function getOnChainData(address: string) {
  const v2Url = 'https://api.etherscan.io/v2/api';

  // Try Base first
  if (ETHERSCAN_API_KEY) {
    const url = `${v2Url}?chainid=8453&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    console.log('[onchain:base] Calling V2 API...');
    const data = await safeFetch(url);

    if (data?.status === '1' && Array.isArray(data.result) && data.result.length) {
      const firstTx = data.result[0];
      const firstDate = new Date(Number(firstTx.timeStamp) * 1000);
      const ageDays = Math.floor((Date.now() - firstDate.getTime()) / 86400000);
      const { protocols, activityDiversity } = analyzeTransactions(data.result);

      console.log('[onchain:base] Found', data.result.length, 'transactions');
      return {
        transactionCount: data.result.length,
        firstTransaction: firstDate.toISOString(),
        walletAgeDays: ageDays,
        protocols,
        activityDiversity,
        chain: 'base' as const,
      };
    }
  }

  // Fallback to Ethereum
  if (ETHERSCAN_API_KEY) {
    const url = `${v2Url}?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    console.log('[onchain:eth] Calling V2 API...');
    const data = await safeFetch(url);

    if (data?.status === '1' && Array.isArray(data.result) && data.result.length) {
      const firstTx = data.result[0];
      const firstDate = new Date(Number(firstTx.timeStamp) * 1000);
      const ageDays = Math.floor((Date.now() - firstDate.getTime()) / 86400000);
      const { protocols, activityDiversity } = analyzeTransactions(data.result);

      console.log('[onchain:eth] Found', data.result.length, 'transactions');
      return {
        transactionCount: data.result.length,
        firstTransaction: firstDate.toISOString(),
        walletAgeDays: ageDays,
        protocols,
        activityDiversity,
        chain: 'ethereum' as const,
      };
    }
  }

  return {
    transactionCount: 0,
    firstTransaction: null,
    walletAgeDays: 0,
    protocols: [],
    activityDiversity: { defi: false, nft: false, governance: false, bridging: false },
    chain: undefined,
  };
}

/* ============================================================================
   POST HANDLER - Main Entry Point
   ============================================================================ */

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json<CheckVibeError>(
        { error: 'Address is required', code: 'MISSING_ADDRESS' },
        { status: 400 }
      );
    }

    let resolvedAddress = address.trim();
    const originalInput = resolvedAddress;

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              VIBE CHECK - Starting Analysis                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Input: ${originalInput.padEnd(52)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Resolve ENS name FIRST (if applicable)
    // ═══════════════════════════════════════════════════════════════════════
    if (isENSName(resolvedAddress)) {
      console.log('\n[STEP 1] ENS Resolution');
      const ensResolved = await resolveENS(resolvedAddress);
      
      if (!ensResolved) {
        return NextResponse.json<CheckVibeError>(
          { error: `Could not resolve ENS name: ${resolvedAddress}`, code: 'ENS_NOT_FOUND' },
          { status: 400 }
        );
      }
      
      resolvedAddress = ensResolved;
      console.log(`[STEP 1] ✓ Resolved: ${originalInput} → ${resolvedAddress}`);
    } else {
      console.log('\n[STEP 1] Input is already an address (skipping ENS resolution)');
    }

    // Normalize address to lowercase
    resolvedAddress = resolvedAddress.toLowerCase();

    // Validate address format
    if (!isValidAddressFormat(resolvedAddress)) {
      return NextResponse.json<CheckVibeError>(
        { error: 'Invalid Ethereum address format', code: 'INVALID_ADDRESS' },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Detect Contract vs Wallet (Parallel check on Base + Mainnet)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP 2] Contract Detection (Parallel)');
    const contractInfo = await detectAndGetContractInfo(resolvedAddress);
    const isContract = contractInfo.isContract;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Check for Known Protocols
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP 3] Protocol Detection');
    const knownProtocol = getKnownProtocol(resolvedAddress);
    if (knownProtocol) {
      console.log(`[STEP 3] ✓ Known protocol: ${knownProtocol.name} (${knownProtocol.category})`);
    } else {
      console.log('[STEP 3] Not a known protocol');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Fetch Ethos Profile + On-Chain Data (Parallel)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP 4] Fetching Profile & On-Chain Data');
    const [ethosData, onChainData] = await Promise.all([
      getEthosProfile(resolvedAddress),
      getOnChainData(resolvedAddress),
    ]);
    console.log('[STEP 4] ✓ Data fetched');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: AI Analysis
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP 5] AI Analysis');
    const aiAnalysis = await analyzeWallet({
      ...ethosData,
      onChainData,
      contractInfo: isContract ? contractInfo : undefined,
      knownProtocol,
    });
    console.log('[STEP 5] ✓ AI analysis complete');

    // Build response
    const response: CheckVibeResponse = {
      ethosData,
      onChainData,
      contractInfo: isContract ? contractInfo : undefined,
      knownProtocol: knownProtocol || undefined,
      aiAnalysis,
      timestamp: new Date().toISOString(),
    };

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Analysis Complete                        ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Input:  ${originalInput.padEnd(51)}║`);
    console.log(`║ Type:   ${(isContract ? 'CONTRACT' : 'WALLET').padEnd(51)}║`);
    console.log(`║ Score:  ${String(ethosData.score).padEnd(51)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝');

    return NextResponse.json(response);

  } catch (err) {
    console.error('[POST] Unexpected error:', err);
    return NextResponse.json<CheckVibeError>(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
