import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemOverview, DecisionRecommendation } from '../config/assessmentSchema';

export interface AssessmentResponse {
  score: number; // 1-5 scale
  notes: string;
}

export interface ReviewState {
  systemOverview: SystemOverview;
  assessments: Record<string, Record<string, AssessmentResponse>>;
  decisionRecommendation: DecisionRecommendation;
  decisionRationale: string;
  
  // Actions
  updateSystemOverview: (field: keyof SystemOverview, value: string) => void;
  updateAssessment: (categoryId: string, questionId: string, score: number, notes: string) => void;
  updateDecision: (recommendation: DecisionRecommendation, rationale: string) => void;
  clearReview: () => void;
  importState: (newState: Partial<ReviewState>) => void;
}

const initialSystemOverview: SystemOverview = {
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

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      systemOverview: initialSystemOverview,
      assessments: {},
      decisionRecommendation: '',
      decisionRationale: '',

      updateSystemOverview: (field, value) => 
        set((state) => ({
          systemOverview: { ...state.systemOverview, [field]: value }
        })),

      updateAssessment: (categoryId, questionId, score, notes) =>
        set((state) => {
          const categoryAssessments = state.assessments[categoryId] || {};
          return {
            assessments: {
              ...state.assessments,
              [categoryId]: {
                ...categoryAssessments,
                [questionId]: { score, notes }
              }
            }
          };
        }),

      updateDecision: (recommendation, rationale) =>
        set(() => ({
          decisionRecommendation: recommendation,
          decisionRationale: rationale
        })),

      clearReview: () => set({ 
        systemOverview: { ...initialSystemOverview, reviewDate: new Date().toISOString().split('T')[0] },
        assessments: {},
        decisionRecommendation: '',
        decisionRationale: ''
      }),

      importState: (newState) => set((state) => ({
        ...state,
        ...newState
      }))
    }),
    {
      name: 'cp-sustainability-review-storage', // unique name
    }
  )
);
