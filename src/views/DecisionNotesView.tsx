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
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Sustainability Decision Notes</h2>
        <p className="mt-2 text-slate-600">
          Record the final recommendation regarding the long-term sustainability and viability of this system.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-900">Overall Recommendation</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RECOMMENDATIONS.map((rec) => (
              <button
                key={rec}
                onClick={() => updateDecision(rec, decisionRationale)}
                className={twMerge(
                  clsx(
                    "px-4 py-3 text-left font-medium rounded-lg border transition-colors",
                    decisionRecommendation === rec
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )
                )}
              >
                {rec}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-900">Rationale</label>
          <p className="text-sm text-slate-500 mb-2">Provide the reasoning for this recommendation, referencing specific categories or risks identified.</p>
          <textarea
            value={decisionRationale}
            onChange={(e) => updateDecision(decisionRecommendation, e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            placeholder="Document the decision rationale here..."
          />
        </div>

      </div>
    </div>
  );
}
