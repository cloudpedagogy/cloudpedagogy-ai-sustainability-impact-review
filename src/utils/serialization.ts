import type {
  SystemOverview,
  DecisionRecommendation,
  EvidenceType,
  ConfidenceLevel,
  MethodologyVersion,
} from '../config/assessmentSchema';
import {
  DEFAULT_METHODOLOGY_VERSION,
  LEGACY_METHODOLOGY_VERSION,
} from '../config/assessmentSchema';
import { isValidScore } from './scoring';

export const APPLICATION_ID = 'cloudpedagogy-ai-sustainability-impact-review';
export const CURRENT_SCHEMA_VERSION = 1;
export const METHODOLOGY_ID = 'cp-sustainability-methodology-v2';
export const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface AssessmentResponse {
  score: number; // 1-5 scale (0 indicates unassessed in legacy data)
  notes: string;
  evidenceType?: EvidenceType;
  evidenceSource?: string;
  assumptions?: string;
  confidence?: ConfidenceLevel;
}

export interface AssessmentRecord {
  id: string;
  name: string;
  methodologyVersion: MethodologyVersion;
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
  methodology: MethodologyVersion;
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
  const activeRecord = assessments[activeAssessmentId];
  const methodology = activeRecord?.methodologyVersion || DEFAULT_METHODOLOGY_VERSION;

  return {
    application: APPLICATION_ID,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    methodology,
    exportedAt: new Date().toISOString(),
    activeAssessmentId,
    assessments: records,
  };
}

/**
 * Sanitizes and validates a single SystemOverview object.
 */
export function sanitizeSystemOverview(raw: unknown): SystemOverview {
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
 * Rejects invalid or malicious score values while preserving optional evidence fields.
 */
export function validateAndSanitizeAssessments(
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

      const evidenceType = typeof resp.evidenceType === 'string' ? (resp.evidenceType as EvidenceType) : undefined;
      const evidenceSource = typeof resp.evidenceSource === 'string' ? resp.evidenceSource : undefined;
      const assumptions = typeof resp.assumptions === 'string' ? resp.assumptions : undefined;
      const confidence = typeof resp.confidence === 'string' ? (resp.confidence as ConfidenceLevel) : undefined;

      const safeResponse: AssessmentResponse = { score: 0, notes };
      if (evidenceType) safeResponse.evidenceType = evidenceType;
      if (evidenceSource) safeSourceText(safeResponse, 'evidenceSource', evidenceSource);
      if (assumptions) safeSourceText(safeResponse, 'assumptions', assumptions);
      if (confidence) safeResponse.confidence = confidence;

      // Score can be valid integer 1-5, or 0 (unanswered placeholder in legacy data)
      if (score === 0 || score === undefined || score === null) {
        safeResponse.score = 0;
        result[categoryId][questionId] = safeResponse;
      } else if (isValidScore(score)) {
        safeResponse.score = score;
        result[categoryId][questionId] = safeResponse;
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

function safeSourceText(resp: AssessmentResponse, key: 'evidenceSource' | 'assumptions', text: string) {
  if (text.trim()) {
    resp[key] = text;
  }
}

/**
 * Validates a single AssessmentRecord.
 */
export function validateAssessmentRecord(
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

  const methodologyVersion: MethodologyVersion =
    obj.methodologyVersion === 'cp-sustainability-methodology-v1' ||
    obj.methodology === 'cp-sustainability-methodology-v1'
      ? LEGACY_METHODOLOGY_VERSION
      : DEFAULT_METHODOLOGY_VERSION;

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
      methodologyVersion,
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
 * Supports Version 1 bundles, single assessment exports, and legacy unversioned exports.
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
  if ('systemOverview' in obj || 'assessments' in obj) {
    const fallbackId = `legacy-${Date.now()}`;
    const legacyPayload = {
      ...obj,
      methodologyVersion: LEGACY_METHODOLOGY_VERSION,
    };
    const val = validateAssessmentRecord(legacyPayload, fallbackId);
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
