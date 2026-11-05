import { useReviewStore } from '../store/useReviewStore';
import { getCategoriesForMethodology, DEFAULT_METHODOLOGY_VERSION } from '../config/assessmentSchema';
import { RiskBadge } from '../components/RiskBadge';
import { calculateOverallScore } from '../utils/scoring';
import { getCategoryMitigations } from '../utils/mitigations';
import {
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Layers,
} from 'lucide-react';

export function ReviewSummaryView() {
  const {
    activeAssessmentId,
    savedAssessments,
    systemOverview,
    assessments,
    decisionRecommendation,
    decisionRationale,
    upgradeAssessmentMethodology,
  } = useReviewStore();

  const activeRecord = savedAssessments[activeAssessmentId];
  const methodologyVersion = activeRecord?.methodologyVersion || DEFAULT_METHODOLOGY_VERSION;
  const categories = getCategoriesForMethodology(methodologyVersion);

  const summary = calculateOverallScore(categories, assessments, methodologyVersion);

  const handlePrint = () => {
    window.print();
  };

  const isLegacyV1 = methodologyVersion === 'cp-sustainability-methodology-v1';

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-16 print:max-w-none print:w-full print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">Sustainability Review Summary</h2>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                isLegacyV1
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Layers className="w-3 h-3" />
              {isLegacyV1 ? 'Methodology v1 (34 questions)' : 'Methodology v2 (38 questions)'}
            </span>
          </div>
          <p className="text-slate-600 text-sm">
            Governance outputs, empirical evidence status, and context-sensitive mitigations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Historical Methodology Upgrade Callout */}
      {isLegacyV1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-blue-900">
                Historical Review Evaluated Under Methodology v1 (34 Questions)
              </div>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                This assessment was completed under the original 34-question framework. Its completeness and historical decision are preserved. You can create a linked Methodology v2 reassessment revision to evaluate expanded environmental dimensions (training/inference compute, grid carbon, hardware lifecycle, and water impact) while preserving this original record.
              </p>
            </div>
          </div>
          <button
            onClick={() => upgradeAssessmentMethodology(activeAssessmentId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0"
          >
            <span>Create v2 Reassessment</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Linked Historical Reassessment Notice */}
      {activeRecord?.sourceAssessmentId && (
        <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              This is a Methodology v2 reassessment linked to historical source record:{' '}
              <strong>
                {savedAssessments[activeRecord.sourceAssessmentId]?.name || activeRecord.sourceAssessmentId}
              </strong>
            </span>
          </div>
        </div>
      )}

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
            <div className="font-bold text-base">
              Assessment Complete (100% of Questions Evaluated under {isLegacyV1 ? 'v1' : 'v2'} Framework)
            </div>
            <p className="text-sm mt-1 text-emerald-800">
              All 8 assessment categories and all {summary.totalQuestions} governance questions have been evaluated. Final sustainability classifications and mitigation requirements are confirmed.
            </p>
          </div>
        </div>
      )}

      {/* System Information */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300">
        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
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

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI System Type</div>
            <div className="text-slate-900 mt-1">{systemOverview.aiUseType || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intended Operational Horizon</div>
            <div className="text-slate-900 mt-1">{systemOverview.intendedDuration || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sector / Department</div>
            <div className="text-slate-900 mt-1">{systemOverview.sector || 'Not specified'}</div>
          </div>

          <div className="col-span-2 md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deployment Context & Setting</div>
            <div className="text-slate-900 mt-1">{systemOverview.contextOfUse || 'Not specified'}</div>
          </div>

          <div className="col-span-2 md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Key Stakeholders & Governance Bodies</div>
            <div className="text-slate-900 mt-1">{systemOverview.keyStakeholders || 'Not specified'}</div>
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
          <div className="text-xs text-slate-500 mt-1">Scale 1 (Sustainable) to 5 (Worst)</div>
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
            * Provisional classification based on {summary.completionPercentage}% of evaluated questions under {isLegacyV1 ? 'v1' : 'v2'} methodology.
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
          <p className="text-xs text-red-800 leading-relaxed">
            The questions below received severe concern ratings (4 or 5). Even if overall category averages appear moderate, these individual areas represent material sustainability risks requiring immediate institutional governance oversight:
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

      {/* Context-Sensitive Priority Mitigations */}
      {summary.highestRiskCategories.length > 0 && (
        <section className="bg-amber-50 rounded-xl border border-amber-300 p-8 print:bg-white print:border-slate-300 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-amber-950 mb-1 print:text-black">
              Priority Mitigations & Advisory Guidance
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              Categories requiring mitigation either exceed the acceptable risk threshold (average &gt; 2.6) or contain severe individual concerns (score &ge; 4).
            </p>
          </div>

          {/* Advisory Disclaimer Notice */}
          <div className="p-3.5 bg-amber-100/70 border border-amber-300 rounded-lg text-xs text-amber-900 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <strong>Advisory Governance Notice:</strong> The recommendations below are suggested governance options generated from identified concern ratings and evidence gaps. They represent advisory guidance rather than verified corrective actions. Implementing a suggested action does not by itself guarantee sustainability.
            </div>
          </div>

          <div className="space-y-5">
            {summary.highestRiskCategories.map((cat) => {
              const categoryDef = categories.find((c) => c.id === cat.categoryId);
              const mitigations = categoryDef
                ? getCategoryMitigations(categoryDef, assessments[cat.categoryId], cat.average, cat.hasSevereConcern)
                : [];

              return (
                <div key={cat.categoryId} className="bg-white p-5 rounded-lg border border-amber-200 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{cat.categoryTitle}</h4>
                      <span className="text-xs text-slate-500">
                        Category Average: {cat.average?.toFixed(1) ?? 'N/A'}
                      </span>
                    </div>
                    <RiskBadge score={cat.average} isComplete={cat.isComplete} />
                  </div>

                  {mitigations.length > 0 ? (
                    <div className="space-y-2.5">
                      {mitigations.map((m) => (
                        <div key={m.id} className="text-xs text-slate-800 bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                m.triggerType === 'severe_concern'
                                  ? 'bg-red-100 text-red-800'
                                  : m.triggerType === 'uncertain_evidence'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {m.triggerLabel}
                            </span>
                            {m.questionText && (
                              <span className="font-medium text-slate-600 truncate">{m.questionText}</span>
                            )}
                          </div>
                          <p className="text-slate-800 leading-relaxed font-medium">
                            <span className="text-slate-900 font-bold">Recommended Advisory Action: </span>
                            {m.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-700 text-xs leading-relaxed">
                      <strong>Action Required:</strong> Review governance controls and risk factors for {cat.categoryTitle.toLowerCase()}. Document clear mitigating actions, conditions, or risk acceptance protocols prior to advancing system lifecycle stages.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
