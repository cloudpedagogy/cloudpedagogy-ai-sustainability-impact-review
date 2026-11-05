import { describe, it, expect } from 'vitest';
import {
  createExportBundle,
  validateAndParseImport,
  APPLICATION_ID,
  CURRENT_SCHEMA_VERSION,
  METHODOLOGY_ID,
  MAX_IMPORT_FILE_SIZE_BYTES,
  type AssessmentRecord,
} from './serialization';
import { initialSystemOverview } from '../store/useReviewStore';

function createMockRecord(id: string = 'test-rec-1', name: string = 'Test System', sourceId?: string): AssessmentRecord {
  return {
    id,
    name,
    methodologyVersion: 'cp-sustainability-methodology-v2',
    sourceAssessmentId: sourceId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    systemOverview: {
      ...initialSystemOverview,
      systemName: name,
      contextOfUse: 'University production deployment',
      aiUseType: 'Hosted LLM API',
      intendedDuration: '2 years',
      keyStakeholders: 'Faculty, Students, IT Architecture',
    },
    assessments: {
      technical: {
        tech_maintainability: {
          score: 2,
          notes: 'Maintained by team',
          evidenceType: 'measured',
          evidenceSource: 'Git commit activity logs',
          confidence: 'high',
        },
        tech_dependencies: { score: 1, notes: 'Fully documented' },
      },
    },
    decisionRecommendation: 'Proceed with Conditions',
    decisionRationale: 'Follow mitigation roadmap.',
  };
}

describe('Serialization — createExportBundle', () => {
  it('creates a compliant version 1 bundle with metadata and records', () => {
    const record = createMockRecord('test-rec-1', 'Test System', 'source-v1-original');
    const bundle = createExportBundle({ [record.id]: record }, record.id);

    expect(bundle.application).toBe(APPLICATION_ID);
    expect(bundle.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(bundle.methodology).toBe(METHODOLOGY_ID);
    expect(bundle.activeAssessmentId).toBe(record.id);
    expect(bundle.assessments).toHaveLength(1);
    expect(bundle.assessments[0].name).toBe('Test System');
    expect(bundle.assessments[0].sourceAssessmentId).toBe('source-v1-original');
    expect(bundle.assessments[0].systemOverview.aiUseType).toBe('Hosted LLM API');
    expect(bundle.assessments[0].assessments.technical.tech_maintainability.evidenceType).toBe('measured');
    expect(bundle.exportedAt).toBeDefined();
  });
});

describe('Serialization — validateAndParseImport (Version 1 Bundles)', () => {
  it('successfully validates and parses a valid version 1 bundle with evidence fields and source link', () => {
    const record = createMockRecord('test-rec-1', 'Test System', 'source-v1-original');
    const bundle = createExportBundle({ [record.id]: record }, record.id);
    const jsonStr = JSON.stringify(bundle);

    const result = validateAndParseImport(jsonStr);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.assessments).toHaveLength(1);
      expect(result.assessments[0].id).toBe(record.id);
      expect(result.assessments[0].name).toBe('Test System');
      expect(result.assessments[0].methodologyVersion).toBe('cp-sustainability-methodology-v2');
      expect(result.assessments[0].sourceAssessmentId).toBe('source-v1-original');
      expect(result.assessments[0].assessments.technical.tech_maintainability.evidenceType).toBe('measured');
      expect(result.assessments[0].assessments.technical.tech_maintainability.evidenceSource).toBe('Git commit activity logs');
      expect(result.activeAssessmentId).toBe(record.id);
    }
  });

  it('rejects bundles with mismatched application identifier', () => {
    const record = createMockRecord();
    const bundle = {
      ...createExportBundle({ [record.id]: record }, record.id),
      application: 'other-incompatible-application',
    };

    const result = validateAndParseImport(JSON.stringify(bundle));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Incompatible application identifier');
    }
  });

  it('rejects unsupported future schema versions', () => {
    const record = createMockRecord();
    const bundle = {
      ...createExportBundle({ [record.id]: record }, record.id),
      schemaVersion: 99,
    };

    const result = validateAndParseImport(JSON.stringify(bundle));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Unsupported schema version 99');
    }
  });

  it('rejects invalid score values in assessments', () => {
    const record = createMockRecord();
    record.assessments.technical.tech_maintainability.score = 99; // invalid

    const bundle = createExportBundle({ [record.id]: record }, record.id);
    const result = validateAndParseImport(JSON.stringify(bundle));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid score value "99"');
    }
  });

  it('rejects invalid evidenceType string values', () => {
    const rawBundle = {
      application: APPLICATION_ID,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      methodology: METHODOLOGY_ID,
      exportedAt: new Date().toISOString(),
      activeAssessmentId: 'rec-1',
      assessments: [
        {
          id: 'rec-1',
          name: 'Invalid Evidence Assessment',
          systemOverview: { systemName: 'Invalid Evidence Assessment' },
          assessments: {
            technical: {
              tech_maintainability: {
                score: 2,
                notes: 'Test notes',
                evidenceType: 'unverified_rumor', // INVALID
              },
            },
          },
          decisionRecommendation: '',
          decisionRationale: '',
        },
      ],
    };

    const result = validateAndParseImport(JSON.stringify(rawBundle));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid evidenceType "unverified_rumor"');
    }
  });

  it('rejects invalid confidence string values', () => {
    const rawBundle = {
      application: APPLICATION_ID,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      methodology: METHODOLOGY_ID,
      exportedAt: new Date().toISOString(),
      activeAssessmentId: 'rec-1',
      assessments: [
        {
          id: 'rec-1',
          name: 'Invalid Confidence Assessment',
          systemOverview: { systemName: 'Invalid Confidence Assessment' },
          assessments: {
            technical: {
              tech_maintainability: {
                score: 2,
                notes: 'Test notes',
                evidenceType: 'measured',
                confidence: 'super_high', // INVALID
              },
            },
          },
          decisionRecommendation: '',
          decisionRationale: '',
        },
      ],
    };

    const result = validateAndParseImport(JSON.stringify(rawBundle));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid confidence "super_high"');
    }
  });
});

describe('Serialization — validateAndParseImport (Legacy Exports)', () => {
  it('successfully migrates and normalizes legacy unversioned store exports as methodology v1', () => {
    const legacyExport = {
      systemOverview: {
        systemName: 'Legacy AI Review',
        description: 'Old assessment format',
        reviewPurpose: 'Annual Review',
      },
      assessments: {
        technical: {
          tech_maintainability: { score: 3, notes: 'Some tech debt' },
        },
        environmental: {
          env_overhead: { score: 1, notes: 'Optimized batching' },
        },
      },
      decisionRecommendation: 'Proceed',
      decisionRationale: 'Viable architecture.',
    };

    const result = validateAndParseImport(JSON.stringify(legacyExport));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.assessments).toHaveLength(1);
      const migrated = result.assessments[0];
      expect(migrated.name).toBe('Legacy AI Review');
      expect(migrated.methodologyVersion).toBe('cp-sustainability-methodology-v1');
      expect(migrated.sourceAssessmentId).toBeUndefined();
      expect(migrated.assessments.technical.tech_maintainability.score).toBe(3);
      expect(migrated.decisionRecommendation).toBe('Proceed');
    }
  });
});

describe('Serialization — validateAndParseImport (Error Handling & Limits)', () => {
  it('rejects empty input or invalid JSON syntax', () => {
    expect(validateAndParseImport('').success).toBe(false);
    expect(validateAndParseImport('{ not-valid-json').success).toBe(false);
    expect(validateAndParseImport('12345').success).toBe(false);
  });

  it('rejects files exceeding the maximum size limit', () => {
    const oversizedString = ' '.repeat(MAX_IMPORT_FILE_SIZE_BYTES + 10);
    const result = validateAndParseImport(oversizedString);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('File size exceeds the 5 MB maximum limit');
    }
  });
});
