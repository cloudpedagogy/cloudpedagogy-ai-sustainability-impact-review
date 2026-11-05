import { useState } from 'react';
import { Download, Upload, Trash2, ShieldCheck, Plus, Copy, FolderOpen, Menu } from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';
import { createExportBundle, MAX_IMPORT_FILE_SIZE_BYTES } from '../utils/serialization';
import { calculateOverallScore } from '../utils/scoring';
import { getCategoriesForMethodology } from '../config/assessmentSchema';

export interface HeaderProps {
  onOpenMobileNav?: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const {
    activeAssessmentId,
    savedAssessments,
    createNewAssessment,
    loadAssessment,
    duplicateAssessment,
    deleteAssessment,
    clearCurrentReview,
    importState,
  } = useReviewStore();

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExport = () => {
    const bundle = createExportBundle(savedAssessments, activeAssessmentId);
    const dataStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const dataUri = URL.createObjectURL(blob);

    const safeName = (savedAssessments[activeAssessmentId]?.name || 'assessment')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const exportFileName = `sustainability-review-${safeName}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    URL.revokeObjectURL(dataUri);

    showNotification('Versioned JSON export downloaded successfully.', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      showNotification(
        `Import failed: File size exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        'error'
      );
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (readEvent) => {
      try {
        const content = readEvent.target?.result as string;
        const result = importState(content);
        if (result.success) {
          showNotification('Assessment data imported successfully. Existing records preserved.', 'success');
        } else {
          showNotification(`Import validation rejected: ${result.error}`, 'error');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown parsing error';
        showNotification(`Failed to read file: ${errorMsg}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateNew = () => {
    const name = window.prompt('Enter name for the new assessment:', 'New System Review');
    if (name !== null) {
      const newId = createNewAssessment(name);
      showNotification(`Created new assessment "${savedAssessments[newId]?.name || name}".`, 'success');
    }
  };

  const handleDuplicate = () => {
    const newId = duplicateAssessment(activeAssessmentId);
    if (newId) {
      showNotification('Assessment duplicated successfully.', 'success');
    }
  };

  const handleDelete = () => {
    const currentName = savedAssessments[activeAssessmentId]?.name || 'this assessment';
    const totalCount = Object.keys(savedAssessments).length;
    const confirmMsg =
      totalCount > 1
        ? `Are you sure you want to delete "${currentName}"? Other saved assessments will remain.`
        : `Are you sure you want to reset "${currentName}"? This will clear all data.`;

    if (window.confirm(confirmMsg)) {
      deleteAssessment(activeAssessmentId);
      showNotification('Assessment removed.', 'success');
    }
  };

  const savedList = Object.values(savedAssessments);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`px-4 sm:px-6 py-2 text-xs font-medium flex items-center justify-between border-b ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 ml-4 font-bold p-1 focus-visible:ring-2 focus-visible:ring-slate-800 rounded"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-0 min-h-16 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Mobile Nav Toggle & Active Assessment Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          {onOpenMobileNav && (
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider shrink-0">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Active Review:</span>
          </div>

          <div className="relative flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
            <FolderOpen className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <label htmlFor="active-assessment-select" className="sr-only">
              Select saved assessment
            </label>
            <select
              id="active-assessment-select"
              value={activeAssessmentId}
              onChange={(e) => loadAssessment(e.target.value)}
              aria-label="Select saved assessment"
              className="text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-md px-2 py-1 max-w-[160px] xs:max-w-[200px] sm:max-w-xs truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
            >
              {savedList.map((record) => {
                const categories = getCategoriesForMethodology(record.methodologyVersion);
                const summary = calculateOverallScore(categories, record.assessments, record.methodologyVersion);
                const statusTag = summary.isComplete
                  ? 'Complete'
                  : `Draft ${summary.completionPercentage}%`;
                const versionTag = record.methodologyVersion === 'cp-sustainability-methodology-v1' ? ' [v1]' : '';
                return (
                  <option key={record.id} value={record.id}>
                    [{statusTag}]{versionTag} {record.name}
                  </option>
                );
              })}
            </select>

            <button
              onClick={handleCreateNew}
              title="Create new assessment"
              className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
              aria-label="Create new assessment"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={handleDuplicate}
              title="Duplicate current assessment"
              className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
              aria-label="Duplicate current assessment"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <label
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-slate-800"
            aria-label="Import assessments from JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              className="sr-only"
              onChange={handleImport}
              aria-label="Upload JSON file"
            />
          </label>

          <button
            onClick={handleExport}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
            aria-label="Export assessments to JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to clear current review responses? Saved assessment metadata will be preserved.'
                )
              ) {
                clearCurrentReview();
                showNotification('Current review responses cleared.', 'success');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
            title="Clear responses in current review"
            aria-label="Clear responses in current review"
          >
            Clear Responses
          </button>

          {savedList.length > 1 && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              title="Delete current review"
              aria-label="Delete current review"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
