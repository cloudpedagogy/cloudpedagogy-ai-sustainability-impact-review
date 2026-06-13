import { useParams } from 'react-router-dom';
import { ASSESSMENT_CATEGORIES } from '../config/assessmentSchema';
import { useReviewStore } from '../store/useReviewStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function AssessmentCategoryView() {
  const { categoryId } = useParams();
  const category = ASSESSMENT_CATEGORIES.find(c => c.id === categoryId);
  const { assessments, updateAssessment } = useReviewStore();

  if (!category) return <div>Category not found.</div>;

  const categoryAssessments = assessments[category.id] || {};

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
        <p className="mt-2 text-slate-600">{category.description}</p>
      </div>

      <div className="space-y-6">
        {category.questions.map((q, index) => {
          const response = categoryAssessments[q.id] || { score: 0, notes: '' };
          
          return (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium mb-2">{q.text}</p>
                  {q.guidance && (
                    <p className="text-sm text-slate-500 mb-4">{q.guidance}</p>
                  )}
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Sustainability Risk Assessment</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { val: 1, label: '1 - Sustainable' },
                        { val: 2, label: '2 - Minor Concern' },
                        { val: 3, label: '3 - Moderate Concern' },
                        { val: 4, label: '4 - Significant Concern' },
                        { val: 5, label: '5 - Critical Sustainability Concern' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => updateAssessment(category.id, q.id, opt.val, response.notes)}
                          className={twMerge(
                            clsx(
                              "px-3 py-2 text-sm font-medium rounded-md border transition-colors",
                              response.score === opt.val
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            )
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Notes & Evidence</label>
                    <textarea
                      value={response.notes}
                      onChange={(e) => updateAssessment(category.id, q.id, response.score, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Add context or rationale for this rating..."
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
