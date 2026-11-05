import { useState } from 'react';
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
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const RATING_DESCRIPTORS: Record<number, string> = {
  1: '1 - Sustainable (Negligible Risk)',
  2: '2 - Minor Concern (Low Risk)',
  3: '3 - Moderate Concern (Medium Risk)',
  4: '4 - Significant Concern (High Risk)',
  5: '5 - Critical Concern (Severe Risk)',
};

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

  const [showFullAuditOnScreen, setShowFullAuditOnScreen] = useState(false);

  const activeRecord = savedAssessments[activeAssessmentId];
  const methodologyVersion = activeRecord?.methodologyVersion || DEFAULT_METHODOLOGY_VERSION;
  const categories = getCategoriesForMethodology(methodologyVersion);

  const summary = calculateOverallScore(categories, assessments, methodologyVersion);

  const handlePrint = () => {
    window.print();
  };

  const isLegacyV1 = methodologyVersion === 'cp-sustainability-methodology-v1';
  const currentDateFormatted = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-16 print:max-w-none print:w-full print:bg-white print:text-slate-900 print:space-y-6">
      {/* Print Document Header (Visible only in Print / PDF mode) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          <span>CloudPedagogy AI Governance Framework</span>
          <span>Printed on {currentDateFormatted}</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          AI Sustainability Impact Review — Governance Pack
        </h1>
        <div className="text-sm font-semibold text-slate-700 mt-1 flex flex-wrap gap-4">
          <span>
            <strong>Assessment:</strong> {activeRecord?.name || 'Current Review'}
          </span>
          <span>
            <strong>Methodology:</strong> {isLegacyV1 ? 'v1 (34 Questions)' : 'v2 (38 Questions)'}
          </span>
          <span>
            <strong>Status:</strong>{' '}
            {summary.isComplete ? 'Complete (100%)' : `Provisional (${summary.completionPercentage}%)`}
          </span>
        </div>
        {activeRecord?.sourceAssessmentId && (
          <div className="text-xs text-slate-600 mt-1.5 italic">
            Historical Provenance: Linked Methodology v2 reassessment of original record:{' '}
            <strong>
              {savedAssessments[activeRecord.sourceAssessmentId]?.name || activeRecord.sourceAssessmentId}
            </strong>
          </div>
        )}
      </div>

      {/* Screen Header */}
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
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md transition-colors text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
            aria-label="Print or export assessment as PDF review pack"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
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
            type="button"
            onClick={() => upgradeAssessmentMethodology(activeAssessmentId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
          >
            <span>Create v2 Reassessment</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Linked Historical Reassessment Notice */}
      {activeRecord?.sourceAssessmentId && (
        <div className="bg-slate-100 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 flex items-center justify-between gap-2 print:border-slate-300">
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
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 flex items-start gap-3 text-amber-900 print:bg-white print:border-amber-400 print:border-2">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 print:hidden" />
          <div>
            <div className="font-bold text-base">
              Provisional Assessment ({summary.completionPercentage}% Complete — {summary.unansweredQuestions} Questions Remaining)
            </div>
            <p className="text-sm mt-1 text-amber-800 leading-relaxed print:text-slate-800">
              This review is incomplete. Calculated averages are provisional descriptive indicators and must not be interpreted as a definitive Low Risk or Sustainable governance classification until all categories are fully assessed.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex items-start gap-3 text-emerald-900 print:bg-white print:border-emerald-600 print:border-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 print:hidden" />
          <div>
            <div className="font-bold text-base">
              Assessment Complete (100% of Questions Evaluated under {isLegacyV1 ? 'v1' : 'v2'} Framework)
            </div>
            <p className="text-sm mt-1 text-emerald-800 print:text-slate-800">
              All 8 assessment categories and all {summary.totalQuestions} governance questions have been evaluated. Final sustainability classifications and mitigation requirements are confirmed.
            </p>
          </div>
        </div>
      )}

      {/* System Information */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 print:shadow-none print:border-slate-300 print-break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">System Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-sm">
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

          <div className="sm:col-span-2 md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Primary Users</div>
            <div className="text-slate-900 mt-1">{systemOverview.primaryUsers || 'Not specified'}</div>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deployment Context & Setting</div>
            <div className="text-slate-900 mt-1">{systemOverview.contextOfUse || 'Not specified'}</div>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Key Stakeholders & Governance Bodies</div>
            <div className="text-slate-900 mt-1">{systemOverview.keyStakeholders || 'Not specified'}</div>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</div>
            <div className="text-slate-900 mt-1">{systemOverview.description || 'Not specified'}</div>
          </div>
        </div>
      </section>

      {/* Key Sustainability Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 print-break-inside-avoid">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs text-center print:border-slate-300">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessment Completion</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{summary.completionPercentage}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.answeredQuestions} of {summary.totalQuestions} questions
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs text-center print:border-slate-300">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {summary.average !== null ? summary.average.toFixed(1) : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Scale 1 (Sustainable) to 5 (Worst)</div>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-xl border shadow-xs text-center print:border-slate-300 ${
            summary.maxScore !== null && summary.maxScore >= 4
              ? 'bg-red-50 border-red-200 text-red-900 print:bg-white'
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
          className={`p-4 sm:p-5 rounded-xl border shadow-xs text-center print:border-slate-300 ${
            summary.severeConcernCount > 0
              ? 'bg-amber-50 border-amber-200 text-amber-900 print:bg-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Severe Concerns (4–5)</div>
          <div className="text-3xl font-extrabold mt-2">{summary.severeConcernCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.severeConcernCount === 0 ? 'None identified' : 'Requires governance oversight'}
          </div>
        </div>
      </section>

      {/* Overall Score Card */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center text-center print:bg-white print:border-slate-300 print-break-inside-avoid">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Overall Sustainability Rating
        </h3>
        <div className="text-5xl font-black text-slate-900 mb-3">
          {summary.average !== null ? summary.average.toFixed(1) : 'N/A'}
        </div>
        <RiskBadge
          score={summary.average}
          isComplete={summary.isComplete}
          className="text-sm px-4 py-1"
        />
        {!summary.isComplete && (
          <p className="text-xs text-amber-800 font-medium mt-3 print:text-slate-800">
            * Provisional classification based on {summary.completionPercentage}% of evaluated questions under {isLegacyV1 ? 'v1' : 'v2'} methodology.
          </p>
        )}
      </section>

      {/* Severe Concerns Visibility Callout */}
      {summary.categoriesWithSevereConcerns.length > 0 && (
        <section className="bg-red-50 rounded-xl border border-red-300 p-6 space-y-4 print:bg-white print:border-red-400 print:border-2 print-break-inside-avoid">
          <div className="flex items-center gap-2 text-red-900 font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 print:hidden" />
            <span>Severe Individual Concerns Identified ({summary.severeConcernCount})</span>
          </div>
          <p className="text-xs text-red-800 leading-relaxed print:text-slate-800">
            The questions below received severe concern ratings (4 or 5). Even if overall category averages appear moderate, these individual areas represent material sustainability risks requiring immediate institutional governance oversight:
          </p>
          <div className="space-y-3">
            {summary.categoriesWithSevereConcerns.map((cat) => (
              <div key={cat.categoryId} className="bg-white p-4 rounded-lg border border-red-200 shadow-xs space-y-2 print:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{cat.categoryTitle}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 print:border print:border-slate-400">
                    Category Average: {cat.average?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {cat.severeConcernQuestions.map((q) => (
                    <li key={q.questionId}>
                      <strong className="text-red-700 print:text-black">Score {q.score}/5:</strong> {q.questionText}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Decision Notes */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 print:shadow-none print:border-slate-300 print-break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">Sustainability Decision</h3>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommendation</div>
            <div className="font-bold text-slate-900 mt-1 text-lg">
              {decisionRecommendation || 'Undecided / Not recorded'}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rationale & Conditions</div>
            <div className="text-slate-900 mt-1 whitespace-pre-wrap bg-slate-50 p-4 rounded-md border border-slate-200 text-sm leading-relaxed print:bg-white">
              {decisionRationale || 'No rationale recorded.'}
            </div>
          </div>
        </div>
      </section>

      {/* Category Scores */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 print:shadow-none print:border-slate-300 print-break-inside-avoid">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
          <h3 className="text-lg font-bold text-slate-900">Category Scores</h3>
          <span className="text-xs text-slate-500">
            {summary.categorySummaries.filter((c) => c.isComplete).length} of {summary.categorySummaries.length} categories completed
          </span>
        </div>
        <div className="space-y-3">
          {summary.categorySummaries.map((cat) => (
            <div
              key={cat.categoryId}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-2 print:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900 text-sm">{cat.categoryTitle}</span>
                <span className="text-xs text-slate-500">
                  ({cat.answeredQuestions}/{cat.totalQuestions} answered)
                </span>
                {cat.hasSevereConcern && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded print:border-slate-400"
                    title="Category contains severe individual concern"
                  >
                    <AlertTriangle className="w-3 h-3 text-red-600 print:hidden" />
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
        <section className="bg-amber-50 rounded-xl border border-amber-300 p-6 sm:p-8 print:bg-white print:border-slate-300 space-y-6 print-break-inside-avoid">
          <div>
            <h3 className="text-lg font-bold text-amber-950 mb-1 print:text-black">
              Priority Mitigations & Advisory Guidance
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed print:text-slate-700">
              Categories requiring mitigation either exceed the acceptable risk threshold (average &gt; 2.6) or contain severe individual concerns (score &ge; 4).
            </p>
          </div>

          {/* Advisory Disclaimer Notice */}
          <div className="p-3.5 bg-amber-100/70 border border-amber-300 rounded-lg text-xs text-amber-900 leading-relaxed flex items-start gap-2 print:bg-white print:border-slate-300 print:text-slate-800">
            <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5 print:hidden" />
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
                <div key={cat.categoryId} className="bg-white p-5 rounded-lg border border-amber-200 shadow-xs space-y-3 print:border-slate-300">
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
                        <div key={m.id} className="text-xs text-slate-800 bg-slate-50 p-3 rounded border border-slate-200 space-y-1 print:bg-white">
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

      {/* Screen Toggle Button for Full Question-by-Question Audit */}
      <div className="print:hidden flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setShowFullAuditOnScreen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-md shadow-xs transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
          aria-expanded={showFullAuditOnScreen}
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>{showFullAuditOnScreen ? 'Hide Detailed Question Audit' : 'Show Complete Question Audit (Included in Print Pack)'}</span>
          {showFullAuditOnScreen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Complete Question-by-Question Audit Section (Always visible in Print, toggleable on screen) */}
      <section
        className={`${
          showFullAuditOnScreen ? 'block' : 'hidden'
        } print:block print-force-show space-y-6 pt-4 print:pt-0`}
      >
        <div className="border-b-2 border-slate-900 pb-3">
          <h3 className="text-xl font-bold text-slate-900">
            Complete Assessment Question Audit
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Detailed breakdown of all {summary.totalQuestions} evaluated questions across all 8 sustainability dimensions under {isLegacyV1 ? 'Methodology v1' : 'Methodology v2'}.
          </p>
        </div>

        <div className="space-y-6">
          {categories.map((cat, catIdx) => {
            const catAssessments = assessments[cat.id] || {};
            return (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 print:shadow-none print:border-slate-300 print-break-inside-avoid"
              >
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
                  <h4 className="text-base font-bold text-slate-900">
                    Category {catIdx + 1}: {cat.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {cat.questions.length} questions
                  </span>
                </div>

                <div className="space-y-4">
                  {cat.questions.map((q, qIdx) => {
                    const resp = catAssessments[q.id] || { score: 0, notes: '' };
                    const isAnswered = resp.score >= 1 && resp.score <= 5;
                    const hasEvidence = Boolean(
                      resp.evidenceType || resp.evidenceSource || resp.assumptions || resp.confidence
                    );

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2 text-xs print:bg-white print:border-slate-200 print-break-inside-avoid"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="font-semibold text-slate-900 text-sm max-w-xl">
                            <span className="text-slate-500 font-normal mr-1.5">
                              {qIdx + 1}.
                            </span>
                            {q.text}
                          </div>
                          <div>
                            {isAnswered ? (
                              <span
                                className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                  resp.score >= 4
                                    ? 'bg-red-100 text-red-900 border border-red-300'
                                    : resp.score === 3
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}
                              >
                                {RATING_DESCRIPTORS[resp.score]}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[11px]">
                                Unanswered
                              </span>
                            )}
                          </div>
                        </div>

                        {q.guidance && (
                          <div className="text-slate-500 italic text-[11px]">
                            Guidance: {q.guidance}
                          </div>
                        )}

                        <div className="text-slate-800">
                          <strong className="text-slate-900">Recorded Notes & Context: </strong>
                          {resp.notes ? resp.notes : <span className="text-slate-400 italic">None recorded</span>}
                        </div>

                        {hasEvidence && (
                          <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-100 print:border-slate-200">
                            <div>
                              <strong className="text-slate-900">Evidence Basis: </strong>
                              {resp.evidenceType ? resp.evidenceType.toUpperCase() : 'Not specified'}
                            </div>
                            <div>
                              <strong className="text-slate-900">Confidence: </strong>
                              {resp.confidence ? resp.confidence.toUpperCase() : 'Not specified'}
                            </div>
                            {resp.evidenceSource && (
                              <div className="sm:col-span-2">
                                <strong className="text-slate-900">Source: </strong>
                                {resp.evidenceSource}
                              </div>
                            )}
                            {resp.assumptions && (
                              <div className="sm:col-span-2">
                                <strong className="text-slate-900">Stated Assumptions: </strong>
                                {resp.assumptions}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Methodological Limitations and Governance Disclaimers */}
      <section className="bg-slate-100 rounded-xl border border-slate-300 p-6 sm:p-7 space-y-3 text-xs text-slate-700 print:bg-white print:border-slate-400 print:border-t-2 print:rounded-none print-break-inside-avoid">
        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          Methodological Limitations & Advisory Disclaimers
        </h4>
        <div className="space-y-2 leading-relaxed">
          <p>
            <strong>Qualitative Governance Evaluation:</strong> This review provides structured qualitative and heuristic governance evaluation across technical, organisational, educational, environmental, and social sustainability dimensions. Numerical scores (1–5) represent comparative institutional risk ratings rather than empirical laboratory measurements of energy or kilowatt-hour totals.
          </p>
          <p>
            <strong>Advisory Recommendations:</strong> Context-sensitive mitigations and priority actions are advisory suggestions designed to inform human governance deliberations. They do not constitute formal compliance certification, legal clearance, or institutional warranty.
          </p>
          <p>
            <strong>Self-Reported Evidence:</strong> Any numerical metrics, API consumption estimates, or infrastructure assumptions recorded in evidence fields are self-reported by the evaluating institution and have not been independently verified or certified by CloudPedagogy.
          </p>
          <p>
            <strong>Open-Source Independence:</strong> This application is distributed under the MIT Licence as an independent governance utility. The evaluation does not imply endorsement by third-party model providers, cloud vendors, or regulatory authorities.
          </p>
        </div>
      </section>
    </div>
  );
}
