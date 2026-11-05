import { describe, it, expect, beforeEach } from 'vitest';
import { useReviewStore, migrateLegacyState } from './useReviewStore';
import { APPLICATION_ID, CURRENT_SCHEMA_VERSION, METHODOLOGY_ID } from '../utils/serialization';

describe('useReviewStore — Legacy Migration', () => {
  it('correctly migrates legacy unversioned state into version 1 multi-assessment model as methodology v1', () => {
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
    expect(migrated.savedAssessments!['default-assessment'].methodologyVersion).toBe('cp-sustainability-methodology-v1');
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
    store.updateSystemOverview('aiUseType', 'Conversational Assistant');
    store.updateSystemOverview('intendedDuration', '3 academic years');

    const state = useReviewStore.getState();
    expect(state.systemOverview.systemName).toBe('Adaptive Feedback Bot');
    expect(state.systemOverview.sector).toBe('Higher Education');
    expect(state.systemOverview.aiUseType).toBe('Conversational Assistant');
    expect(state.systemOverview.intendedDuration).toBe('3 academic years');
    expect(state.savedAssessments[state.activeAssessmentId].name).toBe('Adaptive Feedback Bot');
  });

  it('updates assessment question response and optional evidence info', () => {
    const store = useReviewStore.getState();
    store.updateAssessment('technical', 'tech_fallback', 4, 'Fallback logic is incomplete', {
      evidenceType: 'qualitative',
      evidenceSource: 'Architecture diagram review',
      assumptions: 'Assumes primary API availability is 99%',
      confidence: 'medium',
    });

    const state = useReviewStore.getState();
    const resp = state.assessments.technical.tech_fallback;
    expect(resp.score).toBe(4);
    expect(resp.notes).toBe('Fallback logic is incomplete');
    expect(resp.evidenceType).toBe('qualitative');
    expect(resp.evidenceSource).toBe('Architecture diagram review');
    expect(resp.confidence).toBe('medium');

    const savedResp = state.savedAssessments[state.activeAssessmentId].assessments.technical.tech_fallback;
    expect(savedResp.score).toBe(4);
    expect(savedResp.evidenceType).toBe('qualitative');
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
    expect(state.savedAssessments[secondId].methodologyVersion).toBe('cp-sustainability-methodology-v2');
  });

  it('creates a new v2 reassessment preserving historical v1 record completely and resetting decision provenance', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'Historical Evaluation');
    store.updateAssessment('technical', 'tech_maintainability', 2, 'Maintained under v1');
    store.updateDecision('Proceed with Conditions', 'Original conditional approval under 34 questions');

    // Simulate assessment initialized in v1
    const v1Id = store.activeAssessmentId;
    useReviewStore.setState((prev) => ({
      savedAssessments: {
        ...prev.savedAssessments,
        [v1Id]: {
          ...prev.savedAssessments[v1Id],
          methodologyVersion: 'cp-sustainability-methodology-v1',
        },
      },
    }));

    expect(useReviewStore.getState().savedAssessments[v1Id].methodologyVersion).toBe('cp-sustainability-methodology-v1');

    const v2Id = store.upgradeAssessmentMethodology(v1Id);
    expect(v2Id).toBeDefined();
    expect(v2Id).not.toBe(v1Id);

    const state = useReviewStore.getState();

    // 1. Original v1 assessment must remain preserved completely
    const v1Record = state.savedAssessments[v1Id];
    expect(v1Record).toBeDefined();
    expect(v1Record.methodologyVersion).toBe('cp-sustainability-methodology-v1');
    expect(v1Record.name).toBe('Historical Evaluation');
    expect(v1Record.decisionRecommendation).toBe('Proceed with Conditions');
    expect(v1Record.decisionRationale).toBe('Original conditional approval under 34 questions');
    expect(v1Record.assessments.technical.tech_maintainability.score).toBe(2);

    // 2. New v2 assessment must be active and linked via sourceAssessmentId
    expect(state.activeAssessmentId).toBe(v2Id);
    const v2Record = state.savedAssessments[v2Id];
    expect(v2Record).toBeDefined();
    expect(v2Record.methodologyVersion).toBe('cp-sustainability-methodology-v2');
    expect(v2Record.name).toBe('Historical Evaluation (v2 Reassessment)');
    expect(v2Record.sourceAssessmentId).toBe(v1Id);

    // 3. New v2 assessment must have copied answers but fresh undecided decision provenance
    expect(v2Record.assessments.technical.tech_maintainability.score).toBe(2);
    expect(v2Record.decisionRecommendation).toBe('');
    expect(v2Record.decisionRationale).toBe('');
    expect(state.decisionRecommendation).toBe('');
    expect(state.decisionRationale).toBe('');

    // 4. Modifying v2 reassessment must not mutate historical v1 record
    store.updateAssessment('technical', 'tech_maintainability', 5, 'Critical tech debt uncovered in v2');
    const stateAfterUpdate = useReviewStore.getState();
    expect(stateAfterUpdate.savedAssessments[v2Id].assessments.technical.tech_maintainability.score).toBe(5);
    expect(stateAfterUpdate.savedAssessments[v1Id].assessments.technical.tech_maintainability.score).toBe(2);
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

  it('handles ID collision during import by safely assigning a fresh ID and preserving existing data', () => {
    const store = useReviewStore.getState();
    store.updateSystemOverview('systemName', 'Original Active Assessment');
    const existingId = store.activeAssessmentId;

    // Craft an import payload having the exact same ID as existingId
    const collidingImportPayload = {
      application: APPLICATION_ID,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      methodology: METHODOLOGY_ID,
      exportedAt: new Date().toISOString(),
      activeAssessmentId: existingId,
      assessments: [
        {
          id: existingId, // COLLIDING ID
          name: 'Conflicting External Assessment',
          methodologyVersion: 'cp-sustainability-methodology-v2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          systemOverview: { systemName: 'Conflicting External Assessment' },
          assessments: {
            technical: {
              tech_maintainability: { score: 3, notes: 'From backup' },
            },
          },
          decisionRecommendation: 'Proceed',
          decisionRationale: '',
        },
      ],
    };

    const result = store.importState(JSON.stringify(collidingImportPayload));
    expect(result.success).toBe(true);

    const stateAfter = useReviewStore.getState();
    // 1. Existing assessment must NOT be overwritten!
    expect(stateAfter.savedAssessments[existingId]).toBeDefined();
    expect(stateAfter.savedAssessments[existingId].name).toBe('Original Active Assessment');

    // 2. The imported assessment must be preserved under a fresh non-colliding ID
    const importedRecord = Object.values(stateAfter.savedAssessments).find((rec) =>
      rec.name.includes('Conflicting External Assessment')
    );
    expect(importedRecord).toBeDefined();
    expect(importedRecord!.id).not.toBe(existingId);
    expect(importedRecord!.name).toContain('(Imported)');
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

  it('remaps sourceAssessmentId correctly when imported assessments undergo ID remapping', () => {
    const store = useReviewStore.getState();
    const existingId = store.activeAssessmentId;

    const parentOriginalId = existingId;
    const childOriginalId = 'child-assessment-1';

    const importPayload = {
      application: APPLICATION_ID,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      methodology: METHODOLOGY_ID,
      exportedAt: new Date().toISOString(),
      activeAssessmentId: childOriginalId,
      assessments: [
        {
          id: parentOriginalId, // Collides with existingId
          name: 'Parent Assessment',
          methodologyVersion: 'cp-sustainability-methodology-v1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          systemOverview: { systemName: 'Parent System' },
          assessments: {},
          decisionRecommendation: 'Proceed',
          decisionRationale: 'Original v1 review',
        },
        {
          id: childOriginalId,
          name: 'Child Assessment',
          methodologyVersion: 'cp-sustainability-methodology-v2',
          sourceAssessmentId: parentOriginalId, // Points to parent which collides
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          systemOverview: { systemName: 'Child System' },
          assessments: {},
          decisionRecommendation: '',
          decisionRationale: '',
        },
      ],
    };

    const result = store.importState(JSON.stringify(importPayload));
    expect(result.success).toBe(true);

    const stateAfter = useReviewStore.getState();
    const importedParent = Object.values(stateAfter.savedAssessments).find((rec) =>
      rec.name.includes('Parent Assessment')
    );
    const importedChild = Object.values(stateAfter.savedAssessments).find((rec) =>
      rec.name.includes('Child Assessment')
    );

    expect(importedParent).toBeDefined();
    expect(importedChild).toBeDefined();
    // Parent ID must have been remapped because it collided with existingId
    expect(importedParent!.id).not.toBe(parentOriginalId);
    // Child sourceAssessmentId must have been updated to point to parent's new ID
    expect(importedChild!.sourceAssessmentId).toBe(importedParent!.id);
  });
});
