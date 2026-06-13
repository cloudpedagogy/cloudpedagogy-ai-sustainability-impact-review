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
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">System Overview</h2>
        <p className="mt-2 text-slate-600">
          Provide high-level context for the system or workflow under review.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">System / Project Name</label>
            <input 
              type="text" 
              name="systemName" 
              value={systemOverview.systemName} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="e.g. Adaptive Learning Assistant"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              name="description" 
              value={systemOverview.description} 
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="Brief description of the system's purpose and functionality"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Review Purpose</label>
            <select
              name="reviewPurpose"
              value={systemOverview.reviewPurpose}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
            >
              <option value="">Select purpose...</option>
              {REVIEW_PURPOSES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Context of Use / Sector</label>
            <input 
              type="text" 
              name="sector" 
              value={systemOverview.sector} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="e.g. Higher Education, Research, Admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Primary Users</label>
            <input 
              type="text" 
              name="primaryUsers" 
              value={systemOverview.primaryUsers} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="e.g. Students, Faculty, Support Staff"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Lifecycle Stage</label>
            <select
              name="lifecycleStage"
              value={systemOverview.lifecycleStage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
            >
              <option value="">Select stage...</option>
              <option value="Idea">Idea</option>
              <option value="Prototype">Prototype</option>
              <option value="Pilot">Pilot</option>
              <option value="Operational">Operational</option>
              <option value="Scaling">Scaling</option>
              <option value="Retiring">Retiring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">System Owner (Role/Dept)</label>
            <input 
              type="text" 
              name="systemOwner" 
              value={systemOverview.systemOwner} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Review</label>
            <input 
              type="date" 
              name="reviewDate" 
              value={systemOverview.reviewDate} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Suggested Next Review Date</label>
            <input 
              type="date" 
              name="nextReviewDate" 
              value={systemOverview.nextReviewDate} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
