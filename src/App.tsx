import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SystemOverviewView } from './views/SystemOverviewView';
import { AssessmentCategoryView } from './views/AssessmentCategoryView';
import { DecisionNotesView } from './views/DecisionNotesView';
import { ReviewSummaryView } from './views/ReviewSummaryView';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <div className="w-64 shrink-0 print:hidden">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible bg-slate-50">
            <div className="max-w-5xl mx-auto">
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
