# @vibe-check/sdk

TypeScript SDK for the Vibe Check reputation API.

## Install

```bash
npm install @vibe-check/sdk
```

## Usage

```typescript
import { VibeCheck } from '@vibe-check/sdk';

const client = new VibeCheck({ apiKey: 'your-key' });

// Get reputation
const rep = await client.getReputation('vitalik.eth');
console.log(rep.ethosData.score); // 2100

// Get history
const history = await client.getHistory('0x...');

// Compare wallets
const comparison = await client.compare('vitalik.eth', 'paradigm.eth');
```

## Options

- `baseUrl` - API base URL (default: `https://vibecheck.base.org`)
- `apiKey` - API key for higher rate limits
- `timeout` - Request timeout in ms (default: 30000)
