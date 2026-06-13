import { useReviewStore } from '../store/useReviewStore';
import { ASSESSMENT_CATEGORIES } from '../config/assessmentSchema';
import { RiskBadge, getRiskLabelAndColor } from '../components/RiskBadge';
import { Printer } from 'lucide-react';

export function ReviewSummaryView() {
  const { systemOverview, assessments, decisionRecommendation, decisionRationale } = useReviewStore();

  const categoryScores = ASSESSMENT_CATEGORIES.map(category => {
    const catAssessments = assessments[category.id] || {};
    const answeredScores = category.questions
      .map(q => catAssessments[q.id]?.score || 0)
      .filter(s => s > 0);
    
    const average = answeredScores.length > 0
      ? answeredScores.reduce((a, b) => a + b, 0) / answeredScores.length
      : 0;

    return {
      category,
      average,
      isComplete: answeredScores.length === category.questions.length
    };
  });

  const validScores = categoryScores.filter(c => c.average > 0).map(c => c.average);
  const overallScore = validScores.length > 0
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : 0;

  const highestRiskCategories = [...categoryScores]
    .filter(c => c.average >= 3.0)
    .sort((a, b) => b.average - a.average);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500 pb-12 print:max-w-none print:w-full print:bg-white print:text-black">
      
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sustainability Review Summary</h2>
          <p className="mt-2 text-slate-600">Final assessment and outputs based on your review.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>

      {/* System Information */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300">
        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-slate-500">System Name</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.systemName || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Review Purpose</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.reviewPurpose || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Date of Review</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.reviewDate || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Lifecycle Stage</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.lifecycleStage || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">System Owner</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.systemOwner || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Next Review Date</div>
            <div className="font-semibold text-slate-900 mt-1">{systemOverview.nextReviewDate || 'Not specified'}</div>
          </div>
          <div className="col-span-2 md:col-span-3">
            <div className="text-sm font-medium text-slate-500">Description</div>
            <div className="text-slate-900 mt-1">{systemOverview.description || 'Not specified'}</div>
          </div>
        </div>
      </section>

      {/* Overall Score */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center print:bg-white print:border-slate-300">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Overall Sustainability Rating</h3>
        <div className="text-5xl font-bold text-slate-900 mb-4">{overallScore > 0 ? overallScore.toFixed(1) : 'N/A'}</div>
        <RiskBadge score={overallScore} className="text-base px-4 py-1" />
      </section>

      {/* Decision Notes */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300">
        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Sustainability Decision</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-500">Recommendation</div>
            <div className="font-semibold text-slate-900 mt-1 text-lg">
              {decisionRecommendation || 'Not recorded'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Rationale</div>
            <div className="text-slate-900 mt-1 whitespace-pre-wrap bg-slate-50 p-4 rounded-md border border-slate-100">
              {decisionRationale || 'No rationale provided.'}
            </div>
          </div>
        </div>
      </section>

      {/* Category Scores */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300">
        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Category Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {categoryScores.map(cat => (
            <div key={cat.category.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <span className="font-medium text-slate-700">{cat.category.title}</span>
              <RiskBadge score={cat.average} />
            </div>
          ))}
        </div>
      </section>

      {/* Highest Risk / Mitigations */}
      {highestRiskCategories.length > 0 && (
        <section className="bg-amber-50 rounded-xl border border-amber-200 p-8 print:bg-white print:border-slate-300">
          <h3 className="text-lg font-bold text-amber-900 mb-6 border-b border-amber-200 pb-4 print:text-black print:border-slate-300">Priority Mitigations (Highest Risk Areas)</h3>
          <div className="space-y-6">
            {highestRiskCategories.map(cat => {
              const { label } = getRiskLabelAndColor(cat.average);
              return (
                <div key={cat.category.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900">{cat.category.title}</h4>
                    <span className="text-sm font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">{cat.average.toFixed(1)} - {label}</span>
                  </div>
                  <p className="text-slate-700 text-sm">
                    <strong>Action Required:</strong> Review governance controls for {cat.category.title.toLowerCase()}. Document clear mitigating actions or risk acceptance protocols before advancing the system lifecycle stage.
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
