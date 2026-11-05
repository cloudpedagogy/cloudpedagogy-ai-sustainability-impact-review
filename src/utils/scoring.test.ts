import { describe, it, expect } from 'vitest';
import {
  isValidScore,
  getRiskLabelAndColor,
  calculateCategoryScore,
  calculateOverallScore,
} from './scoring';
import { ASSESSMENT_CATEGORIES } from '../config/assessmentSchema';
import type { Category } from '../config/assessmentSchema';

describe('Scoring Utility — isValidScore', () => {
  it('accepts integer scores 1 through 5', () => {
    expect(isValidScore(1)).toBe(true);
    expect(isValidScore(2)).toBe(true);
    expect(isValidScore(3)).toBe(true);
    expect(isValidScore(4)).toBe(true);
    expect(isValidScore(5)).toBe(true);
  });

  it('rejects 0, negative numbers, decimals, non-numbers and out-of-range values', () => {
    expect(isValidScore(0)).toBe(false);
    expect(isValidScore(-1)).toBe(false);
    expect(isValidScore(6)).toBe(false);
    expect(isValidScore(3.5)).toBe(false);
    expect(isValidScore('3')).toBe(false);
    expect(isValidScore(null)).toBe(false);
    expect(isValidScore(undefined)).toBe(false);
    expect(isValidScore({})).toBe(false);
  });
});

describe('Scoring Utility — getRiskLabelAndColor', () => {
  it('returns "Not Assessed" when score is null or 0', () => {
    expect(getRiskLabelAndColor(null).label).toBe('Not Assessed');
    expect(getRiskLabelAndColor(0).label).toBe('Not Assessed');
  });

  it('classifies complete assessments according to risk bands', () => {
    expect(getRiskLabelAndColor(1.0, true).label).toBe('Sustainable / Low Risk');
    expect(getRiskLabelAndColor(1.8, true).label).toBe('Sustainable / Low Risk');
    expect(getRiskLabelAndColor(1.9, true).label).toBe('Manageable with Monitoring');
    expect(getRiskLabelAndColor(2.6, true).label).toBe('Manageable with Monitoring');
    expect(getRiskLabelAndColor(2.7, true).label).toBe('Sustainability Risks Present');
    expect(getRiskLabelAndColor(3.4, true).label).toBe('Sustainability Risks Present');
    expect(getRiskLabelAndColor(3.5, true).label).toBe('Significant Sustainability Concerns');
    expect(getRiskLabelAndColor(4.2, true).label).toBe('Significant Sustainability Concerns');
    expect(getRiskLabelAndColor(4.3, true).label).toBe('Critical Sustainability Concern');
    expect(getRiskLabelAndColor(5.0, true).label).toBe('Critical Sustainability Concern');
  });

  it('never presents incomplete assessments as definitively Sustainable or Low Risk', () => {
    const lowRiskIncomplete = getRiskLabelAndColor(1.2, false);
    expect(lowRiskIncomplete.isProvisional).toBe(true);
    expect(lowRiskIncomplete.label).toContain('Provisional');
    expect(lowRiskIncomplete.label).not.toBe('Sustainable / Low Risk');
  });
});

describe('Scoring Utility — calculateCategoryScore', () => {
  const sampleCategory: Category = {
    id: 'technical',
    title: 'Technical Sustainability',
    description: 'Test category description',
    questions: [
      { id: 'q1', text: 'Question 1' },
      { id: 'q2', text: 'Question 2' },
      { id: 'q3', text: 'Question 3' },
      { id: 'q4', text: 'Question 4' },
      { id: 'q5', text: 'Question 5' },
    ],
  };

  it('correctly handles empty/unanswered category', () => {
    const summary = calculateCategoryScore(sampleCategory, {});
    expect(summary.totalQuestions).toBe(5);
    expect(summary.answeredQuestions).toBe(0);
    expect(summary.unansweredQuestions).toBe(5);
    expect(summary.completionPercentage).toBe(0);
    expect(summary.isComplete).toBe(false);
    expect(summary.average).toBeNull();
    expect(summary.maxScore).toBeNull();
    expect(summary.hasSevereConcern).toBe(false);
    expect(summary.requiresMitigation).toBe(false);
  });

  it('does NOT treat unanswered questions (or legacy score 0) as 0 in average', () => {
    const summary = calculateCategoryScore(sampleCategory, {
      q1: { score: 4, notes: '' },
      q2: { score: 0, notes: '' }, // legacy unanswered marker
      // q3, q4, q5 missing
    });

    expect(summary.answeredQuestions).toBe(1);
    expect(summary.unansweredQuestions).toBe(4);
    expect(summary.average).toBe(4.0);
    expect(summary.maxScore).toBe(4);
    expect(summary.isComplete).toBe(false);
    expect(summary.hasSevereConcern).toBe(true);
    expect(summary.requiresMitigation).toBe(true);
  });

  it('calculates accurate average and completion for partially answered category', () => {
    const summary = calculateCategoryScore(sampleCategory, {
      q1: { score: 2, notes: '' },
      q2: { score: 3, notes: '' },
    });

    expect(summary.answeredQuestions).toBe(2);
    expect(summary.unansweredQuestions).toBe(3);
    expect(summary.completionPercentage).toBe(40);
    expect(summary.isComplete).toBe(false);
    expect(summary.average).toBe(2.5);
    expect(summary.maxScore).toBe(3);
    expect(summary.hasSevereConcern).toBe(false);
    expect(summary.requiresMitigation).toBe(false);
  });

  it('detects severe concerns (score 4 or 5) even if category average is low', () => {
    const summary = calculateCategoryScore(sampleCategory, {
      q1: { score: 1, notes: '' },
      q2: { score: 1, notes: '' },
      q3: { score: 1, notes: '' },
      q4: { score: 1, notes: '' },
      q5: { score: 5, notes: '' },
    });

    // Average is (1+1+1+1+5)/5 = 1.8
    expect(summary.average).toBe(1.8);
    expect(summary.maxScore).toBe(5);
    expect(summary.hasSevereConcern).toBe(true);
    expect(summary.severeConcernQuestions).toHaveLength(1);
    expect(summary.severeConcernQuestions[0].questionId).toBe('q5');
    // Even though average is 1.8 (Band 1), severe concern triggers mitigation requirement!
    expect(summary.requiresMitigation).toBe(true);
  });

  it('flags mitigation when average exceeds 2.6 boundary', () => {
    const summary = calculateCategoryScore(sampleCategory, {
      q1: { score: 3, notes: '' },
      q2: { score: 3, notes: '' },
      q3: { score: 3, notes: '' },
      q4: { score: 2, notes: '' },
      q5: { score: 3, notes: '' },
    });

    // Average is 14/5 = 2.8 (> 2.6)
    expect(summary.average).toBe(2.8);
    expect(summary.requiresMitigation).toBe(true);
  });
});

describe('Scoring Utility — calculateOverallScore', () => {
  it('correctly reports 0% completion for brand new review', () => {
    const overall = calculateOverallScore(ASSESSMENT_CATEGORIES, {});
    expect(overall.totalQuestions).toBe(34);
    expect(overall.answeredQuestions).toBe(0);
    expect(overall.unansweredQuestions).toBe(34);
    expect(overall.completionPercentage).toBe(0);
    expect(overall.isComplete).toBe(false);
    expect(overall.average).toBeNull();
    expect(overall.maxScore).toBeNull();
    expect(overall.severeConcernCount).toBe(0);
    expect(overall.overallRiskBand.label).toBe('Not Assessed');
  });

  it('reports provisional status for partially completed assessment', () => {
    const partialAssessments = {
      technical: {
        tech_maintainability: { score: 1, notes: '' },
        tech_dependencies: { score: 1, notes: '' },
      },
    };

    const overall = calculateOverallScore(ASSESSMENT_CATEGORIES, partialAssessments);
    expect(overall.answeredQuestions).toBe(2);
    expect(overall.isComplete).toBe(false);
    expect(overall.overallRiskBand.isProvisional).toBe(true);
    expect(overall.overallRiskBand.label).toContain('Provisional');
    // Incomplete must never report definitive Low Risk
    expect(overall.overallRiskBand.label).not.toBe('Sustainable / Low Risk');
  });

  it('correctly aggregates full assessment when all 34 questions are answered', () => {
    const completeAssessments: Record<string, Record<string, { score: number; notes: string }>> = {};

    ASSESSMENT_CATEGORIES.forEach((cat) => {
      completeAssessments[cat.id] = {};
      cat.questions.forEach((q) => {
        completeAssessments[cat.id][q.id] = { score: 2, notes: 'Good condition' };
      });
    });

    const overall = calculateOverallScore(ASSESSMENT_CATEGORIES, completeAssessments);
    expect(overall.totalQuestions).toBe(34);
    expect(overall.answeredQuestions).toBe(34);
    expect(overall.unansweredQuestions).toBe(0);
    expect(overall.completionPercentage).toBe(100);
    expect(overall.isComplete).toBe(true);
    expect(overall.average).toBe(2.0);
    expect(overall.maxScore).toBe(2);
    expect(overall.severeConcernCount).toBe(0);
    expect(overall.overallRiskBand.label).toBe('Manageable with Monitoring');
    expect(overall.overallRiskBand.isProvisional).toBe(false);
  });

  it('highlights severe concerns across multiple categories even with low overall average', () => {
    const mixedAssessments: Record<string, Record<string, { score: number; notes: string }>> = {};

    ASSESSMENT_CATEGORIES.forEach((cat) => {
      mixedAssessments[cat.id] = {};
      cat.questions.forEach((q) => {
        mixedAssessments[cat.id][q.id] = { score: 1, notes: '' };
      });
    });

    // Inject two severe concerns in technical and environmental
    mixedAssessments.technical.tech_fallback = { score: 5, notes: 'No fallback exists' };
    mixedAssessments.environmental.env_infrastructure = { score: 4, notes: 'Massive compute usage' };

    const overall = calculateOverallScore(ASSESSMENT_CATEGORIES, mixedAssessments);
    expect(overall.isComplete).toBe(true);
    expect(overall.maxScore).toBe(5);
    expect(overall.severeConcernCount).toBe(2);
    expect(overall.categoriesWithSevereConcerns).toHaveLength(2);
    expect(overall.highestRiskCategories.some((c) => c.categoryId === 'technical')).toBe(true);
    expect(overall.highestRiskCategories.some((c) => c.categoryId === 'environmental')).toBe(true);
  });
});
