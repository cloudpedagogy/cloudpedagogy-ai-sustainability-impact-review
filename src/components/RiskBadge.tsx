import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getRiskLabelAndColor } from '../utils/scoring';

interface RiskBadgeProps {
  score: number | null;
  isComplete?: boolean;
  className?: string;
}

export function RiskBadge({ score, isComplete = true, className }: RiskBadgeProps) {
  const { label, color } = getRiskLabelAndColor(score, isComplete);

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
          color,
          className
        )
      )}
    >
      {score !== null && score > 0 ? (
        <span>
          <strong className="font-semibold">{score.toFixed(1)}</strong>
          <span className="mx-1.5 opacity-60">|</span>
          <span>{label}</span>
        </span>
      ) : (
        label
      )}
    </span>
  );
}
