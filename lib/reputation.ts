import { createPublicClient, http, fallback, getAddress, isAddress, type Hex } from 'viem';
import { mainnet, base } from 'viem/chains';
import { normalize } from 'viem/ens';
import { getEthosProfile } from '@/lib/ethos';
import { analyzeWallet } from '@/lib/claude';
import { storeReputationSnapshot } from '@/lib/history';
import { analyzeSybilRisk } from '@/lib/sybil';
import type { ReputationResult, ContractInfo, OnChainData } from '@/types';

/* ============================================================================
   VIEM CLIENTS - Multiple RPC endpoints for reliability
   ============================================================================ */

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Primary client with fallback transport for ENS resolution reliability
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://eth.drpc.org', { timeout: 15_000 }),
    http('https://cloudflare-eth.com', { timeout: 15_000 }),
    http('https://1rpc.io/eth', { timeout: 15_000 }),
    http('https://rpc.ankr.com/eth', { timeout: 15_000 }),
  ]),
});

const mainnetClientBackup = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com', {
    timeout: 15_000,
    retryCount: 1,
  }),
});

const baseClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org', {
    timeout: 10_000,
    retryCount: 2,
  }),
});

const baseClientBackup = createPublicClient({
  chain: base,
  transport: http('https://base.llamarpc.com', {
    timeout: 10_000,
    retryCount: 1,
  }),
});

/* ============================================================================
   INTERNAL TYPES
   ============================================================================ */

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
      return null;
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function isENSName(input: string): boolean {
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
   STEP 1: ENS RESOLUTION
   ============================================================================ */

async function resolveENS(ensName: string): Promise<string | null> {
  try {
    const normalizedName = normalize(ensName);

    try {
      const address = await mainnetClient.getEnsAddress({ name: normalizedName });
      if (address) return address;
    } catch {}

    try {
      const address = await mainnetClientBackup.getEnsAddress({ name: normalizedName });
      if (address) return address;
    } catch {}

    return null;
  } catch {
    return null;
  }
}

/* ============================================================================
   STEP 2: BYTECODE CHECK
   ============================================================================ */

function interpretBytecode(bytecode: Hex | undefined): { hasCode: boolean; raw: string } {
  if (bytecode === undefined) return { hasCode: false, raw: 'undefined' };
  if (bytecode === '0x') return { hasCode: false, raw: '0x' };
  if (bytecode === '0x0') return { hasCode: false, raw: '0x0' };
  if (bytecode === '0x00') return { hasCode: false, raw: '0x00' };
  if (bytecode.length <= 2) return { hasCode: false, raw: bytecode };
  // EIP-7702 delegation designator — address has delegated code but is still an EOA
  if (bytecode.toLowerCase().startsWith('0xef0100')) return { hasCode: false, raw: 'EIP-7702 delegation' };
  return { hasCode: true, raw: bytecode.slice(0, 20) + '...' };
}

async function getBytecodeOnChain(address: string, chainId: number): Promise<BytecodeResult> {
  const chainName = chainId === 8453 ? 'Base' : 'Mainnet';
  const primaryClient = chainId === 8453 ? baseClient : mainnetClient;
  const backupClient = chainId === 8453 ? baseClientBackup : mainnetClientBackup;

  let checksumAddress: `0x${string}`;
  try {
    checksumAddress = getAddress(address);
  } catch {
    return { chainId, chainName, status: 'ERROR', error: 'Invalid address format' };
  }

  try {
    const bytecode = await primaryClient.getBytecode({ address: checksumAddress });
    const result = interpretBytecode(bytecode);
    return {
      chainId,
      chainName,
      status: result.hasCode ? 'HAS_CODE' : 'NO_CODE',
      bytecode: bytecode ?? undefined,
    };
  } catch {}

  try {
    const bytecode = await backupClient.getBytecode({ address: checksumAddress });
    const result = interpretBytecode(bytecode);
    return {
      chainId,
      chainName,
      status: result.hasCode ? 'HAS_CODE' : 'NO_CODE',
      bytecode: bytecode ?? undefined,
    };
  } catch {
    return { chainId, chainName, status: 'ERROR', error: 'All RPC endpoints failed' };
  }
}

async function detectAccountType(address: string): Promise<DetectionResult> {
  const [baseResult, mainnetResult] = await Promise.all([
    getBytecodeOnChain(address, 8453),
    getBytecodeOnChain(address, 1),
  ]);

  let isContract = false;
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  let detectedChain: number | null = null;

  if (baseResult.status === 'HAS_CODE' || mainnetResult.status === 'HAS_CODE') {
    isContract = true;
    confidence = 'HIGH';
    detectedChain = baseResult.status === 'HAS_CODE' ? 8453 : 1;
  } else if (baseResult.status === 'NO_CODE' && mainnetResult.status === 'NO_CODE') {
    isContract = false;
    confidence = 'HIGH';
  } else if (baseResult.status === 'ERROR' && mainnetResult.status === 'ERROR') {
    isContract = false;
    confidence = 'LOW';
  } else if (baseResult.status === 'NO_CODE' || mainnetResult.status === 'NO_CODE') {
    isContract = false;
    confidence = 'MEDIUM';
  } else {
    isContract = false;
    confidence = 'LOW';
  }

  return { isContract, confidence, detectedChain, baseResult, mainnetResult };
}

/* ============================================================================
   CONTRACT DETAILS
   ============================================================================ */

async function getContractDetails(address: string, chainId: number): Promise<Partial<ContractInfo>> {
  const apiKey = ETHERSCAN_API_KEY;
  const v2Url = 'https://api.etherscan.io/v2/api';

  if (!apiKey) return {};

  try {
    const sourceUrl = `${v2Url}?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    const sourceData = await safeFetch(sourceUrl);
    const sourceResult = sourceData?.result?.[0];
    const isVerified = sourceResult?.ABI && sourceResult.ABI !== 'Contract source code not verified';

    const creationUrl = `${v2Url}?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${apiKey}`;
    const creationData = await safeFetch(creationUrl);
    const hasCreationData = creationData?.status === '1' && creationData?.result?.length > 0;
    const creation = hasCreationData ? creationData.result[0] : null;

    const txUrl = `${v2Url}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${apiKey}`;
    const txData = await safeFetch(txUrl);
    const transactions = Array.isArray(txData?.result) ? txData.result : [];
    const uniqueAddresses = new Set(transactions.map((tx: any) => tx.from?.toLowerCase()));

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
      }
    }

    let contractAgeDays = 0;
    if (creation?.timestamp) {
      contractAgeDays = Math.floor((Date.now() - Number(creation.timestamp) * 1000) / 86400000);
    } else if (transactions.length > 0) {
      contractAgeDays = Math.floor((Date.now() - Number(transactions[0].timeStamp) * 1000) / 86400000);
    }

    const isProxy = sourceResult?.Proxy === '1' || (sourceResult?.Implementation && sourceResult.Implementation !== '');

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
  } catch {
    return {};
  }
}

async function detectAndGetContractInfo(address: string): Promise<ContractInfo> {
  try {
    const detection = await detectAccountType(address);

    if (!detection.isContract) {
      return { isContract: false, isVerified: false, isProxy: false };
    }

    const chainId = detection.detectedChain || 8453;
    const details = await getContractDetails(address, chainId);

    // Smart account heuristic: bytecode exists but Etherscan has no contract creation
    // data and zero interactions. Real contracts always have a creation tx and at least
    // some interactions. Smart accounts (EIP-4337/7702) have bytecode but no contract
    // creation record in Etherscan.
    const hasNoContractEvidence =
      !details.creator &&
      !details.creationTxHash &&
      (details.interactionCount ?? 0) === 0 &&
      (details.uniqueUsers ?? 0) === 0;

    if (hasNoContractEvidence) {
      return { isContract: false, isVerified: false, isProxy: false };
    }

    return {
      isContract: true,
      isVerified: details.isVerified ?? false,
      isProxy: details.isProxy ?? false,
      detectedChain: chainId,
      ...details,
    };
  } catch {
    return { isContract: false, isVerified: false, isProxy: false };
  }
}

/* ============================================================================
   KNOWN PROTOCOLS
   ============================================================================ */

const KNOWN_PROTOCOLS: Record<string, ProtocolInfo> = {
  '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': { name: 'Uniswap V3', category: 'defi' },
  '0x2626664c2603336e57b271c5c0b26f421741e481': { name: 'Uniswap V3', category: 'defi' },
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': { name: 'Uniswap Universal Router', category: 'defi' },
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': { name: 'Aerodrome', category: 'defi' },
  '0x420dd381b31aef6683db6b902084cb0ffece40da': { name: 'Aerodrome', category: 'defi' },
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { name: 'USDC', category: 'defi' },
  '0x4200000000000000000000000000000000000006': { name: 'WETH (Base)', category: 'defi' },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { name: 'DAI (Base)', category: 'defi' },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { name: 'USDC', category: 'defi' },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { name: 'USDT', category: 'defi' },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { name: 'DAI', category: 'defi' },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH', category: 'defi' },
  '0x4200000000000000000000000000000000000010': { name: 'Base Bridge', category: 'bridging' },
  '0x49048044d57e1c92a77f79988d21fa8faf74e97e': { name: 'Base Bridge', category: 'bridging' },
};

function getKnownProtocol(address: string): ProtocolInfo | null {
  return KNOWN_PROTOCOLS[address.toLowerCase()] || null;
}

/* ============================================================================
   ON-CHAIN DATA
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

async function getOnChainData(address: string): Promise<OnChainData> {
  const v2Url = 'https://api.etherscan.io/v2/api';

  if (ETHERSCAN_API_KEY) {
    const url = `${v2Url}?chainid=8453&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    const data = await safeFetch(url);

    if (data?.status === '1' && Array.isArray(data.result) && data.result.length) {
      const firstTx = data.result[0];
      const firstDate = new Date(Number(firstTx.timeStamp) * 1000);
      const ageDays = Math.floor((Date.now() - firstDate.getTime()) / 86400000);
      const { protocols, activityDiversity } = analyzeTransactions(data.result);

      return {
        transactionCount: data.result.length,
        firstTransaction: firstDate.toISOString(),
        walletAgeDays: ageDays,
        protocols,
        activityDiversity,
        chain: 'base',
      };
    }
  }

  if (ETHERSCAN_API_KEY) {
    const url = `${v2Url}?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    const data = await safeFetch(url);

    if (data?.status === '1' && Array.isArray(data.result) && data.result.length) {
      const firstTx = data.result[0];
      const firstDate = new Date(Number(firstTx.timeStamp) * 1000);
      const ageDays = Math.floor((Date.now() - firstDate.getTime()) / 86400000);
      const { protocols, activityDiversity } = analyzeTransactions(data.result);

      return {
        transactionCount: data.result.length,
        firstTransaction: firstDate.toISOString(),
        walletAgeDays: ageDays,
        protocols,
        activityDiversity,
        chain: 'ethereum',
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
   BASENAME REVERSE LOOKUP
   ============================================================================ */

async function resolveBasename(address: string): Promise<string | null> {
  try {
    const name = await baseClient.getEnsName({
      address: getAddress(address) as `0x${string}`,
      universalResolverAddress: '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD',
    });
    if (name && name.endsWith('.base.eth')) {
      return name;
    }
    return null;
  } catch {
    return null;
  }
}

/* ============================================================================
   MAIN EXPORT: getReputation()
   ============================================================================ */

export async function getReputation(addressOrEns: string): Promise<ReputationResult> {
  let resolvedAddress = addressOrEns.trim();
  const originalInput = resolvedAddress;

  // Step 1: Resolve ENS
  if (isENSName(resolvedAddress)) {
    const ensResolved = await resolveENS(resolvedAddress);
    if (!ensResolved) {
      throw new Error(`Could not resolve ENS name: ${resolvedAddress}`);
    }
    resolvedAddress = ensResolved;
  }

  resolvedAddress = resolvedAddress.toLowerCase();

  if (!isValidAddressFormat(resolvedAddress)) {
    throw new Error('Invalid Ethereum address format');
  }

  // Step 2: Contract detection + Ethos + on-chain data in parallel
  const [contractInfoRaw, ethosData, onChainData] = await Promise.all([
    detectAndGetContractInfo(resolvedAddress),
    getEthosProfile(resolvedAddress),
    getOnChainData(resolvedAddress),
  ]);

  // Step 3: Known protocol
  const knownProtocol = getKnownProtocol(resolvedAddress);

  const contractInfo = contractInfoRaw;
  const isContract = contractInfo.isContract;

  // Step 4: Basename reverse lookup (non-blocking)
  const basename = await resolveBasename(resolvedAddress).catch(() => null);

  // Step 5: AI analysis
  const aiAnalysis = await analyzeWallet({
    ...ethosData,
    onChainData,
    contractInfo: isContract ? contractInfo : undefined,
    knownProtocol,
  });

  // Step 6: Sybil risk analysis
  const sybilRisk = analyzeSybilRisk({ onChainData, ethosData });

  // Fire-and-forget history storage
  storeReputationSnapshot(resolvedAddress, {
    score: ethosData.score,
    tier: aiAnalysis.oneWordSummary,
    transactionCount: onChainData.transactionCount,
    timestamp: Date.now(),
  }).catch(() => {});

  return {
    ethosData,
    onChainData,
    contractInfo: isContract ? contractInfo : undefined,
    knownProtocol: knownProtocol || undefined,
    aiAnalysis,
    sybilRisk,
    address: resolvedAddress,
    inputAddress: originalInput,
    timestamp: new Date().toISOString(),
    basename: basename ?? undefined,
  };
}
