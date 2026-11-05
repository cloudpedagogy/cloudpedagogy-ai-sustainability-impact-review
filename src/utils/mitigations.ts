import type { Category } from '../config/assessmentSchema';
import type { AssessmentResponse } from '../store/useReviewStore';

export interface MitigationRecommendation {
  id: string;
  triggerType: 'severe_concern' | 'elevated_average' | 'uncertain_evidence';
  triggerLabel: string;
  questionId?: string;
  questionText?: string;
  action: string;
}

const SPECIFIC_QUESTION_ACTIONS: Record<string, string> = {
  // Environmental Considerations
  env_proportionality:
    'Evaluate whether a smaller task-specific model (SLM), fine-tuned open model, or non-AI heuristic logic can deliver the required outcome with significantly lower compute demand.',
  env_overhead:
    'Introduce response caching, semantic prompt compression, and batch query scheduling to eliminate redundant compute overhead and repeated API calls.',
  env_infrastructure:
    'Review infrastructure hosting options; evaluate quantized local/edge models versus high-efficiency centralized data center regions.',
  env_frequency:
    'Throttle real-time AI invocation frequency (e.g. replace keystroke-triggered generation with explicit user-initiated action triggers).',
  env_training_inference:
    'Distinguish one-off training emissions from ongoing inference scaling; model anticipated query volumes and establish quota ceilings before broad rollout.',
  env_energy_grid:
    'Engage cloud/hosting providers to request region-specific renewable energy matching data and prefer hosting zones with low grid carbon intensity.',
  env_hardware_lifecycle:
    'Inquire into vendor accelerator procurement, hardware refresh cycles, and certified electronic waste recycling practices.',
  env_water_cooling:
    'Inquire into data centre WUE (Water Usage Effectiveness) and avoid hosting high-density compute clusters in water-stressed utility districts.',

  // Technical Sustainability
  tech_maintainability:
    'Establish formal architectural documentation, pair-programming handover protocols, and reduce dependency on individual technical leads to prevent disruption upon staff turnover.',
  tech_dependencies:
    'Audit all third-party dependencies and model APIs for active maintenance, security patches, and deprecation schedules.',
  tech_fallback:
    'Implement non-AI fallback pathways or graceful degradation states so critical workflows can proceed manually or via conventional logic during AI outages.',
  tech_complexity:
    'Re-evaluate architectural complexity against delivered institutional value; eliminate unnecessary pipeline stages where simpler logic suffices.',
  tech_portability:
    'Establish standard data export and model configuration migration pathways to avoid proprietary vendor platform lock-in.',

  // Organisational Sustainability
  org_ownership:
    'Formally assign long-term governance accountability to a designated institutional role or committee rather than an individual staff member.',
  org_funding:
    'Secure ongoing operational budget allocations beyond grant/pilot periods for licensing, token consumption, and technical maintenance.',
  org_continuity:
    'Formalize tacit system knowledge into standard operating procedures to maintain operational continuity during staff restructuring.',
  org_alignment:
    'Re-align the system with evolving institutional governance frameworks, data policies, and strategic priorities.',
  org_support:
    'Establish clear support boundaries, self-service documentation, and tier-1 escalation pathways to manage user support burdens.',

  // Capability Sustainability
  cap_training:
    'Create modular, easily updated onboarding and training resources designed to withstand frequent model or UI updates.',
  cap_confidence:
    'Provide critical AI literacy training to ensure staff critically verify model outputs rather than relying uncritically on automated recommendations.',
  cap_expectation:
    'Calibrate system interfaces to match actual staff technical capabilities without assuming advanced prompt engineering expertise.',
  cap_transfer:
    'Implement institutional knowledge transfer rituals and shared best-practice repositories across participating departments.',

  // Educational / Research Sustainability
  edu_curriculum:
    'Design AI-supported learning activities to minimize recurring syllabus and assessment redesign upon model updates.',
  edu_reproducibility:
    'Log model versions, temperature parameters, and prompt configurations to ensure long-term research and curricular reproducibility.',
  edu_workload:
    'Streamline verification steps to ensure the tool does not create more administrative burden than the time it saves.',
  edu_reliance:
    'Establish periodic assessments without AI assistance to prevent degradation of foundational academic and analytical competencies.',

  // Governance Sustainability
  gov_oversight:
    'Establish a mandatory recurring oversight review cycle and clear escalation triggers before advancing the lifecycle stage.',
  gov_audit:
    'Implement secure logging of prompt inputs, model versions, and system outputs for significant decisions to ensure long-term auditability.',
  gov_incident:
    'Document and publicize formal incident reporting pathways for AI hallucinations, bias, or operational failures.',
  gov_policy:
    'Ensure architectural modularity so the system can promptly adapt to changing legal or institutional regulations.',

  // Vendor and Infrastructure Dependency
  ven_lockin:
    'Decouple application logic from proprietary vendor APIs using standard model gateways or abstraction adapters to enable provider switching.',
  ven_withdrawal:
    'Prepare a business continuity contingency plan detailing backup models and operational fallbacks if the primary API is discontinued.',
  ven_procurement:
    'Align procurement contracts with institutional data stewardship, retention, deletion, and intellectual property requirements.',
  ven_alternatives:
    'Benchmark and validate alternative model providers to ensure rapid transition capability in case of commercial disruption.',

  // Social and Human Impact
  soc_equity:
    'Conduct demographic impact audits to identify and mitigate systematic disadvantages or algorithmic biases across user cohorts.',
  soc_displacement:
    'Engage staff proactively to address role degradation concerns and reinforce professional autonomy.',
  soc_oversight:
    'Ensure critical workflows preserve meaningful human review and maintain an accessible mechanism for users to challenge or appeal AI-supported decisions.',
  soc_accessibility:
    'Integrate recurring accessibility audits to maintain compliance with institutional accessibility standards as the system evolves.',
};

/**
 * Returns context-sensitive advisory mitigations for a category.
 * Generated recommendations are clearly framed as advisory options.
 */
export function getCategoryMitigations(
  category: Category,
  responses: Record<string, AssessmentResponse | undefined> | undefined,
  averageScore: number | null,
  hasSevereConcern: boolean = false
): MitigationRecommendation[] {
  const safeResponses = responses || {};
  const recommendations: MitigationRecommendation[] = [];

  // 1. Specific Question Severe Concerns (Score 4 or 5)
  category.questions.forEach((q) => {
    const resp = safeResponses[q.id];
    if (resp && typeof resp.score === 'number' && resp.score >= 4) {
      const specificAction =
        SPECIFIC_QUESTION_ACTIONS[q.id] ||
        `Establish formal mitigating controls and review operational risks associated with: ${q.text}`;

      recommendations.push({
        id: `mitigation-${q.id}`,
        triggerType: 'severe_concern',
        triggerLabel: `Severe Concern (${resp.score}/5)`,
        questionId: q.id,
        questionText: q.text,
        action: specificAction,
      });
    }
  });

  // 2. Unknown Evidence Advisory
  category.questions.forEach((q) => {
    const resp = safeResponses[q.id];
    if (resp && resp.evidenceType === 'unknown') {
      recommendations.push({
        id: `unknown-${q.id}`,
        triggerType: 'uncertain_evidence',
        triggerLabel: 'Evidence Gap (Unknown)',
        questionId: q.id,
        questionText: q.text,
        action: `Request supplier telemetry or establish a measurement plan to replace unknown assumptions with empirical data regarding: ${q.text}`,
      });
    }
  });

  // 3. Elevated Category Average (> 2.6) or general severe concern when no specific question severe concern exists
  if ((hasSevereConcern || (averageScore !== null && averageScore > 2.6)) && recommendations.length === 0) {
    recommendations.push({
      id: `elevated-avg-${category.id}`,
      triggerType: 'elevated_average',
      triggerLabel:
        averageScore !== null
          ? `Elevated Category Score (${averageScore.toFixed(1)})`
          : 'Elevated Risk Area',
      action: `Conduct a focused governance review of ${category.title.toLowerCase()} controls. Document clear mitigating conditions before advancing the system lifecycle stage.`,
    });
  }

  return recommendations;
}
