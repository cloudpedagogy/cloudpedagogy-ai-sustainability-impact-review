import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SystemOverviewView } from './views/SystemOverviewView';
import { AssessmentCategoryView } from './views/AssessmentCategoryView';
import { DecisionNotesView } from './views/DecisionNotesView';
import { ReviewSummaryView } from './views/ReviewSummaryView';

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Sidebar for Desktop & Mobile Drawer */}
        <Sidebar
          isMobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64">
          <Header onOpenMobileNav={() => setMobileNavOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 print:p-0 print:overflow-visible bg-slate-50">
            <div className="max-w-5xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<SystemOverviewView />} />
                <Route path="/category/:categoryId" element={<AssessmentCategoryView />} />
                <Route path="/decision" element={<DecisionNotesView />} />
                <Route path="/summary" element={<ReviewSummaryView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
