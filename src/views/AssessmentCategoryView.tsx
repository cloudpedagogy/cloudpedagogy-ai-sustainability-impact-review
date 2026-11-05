import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoriesForMethodology, type EvidenceType, type ConfidenceLevel } from '../config/assessmentSchema';
import { useReviewStore } from '../store/useReviewStore';
import { calculateCategoryScore } from '../utils/scoring';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight, HelpCircle, AlertCircle, FileCheck2, RotateCcw } from 'lucide-react';

const RATING_SCALE = [
  { val: 1, name: 'Sustainable', ariaLabel: 'Score 1: Sustainable / Negligible Risk' },
  { val: 2, name: 'Minor Concern', ariaLabel: 'Score 2: Minor Concern / Low Risk' },
  { val: 3, name: 'Moderate Concern', ariaLabel: 'Score 3: Moderate Concern / Medium Risk' },
  { val: 4, name: 'Significant Concern', ariaLabel: 'Score 4: Significant Concern / High Risk' },
  { val: 5, name: 'Critical Concern', ariaLabel: 'Score 5: Critical Concern / Severe Risk' },
] as const;

export function AssessmentCategoryView() {
  const { categoryId } = useParams();
  const { activeAssessmentId, savedAssessments, assessments, updateAssessment } = useReviewStore();

  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  const activeRecord = savedAssessments[activeAssessmentId];
  const categories = getCategoriesForMethodology(activeRecord?.methodologyVersion);

  const categoryIndex = categories.findIndex((c) => c.id === categoryId);
  const category = categoryIndex !== -1 ? categories[categoryIndex] : null;

  if (!category) {
    return (
      <div role="alert" className="p-8 text-slate-700 bg-white rounded-lg border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Category Not Found</h2>
        <p className="mt-2 text-sm">The requested assessment category does not exist in the active methodology.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-slate-800 underline">
          Return to System Overview
        </Link>
      </div>
    );
  }

  const categoryAssessments = assessments[category.id] || {};
  const catSummary = calculateCategoryScore(category, categoryAssessments);

  const prevCategory = categoryIndex > 0 ? categories[categoryIndex - 1] : null;
  const nextCategory = categoryIndex < categories.length - 1 ? categories[categoryIndex + 1] : null;

  const toggleEvidence = (qid: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Category Header with Step Tracker */}
      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 gap-2">
          <span>Category {categoryIndex + 1} of {categories.length}</span>
          <span className={catSummary.isComplete ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
            {catSummary.answeredQuestions} of {catSummary.totalQuestions} evaluated ({catSummary.completionPercentage}%)
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
        <p className="mt-1 text-slate-600 text-sm leading-relaxed">{category.description}</p>
      </header>

      {/* Question Cards */}
      <div className="space-y-6">
        {category.questions.map((q, index) => {
          const response = categoryAssessments[q.id] || { score: 0, notes: '' };
          const hasEvidenceData = Boolean(
            response.evidenceType || response.evidenceSource || response.assumptions || response.confidence
          );
          const isEvidenceOpen = expandedEvidence[q.id] || hasEvidenceData;
          const isAnswered = response.score >= 1 && response.score <= 5;

          return (
            <article
              key={q.id}
              aria-labelledby={`q-title-${q.id}`}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div
                  aria-hidden="true"
                  className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700 self-start"
                >
                  {index + 1}
                </div>

                <div className="flex-1 space-y-4 min-w-0">
                  <div>
                    <h3 id={`q-title-${q.id}`} className="text-slate-900 font-semibold text-base leading-snug">
                      {q.text}
                    </h3>
                    {q.guidance && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed flex items-start gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{q.guidance}</span>
                      </p>
                    )}
                  </div>

                  {/* Rating Selector using Native Accessible Radiogroup */}
                  <fieldset className="space-y-2 border-0 p-0 m-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <legend
                        id={`rating-label-${q.id}`}
                        className="text-xs font-bold uppercase tracking-wider text-slate-700"
                      >
                        Sustainability Concern Rating
                      </legend>

                      <div className="flex items-center gap-2">
                        {isAnswered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-white">
                            Scored {response.score}/5
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Unanswered
                          </span>
                        )}

                        {isAnswered && (
                          <button
                            type="button"
                            onClick={() =>
                              updateAssessment(category.id, q.id, 0, response.notes, {
                                evidenceType: response.evidenceType,
                                evidenceSource: response.evidenceSource,
                                assumptions: response.assumptions,
                                confidence: response.confidence,
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 rounded px-1"
                            aria-label={`Clear rating for question ${index + 1}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      role="radiogroup"
                      aria-labelledby={`rating-label-${q.id}`}
                      className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                    >
                      {RATING_SCALE.map((opt) => {
                        const isSelected = response.score === opt.val;
                        const radioId = `rating-${q.id}-${opt.val}`;
                        return (
                          <label
                            key={opt.val}
                            htmlFor={radioId}
                            className={twMerge(
                              clsx(
                                'relative flex flex-col items-center justify-center p-2.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors text-center focus-within:ring-2 focus-within:ring-slate-800 focus-within:ring-offset-1',
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                              )
                            )}
                          >
                            <input
                              type="radio"
                              id={radioId}
                              name={`rating-group-${q.id}`}
                              value={opt.val}
                              checked={isSelected}
                              onChange={() =>
                                updateAssessment(category.id, q.id, opt.val, response.notes, {
                                  evidenceType: response.evidenceType,
                                  evidenceSource: response.evidenceSource,
                                  assumptions: response.assumptions,
                                  confidence: response.confidence,
                                })
                              }
                              aria-label={opt.ariaLabel}
                              className="sr-only"
                            />
                            <span className="font-bold text-sm block" aria-hidden="true">
                              {opt.val}
                            </span>
                            <span
                              className={clsx(
                                'text-[11px] mt-0.5 block leading-tight',
                                isSelected ? 'text-slate-200' : 'text-slate-500'
                              )}
                            >
                              {opt.name}
                            </span>
                            {isSelected && <span className="sr-only">(Selected)</span>}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Notes & Explanation */}
                  <div className="space-y-1">
                    <label htmlFor={`notes-${q.id}`} className="block text-xs font-medium text-slate-700">
                      Explanation & Context
                    </label>
                    <textarea
                      id={`notes-${q.id}`}
                      value={response.notes}
                      onChange={(e) =>
                        updateAssessment(category.id, q.id, response.score, e.target.value, {
                          evidenceType: response.evidenceType,
                          evidenceSource: response.evidenceSource,
                          assumptions: response.assumptions,
                          confidence: response.confidence,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
                      placeholder="Record context, reasoning, or institutional rationale..."
                    />
                  </div>

                  {/* Optional Structured Evidence Section */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleEvidence(q.id)}
                      aria-expanded={isEvidenceOpen}
                      aria-controls={`evidence-panel-${q.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 rounded p-1"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span>Evidence, Assumptions & Uncertainty (Optional)</span>
                      <span className="text-slate-400" aria-hidden="true">{isEvidenceOpen ? '▲' : '▼'}</span>
                    </button>

                    {isEvidenceOpen && (
                      <div
                        id={`evidence-panel-${q.id}`}
                        className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4"
                      >
                        {/* Evidence Type */}
                        <fieldset className="border-0 p-0 m-0 space-y-1.5">
                          <legend
                            id={`evidence-type-legend-${q.id}`}
                            className="block text-xs font-semibold text-slate-700"
                          >
                            Evidence Basis
                          </legend>
                          <div
                            role="radiogroup"
                            aria-labelledby={`evidence-type-legend-${q.id}`}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                          >
                            {[
                              { val: 'measured', label: 'Measured Evidence' },
                              { val: 'estimated', label: 'Estimate / Model' },
                              { val: 'qualitative', label: 'Qualitative Judgement' },
                              { val: 'unknown', label: 'Unknown / Unavailable' },
                            ].map((item) => {
                              const isChecked = response.evidenceType === item.val;
                              const optId = `evidence-type-${q.id}-${item.val}`;
                              return (
                                <label
                                  key={item.val}
                                  htmlFor={optId}
                                  className={twMerge(
                                    clsx(
                                      'px-2.5 py-1.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-slate-800',
                                      isChecked
                                        ? 'bg-slate-700 text-white border-slate-700'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    )
                                  )}
                                >
                                  <input
                                    type="radio"
                                    id={optId}
                                    name={`evidence-type-${q.id}`}
                                    value={item.val}
                                    checked={isChecked}
                                    onChange={() =>
                                      updateAssessment(category.id, q.id, response.score, response.notes, {
                                        evidenceType: isChecked ? '' : (item.val as EvidenceType),
                                        evidenceSource: response.evidenceSource,
                                        assumptions: response.assumptions,
                                        confidence: response.confidence,
                                      })
                                    }
                                    className="sr-only"
                                  />
                                  <span>{item.label}</span>
                                </label>
                              );
                            })}
                          </div>

                          {response.evidenceType === 'unknown' && (
                            <p className="text-[11px] text-amber-800 font-medium mt-1.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                              <span>Notice: Unknown evidence status does not imply low environmental or governance risk.</span>
                            </p>
                          )}
                        </fieldset>

                        {/* Evidence Source & Assumptions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor={`evidence-source-${q.id}`}
                              className="block text-xs font-medium text-slate-700 mb-1"
                            >
                              Evidence Source / Document
                            </label>
                            <input
                              type="text"
                              id={`evidence-source-${q.id}`}
                              value={response.evidenceSource || ''}
                              onChange={(e) =>
                                updateAssessment(category.id, q.id, response.score, response.notes, {
                                  evidenceType: response.evidenceType,
                                  evidenceSource: e.target.value,
                                  assumptions: response.assumptions,
                                  confidence: response.confidence,
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
                              placeholder="e.g. Cloud ESG Report 2026, Section 3.2"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`assumptions-${q.id}`}
                              className="block text-xs font-medium text-slate-700 mb-1"
                            >
                              Key Stated Assumptions
                            </label>
                            <input
                              type="text"
                              id={`assumptions-${q.id}`}
                              value={response.assumptions || ''}
                              onChange={(e) =>
                                updateAssessment(category.id, q.id, response.score, response.notes, {
                                  evidenceType: response.evidenceType,
                                  evidenceSource: response.evidenceSource,
                                  assumptions: e.target.value,
                                  confidence: response.confidence,
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
                              placeholder="e.g. Assumes 50k monthly queries at 800 tokens"
                            />
                          </div>
                        </div>

                        {/* Confidence Level */}
                        <fieldset className="border-0 p-0 m-0 space-y-1.5">
                          <legend
                            id={`confidence-legend-${q.id}`}
                            className="block text-xs font-semibold text-slate-700"
                          >
                            Assessment Confidence
                          </legend>
                          <div
                            role="radiogroup"
                            aria-labelledby={`confidence-legend-${q.id}`}
                            className="flex flex-wrap gap-2"
                          >
                            {[
                              { val: 'high', label: 'High Confidence' },
                              { val: 'medium', label: 'Medium Confidence' },
                              { val: 'low', label: 'Low Confidence / Highly Uncertain' },
                            ].map((conf) => {
                              const isChecked = response.confidence === conf.val;
                              const confId = `confidence-${q.id}-${conf.val}`;
                              return (
                                <label
                                  key={conf.val}
                                  htmlFor={confId}
                                  className={twMerge(
                                    clsx(
                                      'px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-slate-800',
                                      isChecked
                                        ? 'bg-slate-700 text-white border-slate-700'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    )
                                  )}
                                >
                                  <input
                                    type="radio"
                                    id={confId}
                                    name={`confidence-${q.id}`}
                                    value={conf.val}
                                    checked={isChecked}
                                    onChange={() =>
                                      updateAssessment(category.id, q.id, response.score, response.notes, {
                                        evidenceType: response.evidenceType,
                                        evidenceSource: response.evidenceSource,
                                        assumptions: response.assumptions,
                                        confidence: isChecked ? '' : (conf.val as ConfidenceLevel),
                                      })
                                    }
                                    className="sr-only"
                                  />
                                  <span>{conf.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Sequential Workflow Navigation */}
      <nav aria-label="Category Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200">
        {prevCategory ? (
          <Link
            to={`/category/${prevCategory.id}`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Previous: {prevCategory.title}</span>
          </Link>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>System Overview</span>
          </Link>
        )}

        {nextCategory ? (
          <Link
            to={`/category/${nextCategory.id}`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 ml-auto"
          >
            <span>Next: {nextCategory.title}</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        ) : (
          <Link
            to="/decision"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 ml-auto"
          >
            <span>Proceed to Decision Notes</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  );
}
