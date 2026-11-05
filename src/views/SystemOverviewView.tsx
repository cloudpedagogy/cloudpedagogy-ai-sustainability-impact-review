import { useReviewStore } from '../store/useReviewStore';
import type { SystemOverview, ReviewPurpose } from '../config/assessmentSchema';

const REVIEW_PURPOSES: ReviewPurpose[] = [
  'Initial Design Review',
  'Pre-Deployment Review',
  'Annual Review',
  'Post-Incident Review',
  'Procurement / Adoption Review',
  'Scaling Review',
  'Retirement / Decommissioning Review'
];

export function SystemOverviewView() {
  const { systemOverview, updateSystemOverview } = useReviewStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateSystemOverview(e.target.name as keyof SystemOverview, e.target.value);
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">System Overview</h2>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          Provide contextual and technical metadata for the AI system or workflow under sustainability review.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="systemOverview-systemName" className="block text-sm font-semibold text-slate-700 mb-1">
              System / Project Name <span className="text-slate-500 font-normal">(recommended)</span>
            </label>
            <input 
              type="text" 
              id="systemOverview-systemName"
              name="systemName" 
              value={systemOverview.systemName} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. Institutional LLM Student Advisory Gateway"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="systemOverview-description" className="block text-sm font-semibold text-slate-700 mb-1">
              Description <span className="text-slate-500 font-normal">(recommended)</span>
            </label>
            <textarea 
              id="systemOverview-description"
              name="description" 
              value={systemOverview.description} 
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="Brief description of the system's purpose, scope, and technical functionality"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="systemOverview-contextOfUse" className="block text-sm font-semibold text-slate-700 mb-1">
              Operational Setting & Context of Use
            </label>
            <textarea 
              id="systemOverview-contextOfUse"
              name="contextOfUse" 
              value={systemOverview.contextOfUse} 
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. Production environment deployed across university faculties for real-time tutoring"
            />
          </div>

          <div>
            <label htmlFor="systemOverview-reviewPurpose" className="block text-sm font-semibold text-slate-700 mb-1">
              Review Purpose
            </label>
            <select
              id="systemOverview-reviewPurpose"
              name="reviewPurpose"
              value={systemOverview.reviewPurpose}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 bg-white text-sm"
            >
              <option value="">Select purpose...</option>
              {REVIEW_PURPOSES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="systemOverview-aiUseType" className="block text-sm font-semibold text-slate-700 mb-1">
              AI System Type & Modality
            </label>
            <input 
              type="text" 
              id="systemOverview-aiUseType"
              name="aiUseType" 
              value={systemOverview.aiUseType} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. Hosted LLM API, Fine-Tuned SLM, RAG Pipeline"
            />
          </div>

          <div>
            <label htmlFor="systemOverview-sector" className="block text-sm font-semibold text-slate-700 mb-1">
              Sector / Department
            </label>
            <input 
              type="text" 
              id="systemOverview-sector"
              name="sector" 
              value={systemOverview.sector} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. Higher Education / Academic Computing"
            />
          </div>

          <div>
            <label htmlFor="systemOverview-primaryUsers" className="block text-sm font-semibold text-slate-700 mb-1">
              Primary Users
            </label>
            <input 
              type="text" 
              id="systemOverview-primaryUsers"
              name="primaryUsers" 
              value={systemOverview.primaryUsers} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. Students, Faculty, Support Staff"
            />
          </div>

          <div>
            <label htmlFor="systemOverview-lifecycleStage" className="block text-sm font-semibold text-slate-700 mb-1">
              Current Lifecycle Stage
            </label>
            <select
              id="systemOverview-lifecycleStage"
              name="lifecycleStage"
              value={systemOverview.lifecycleStage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 bg-white text-sm"
            >
              <option value="">Select stage...</option>
              <option value="Idea">Idea / Discovery</option>
              <option value="Prototype">Prototype / Feasibility</option>
              <option value="Pilot">Pilot / Controlled Trial</option>
              <option value="Operational">Operational / In Production</option>
              <option value="Scaling">Scaling / Broad Adoption</option>
              <option value="Retiring">Retiring / Decommissioning</option>
            </select>
          </div>

          <div>
            <label htmlFor="systemOverview-intendedDuration" className="block text-sm font-semibold text-slate-700 mb-1">
              Intended Operational Horizon
            </label>
            <input 
              type="text" 
              id="systemOverview-intendedDuration"
              name="intendedDuration" 
              value={systemOverview.intendedDuration} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. 3-year institutional license, 1-year research grant"
            />
          </div>

          <div>
            <label htmlFor="systemOverview-systemOwner" className="block text-sm font-semibold text-slate-700 mb-1">
              System Owner (Role / Unit)
            </label>
            <input 
              type="text" 
              id="systemOverview-systemOwner"
              name="systemOwner" 
              value={systemOverview.systemOwner} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. Head of Educational Technology"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="systemOverview-keyStakeholders" className="block text-sm font-semibold text-slate-700 mb-1">
              Key Stakeholders & Governance Bodies
            </label>
            <input 
              type="text" 
              id="systemOverview-keyStakeholders"
              name="keyStakeholders" 
              value={systemOverview.keyStakeholders} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
              placeholder="e.g. Academic Standards Committee, IT Security, Student Union, DPO"
            />
          </div>

          <div>
            <label htmlFor="systemOverview-reviewDate" className="block text-sm font-semibold text-slate-700 mb-1">
              Date of Review
            </label>
            <input 
              type="date" 
              id="systemOverview-reviewDate"
              name="reviewDate" 
              value={systemOverview.reviewDate} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="systemOverview-nextReviewDate" className="block text-sm font-semibold text-slate-700 mb-1">
              Suggested Next Review Date
            </label>
            <input 
              type="date" 
              id="systemOverview-nextReviewDate"
              name="nextReviewDate" 
              value={systemOverview.nextReviewDate} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 text-sm"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
