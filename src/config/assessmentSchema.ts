export type ReviewPurpose = 
  | 'Initial Design Review'
  | 'Pre-Deployment Review'
  | 'Annual Review'
  | 'Post-Incident Review'
  | 'Procurement / Adoption Review'
  | 'Scaling Review'
  | 'Retirement / Decommissioning Review'
  | '';

export type DecisionRecommendation = 
  | 'Proceed'
  | 'Proceed with Conditions'
  | 'Pause and Revise'
  | 'Do Not Proceed Yet'
  | '';

export interface SystemOverview {
  systemName: string;
  description: string;
  contextOfUse: string;
  sector: string;
  primaryUsers: string;
  aiUseType: string;
  lifecycleStage: string;
  intendedDuration: string;
  keyStakeholders: string;
  systemOwner: string;
  reviewDate: string;
  nextReviewDate: string;
  reviewPurpose: ReviewPurpose;
}

export interface Question {
  id: string;
  text: string;
  guidance?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const ASSESSMENT_CATEGORIES: Category[] = [
  {
    id: 'technical',
    title: 'Technical Sustainability',
    description: 'Assess the maintainability, technical debt, and long-term architectural viability of the system.',
    questions: [
      { id: 'tech_maintainability', text: 'Can the system be maintained by standard technical teams without relying on a single specialist?', guidance: 'Consider if handovers or team transitions would critically disrupt the system.' },
      { id: 'tech_dependencies', text: 'Are external libraries, APIs, and models clearly documented and actively supported?', guidance: 'Evaluate the risk of deprecated packages or unmaintained open-source components.' },
      { id: 'tech_fallback', text: 'Is there a viable fallback process or graceful degradation if the AI component fails?', guidance: 'Determine if core workflows can proceed manually or via conventional software if the AI is offline.' },
      { id: 'tech_complexity', text: 'Is the architectural complexity proportionate to the institutional value being delivered?', guidance: 'Avoid over-engineering solutions where simpler, non-AI logic would suffice.' },
      { id: 'tech_portability', text: 'Can system data and configurations be easily exported or migrated if the underlying technology changes?', guidance: 'Consider data lock-in and whether export pathways exist without manual extraction.' }
    ]
  },
  {
    id: 'organisational',
    title: 'Organisational Sustainability',
    description: 'Evaluate ownership, resourcing, and institutional alignment over the system lifecycle.',
    questions: [
      { id: 'org_ownership', text: 'Is there a clearly defined institutional owner accountable for the system post-launch?', guidance: 'Ensure ownership is tied to a role or department, rather than a specific individual who might leave.' },
      { id: 'org_funding', text: 'Is long-term funding secured for operational costs, licensing, and necessary upgrades?', guidance: 'Review if funding extends beyond pilot phases or grant funding periods.' },
      { id: 'org_continuity', text: 'Is there a continuity plan to ensure operational stability during staff turnover or restructuring?', guidance: 'Assess how reliant the system is on tacit knowledge versus formal documentation.' },
      { id: 'org_alignment', text: 'Does the system remain aligned with current institutional strategy and governance frameworks?', guidance: 'Verify that the tool still supports the broader institutional goals.' },
      { id: 'org_support', text: 'Is the operational support burden manageable for existing IT and administrative teams?', guidance: 'Consider the hidden costs of tier 1 user support and incident handling.' }
    ]
  },
  {
    id: 'capability',
    title: 'Capability Sustainability',
    description: 'Assess the long-term training, confidence, and capability requirements for users and support staff.',
    questions: [
      { id: 'cap_training', text: 'Are training materials and onboarding processes sustainable and easily updated?', guidance: 'Evaluate if UI or model changes will immediately invalidate all training materials.' },
      { id: 'cap_confidence', text: 'Do primary users possess the necessary baseline capability to interpret the AI outputs critically?', guidance: 'Consider whether users might blindly trust AI outputs without the skill to verify them.' },
      { id: 'cap_expectation', text: 'Does the system set realistic capability expectations for staff rather than assuming advanced AI literacy?', guidance: 'Assess if the tool requires prompt engineering skills that staff do not possess.' },
      { id: 'cap_transfer', text: 'Are there systematic mechanisms for knowledge transfer regarding system usage and administration?', guidance: 'Check if usage patterns and best practices are shared across teams.' }
    ]
  },
  {
    id: 'educational',
    title: 'Educational / Research Sustainability',
    description: 'Assess the impact on curriculum maintenance, research reproducibility, and academic governance.',
    questions: [
      { id: 'edu_curriculum', text: 'Can associated curricula, assessments, or research workflows remain current without excessive redesign effort?', guidance: 'Consider if the AI tool forces constant rewriting of syllabi or assessment criteria.' },
      { id: 'edu_reproducibility', text: 'For research contexts, are the AI methodologies sufficiently transparent to allow long-term reproducibility?', guidance: 'Evaluate if future researchers could replicate the AI steps.' },
      { id: 'edu_workload', text: 'Does the introduction of the system avoid creating hidden administrative workloads for academic or research staff?', guidance: 'Assess if the tool generates more verification work than the time it saves.' },
      { id: 'edu_reliance', text: 'Does the system avoid creating over-reliance that might degrade core academic or research skills over time?', guidance: 'Consider if students or staff might lose foundational skills due to over-automation.' }
    ]
  },
  {
    id: 'governance',
    title: 'Governance Sustainability',
    description: 'Evaluate oversight models, auditability, and ongoing policy alignment.',
    questions: [
      { id: 'gov_oversight', text: 'Is there an established, recurring oversight review cycle for this specific system?', guidance: 'Ensure this review is scheduled to happen again at an appropriate interval.' },
      { id: 'gov_audit', text: 'Can significant AI-supported decisions be audited or reconstructed months or years later?', guidance: 'Evaluate if the inputs, model version, and outputs are logged for critical decisions.' },
      { id: 'gov_incident', text: 'Are incident reporting and risk escalation pathways clearly documented and functional?', guidance: 'Check if users know exactly how to report AI hallucinations or failures.' },
      { id: 'gov_policy', text: 'Does the system architecture allow for timely adjustments when institutional policies or legal regulations change?', guidance: 'Consider how quickly the system could be updated to comply with new legislation.' }
    ]
  },
  {
    id: 'vendor',
    title: 'Vendor and Infrastructure Dependency',
    description: 'Assess risks related to third-party providers, procurement lock-in, and service continuity.',
    questions: [
      { id: 'ven_lockin', text: 'Are mitigation strategies in place for potential vendor lock-in or unmanageable price increases?', guidance: 'Consider the impact of a 5x API price increase or tier changes.' },
      { id: 'ven_withdrawal', text: 'What is the institutional risk if the core AI model or service is deprecated or withdrawn?', guidance: 'Evaluate the business continuity plan for sudden model deprecation.' },
      { id: 'ven_procurement', text: 'Does the vendor contract align with institutional procurement requirements for long-term data stewardship?', guidance: 'Review data retention, deletion, and intellectual property clauses.' },
      { id: 'ven_alternatives', text: 'Are there viable alternative providers or models that could be integrated without complete system rebuilds?', guidance: 'Assess if the system uses standard API structures rather than highly proprietary ones.' }
    ]
  },
  {
    id: 'environmental',
    title: 'Environmental Considerations',
    description: 'Review the proportionality of compute usage and infrastructure choices from a governance perspective.',
    questions: [
      { id: 'env_proportionality', text: 'Is the use of AI proportionate to the problem, or could simpler, less resource-intensive methods suffice?', guidance: 'Avoid deploying large language models for tasks that could be solved with simple heuristics or regex.' },
      { id: 'env_overhead', text: 'Does the system architecture avoid unnecessary or redundant AI processing overhead?', guidance: 'Consider caching strategies or batching to reduce redundant API calls.' },
      { id: 'env_infrastructure', text: 'Are the chosen infrastructure and hosting models justifiable from a resource efficiency perspective?', guidance: 'Evaluate if local/edge models could be used instead of cloud models for certain tasks.' },
      { id: 'env_frequency', text: 'Is the frequency of AI calls or batch processing optimized to reduce unnecessary compute burden?', guidance: 'Review if the system triggers AI generation on every keystroke versus user-initiated requests.' }
    ]
  },
  {
    id: 'social',
    title: 'Social and Human Impact',
    description: 'Evaluate the long-term impact on equity, inclusion, staff experience, and meaningful human oversight.',
    questions: [
      { id: 'soc_equity', text: 'Has the system been assessed to ensure it does not systematically disadvantage specific user groups over time?', guidance: 'Consider biases in the model that might compound over months of usage.' },
      { id: 'soc_displacement', text: 'Are there unaddressed concerns regarding staff displacement, role degradation, or loss of professional autonomy?', guidance: 'Evaluate the impact on staff morale and the perceived value of their expertise.' },
      { id: 'soc_oversight', text: 'Does the system preserve meaningful human judgement and agency in critical workflows?', guidance: 'Consider whether users retain the ability to review, challenge, override, or contextualise AI-supported recommendations.' },
      { id: 'soc_accessibility', text: 'Are long-term accessibility requirements integrated and actively maintained as the system evolves?', guidance: 'Ensure the UI and AI outputs remain compliant with institutional accessibility standards.' }
    ]
  }
];
