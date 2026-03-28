'use client';

import { useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { base } from 'viem/chains';
import {
  EAS_CONTRACT_ADDRESS,
  SCHEMA_UID,
  encodeAttestationData,
  getEASScanUrl,
} from '@/lib/eas';

// Minimal EAS ABI for the attest function
const EAS_ABI = [
  {
    name: 'attest',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'request',
        type: 'tuple',
        components: [
          { name: 'schema', type: 'bytes32' },
          {
            name: 'data',
            type: 'tuple',
            components: [
              { name: 'recipient', type: 'address' },
              { name: 'expirationTime', type: 'uint64' },
              { name: 'revocable', type: 'bool' },
              { name: 'refUID', type: 'bytes32' },
              { name: 'data', type: 'bytes' },
              { name: 'value', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const;

type AttestState = 'idle' | 'switching' | 'attesting' | 'success' | 'error';

interface AttestButtonProps {
  targetAddress: string;
  score: number;
  tier: string;
}

export function AttestButton({ targetAddress, score, tier }: AttestButtonProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<AttestState>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOnBase = chainId === base.id;

  const handleSwitchChain = async () => {
    setState('switching');
    try {
      await switchChainAsync({ chainId: base.id });
      setState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch chain');
      setState('error');
    }
  };

  const handleAttest = async () => {
    if (!walletClient) return;
    setState('attesting');
    setError(null);
    try {
      const encodedData = encodeAttestationData(targetAddress, score, tier);

      const hash = await walletClient.writeContract({
        address: EAS_CONTRACT_ADDRESS as `0x${string}`,
        abi: EAS_ABI,
        functionName: 'attest',
        args: [
          {
            schema: SCHEMA_UID as `0x${string}`,
            data: {
              recipient: targetAddress as `0x${string}`,
              expirationTime: BigInt(0),
              revocable: true,
              refUID: ('0x' + '0'.repeat(64)) as `0x${string}`,
              data: encodedData as `0x${string}`,
              value: BigInt(0),
            },
          },
        ],
      });

      setTxHash(hash);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attestation failed');
      setState('error');
    }
  };

  const handleRetry = () => {
    setState('idle');
    setError(null);
    setTxHash(null);
  };

  // Success state
  if (state === 'success' && txHash) {
    return (
      <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-green-500/30 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-400">
              Attestation Created!
            </h3>
            <p className="text-xs text-gray-400">
              On-chain reputation recorded on Base
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-900/60 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-base-blue hover:text-base-blue-light transition-colors break-all"
            >
              {txHash}
            </a>
          </div>

          <div className="flex gap-3">
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-base-blue/20 hover:bg-base-blue/30 rounded-xl text-sm font-medium text-base-blue transition-all border border-base-blue/30 hover:border-base-blue/50"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View on BaseScan
            </a>
            <a
              href={getEASScanUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-sm font-medium text-purple-300 transition-all border border-purple-500/30 hover:border-purple-500/50"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              View on EASScan
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="bg-gray-900/40 rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-400">
                On-Chain Attestation
              </p>
              <p className="text-xs text-gray-600">
                Connect wallet to attest this reputation on Base
              </p>
            </div>
          </div>
          <button
            disabled
            className="px-5 py-2.5 bg-gray-800 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed border border-white/5"
          >
            Connect Wallet to Attest
          </button>
        </div>
      </div>
    );
  }

  // Wrong chain
  if (!isOnBase) {
    return (
      <div className="bg-gray-900/40 rounded-2xl p-5 border border-base-blue/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-base-blue"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-white">
                On-Chain Attestation
              </p>
              <p className="text-xs text-gray-400">
                Switch to Base to create an attestation
              </p>
            </div>
          </div>
          <button
            onClick={handleSwitchChain}
            disabled={state === 'switching'}
            className="px-5 py-2.5 bg-base-blue hover:bg-base-blue-light rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {state === 'switching' ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Switching...
              </span>
            ) : (
              'Switch to Base'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="bg-gray-900/40 rounded-2xl p-5 border border-red-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-400">
              Attestation Failed
            </p>
            <p className="text-xs text-gray-500 truncate">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-medium text-red-400 transition-colors border border-red-500/30 hover:border-red-500/50 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ready to attest (idle or attesting)
  return (
    <div className="bg-gray-900/40 rounded-2xl p-5 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-purple-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-white">
              On-Chain Attestation
            </p>
            <p className="text-xs text-gray-400">
              Record this reputation score on Base via EAS
            </p>
          </div>
        </div>
        <button
          onClick={handleAttest}
          disabled={state === 'attesting'}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-base-blue hover:from-purple-500 hover:to-base-blue-light rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {state === 'attesting' ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating Attestation...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Attest On-Chain
            </>
          )}
        </button>
      </div>
    </div>
  );
}
