import { getReputation } from '@/lib/reputation';
import { getReputationHistory } from '@/lib/history';

// Tool definitions
export const MCP_TOOLS = [
  {
    name: 'check_reputation',
    description: 'Get full reputation analysis for a wallet address or ENS name on Base/Ethereum. Returns Ethos score, on-chain data, AI analysis, sybil risk, and contract info.',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Wallet address, ENS name, or contract address' },
      },
      required: ['address'],
    },
  },
  {
    name: 'compare_wallets',
    description: 'Compare two wallet addresses side by side. Returns reputation data for both wallets.',
    inputSchema: {
      type: 'object',
      properties: {
        address_a: { type: 'string', description: 'First wallet address or ENS name' },
        address_b: { type: 'string', description: 'Second wallet address or ENS name' },
      },
      required: ['address_a', 'address_b'],
    },
  },
  {
    name: 'get_history',
    description: 'Get historical reputation score snapshots for a wallet address.',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Wallet address' },
        limit: { type: 'number', description: 'Max snapshots to return (default 100)' },
      },
      required: ['address'],
    },
  },
];

// Resource templates
export const MCP_RESOURCES = [
  {
    uriTemplate: 'reputation://{address}',
    name: 'Wallet Reputation',
    description: 'Full reputation data for a wallet address',
    mimeType: 'application/json',
  },
];

// Tool execution
export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    case 'check_reputation': {
      const result = await getReputation(args.address);
      return result;
    }
    case 'compare_wallets': {
      const [a, b] = await Promise.all([
        getReputation(args.address_a),
        getReputation(args.address_b),
      ]);
      return { wallet_a: a, wallet_b: b };
    }
    case 'get_history': {
      const history = await getReputationHistory(args.address, args.limit || 100);
      return history;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Resource reading
export async function readResource(uri: string): Promise<any> {
  const match = uri.match(/^reputation:\/\/(.+)$/);
  if (match) {
    return await getReputation(match[1]);
  }
  throw new Error(`Unknown resource URI: ${uri}`);
}

// Server info
export const MCP_SERVER_INFO = {
  name: 'vibe-check-mcp',
  version: '1.0.0',
  description: 'Vibe Check - Composable reputation infrastructure for Base',
};
