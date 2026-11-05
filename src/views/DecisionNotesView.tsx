import { useReviewStore } from '../store/useReviewStore';
import type { DecisionRecommendation } from '../config/assessmentSchema';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const RECOMMENDATIONS: DecisionRecommendation[] = [
  'Proceed',
  'Proceed with Conditions',
  'Pause and Revise',
  'Do Not Proceed Yet'
];

export function DecisionNotesView() {
  const { decisionRecommendation, decisionRationale, updateDecision } = useReviewStore();

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Sustainability Decision Notes</h2>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          Record the final institutional recommendation regarding the long-term sustainability, proportionality, and viability of this system.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-8">
        <fieldset className="space-y-3 border-0 p-0 m-0">
          <legend id="decision-recommendation-legend" className="block text-sm font-semibold text-slate-900">
            Overall Governance Recommendation
          </legend>
          <div
            role="radiogroup"
            aria-labelledby="decision-recommendation-legend"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {RECOMMENDATIONS.map((rec) => {
              const isSelected = decisionRecommendation === rec;
              const radioId = `decision-rec-${rec.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              return (
                <label
                  key={rec}
                  htmlFor={radioId}
                  className={twMerge(
                    clsx(
                      'px-4 py-3 text-left font-medium rounded-lg border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-slate-800 focus-within:ring-offset-1 text-sm flex items-center justify-between',
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      id={radioId}
                      name="decision-recommendation"
                      value={rec}
                      checked={isSelected}
                      onChange={() => updateDecision(rec, decisionRationale)}
                      className="sr-only"
                    />
                    <span>{rec}</span>
                  </div>
                  {isSelected && <span className="text-xs text-slate-300 font-normal">Active</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="decision-rationale" className="block text-sm font-semibold text-slate-900">
            Decision Rationale & Governance Conditions
          </label>
          <p className="text-xs text-slate-500">
            Provide the reasoning for this recommendation, referencing specific categories, severe concerns, or evidence limitations identified during the review.
          </p>
          <textarea
            id="decision-rationale"
            value={decisionRationale}
            onChange={(e) => updateDecision(decisionRecommendation, e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
            placeholder="Document institutional reasoning, required mitigations, conditions for deployment, or monitoring cadences..."
          />
        </div>
      </form>
    </div>
  );
}
