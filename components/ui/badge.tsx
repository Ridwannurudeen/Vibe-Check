import { cn } from '@/lib/utils';
import type { BadgeProps } from '@/types';

const badgeStyles = {
  positive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  neutral: 'bg-base-blue/20 text-base-blue border-base-blue/30',
  negative: 'bg-red-500/20 text-red-400 border-red-500/30',
  default: 'bg-base-blue/20 text-base-blue border-base-blue/30',
  base: 'bg-base-blue/20 text-base-blue border-base-blue/30',
};

export function Badge({ label, type = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        badgeStyles[type]
      )}
    >
      {label}
    </span>
  );
}
