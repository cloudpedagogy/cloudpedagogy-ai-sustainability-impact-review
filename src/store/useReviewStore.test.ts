import { describe, it, expect, beforeEach } from 'vitest';
import { useReviewStore, migrateLegacyState } from './useReviewStore';
import { APPLICATION_ID, CURRENT_SCHEMA_VERSION, METHODOLOGY_ID } from '../utils/serialization';

describe('useReviewStore — Legacy Migration', () => {
  it('correctly migrates legacy unversioned state into version 1 multi-assessment model', () => {
    const legacyState = {
      systemOverview: {
        systemName: 'Legacy Automated Tutor',
        description: 'Tutor system',
        reviewPurpose: 'Pre-Deployment Review',
      },
      assessments: {
        technical: {
          tech_maintainability: { score: 2, notes: 'Clear docs' },
        },
      },
      decisionRecommendation: 'Proceed with Conditions',
      decisionRationale: 'Requires monitoring.',
    };

    const migrated = migrateLegacyState(legacyState);
    expect(migrated.activeAssessmentId).toBe('default-assessment');
    expect(migrated.savedAssessments).toBeDefined();
    expect(migrated.savedAssessments!['default-assessment']).toBeDefined();
    expect(migrated.savedAssessments!['default-assessment'].name).toBe('Legacy Automated Tutor');
    expect(migrated.savedAssessments!['default-assessment'].assessments.technical.tech_maintainability.score).toBe(2);
    expect(migrated.decisionRecommendation).toBe('Proceed with Conditions');
  });

  it('safely handles null or invalid persisted state without throwing', () => {
    const migrated = migrateLegacyState(null);
    expect(migrated.activeAssessmentId).toBeDefined();
    expect(migrated.savedAssessments).toBeDefined();
  });
});

describe('useReviewStore — Actions & Multi-Assessment Management', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useReviewStore.getState();
    store.clearCurrentReview();
  });

  it('updates system overview and synchronizes with savedAssessments', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'Adaptive Feedback Bot');
    store.updateSystemOverview('sector', 'Higher Education');

    const state = useReviewStore.getState();
    expect(state.systemOverview.systemName).toBe('Adaptive Feedback Bot');
    expect(state.systemOverview.sector).toBe('Higher Education');
    expect(state.savedAssessments[state.activeAssessmentId].name).toBe('Adaptive Feedback Bot');
  });

  it('updates assessment question response and synchronizes with savedAssessments', () => {
    const store = useReviewStore.getState();
    store.updateAssessment('technical', 'tech_fallback', 4, 'Fallback logic is incomplete');

    const state = useReviewStore.getState();
    expect(state.assessments.technical.tech_fallback.score).toBe(4);
    expect(state.assessments.technical.tech_fallback.notes).toBe('Fallback logic is incomplete');
    expect(state.savedAssessments[state.activeAssessmentId].assessments.technical.tech_fallback.score).toBe(4);
  });

  it('allows starting a new assessment without deleting previous ones', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'First System');
    const firstId = store.activeAssessmentId;

    const secondId = store.createNewAssessment('Second System');
    expect(secondId).not.toBe(firstId);

    const state = useReviewStore.getState();
    expect(state.activeAssessmentId).toBe(secondId);
    expect(state.systemOverview.systemName).toBe('');
    expect(state.savedAssessments[firstId].name).toBe('First System');
    expect(state.savedAssessments[secondId].name).toBe('Second System');
  });

  it('switches between saved assessments cleanly', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'Alpha Review');
    store.updateAssessment('technical', 'tech_maintainability', 1, 'Great maintainability');
    const alphaId = store.activeAssessmentId;

    const betaId = store.createNewAssessment('Beta Review');
    expect(betaId).toBeDefined();
    store.updateSystemOverview('systemName', 'Beta Review');
    store.updateAssessment('technical', 'tech_maintainability', 5, 'Critical tech debt');

    // Load Alpha Review back
    const loadSuccess = store.loadAssessment(alphaId);
    expect(loadSuccess).toBe(true);

    const state = useReviewStore.getState();
    expect(state.activeAssessmentId).toBe(alphaId);
    expect(state.systemOverview.systemName).toBe('Alpha Review');
    expect(state.assessments.technical.tech_maintainability.score).toBe(1);
  });

  it('duplicates an assessment successfully', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'Original Model');
    store.updateAssessment('environmental', 'env_overhead', 2, 'Batching enabled');
    const originalId = store.activeAssessmentId;

    const copyId = store.duplicateAssessment(originalId);
    expect(copyId).not.toBe(originalId);

    const state = useReviewStore.getState();
    expect(state.activeAssessmentId).toBe(copyId);
    expect(state.savedAssessments[copyId].name).toBe('Original Model (Copy)');
    expect(state.assessments.environmental.env_overhead.score).toBe(2);
  });

  it('leaves existing store data untouched when import validation fails', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'Protected Original System');
    const originalName = useReviewStore.getState().systemOverview.systemName;
    expect(originalName).toBe('Protected Original System');

    // Attempt to import malformed JSON with out-of-bounds score 99
    const malformedPayload = {
      application: APPLICATION_ID,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      methodology: METHODOLOGY_ID,
      exportedAt: new Date().toISOString(),
      activeAssessmentId: 'corrupted-id',
      assessments: [
        {
          id: 'corrupted-id',
          name: 'Corrupted System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          systemOverview: { systemName: 'Corrupted' },
          assessments: {
            technical: {
              tech_maintainability: { score: 99, notes: '' }, // invalid
            },
          },
          decisionRecommendation: '',
          decisionRationale: '',
        },
      ],
    };

    const result = store.importState(JSON.stringify(malformedPayload));
    expect(result.success).toBe(false);

    // Existing store state must remain untouched
    const stateAfter = useReviewStore.getState();
    expect(stateAfter.systemOverview.systemName).toBe(originalName);
  });
});
