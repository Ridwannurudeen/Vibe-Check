import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

// Base EAS contract address
export const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021';

// Schema: address target, uint256 score, string tier, uint256 timestamp
// This schema UID will be set after one-time registration on Base
// For now, use a placeholder - replace after registering
// Zero bytes32 placeholder — replace with actual schema UID after registration
const ZERO_BYTES32 = ('0x' + '0'.repeat(64)) as `0x${string}`;

export const SCHEMA_UID =
  (process.env.NEXT_PUBLIC_EAS_SCHEMA_UID as `0x${string}`) || ZERO_BYTES32;

export const SCHEMA_STRING =
  'address target, uint256 score, string tier, uint256 timestamp';

const schemaEncoder = new SchemaEncoder(SCHEMA_STRING);

export function encodeAttestationData(
  target: string,
  score: number,
  tier: string,
): string {
  const encodedData = schemaEncoder.encodeData([
    { name: 'target', value: target, type: 'address' },
    { name: 'score', value: BigInt(score), type: 'uint256' },
    { name: 'tier', value: tier, type: 'string' },
    {
      name: 'timestamp',
      value: BigInt(Math.floor(Date.now() / 1000)),
      type: 'uint256',
    },
  ]);
  return encodedData;
}

export function getEASInstance(): EAS {
  return new EAS(EAS_CONTRACT_ADDRESS);
}

export function getEASScanUrl(txHashOrUid: string): string {
  // If this is a tx hash (not an attestation UID), link to the tx page
  return `https://base.easscan.org/offchain/attestation/view/${txHashOrUid}`;
}

export function getEASScanTxUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}
