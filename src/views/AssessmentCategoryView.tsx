import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoriesForMethodology, type EvidenceType, type ConfidenceLevel } from '../config/assessmentSchema';
import { useReviewStore } from '../store/useReviewStore';
import { calculateCategoryScore } from '../utils/scoring';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight, HelpCircle, AlertCircle, FileCheck2 } from 'lucide-react';

export function AssessmentCategoryView() {
  const { categoryId } = useParams();
  const { activeAssessmentId, savedAssessments, assessments, updateAssessment } = useReviewStore();

  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  const activeRecord = savedAssessments[activeAssessmentId];
  const categories = getCategoriesForMethodology(activeRecord?.methodologyVersion);

  const categoryIndex = categories.findIndex((c) => c.id === categoryId);
  const category = categoryIndex !== -1 ? categories[categoryIndex] : null;

  if (!category) return <div className="p-8 text-slate-700">Category not found.</div>;

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
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span>Category {categoryIndex + 1} of {categories.length}</span>
          <span className={catSummary.isComplete ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
            {catSummary.answeredQuestions} of {catSummary.totalQuestions} evaluated ({catSummary.completionPercentage}%)
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
        <p className="mt-1 text-slate-600 text-sm leading-relaxed">{category.description}</p>
      </div>

      {/* Question Cards */}
      <div className="space-y-6">
        {category.questions.map((q, index) => {
          const response = categoryAssessments[q.id] || { score: 0, notes: '' };
          const hasEvidenceData = Boolean(
            response.evidenceType || response.evidenceSource || response.assumptions || response.confidence
          );
          const isEvidenceOpen = expandedEvidence[q.id] || hasEvidenceData;

          return (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-slate-900 font-medium text-base">{q.text}</p>
                    {q.guidance && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed flex items-start gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{q.guidance}</span>
                      </p>
                    )}
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sustainability Concern Rating
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { val: 1, label: '1 - Sustainable' },
                        { val: 2, label: '2 - Minor Concern' },
                        { val: 3, label: '3 - Moderate Concern' },
                        { val: 4, label: '4 - Significant Concern' },
                        { val: 5, label: '5 - Critical Concern' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() =>
                            updateAssessment(category.id, q.id, opt.val, response.notes, {
                              evidenceType: response.evidenceType,
                              evidenceSource: response.evidenceSource,
                              assumptions: response.assumptions,
                              confidence: response.confidence,
                            })
                          }
                          className={twMerge(
                            clsx(
                              'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                              response.score === opt.val
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            )
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes & Explanation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Explanation & Context
                    </label>
                    <textarea
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
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Record context, reasoning, or institutional rationale..."
                    />
                  </div>

                  {/* Optional Structured Evidence Section */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleEvidence(q.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Evidence, Assumptions & Uncertainty (Optional)</span>
                      <span className="text-slate-400">{isEvidenceOpen ? '▲' : '▼'}</span>
                    </button>

                    {isEvidenceOpen && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                        {/* Evidence Type */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Evidence Basis
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { val: 'measured', label: 'Measured Evidence' },
                              { val: 'estimated', label: 'Estimate / Model' },
                              { val: 'qualitative', label: 'Qualitative Judgement' },
                              { val: 'unknown', label: 'Unknown / Unavailable' },
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() =>
                                  updateAssessment(category.id, q.id, response.score, response.notes, {
                                    evidenceType: response.evidenceType === item.val ? '' : (item.val as EvidenceType),
                                    evidenceSource: response.evidenceSource,
                                    assumptions: response.assumptions,
                                    confidence: response.confidence,
                                  })
                                }
                                className={twMerge(
                                  clsx(
                                    'px-2.5 py-1.5 text-xs font-medium rounded border text-center transition-colors',
                                    response.evidenceType === item.val
                                      ? 'bg-slate-700 text-white border-slate-700'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  )
                                )}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>

                          {response.evidenceType === 'unknown' && (
                            <p className="text-[11px] text-amber-800 font-medium mt-1.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Notice: Unknown evidence status does not imply low environmental or governance risk.</span>
                            </p>
                          )}
                        </div>

                        {/* Evidence Source & Assumptions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Evidence Source / Document
                            </label>
                            <input
                              type="text"
                              value={response.evidenceSource || ''}
                              onChange={(e) =>
                                updateAssessment(category.id, q.id, response.score, response.notes, {
                                  evidenceType: response.evidenceType,
                                  evidenceSource: e.target.value,
                                  assumptions: response.assumptions,
                                  confidence: response.confidence,
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
                              placeholder="e.g. Cloud ESG Report 2026, Section 3.2"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Key Stated Assumptions
                            </label>
                            <input
                              type="text"
                              value={response.assumptions || ''}
                              onChange={(e) =>
                                updateAssessment(category.id, q.id, response.score, response.notes, {
                                  evidenceType: response.evidenceType,
                                  evidenceSource: response.evidenceSource,
                                  assumptions: e.target.value,
                                  confidence: response.confidence,
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
                              placeholder="e.g. Assumes 50k monthly queries at 800 tokens"
                            />
                          </div>
                        </div>

                        {/* Confidence Level */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Assessment Confidence
                          </label>
                          <div className="flex gap-2">
                            {[
                              { val: 'high', label: 'High Confidence' },
                              { val: 'medium', label: 'Medium Confidence' },
                              { val: 'low', label: 'Low Confidence / Highly Uncertain' },
                            ].map((conf) => (
                              <button
                                key={conf.val}
                                type="button"
                                onClick={() =>
                                  updateAssessment(category.id, q.id, response.score, response.notes, {
                                    evidenceType: response.evidenceType,
                                    evidenceSource: response.evidenceSource,
                                    assumptions: response.assumptions,
                                    confidence: response.confidence === conf.val ? '' : (conf.val as ConfidenceLevel),
                                  })
                                }
                                className={twMerge(
                                  clsx(
                                    'px-2.5 py-1 text-xs font-medium rounded border transition-colors',
                                    response.confidence === conf.val
                                      ? 'bg-slate-700 text-white border-slate-700'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  )
                                )}
                              >
                                {conf.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sequential Workflow Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        {prevCategory ? (
          <Link
            to={`/category/${prevCategory.id}`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous: {prevCategory.title}</span>
          </Link>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>System Overview</span>
          </Link>
        )}

        {nextCategory ? (
          <Link
            to={`/category/${nextCategory.id}`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-xs transition-colors"
          >
            <span>Next: {nextCategory.title}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            to="/decision"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-xs transition-colors"
          >
            <span>Proceed to Decision Notes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
