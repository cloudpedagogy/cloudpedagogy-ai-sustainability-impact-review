import type { SystemOverview, DecisionRecommendation } from '../config/assessmentSchema';
import type { AssessmentResponse } from '../store/useReviewStore';
import { isValidScore } from './scoring';

export const APPLICATION_ID = 'cloudpedagogy-ai-sustainability-impact-review';
export const CURRENT_SCHEMA_VERSION = 1;
export const METHODOLOGY_ID = 'cp-sustainability-methodology-v1';
export const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface AssessmentRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  systemOverview: SystemOverview;
  assessments: Record<string, Record<string, AssessmentResponse>>;
  decisionRecommendation: DecisionRecommendation;
  decisionRationale: string;
}

export interface ExportedAssessmentBundle {
  application: typeof APPLICATION_ID;
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  methodology: typeof METHODOLOGY_ID;
  exportedAt: string;
  activeAssessmentId: string;
  assessments: AssessmentRecord[];
}

export type ImportParseResult =
  | {
      success: true;
      assessments: AssessmentRecord[];
      activeAssessmentId?: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Creates an export bundle containing all saved assessments.
 */
export function createExportBundle(
  assessments: Record<string, AssessmentRecord>,
  activeAssessmentId: string
): ExportedAssessmentBundle {
  const records = Object.values(assessments);

  return {
    application: APPLICATION_ID,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    methodology: METHODOLOGY_ID,
    exportedAt: new Date().toISOString(),
    activeAssessmentId,
    assessments: records,
  };
}

/**
 * Sanitizes and validates a single SystemOverview object.
 */
function sanitizeSystemOverview(raw: unknown): SystemOverview {
  if (typeof raw !== 'object' || raw === null) {
    return {
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
  }

  const obj = raw as Record<string, unknown>;

  const str = (v: unknown): string => (typeof v === 'string' ? v : '');

  return {
    systemName: str(obj.systemName),
    description: str(obj.description),
    contextOfUse: str(obj.contextOfUse),
    sector: str(obj.sector),
    primaryUsers: str(obj.primaryUsers),
    aiUseType: str(obj.aiUseType),
    lifecycleStage: str(obj.lifecycleStage),
    intendedDuration: str(obj.intendedDuration),
    keyStakeholders: str(obj.keyStakeholders),
    systemOwner: str(obj.systemOwner),
    reviewDate: str(obj.reviewDate) || new Date().toISOString().split('T')[0],
    nextReviewDate: str(obj.nextReviewDate),
    reviewPurpose: str(obj.reviewPurpose) as SystemOverview['reviewPurpose'],
  };
}

/**
 * Validates and sanitizes the assessments map.
 * Rejects invalid or malicious score values.
 */
function validateAndSanitizeAssessments(
  raw: unknown
): { valid: true; assessments: Record<string, Record<string, AssessmentResponse>> } | { valid: false; error: string } {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, error: 'Assessments must be a key-value mapping of categories.' };
  }

  const result: Record<string, Record<string, AssessmentResponse>> = {};
  const rawMap = raw as Record<string, unknown>;

  for (const [categoryId, categoryObj] of Object.entries(rawMap)) {
    if (typeof categoryObj !== 'object' || categoryObj === null || Array.isArray(categoryObj)) {
      return { valid: false, error: `Invalid assessment group for category "${categoryId}".` };
    }

    result[categoryId] = {};
    const catMap = categoryObj as Record<string, unknown>;

    for (const [questionId, responseObj] of Object.entries(catMap)) {
      if (typeof responseObj !== 'object' || responseObj === null || Array.isArray(responseObj)) {
        return { valid: false, error: `Invalid assessment response for question "${questionId}".` };
      }

      const resp = responseObj as Record<string, unknown>;
      const score = resp.score;
      const notes = typeof resp.notes === 'string' ? resp.notes : '';

      // Score can be valid integer 1-5, or 0 (unanswered placeholder in legacy data)
      if (score === 0 || score === undefined || score === null) {
        result[categoryId][questionId] = { score: 0, notes };
      } else if (isValidScore(score)) {
        result[categoryId][questionId] = { score, notes };
      } else {
        return {
          valid: false,
          error: `Invalid score value "${String(score)}" for question "${questionId}". Scores must be integers between 1 and 5.`,
        };
      }
    }
  }

  return { valid: true, assessments: result };
}

/**
 * Validates a single AssessmentRecord.
 */
function validateAssessmentRecord(
  raw: unknown,
  fallbackId: string
): { valid: true; record: AssessmentRecord } | { valid: false; error: string } {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, error: 'Assessment record must be an object.' };
  }

  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : fallbackId;
  const name =
    typeof obj.name === 'string' && obj.name.trim()
      ? obj.name.trim()
      : (typeof obj.systemOverview === 'object' &&
          obj.systemOverview !== null &&
          typeof (obj.systemOverview as Record<string, unknown>).systemName === 'string' &&
          (obj.systemOverview as Record<string, unknown>).systemName) ||
        'Imported Assessment';

  const createdAt =
    typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString();
  const updatedAt =
    typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString();

  const systemOverview = sanitizeSystemOverview(obj.systemOverview);

  const assessmentsVal = validateAndSanitizeAssessments(obj.assessments ?? {});
  if (!assessmentsVal.valid) {
    return { valid: false, error: assessmentsVal.error };
  }

  const decisionRecommendation =
    typeof obj.decisionRecommendation === 'string'
      ? (obj.decisionRecommendation as DecisionRecommendation)
      : '';
  const decisionRationale =
    typeof obj.decisionRationale === 'string' ? obj.decisionRationale : '';

  return {
    valid: true,
    record: {
      id,
      name: String(name),
      createdAt,
      updatedAt,
      systemOverview,
      assessments: assessmentsVal.assessments,
      decisionRecommendation,
      decisionRationale,
    },
  };
}

/**
 * Safely parses and validates imported JSON data.
 * Supports both Version 1 bundles and legacy unversioned exports.
 */
export function validateAndParseImport(jsonString: string): ImportParseResult {
  if (!jsonString || typeof jsonString !== 'string') {
    return { success: false, error: 'Empty or invalid file content.' };
  }

  if (jsonString.length > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 5 MB maximum limit (${(jsonString.length / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse JSON file: ${err instanceof Error ? err.message : 'Invalid JSON'}`,
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: 'Imported data must be a JSON object.' };
  }

  const obj = parsed as Record<string, unknown>;

  // CASE 1: Version 1 Export Bundle
  if (obj.schemaVersion === 1) {
    if (obj.application !== APPLICATION_ID) {
      return {
        success: false,
        error: `Incompatible application identifier "${String(obj.application)}". Expected "${APPLICATION_ID}".`,
      };
    }

    if (!Array.isArray(obj.assessments) || obj.assessments.length === 0) {
      return { success: false, error: 'Import bundle contains no assessments array.' };
    }

    const records: AssessmentRecord[] = [];
    for (let i = 0; i < obj.assessments.length; i++) {
      const val = validateAssessmentRecord(obj.assessments[i], `imported-${Date.now()}-${i}`);
      if (!val.valid) {
        return { success: false, error: `Assessment #${i + 1} validation failed: ${val.error}` };
      }
      records.push(val.record);
    }

    const activeAssessmentId =
      typeof obj.activeAssessmentId === 'string' &&
      records.some((r) => r.id === obj.activeAssessmentId)
        ? obj.activeAssessmentId
        : records[0].id;

    return {
      success: true,
      assessments: records,
      activeAssessmentId,
    };
  }

  // CASE 2: Single Version 1 Assessment wrapper
  if (obj.schemaVersion === 1 && typeof obj.assessment === 'object' && obj.assessment !== null) {
    const val = validateAssessmentRecord(obj.assessment, `imported-${Date.now()}`);
    if (!val.valid) {
      return { success: false, error: val.error };
    }
    return {
      success: true,
      assessments: [val.record],
      activeAssessmentId: val.record.id,
    };
  }

  // Unsupported higher schema versions
  if (typeof obj.schemaVersion === 'number' && obj.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return {
      success: false,
      error: `Unsupported schema version ${obj.schemaVersion}. This application supports schema version ${CURRENT_SCHEMA_VERSION}.`,
    };
  }

  // CASE 3: Legacy Unversioned State (Version 0)
  // Legacy export dumped raw store: { systemOverview, assessments, decisionRecommendation, decisionRationale }
  if ('systemOverview' in obj || 'assessments' in obj) {
    const fallbackId = `legacy-${Date.now()}`;
    const val = validateAssessmentRecord(obj, fallbackId);
    if (!val.valid) {
      return { success: false, error: `Legacy export validation failed: ${val.error}` };
    }

    return {
      success: true,
      assessments: [val.record],
      activeAssessmentId: val.record.id,
    };
  }

  return {
    success: false,
    error: 'Unrecognised file format. The file is neither a valid Version 1 bundle nor a legacy export.',
  };
}
