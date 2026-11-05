import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { getCategoriesForMethodology } from '../config/assessmentSchema';
import { FileText, CheckCircle, LayoutDashboard, Flag, Circle, X } from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';
import { calculateCategoryScore } from '../utils/scoring';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const { activeAssessmentId, savedAssessments, assessments, decisionRecommendation } = useReviewStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activeRecord = savedAssessments[activeAssessmentId];
  const categories = getCategoriesForMethodology(activeRecord?.methodologyVersion);

  // Focus close button when mobile menu opens; handle Escape key
  useEffect(() => {
    if (isMobileOpen) {
      closeButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMobileOpen, onClose]);

  const isCategoryComplete = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return false;
    return calculateCategoryScore(category, assessments[categoryId]).isComplete;
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    twMerge(
      clsx(
        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800',
        isActive
          ? 'bg-slate-800 text-white font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )
    );

  const handleLinkClick = () => {
    if (isMobileOpen && onClose) {
      onClose();
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-white">
      {/* Header / Brand */}
      <div className="p-5 border-b border-slate-200 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            CloudPedagogy
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-snug">
            AI Sustainability<br />Impact Review
          </h1>
        </div>
        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md focus-visible:ring-2 focus-visible:ring-slate-800"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          onClick={handleLinkClick}
          className={navLinkClass}
          aria-label="System Overview"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>System Overview</span>
        </NavLink>

        <div className="pt-4 pb-1">
          <h2
            id="sidebar-categories-heading"
            className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
          >
            Assessment Categories
          </h2>
        </div>

        <div role="group" aria-labelledby="sidebar-categories-heading" className="space-y-0.5">
          {categories.map((category) => {
            const isComplete = isCategoryComplete(category.id);
            return (
              <NavLink
                key={category.id}
                to={`/category/${category.id}`}
                onClick={handleLinkClick}
                className={navLinkClass}
                title={category.title}
              >
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Completed" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" aria-label="Incomplete" />
                )}
                <span className="truncate">{category.title}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="pt-4 pb-1">
          <h2
            id="sidebar-conclusion-heading"
            className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
          >
            Conclusion
          </h2>
        </div>

        <div role="group" aria-labelledby="sidebar-conclusion-heading" className="space-y-0.5">
          <NavLink
            to="/decision"
            onClick={handleLinkClick}
            className={navLinkClass}
          >
            {decisionRecommendation ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Completed" />
            ) : (
              <Flag className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            )}
            <span>Decision Notes</span>
          </NavLink>

          <NavLink
            to="/summary"
            onClick={handleLinkClick}
            className={navLinkClass}
          >
            <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Review Summary</span>
          </NavLink>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        aria-label="Desktop Main Navigation"
        className="hidden md:flex w-64 h-screen flex-col fixed left-0 top-0 border-r border-slate-200 z-20 print:hidden"
      >
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 md:hidden print:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <nav
            aria-label="Mobile Main Navigation"
            className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-xl z-50 flex flex-col border-r border-slate-200"
          >
            {content}
          </nav>
        </div>
      )}
    </>
  );
}
