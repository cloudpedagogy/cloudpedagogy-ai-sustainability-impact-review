import { useReviewStore } from '../store/useReviewStore';
import { ASSESSMENT_CATEGORIES } from '../config/assessmentSchema';
import { RiskBadge } from '../components/RiskBadge';
import { calculateOverallScore } from '../utils/scoring';
import { Printer, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export function ReviewSummaryView() {
  const { systemOverview, assessments, decisionRecommendation, decisionRationale } = useReviewStore();

  const summary = calculateOverallScore(ASSESSMENT_CATEGORIES, assessments);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-12 print:max-w-none print:w-full print:bg-white print:text-black">
      {/* Header */}
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sustainability Review Summary</h2>
          <p className="mt-1 text-slate-600">
            Comprehensive governance assessment, risk classifications, and priority mitigations.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>

      {/* Provisional vs Complete Banner */}
      {!summary.isComplete ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 flex items-start gap-3 text-amber-900">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-base">
              Provisional Assessment ({summary.completionPercentage}% Complete — {summary.unansweredQuestions} Questions Remaining)
            </div>
            <p className="text-sm mt-1 text-amber-800 leading-relaxed">
              This review is incomplete. Calculated averages are provisional descriptive indicators and must not be interpreted as a definitive Low Risk or Sustainable governance classification until all categories are fully assessed.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex items-start gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-base">Assessment Complete (100% of Questions Evaluated)</div>
            <p className="text-sm mt-1 text-emerald-800">
              All 8 assessment categories and 34 governance questions have been evaluated. Final sustainability classifications and mitigation requirements are confirmed.
            </p>
          </div>
        </div>
      )}

      {/* System Information */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300">
        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Name</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.systemName || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Review Purpose</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.reviewPurpose || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date of Review</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.reviewDate || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lifecycle Stage</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.lifecycleStage || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Owner</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.systemOwner || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Next Review Date</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.nextReviewDate || 'Not specified'}</div>
          </div>
          <div className="col-span-2 md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</div>
            <div className="text-slate-900 mt-1">{systemOverview.description || 'Not specified'}</div>
          </div>
        </div>
      </section>

      {/* Key Sustainability Metrics & Severe Concern Reporting */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessment Completion</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{summary.completionPercentage}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.answeredQuestions} of {summary.totalQuestions} questions
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {summary.average !== null ? summary.average.toFixed(1) : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Scale 1 (Best) to 5 (Worst)</div>
        </div>

        <div
          className={`p-5 rounded-xl border shadow-sm text-center ${
            summary.maxScore !== null && summary.maxScore >= 4
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Highest Concern Score</div>
          <div className="text-3xl font-extrabold mt-2">
            {summary.maxScore !== null ? `${summary.maxScore} / 5` : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.maxScore === 5
              ? 'Critical Concern'
              : summary.maxScore === 4
              ? 'Significant Concern'
              : summary.maxScore !== null
              ? 'Moderate / Low'
              : 'None recorded'}
          </div>
        </div>

        <div
          className={`p-5 rounded-xl border shadow-sm text-center ${
            summary.severeConcernCount > 0
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Severe Concerns (4–5)</div>
          <div className="text-3xl font-extrabold mt-2">{summary.severeConcernCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.severeConcernCount === 0 ? 'None identified' : 'Requires governance review'}
          </div>
        </div>
      </section>

      {/* Overall Score Card */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center print:bg-white print:border-slate-300">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Overall Sustainability Rating
        </h3>
        <div className="text-5xl font-extrabold text-slate-900 mb-4">
          {summary.average !== null ? summary.average.toFixed(1) : 'N/A'}
        </div>
        <RiskBadge
          score={summary.average}
          isComplete={summary.isComplete}
          className="text-sm px-4 py-1"
        />
        {!summary.isComplete && (
          <p className="text-xs text-amber-700 font-medium mt-3">
            * Provisional classification based on {summary.completionPercentage}% of questions.
          </p>
        )}
      </section>

      {/* Severe Concerns Visibility Callout */}
      {summary.categoriesWithSevereConcerns.length > 0 && (
        <section className="bg-red-50 rounded-xl border border-red-300 p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-900 font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
            <span>Severe Individual Concerns Identified ({summary.severeConcernCount})</span>
          </div>
          <p className="text-sm text-red-800 leading-relaxed">
            The following questions received severe concern ratings (4 or 5). Even if the overall category average is low or moderate, these individual areas represent material sustainability risks that cannot be discounted by averaging:
          </p>
          <div className="space-y-3">
            {summary.categoriesWithSevereConcerns.map((cat) => (
              <div key={cat.categoryId} className="bg-white p-4 rounded-lg border border-red-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{cat.categoryTitle}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
                    Category Average: {cat.average?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {cat.severeConcernQuestions.map((q) => (
                    <li key={q.questionId}>
                      <strong className="text-red-700">Score {q.score}/5:</strong> {q.questionText}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Decision Notes */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300">
        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Sustainability Decision</h3>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommendation</div>
            <div className="font-semibold text-slate-900 mt-1 text-lg">
              {decisionRecommendation || 'Not recorded'}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rationale</div>
            <div className="text-slate-900 mt-1 whitespace-pre-wrap bg-slate-50 p-4 rounded-md border border-slate-100 text-sm leading-relaxed">
              {decisionRationale || 'No rationale provided.'}
            </div>
          </div>
        </div>
      </section>

      {/* Category Scores */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900">Category Scores</h3>
          <span className="text-xs text-slate-500">
            {summary.categorySummaries.filter((c) => c.isComplete).length} of {summary.categorySummaries.length} categories completed
          </span>
        </div>
        <div className="space-y-3">
          {summary.categorySummaries.map((cat) => (
            <div
              key={cat.categoryId}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-900 text-sm">{cat.categoryTitle}</span>
                <span className="text-xs text-slate-500">
                  ({cat.answeredQuestions}/{cat.totalQuestions} answered)
                </span>
                {cat.hasSevereConcern && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded"
                    title="Category contains severe individual concern"
                  >
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    Severe Concern
                  </span>
                )}
              </div>
              <div>
                <RiskBadge score={cat.average} isComplete={cat.isComplete} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Priority Mitigations (Highest Risk Areas) */}
      {summary.highestRiskCategories.length > 0 && (
        <section className="bg-amber-50 rounded-xl border border-amber-300 p-8 print:bg-white print:border-slate-300">
          <h3 className="text-lg font-bold text-amber-950 mb-4 border-b border-amber-200 pb-3 print:text-black print:border-slate-300">
            Priority Mitigations (High Risk & Severe Areas)
          </h3>
          <p className="text-xs text-amber-900 mb-6 leading-relaxed">
            Categories requiring formal mitigation either exceed the acceptable risk threshold (average &gt; 2.6) or contain severe individual concerns (score &ge; 4).
          </p>
          <div className="space-y-6">
            {summary.highestRiskCategories.map((cat) => {
              const triggerReasons: string[] = [];
              if (cat.average !== null && cat.average > 2.6) {
                triggerReasons.push(`Elevated category risk score (${cat.average.toFixed(1)})`);
              }
              if (cat.hasSevereConcern) {
                triggerReasons.push(
                  `${cat.severeConcernQuestions.length} severe concern(s) with score(s) ${cat.severeConcernQuestions.map((q) => q.score).join(', ')}`
                );
              }

              return (
                <div key={cat.categoryId} className="bg-white p-5 rounded-lg border border-amber-200 shadow-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{cat.categoryTitle}</h4>
                    <RiskBadge score={cat.average} isComplete={cat.isComplete} />
                  </div>
                  <div className="text-xs font-semibold text-amber-800">
                    Trigger: {triggerReasons.join(' and ')}
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    <strong>Action Required:</strong> Review governance controls and risk factors for {cat.categoryTitle.toLowerCase()}. Document clear mitigating actions, conditions, or risk acceptance protocols prior to advancing system lifecycle stages.
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
