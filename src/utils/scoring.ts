import type { Category, Question } from '../config/assessmentSchema';
import type { AssessmentResponse } from '../store/useReviewStore';

export interface SevereConcernQuestion {
  questionId: string;
  questionText: string;
  score: number;
}

export interface RiskBandClassification {
  label: string;
  color: string;
  isProvisional: boolean;
  bandIndex: number; // 0 = Not Assessed, 1 = Low Risk, ..., 5 = Critical
}

export interface CategoryScoreSummary {
  categoryId: string;
  categoryTitle: string;
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
  completionPercentage: number;
  isComplete: boolean;
  average: number | null;
  maxScore: number | null;
  hasSevereConcern: boolean;
  severeConcernQuestions: SevereConcernQuestion[];
  riskBand: RiskBandClassification;
  requiresMitigation: boolean;
}

export interface OverallScoreSummary {
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
  completionPercentage: number;
  isComplete: boolean;
  average: number | null;
  maxScore: number | null;
  severeConcernCount: number;
  categoriesWithSevereConcerns: CategoryScoreSummary[];
  highestRiskCategories: CategoryScoreSummary[];
  overallRiskBand: RiskBandClassification;
  categorySummaries: CategoryScoreSummary[];
}

/**
 * Validates whether a given score is an integer between 1 and 5.
 */
export function isValidScore(score: unknown): score is number {
  return typeof score === 'number' && Number.isInteger(score) && score >= 1 && score <= 5;
}

/**
 * Returns the risk classification label and styling according to CloudPedagogy risk bands:
 * - <= 1.8: Sustainable / Low Risk
 * - <= 2.6: Manageable with Monitoring
 * - <= 3.4: Sustainability Risks Present
 * - <= 4.2: Significant Sustainability Concerns
 * - > 4.2: Critical Sustainability Concern
 *
 * For incomplete assessments, flags the score as provisional so that partial reviews
 * are never presented as definitively Sustainable or Low Risk.
 */
export function getRiskLabelAndColor(
  score: number | null,
  isComplete: boolean = true
): RiskBandClassification {
  if (score === null || score === 0 || Number.isNaN(score)) {
    return {
      label: 'Not Assessed',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      isProvisional: false,
      bandIndex: 0,
    };
  }

  if (!isComplete) {
    if (score <= 1.8) {
      return {
        label: 'Provisional (Incomplete — Low Concern to date)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        isProvisional: true,
        bandIndex: 1,
      };
    }
    if (score <= 2.6) {
      return {
        label: 'Provisional (Incomplete — Manageable with Monitoring)',
        color: 'bg-blue-50 text-blue-800 border-blue-300',
        isProvisional: true,
        bandIndex: 2,
      };
    }
    if (score <= 3.4) {
      return {
        label: 'Provisional (Incomplete — Sustainability Risks Present)',
        color: 'bg-amber-50 text-amber-800 border-amber-300',
        isProvisional: true,
        bandIndex: 3,
      };
    }
    if (score <= 4.2) {
      return {
        label: 'Provisional (Incomplete — Significant Concerns)',
        color: 'bg-orange-50 text-orange-800 border-orange-300',
        isProvisional: true,
        bandIndex: 4,
      };
    }
    return {
      label: 'Provisional (Incomplete — Critical Concern)',
      color: 'bg-red-50 text-red-800 border-red-300',
      isProvisional: true,
      bandIndex: 5,
    };
  }

  // Complete assessment classifications
  if (score <= 1.8) {
    return {
      label: 'Sustainable / Low Risk',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isProvisional: false,
      bandIndex: 1,
    };
  }
  if (score <= 2.6) {
    return {
      label: 'Manageable with Monitoring',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      isProvisional: false,
      bandIndex: 2,
    };
  }
  if (score <= 3.4) {
    return {
      label: 'Sustainability Risks Present',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      isProvisional: false,
      bandIndex: 3,
    };
  }
  if (score <= 4.2) {
    return {
      label: 'Significant Sustainability Concerns',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      isProvisional: false,
      bandIndex: 4,
    };
  }
  return {
    label: 'Critical Sustainability Concern',
    color: 'bg-red-50 text-red-700 border-red-200',
    isProvisional: false,
    bandIndex: 5,
  };
}

/**
 * Calculates scores, completion status, and severe concern flags for a single category.
 * Missing/unanswered responses are never treated as score 0.
 */
export function calculateCategoryScore(
  category: Category,
  responses: Record<string, AssessmentResponse | undefined> | undefined
): CategoryScoreSummary {
  const safeResponses = responses || {};
  const totalQuestions = category.questions.length;

  const answeredScores: number[] = [];
  const severeConcernQuestions: SevereConcernQuestion[] = [];

  category.questions.forEach((q: Question) => {
    const rawScore = safeResponses[q.id]?.score;
    if (isValidScore(rawScore)) {
      answeredScores.push(rawScore);
      if (rawScore >= 4) {
        severeConcernQuestions.push({
          questionId: q.id,
          questionText: q.text,
          score: rawScore,
        });
      }
    }
  });

  const answeredQuestions = answeredScores.length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const completionPercentage = totalQuestions > 0
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;
  const isComplete = answeredQuestions === totalQuestions;

  const average = answeredQuestions > 0
    ? Number((answeredScores.reduce((acc, curr) => acc + curr, 0) / answeredQuestions).toFixed(2))
    : null;

  const maxScore = answeredScores.length > 0 ? Math.max(...answeredScores) : null;
  const hasSevereConcern = severeConcernQuestions.length > 0;

  const riskBand = getRiskLabelAndColor(average, isComplete);

  // Mitigation trigger: Category average exceeds acceptable threshold (> 2.6, i.e. Band 3+) OR contains severe concern (>= 4)
  const requiresMitigation = (average !== null && average > 2.6) || hasSevereConcern;

  return {
    categoryId: category.id,
    categoryTitle: category.title,
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
    completionPercentage,
    isComplete,
    average,
    maxScore,
    hasSevereConcern,
    severeConcernQuestions,
    riskBand,
    requiresMitigation,
  };
}

/**
 * Calculates overall assessment scores across all categories.
 * Preserves the average as a descriptive indicator, and calculates separate
 * completion status, max individual concern score, and lists of categories with severe concerns.
 */
export function calculateOverallScore(
  categories: Category[],
  assessments: Record<string, Record<string, AssessmentResponse>> | undefined
): OverallScoreSummary {
  const safeAssessments = assessments || {};

  const categorySummaries = categories.map((cat) =>
    calculateCategoryScore(cat, safeAssessments[cat.id])
  );

  const totalQuestions = categorySummaries.reduce((sum, c) => sum + c.totalQuestions, 0);
  const answeredQuestions = categorySummaries.reduce((sum, c) => sum + c.answeredQuestions, 0);
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const completionPercentage = totalQuestions > 0
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;
  const isComplete = totalQuestions > 0 && answeredQuestions === totalQuestions;

  const validCategoryAverages = categorySummaries
    .map((c) => c.average)
    .filter((avg): avg is number => avg !== null);

  const average = validCategoryAverages.length > 0
    ? Number(
        (validCategoryAverages.reduce((acc, curr) => acc + curr, 0) / validCategoryAverages.length).toFixed(2)
      )
    : null;

  const maxScore = categorySummaries.reduce<number | null>((currentMax, c) => {
    if (c.maxScore === null) return currentMax;
    return currentMax === null ? c.maxScore : Math.max(currentMax, c.maxScore);
  }, null);

  const severeConcernCount = categorySummaries.reduce(
    (sum, c) => sum + c.severeConcernQuestions.length,
    0
  );

  const categoriesWithSevereConcerns = categorySummaries.filter((c) => c.hasSevereConcern);

  const highestRiskCategories = categorySummaries
    .filter((c) => c.requiresMitigation)
    .sort((a, b) => {
      // Sort primarily by average descending, then by maxScore
      const avgA = a.average ?? 0;
      const avgB = b.average ?? 0;
      if (avgB !== avgA) return avgB - avgA;
      return (b.maxScore ?? 0) - (a.maxScore ?? 0);
    });

  const overallRiskBand = getRiskLabelAndColor(average, isComplete);

  return {
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
    completionPercentage,
    isComplete,
    average,
    maxScore,
    severeConcernCount,
    categoriesWithSevereConcerns,
    highestRiskCategories,
    overallRiskBand,
    categorySummaries,
  };
}
