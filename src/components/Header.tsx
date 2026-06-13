import { Download, Upload, Trash2, ShieldCheck } from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';

export function Header() {
  const { clearReview, importState } = useReviewStore();

  const handleExport = () => {
    const state = useReviewStore.getState();
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sustainability-review-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        importState(parsed);
      } catch (err) {
        alert("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
      <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Local-first Governance Tool</span>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all review data? This cannot be undone.')) {
                clearReview();
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ml-4"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </button>
        </div>
      </div>
    </header>
  );
}
