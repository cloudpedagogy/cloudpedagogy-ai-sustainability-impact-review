import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function getRiskLabelAndColor(score: number) {
  if (score === 0) return { label: 'Not Assessed', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  if (score <= 1.8) return { label: 'Sustainable / Low Risk', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (score <= 2.6) return { label: 'Manageable with Monitoring', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (score <= 3.4) return { label: 'Sustainability Risks Present', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (score <= 4.2) return { label: 'Significant Sustainability Concerns', color: 'bg-orange-50 text-orange-700 border-orange-200' };
  return { label: 'Critical Sustainability Concern', color: 'bg-red-50 text-red-700 border-red-200' };
}

export function RiskBadge({ score, className }: { score: number, className?: string }) {
  const { label, color } = getRiskLabelAndColor(score);
  return (
    <span className={twMerge(clsx("px-2.5 py-0.5 rounded-full text-sm font-medium border", color, className))}>
      {score > 0 ? `${score.toFixed(1)} - ${label}` : label}
    </span>
  );
}
