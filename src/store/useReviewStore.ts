import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemOverview, DecisionRecommendation } from '../config/assessmentSchema';
import type { AssessmentRecord } from '../utils/serialization';
import { validateAndParseImport } from '../utils/serialization';

export interface AssessmentResponse {
  score: number; // 1-5 scale (0 indicates unassessed in legacy data)
  notes: string;
}

export interface ReviewState {
  // Current active review fields (consumed directly by existing views)
  activeAssessmentId: string;
  systemOverview: SystemOverview;
  assessments: Record<string, Record<string, AssessmentResponse>>;
  decisionRecommendation: DecisionRecommendation;
  decisionRationale: string;

  // Multiple assessments store
  savedAssessments: Record<string, AssessmentRecord>;

  // Actions
  updateSystemOverview: (field: keyof SystemOverview, value: string) => void;
  updateAssessment: (categoryId: string, questionId: string, score: number, notes: string) => void;
  updateDecision: (recommendation: DecisionRecommendation, rationale: string) => void;

  // Multi-assessment management
  createNewAssessment: (name?: string) => string;
  loadAssessment: (id: string) => boolean;
  saveCurrentAssessment: (name?: string) => void;
  deleteAssessment: (id: string) => void;
  duplicateAssessment: (id: string) => string;

  // Reset and import
  clearCurrentReview: () => void;
  clearReview: () => void; // Backward-compatible alias
  importState: (data: unknown) => { success: boolean; error?: string };
}

export const initialSystemOverview: SystemOverview = {
  systemName: '',
  description: '',
  contextOfUse: '',
  sector: '',
  primaryUsers: '',
  aiUseType: '',
  lifecycleStage: '',
  intendedDuration: '',
  keyStakeholders: '',
  systemOwner: '',
  reviewDate: new Date().toISOString().split('T')[0],
  nextReviewDate: '',
  reviewPurpose: '',
};

function generateId(prefix: string = 'review'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function createDefaultRecord(id: string = generateId(), name?: string): AssessmentRecord {
  const timestamp = new Date().toISOString();
  return {
    id,
    name: name?.trim() || 'Untitled Assessment',
    createdAt: timestamp,
    updatedAt: timestamp,
    systemOverview: {
      ...initialSystemOverview,
      reviewDate: timestamp.split('T')[0],
    },
    assessments: {},
    decisionRecommendation: '',
    decisionRationale: '',
  };
}

/**
 * Migrates legacy unversioned state into the version 1 multi-assessment model.
 */
export function migrateLegacyState(persisted: unknown): Partial<ReviewState> {
  if (typeof persisted !== 'object' || persisted === null) {
    const defaultRecord = createDefaultRecord();
    return {
      activeAssessmentId: defaultRecord.id,
      systemOverview: defaultRecord.systemOverview,
      assessments: defaultRecord.assessments,
      decisionRecommendation: defaultRecord.decisionRecommendation,
      decisionRationale: defaultRecord.decisionRationale,
      savedAssessments: { [defaultRecord.id]: defaultRecord },
    };
  }

  const p = persisted as Record<string, unknown>;

  // If already contains savedAssessments and activeAssessmentId, validate and return
  if (
    typeof p.savedAssessments === 'object' &&
    p.savedAssessments !== null &&
    typeof p.activeAssessmentId === 'string'
  ) {
    const saved = p.savedAssessments as Record<string, AssessmentRecord>;
    const activeId = p.activeAssessmentId;
    const activeRecord = saved[activeId] || Object.values(saved)[0] || createDefaultRecord();

    return {
      activeAssessmentId: activeRecord.id,
      systemOverview: activeRecord.systemOverview,
      assessments: activeRecord.assessments,
      decisionRecommendation: activeRecord.decisionRecommendation,
      decisionRationale: activeRecord.decisionRationale,
      savedAssessments: saved,
    };
  }

  // Legacy unversioned migration: wrap active state into a single named assessment
  const legacyId = 'default-assessment';
  const legacySystemOverview: SystemOverview = (p.systemOverview as SystemOverview) || {
    ...initialSystemOverview,
    reviewDate: new Date().toISOString().split('T')[0],
  };
  const legacyAssessments = (p.assessments as Record<string, Record<string, AssessmentResponse>>) || {};
  const legacyRecommendation = (p.decisionRecommendation as DecisionRecommendation) || '';
  const legacyRationale = typeof p.decisionRationale === 'string' ? p.decisionRationale : '';

  const assessmentName = legacySystemOverview.systemName?.trim() || 'Restored Assessment';
  const timestamp = new Date().toISOString();

  const record: AssessmentRecord = {
    id: legacyId,
    name: assessmentName,
    createdAt: timestamp,
    updatedAt: timestamp,
    systemOverview: legacySystemOverview,
    assessments: legacyAssessments,
    decisionRecommendation: legacyRecommendation,
    decisionRationale: legacyRationale,
  };

  return {
    activeAssessmentId: legacyId,
    systemOverview: legacySystemOverview,
    assessments: legacyAssessments,
    decisionRecommendation: legacyRecommendation,
    decisionRationale: legacyRationale,
    savedAssessments: { [legacyId]: record },
  };
}

const initialDefaultRecord = createDefaultRecord('default-assessment');

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      activeAssessmentId: initialDefaultRecord.id,
      systemOverview: initialDefaultRecord.systemOverview,
      assessments: initialDefaultRecord.assessments,
      decisionRecommendation: initialDefaultRecord.decisionRecommendation,
      decisionRationale: initialDefaultRecord.decisionRationale,
      savedAssessments: { [initialDefaultRecord.id]: initialDefaultRecord },

      updateSystemOverview: (field, value) => {
        set((state) => {
          const updatedOverview = { ...state.systemOverview, [field]: value };
          const currentRecord = state.savedAssessments[state.activeAssessmentId];
          const updatedName =
            field === 'systemName' && value.trim()
              ? value.trim()
              : currentRecord?.name || 'Untitled Assessment';

          const updatedRecord: AssessmentRecord = {
            ...(currentRecord || createDefaultRecord(state.activeAssessmentId)),
            name: updatedName,
            systemOverview: updatedOverview,
            updatedAt: new Date().toISOString(),
          };

          return {
            systemOverview: updatedOverview,
            savedAssessments: {
              ...state.savedAssessments,
              [state.activeAssessmentId]: updatedRecord,
            },
          };
        });
      },

      updateAssessment: (categoryId, questionId, score, notes) => {
        set((state) => {
          const categoryAssessments = state.assessments[categoryId] || {};
          const updatedAssessments = {
            ...state.assessments,
            [categoryId]: {
              ...categoryAssessments,
              [questionId]: { score, notes },
            },
          };

          const currentRecord = state.savedAssessments[state.activeAssessmentId];
          const updatedRecord: AssessmentRecord = {
            ...(currentRecord || createDefaultRecord(state.activeAssessmentId)),
            assessments: updatedAssessments,
            updatedAt: new Date().toISOString(),
          };

          return {
            assessments: updatedAssessments,
            savedAssessments: {
              ...state.savedAssessments,
              [state.activeAssessmentId]: updatedRecord,
            },
          };
        });
      },

      updateDecision: (recommendation, rationale) => {
        set((state) => {
          const currentRecord = state.savedAssessments[state.activeAssessmentId];
          const updatedRecord: AssessmentRecord = {
            ...(currentRecord || createDefaultRecord(state.activeAssessmentId)),
            decisionRecommendation: recommendation,
            decisionRationale: rationale,
            updatedAt: new Date().toISOString(),
          };

          return {
            decisionRecommendation: recommendation,
            decisionRationale: rationale,
            savedAssessments: {
              ...state.savedAssessments,
              [state.activeAssessmentId]: updatedRecord,
            },
          };
        });
      },

      createNewAssessment: (name?: string) => {
        const newRecord = createDefaultRecord(generateId(), name);
        set((state) => ({
          activeAssessmentId: newRecord.id,
          systemOverview: newRecord.systemOverview,
          assessments: newRecord.assessments,
          decisionRecommendation: newRecord.decisionRecommendation,
          decisionRationale: newRecord.decisionRationale,
          savedAssessments: {
            ...state.savedAssessments,
            [newRecord.id]: newRecord,
          },
        }));
        return newRecord.id;
      },

      loadAssessment: (id: string) => {
        const state = get();
        const record = state.savedAssessments[id];
        if (!record) return false;

        set({
          activeAssessmentId: id,
          systemOverview: { ...record.systemOverview },
          assessments: JSON.parse(JSON.stringify(record.assessments)),
          decisionRecommendation: record.decisionRecommendation,
          decisionRationale: record.decisionRationale,
        });
        return true;
      },

      saveCurrentAssessment: (name?: string) => {
        set((state) => {
          const currentRecord = state.savedAssessments[state.activeAssessmentId];
          const updatedName = name?.trim() || currentRecord?.name || state.systemOverview.systemName || 'Untitled Assessment';
          const updatedRecord: AssessmentRecord = {
            ...(currentRecord || createDefaultRecord(state.activeAssessmentId)),
            name: updatedName,
            systemOverview: { ...state.systemOverview },
            assessments: JSON.parse(JSON.stringify(state.assessments)),
            decisionRecommendation: state.decisionRecommendation,
            decisionRationale: state.decisionRationale,
            updatedAt: new Date().toISOString(),
          };

          return {
            savedAssessments: {
              ...state.savedAssessments,
              [state.activeAssessmentId]: updatedRecord,
            },
          };
        });
      },

      deleteAssessment: (id: string) => {
        set((state) => {
          const remaining = { ...state.savedAssessments };
          delete remaining[id];
          const remainingKeys = Object.keys(remaining);

          if (remainingKeys.length === 0) {
            const fresh = createDefaultRecord();
            return {
              activeAssessmentId: fresh.id,
              systemOverview: fresh.systemOverview,
              assessments: fresh.assessments,
              decisionRecommendation: fresh.decisionRecommendation,
              decisionRationale: fresh.decisionRationale,
              savedAssessments: { [fresh.id]: fresh },
            };
          }

          if (state.activeAssessmentId === id) {
            const nextId = remainingKeys[0];
            const nextRecord = remaining[nextId];
            return {
              activeAssessmentId: nextId,
              systemOverview: { ...nextRecord.systemOverview },
              assessments: JSON.parse(JSON.stringify(nextRecord.assessments)),
              decisionRecommendation: nextRecord.decisionRecommendation,
              decisionRationale: nextRecord.decisionRationale,
              savedAssessments: remaining,
            };
          }

          return { savedAssessments: remaining };
        });
      },

      duplicateAssessment: (id: string) => {
        const state = get();
        const source = state.savedAssessments[id];
        if (!source) return '';

        const newId = generateId('copy');
        const timestamp = new Date().toISOString();
        const copy: AssessmentRecord = {
          ...JSON.parse(JSON.stringify(source)),
          id: newId,
          name: `${source.name} (Copy)`,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((prev) => ({
          activeAssessmentId: newId,
          systemOverview: copy.systemOverview,
          assessments: copy.assessments,
          decisionRecommendation: copy.decisionRecommendation,
          decisionRationale: copy.decisionRationale,
          savedAssessments: {
            ...prev.savedAssessments,
            [newId]: copy,
          },
        }));

        return newId;
      },

      clearCurrentReview: () => {
        set((state) => {
          const current = state.savedAssessments[state.activeAssessmentId];
          const resetOverview: SystemOverview = {
            ...initialSystemOverview,
            reviewDate: new Date().toISOString().split('T')[0],
          };
          const resetRecord: AssessmentRecord = {
            id: state.activeAssessmentId,
            name: current?.name || 'Untitled Assessment',
            createdAt: current?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            systemOverview: resetOverview,
            assessments: {},
            decisionRecommendation: '',
            decisionRationale: '',
          };

          return {
            systemOverview: resetOverview,
            assessments: {},
            decisionRecommendation: '',
            decisionRationale: '',
            savedAssessments: {
              ...state.savedAssessments,
              [state.activeAssessmentId]: resetRecord,
            },
          };
        });
      },

      clearReview: () => {
        get().clearCurrentReview();
      },

      importState: (data: unknown) => {
        let jsonStr: string;
        if (typeof data === 'string') {
          jsonStr = data;
        } else {
          try {
            jsonStr = JSON.stringify(data);
          } catch {
            return { success: false, error: 'Failed to serialize import data for validation.' };
          }
        }

        const parseResult = validateAndParseImport(jsonStr);
        if (!parseResult.success) {
          return { success: false, error: parseResult.error };
        }

        const importedRecords = parseResult.assessments;
        const newMap: Record<string, AssessmentRecord> = {};
        for (const r of importedRecords) {
          newMap[r.id] = r;
        }

        const targetActiveId = parseResult.activeAssessmentId && newMap[parseResult.activeAssessmentId]
          ? parseResult.activeAssessmentId
          : importedRecords[0].id;

        const targetRecord = newMap[targetActiveId];

        set((state) => ({
          savedAssessments: {
            ...state.savedAssessments,
            ...newMap,
          },
          activeAssessmentId: targetActiveId,
          systemOverview: { ...targetRecord.systemOverview },
          assessments: JSON.parse(JSON.stringify(targetRecord.assessments)),
          decisionRecommendation: targetRecord.decisionRecommendation,
          decisionRationale: targetRecord.decisionRationale,
        }));

        return { success: true };
      },
    }),
    {
      name: 'cp-sustainability-review-storage',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0 || version === undefined) {
          return migrateLegacyState(persistedState) as ReviewState;
        }
        return persistedState as ReviewState;
      },
    }
  )
);
