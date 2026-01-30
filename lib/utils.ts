import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ScoreLevel, ScoreLevelConfig, AttestationBadge } from '@/types';

// Tailwind class merger utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Validate Ethereum address format
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Score level thresholds (Ethos uses 0-2800 scale)
export const SCORE_LEVELS: ScoreLevelConfig[] = [
  { level: 'Excellent', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', min: 2000, max: 2800 },
  { level: 'Good', color: '#0052FF', bg: 'rgba(0, 82, 255, 0.15)', min: 1600, max: 1999 },
  { level: 'Neutral', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', min: 1200, max: 1599 },
  { level: 'Questionable', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', min: 800, max: 1199 },
  { level: 'Risky', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', min: 0, max: 799 },
];

// Get score level configuration based on score
export function getScoreLevel(score: number): ScoreLevelConfig {
  for (const level of SCORE_LEVELS) {
    if (score >= level.min && score <= level.max) {
      return level;
    }
  }
  // Default to Risky if score is out of range
  return SCORE_LEVELS[SCORE_LEVELS.length - 1];
}

// Format Wei to ETH string
export function formatWei(wei: number | bigint): string {
  const eth = Number(wei) / 1e18;
  if (eth === 0) return '0 ETH';
  if (eth < 0.001) return '<0.001 ETH';
  return `${eth.toFixed(3)} ETH`;
}

// Format large numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Get attestation badges from userkeys
export function getAttestationBadges(userkeys: string[]): AttestationBadge[] {
  if (!userkeys || userkeys.length === 0) return [];
  
  const badges: AttestationBadge[] = [];
  
  if (userkeys.some(k => k.includes('x.com'))) {
    badges.push({ label: 'X Verified', type: 'positive' });
  }
  if (userkeys.some(k => k.includes('farcaster'))) {
    badges.push({ label: 'Farcaster', type: 'positive' });
  }
  if (userkeys.some(k => k.includes('discord'))) {
    badges.push({ label: 'Discord', type: 'neutral' });
  }
  if (userkeys.some(k => k.includes('telegram'))) {
    badges.push({ label: 'Telegram', type: 'neutral' });
  }
  
  return badges;
}

// Truncate address for display
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Delay utility for animations
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
