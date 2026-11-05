import { describe, it, expect } from 'vitest';
import { getCategoryMitigations } from './mitigations';
import { ASSESSMENT_CATEGORIES_V2 } from '../config/assessmentSchema';

describe('Mitigations Utility — getCategoryMitigations', () => {
  const envCategory = ASSESSMENT_CATEGORIES_V2.find((c) => c.id === 'environmental')!;
  const techCategory = ASSESSMENT_CATEGORIES_V2.find((c) => c.id === 'technical')!;

  it('generates specific context-sensitive advisory mitigations for severe concern questions', () => {
    const responses = {
      env_proportionality: { score: 5, notes: 'Using 400B parameter model for regex task' },
      env_energy_grid: { score: 4, notes: 'Hosted in coal-heavy region' },
    };

    const mitigations = getCategoryMitigations(envCategory, responses, 4.5, true);
    expect(mitigations.length).toBeGreaterThanOrEqual(2);

    const propMitigation = mitigations.find((m) => m.questionId === 'env_proportionality');
    expect(propMitigation).toBeDefined();
    expect(propMitigation?.triggerType).toBe('severe_concern');
    expect(propMitigation?.action).toContain('task-specific model (SLM)');

    const gridMitigation = mitigations.find((m) => m.questionId === 'env_energy_grid');
    expect(gridMitigation).toBeDefined();
    expect(gridMitigation?.action).toContain('renewable energy');
  });

  it('generates advisory recommendation for unknown evidence gaps', () => {
    const responses = {
      tech_fallback: {
        score: 3,
        notes: 'Unsure about fallback logic',
        evidenceType: 'unknown' as const,
      },
    };

    const mitigations = getCategoryMitigations(techCategory, responses, 3.0, false);
    const unknownMitigation = mitigations.find((m) => m.triggerType === 'uncertain_evidence');
    expect(unknownMitigation).toBeDefined();
    expect(unknownMitigation?.action).toContain('replace unknown assumptions with empirical data');
  });

  it('provides general category advisory when average exceeds 2.6 without individual severe scores', () => {
    // 5 questions with score 3: average is 3.0 (> 2.6)
    const responses = {
      tech_maintainability: { score: 3, notes: '' },
      tech_dependencies: { score: 3, notes: '' },
      tech_fallback: { score: 3, notes: '' },
      tech_complexity: { score: 3, notes: '' },
      tech_portability: { score: 3, notes: '' },
    };

    const mitigations = getCategoryMitigations(techCategory, responses, 3.0, false);
    expect(mitigations).toHaveLength(1);
    expect(mitigations[0].triggerType).toBe('elevated_average');
    expect(mitigations[0].action).toContain('technical sustainability controls');
  });
});
