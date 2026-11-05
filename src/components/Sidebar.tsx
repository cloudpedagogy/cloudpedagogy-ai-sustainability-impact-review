import { NavLink } from 'react-router-dom';
import { ASSESSMENT_CATEGORIES } from '../config/assessmentSchema';
import { FileText, CheckCircle, LayoutDashboard, Flag, Circle } from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';
import { calculateCategoryScore } from '../utils/scoring';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar() {
  const { assessments, decisionRecommendation } = useReviewStore();

  const isCategoryComplete = (categoryId: string) => {
    const category = ASSESSMENT_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return false;
    return calculateCategoryScore(category, assessments[categoryId]).isComplete;
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    twMerge(
      clsx(
        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-slate-800 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )
    );

  return (
    <nav className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-slate-200">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">CloudPedagogy</div>
        <h1 className="text-xl font-bold text-slate-900 leading-tight">
          AI Sustainability<br />Impact Review
        </h1>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        <NavLink to="/" className={navLinkClass}>
          <LayoutDashboard className="w-4 h-4" />
          System Overview
        </NavLink>

        <div className="pt-4 pb-2">
          <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Assessment Categories
          </h2>
        </div>

        {ASSESSMENT_CATEGORIES.map((category) => {
          const isComplete = isCategoryComplete(category.id);
          return (
            <NavLink key={category.id} to={`/category/${category.id}`} className={navLinkClass}>
              {isComplete ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300" />
              )}
              <span className="truncate">{category.title}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 pb-2">
          <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Conclusion
          </h2>
        </div>

        <NavLink to="/decision" className={navLinkClass}>
          {decisionRecommendation ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <Flag className="w-4 h-4" />
          )}
          Decision Notes
        </NavLink>

        <NavLink to="/summary" className={navLinkClass}>
          <FileText className="w-4 h-4" />
          Review Summary
        </NavLink>
      </div>
    </nav>
  );
}
