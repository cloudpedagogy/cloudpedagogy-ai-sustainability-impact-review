import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AssessmentCategoryView } from './AssessmentCategoryView';
import { SystemOverviewView } from './SystemOverviewView';
import { DecisionNotesView } from './DecisionNotesView';
import { ReviewSummaryView } from './ReviewSummaryView';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useReviewStore } from '../store/useReviewStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Batch 3 — Accessibility & Views DOM Testing', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    useReviewStore.getState().clearCurrentReview();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders rating controls as accessible radiogroup with clear labels and value selection', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/category/technical']}>
          <Routes>
            <Route path="/category/:categoryId" element={<AssessmentCategoryView />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const radiogroups = container.querySelectorAll('[role="radiogroup"]');
    expect(radiogroups.length).toBeGreaterThan(0);

    const firstRadioGroup = radiogroups[0];
    expect(firstRadioGroup.getAttribute('aria-labelledby')).toBeTruthy();

    const radioInputs = firstRadioGroup.querySelectorAll('input[type="radio"]');
    expect(radioInputs.length).toBe(5);

    // Initial state: unanswered (none checked)
    const checkedRadiosBefore = firstRadioGroup.querySelectorAll('input[type="radio"]:checked');
    expect(checkedRadiosBefore.length).toBe(0);

    // Initial status badge shows Unanswered
    expect(container.textContent).toContain('Unanswered');

    // Select score 2
    const radio2 = radioInputs[1] as HTMLInputElement;
    expect(radio2.value).toBe('2');
    expect(radio2.getAttribute('aria-label')).toContain('Score 2: Minor Concern / Low Risk');

    act(() => {
      radio2.click();
    });

    // Score is now 2 in store
    const currentScore = useReviewStore.getState().assessments.technical.tech_maintainability?.score;
    expect(currentScore).toBe(2);

    // Status badge shows scored
    expect(container.textContent).toContain('Scored 2/5');

    // Clear button is visible and clicking it resets score to 0
    const clearButton = container.querySelector('button[aria-label*="Clear rating"]') as HTMLButtonElement;
    expect(clearButton).not.toBeNull();

    act(() => {
      clearButton.click();
    });

    expect(useReviewStore.getState().assessments.technical.tech_maintainability?.score).toBe(0);
    expect(container.textContent).toContain('Unanswered');
  });

  it('associates System Overview form labels with inputs via htmlFor and id', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <SystemOverviewView />
        </MemoryRouter>
      );
    });

    const systemNameInput = container.querySelector('#systemOverview-systemName') as HTMLInputElement;
    expect(systemNameInput).not.toBeNull();
    const systemNameLabel = container.querySelector('label[for="systemOverview-systemName"]');
    expect(systemNameLabel).not.toBeNull();
    expect(systemNameLabel?.textContent).toContain('System / Project Name');

    const descTextarea = container.querySelector('#systemOverview-description') as HTMLTextAreaElement;
    expect(descTextarea).not.toBeNull();
    const descLabel = container.querySelector('label[for="systemOverview-description"]');
    expect(descLabel).not.toBeNull();

    const purposeSelect = container.querySelector('#systemOverview-reviewPurpose') as HTMLSelectElement;
    expect(purposeSelect).not.toBeNull();
    const purposeLabel = container.querySelector('label[for="systemOverview-reviewPurpose"]');
    expect(purposeLabel).not.toBeNull();
  });

  it('renders accessible Decision Notes with radiogroup and rationale label association', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/decision']}>
          <DecisionNotesView />
        </MemoryRouter>
      );
    });

    const recLegend = container.querySelector('#decision-recommendation-legend');
    expect(recLegend).not.toBeNull();

    const recRadiogroup = container.querySelector('[role="radiogroup"][aria-labelledby="decision-recommendation-legend"]');
    expect(recRadiogroup).not.toBeNull();

    const radios = recRadiogroup!.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(4);

    const rationaleTextarea = container.querySelector('#decision-rationale') as HTMLTextAreaElement;
    expect(rationaleTextarea).not.toBeNull();
    const rationaleLabel = container.querySelector('label[for="decision-rationale"]');
    expect(rationaleLabel).not.toBeNull();

    // Select "Proceed with Conditions"
    const proceedWithCondRadio = container.querySelector('#decision-rec-proceed-with-conditions') as HTMLInputElement;
    expect(proceedWithCondRadio).not.toBeNull();

    act(() => {
      proceedWithCondRadio.click();
    });

    expect(useReviewStore.getState().decisionRecommendation).toBe('Proceed with Conditions');
  });

  it('provides accessible mobile navigation drawer with Escape key handling and close trigger', () => {
    let closed = false;
    const handleClose = () => {
      closed = true;
    };

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isMobileOpen={true} onClose={handleClose} />
        </MemoryRouter>
      );
    });

    const mobileDialog = container.querySelector('[role="dialog"][aria-label="Mobile Navigation Menu"]');
    expect(mobileDialog).not.toBeNull();

    const closeBtn = container.querySelector('button[aria-label="Close navigation menu"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    act(() => {
      closeBtn.click();
    });
    expect(closed).toBe(true);

    // Test Escape key closes menu
    closed = false;
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(closed).toBe(true);
  });

  it('includes mobile navigation button in Header', () => {
    let opened = false;
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Header onOpenMobileNav={() => { opened = true; }} />
        </MemoryRouter>
      );
    });

    const mobileMenuBtn = container.querySelector('button[aria-label="Open navigation menu"]') as HTMLButtonElement;
    expect(mobileMenuBtn).not.toBeNull();

    act(() => {
      mobileMenuBtn.click();
    });
    expect(opened).toBe(true);
  });

  it('renders complete governance review pack in ReviewSummaryView with all 14 required sections', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'Comprehensive Automated Grader');
    store.updateSystemOverview('reviewPurpose', 'Pre-Deployment Review');
    store.updateSystemOverview('systemOwner', 'Faculty Dean');
    store.updateAssessment('technical', 'tech_maintainability', 4, 'High tech debt note', {
      evidenceType: 'estimated',
      evidenceSource: 'Vendor Spec 2026',
      assumptions: 'Assumes SLA 99%',
      confidence: 'medium',
    });
    store.updateDecision('Proceed with Conditions', 'Must address maintainability within 6 months.');

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/summary']}>
          <ReviewSummaryView />
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';

    // 1. Title and application
    expect(text).toContain('AI Sustainability Impact Review');
    expect(text).toContain('Governance Pack');

    // 2. Assessment name and system overview
    expect(text).toContain('Comprehensive Automated Grader');
    expect(text).toContain('Pre-Deployment Review');
    expect(text).toContain('Faculty Dean');

    // 3. Methodology version and question count
    expect(text).toContain('v2 (38 Questions)');

    // 4. Assessment completion status (provisional since only 1 question scored)
    expect(text).toContain('Provisional');

    // 5. Overall score and category scores
    expect(text).toContain('Category Scores');

    // 6. Severe individual concerns callout (score 4)
    expect(text).toContain('Severe Individual Concerns Identified');
    expect(text).toContain('Score 4/5');

    // 7. Context-sensitive advisory mitigations
    expect(text).toContain('Priority Mitigations & Advisory Guidance');

    // 8. Decision recommendation and rationale
    expect(text).toContain('Proceed with Conditions');
    expect(text).toContain('Must address maintainability within 6 months.');

    // 9. Methodological limitations & advisory disclaimers
    expect(text).toContain('Methodological Limitations & Advisory Disclaimers');
    expect(text).toContain('Qualitative Governance Evaluation');
    expect(text).toContain('Advisory Recommendations');
    expect(text).toContain('Self-Reported Evidence');
    expect(text).toContain('Open-Source Independence');

    // 10. Complete question audit section exists (with force-show for print)
    const auditSection = container.querySelector('.print-force-show');
    expect(auditSection).not.toBeNull();
    expect(auditSection?.textContent).toContain('Complete Assessment Question Audit');
    expect(auditSection?.textContent).toContain('Vendor Spec 2026');
    expect(auditSection?.textContent).toContain('Assumes SLA 99%');
  });

  it('renders historical source assessment provenance in ReviewSummaryView when linked', () => {
    const store = useReviewStore.getState();
    const originalId = store.activeAssessmentId;
    store.updateSystemOverview('systemName', 'Historical V1 Assessment');

    // Upgrade to v2 reassessment
    const v2Id = store.upgradeAssessmentMethodology(originalId);
    expect(v2Id).toBeTruthy();

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/summary']}>
          <ReviewSummaryView />
        </MemoryRouter>
      );
    });

    const text = container.textContent || '';
    expect(text).toContain('This is a Methodology v2 reassessment linked to historical source record');
    expect(text).toContain('Historical V1 Assessment');
  });
});
