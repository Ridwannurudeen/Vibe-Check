/**
 * One-time script to register the Vibe Check attestation schema on Base.
 *
 * Prerequisites:
 *   - PRIVATE_KEY env var set (wallet with ETH on Base for gas)
 *
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/register-eas-schema.mjs
 *
 * After running, copy the SCHEMA_UID and set it as:
 *   NEXT_PUBLIC_EAS_SCHEMA_UID=0x... in your Vercel env vars
 */

import { ethers } from 'ethers';

const BASE_RPC = 'https://mainnet.base.org';
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020';
const SCHEMA_STRING = 'address target, uint256 score, string tier, uint256 timestamp';

// Schema Registry ABI (only the register function we need)
const SCHEMA_REGISTRY_ABI = [
  'function register(string calldata schema, address resolver, bool revocable) external returns (bytes32)',
  'event Registered(bytes32 indexed uid, address indexed registerer)'
];

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable required');
    console.error('Usage: PRIVATE_KEY=0x... node scripts/register-eas-schema.mjs');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(BASE_RPC);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Registering schema on Base...`);
  console.log(`Wallet: ${wallet.address}`);
  console.log(`Schema: "${SCHEMA_STRING}"`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error('Error: Wallet has no ETH on Base for gas');
    process.exit(1);
  }

  const registry = new ethers.Contract(SCHEMA_REGISTRY_ADDRESS, SCHEMA_REGISTRY_ABI, wallet);

  // Register schema: no resolver, revocable
  const tx = await registry.register(
    SCHEMA_STRING,
    '0x0000000000000000000000000000000000000000', // no resolver
    true // revocable
  );

  console.log(`\nTx submitted: ${tx.hash}`);
  console.log(`Waiting for confirmation...`);

  const receipt = await tx.wait();
  console.log(`Confirmed in block ${receipt.blockNumber}`);

  // Extract schema UID from event
  const registeredEvent = receipt.logs.find(log => {
    try {
      const parsed = registry.interface.parseLog({ topics: log.topics, data: log.data });
      return parsed?.name === 'Registered';
    } catch {
      return false;
    }
  });

  if (registeredEvent) {
    const parsed = registry.interface.parseLog({
      topics: registeredEvent.topics,
      data: registeredEvent.data
    });
    const schemaUid = parsed.args[0];
    console.log(`\n========================================`);
    console.log(`SCHEMA_UID: ${schemaUid}`);
    console.log(`========================================`);
    console.log(`\nAdd to Vercel env vars:`);
    console.log(`  NEXT_PUBLIC_EAS_SCHEMA_UID=${schemaUid}`);
    console.log(`\nView on EASScan:`);
    console.log(`  https://base.easscan.org/schema/view/${schemaUid}`);
  } else {
    // Fallback: compute UID from schema params
    console.log('\nCould not extract UID from event. Check tx on BaseScan:');
    console.log(`  https://basescan.org/tx/${tx.hash}`);
  }
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
