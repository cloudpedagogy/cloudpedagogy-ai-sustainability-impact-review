# Project Specification: AI Sustainability Impact Review System

## 1. Project Overview

- **Name**: AI Sustainability Impact Review System
- **Repository**: `cloudpedagogy-ai-sustainability-impact-review`
- **Portfolio**: CloudPedagogy Open-Source AI Governance Suite (Eighth Application)
- **Licence**: MIT Licence
- **Type**: Local-First Single-Page Application (SPA)
- **Architecture**: Zero-backend, zero-telemetry client application compatible with AWS S3 static hosting

### 1.1 Purpose & Governance Objective
The AI Sustainability Impact Review System is designed to evaluate whether AI-supported systems, automated workflows, and computational pipelines can remain viable, responsible, proportional, maintainable, and governable over their operational lifecycle.

It provides higher education and public sector institutions with a rigorous, repeatable methodology to identify sustainability risks, highlight severe individual vulnerabilities, document empirical evidence bases, and formulate actionable governance decisions.

---

## 2. Assessment Framework & Methodology

The application supports dual methodology versions to ensure historical audit continuity while offering state-of-the-art environmental scrutiny:

### 2.1 Methodology v1 (34 Questions) — Historical Baseline
Preserves complete backward compatibility for existing audits. Encompasses 8 core dimensions:
1. **Technical Sustainability (5 questions):** Architecture maintainability, technical debt, dependencies, fallback procedures, and monitoring.
2. **Organisational Sustainability (4 questions):** Leadership sponsorship, operational resourcing, funding continuity, and change management.
3. **Capability Sustainability (4 questions):** Staff training, user capability, retention of institutional memory, and dependency on external specialists.
4. **Educational & Research Sustainability (4 questions):** Pedagogical alignment, research reproducibility, academic integrity, and long-term curricular validity.
5. **Governance Sustainability (5 questions):** Policy alignment, review cadences, audit trails, risk classification, and legal compliance.
6. **Vendor & Infrastructure Dependency (4 questions):** Single-vendor lock-in, API price volatility, SLA guarantees, and exit strategies.
7. **Environmental Considerations (4 questions):** Basic compute proportionality, model necessity, infrastructure efficiency, and hosting footprint.
8. **Social & Human Impact (4 questions):** Human-in-the-loop oversight, cognitive offloading risks, equitable access, and social consequence.

### 2.2 Methodology v2 (38 Questions) — Expanded Environmental Scrutiny
Expands Category 7 (*Environmental Considerations*) from 4 to 8 targeted questions addressing critical AI-specific lifecycle factors:
- `env_proportionality`: Compute proportionality and justification for generative AI / frontier LLM vs. conventional heuristics.
- `env_training_inference`: Distinction between upfront training/fine-tuning demands and cumulative ongoing inference load.
- `env_scale`: Anticipated query volume, user concurrency, and operational scaling boundaries.
- `env_grid_carbon`: Electricity demand, hosting region grid carbon intensity, and renewable power matching.
- `env_datacenter_efficiency`: Data center efficiency metrics (PUE) and vendor environmental disclosures.
- `env_hardware_lifecycle`: Hardware procurement, accelerator lifespan, and embodied carbon impact.
- `env_water_consumption`: Direct on-site data center cooling and upstream thermal water evaporation.
- `env_model_refresh`: Cadence of model fine-tuning, re-indexing, and long-term re-training overhead.

---

## 3. Scoring Engine & Data Integrity

### 3.1 Scoring Scale (1–5)
- **1 - Sustainable:** Negligible risk, proactive management.
- **2 - Minor Concern:** Low risk, standard operational monitoring.
- **3 - Moderate Concern:** Medium risk, mitigation planning required.
- **4 - Significant Concern:** High risk, conditional deployment only.
- **5 - Critical Concern:** Severe risk, unacceptable operational or environmental exposure.

### 3.2 Pure Calculation Logic
Scoring calculations are decoupled from React components into pure functions (`src/utils/scoring.ts`):
- **Missing Value Handling:** Missing answers are stored explicitly as unanswered (score 0 in storage, null in score calculation). Unanswered questions are never treated as score 0 or 1.
- **Completion Independence:** Assessment completion percentage is calculated separately from score averages.
- **Provisional Status Safeguard:** An assessment is categorized as *Provisional* until 100% of questions in the active methodology are answered. Provisional reviews are never awarded definitive "Sustainable" or "Low Risk" classifications.
- **Severe Concern Escalation:** Arithmetic category averages can obscure severe risks. The calculation engine aggregates and surfaces any question scored 4 or 5 as a *Severe Concern* requiring explicit governance resolution.

---

## 4. Evidence, Uncertainty & Advisory Model

### 4.1 Structured Evidence Model
To elevate assessments beyond subjective impression, every question supports optional structured grounding:
- **Evidence Basis:** `measured` | `estimated` | `qualitative` | `unknown`
- **Evidence Source:** Citation of primary reports, specifications, or ESG disclosures.
- **Key Assumptions:** Stated baselines regarding user numbers, token lengths, or uptime.
- **Assessment Confidence:** `high` | `medium` | `low`
- **Uncertainty Principle:** The application explicitly warns reviewers that an "Unknown" evidence status does not imply low risk.

### 4.2 Context-Sensitive Advisory Mitigations
Pure rule-based mitigation engine (`src/utils/mitigations.ts`) triggers prioritized recommendations based on:
1. Individual questions with severe ratings (score ≥ 4).
2. Categories exceeding the acceptable risk threshold (average > 2.6).
3. Questions flagged with uncertain or unavailable evidence bases (`unknown` or `low` confidence).

---

## 5. Persistence, Multiple Assessments & Provenance

### 5.1 Storage Architecture
All data persists in browser `localStorage` (`cp-sustainability-review-storage`) via Zustand.

### 5.2 Multi-Assessment & Reassessment Provenance
- Reviewers can maintain multiple assessments simultaneously in a single browser session.
- **Non-destructive v1 Upgrade:** Upgrading a historical v1 assessment creates a distinct v2 reassessment record, leaving the original v1 record intact (100% complete, original 34 answers, original decision preserved).
- **Provenance Linkage:** The new reassessment links back via `sourceAssessmentId`.
- **Decision Provenance:** New v2 reassessments reset `decisionRecommendation` and `decisionRationale` to ensure independent governance review of newly expanded dimensions.

### 5.3 Versioned Serialization & Collision Protection
- Schema-versioned JSON format (`schemaVersion: 2`, `methodology: "cp-sustainability-methodology-v2"`).
- Strict runtime validation of evidence enums and structure.
- Safe ID collision resolution: renames colliding imported records and remaps child `sourceAssessmentId` links automatically.
- Maximum import file size limit of 5 MB.
- Full legacy migration for unversioned Zustand snapshots.

---

## 6. Accessibility & Responsive User Interface

### 6.1 WCAG AA Design Considerations
- **Accessible Rating Controls:** Native radio inputs wrapped in semantic `<fieldset>` and `<legend>`, supporting keyboard arrow navigation, space selection, and explicit screen reader announcements.
- **Non-Colour Reliance:** All risk ratings and status indicators communicate severity through explicit text labels, numerical values, and distinct borders.
- **Form Association:** Complete `<label htmlFor="...">` and `<input id="...">` pairings across all input fields.
- **Visible Focus Rings:** High-contrast focus indicators (`focus-visible:ring-2 focus-visible:ring-slate-800`).

### 6.2 Responsive Navigation
- Permanent desktop sidebar navigation.
- Accessible slide-over mobile drawer navigation with backdrop dismissal, close button, and Escape key listener.
- Mobile viewports (320px, 375px, 768px) verified for zero horizontal overflow.

---

## 7. Complete Printable Governance Review Pack

The browser-native print functionality generates an institutional governance review pack comprising:
1. Application brand, governance pack title, and print timestamp.
2. System Overview metadata (13 context and ownership fields).
3. Methodology version and question count (v1 / 34 or v2 / 38).
4. Assessment completion percentage and provisional / complete status.
5. Overall sustainability risk rating and risk band.
6. Severe concern callout detailing all questions scored 4 or 5.
7. Category scores summary table.
8. Context-sensitive advisory mitigations.
9. Formal decision recommendation and governance rationale.
10. Full question-by-question audit across all 8 dimensions with recorded scores, notes, evidence classifications, sources, assumptions, and confidence levels.
11. Historical reassessment provenance link when applicable.
12. Explicit methodological limitations and advisory disclaimers.

---

## 8. Development, Testing & Continuous Integration

- **Development Server:** `npm run dev`
- **Linting:** `npm run lint` (ESLint 10 with typescript-eslint)
- **Automated Tests:** `npm test` (Vitest 4 in JSDOM environment, 47 unit and integration tests)
- **Production Build:** `npm run build` (`tsc -b && vite build`)
- **Continuous Integration:** GitHub Actions (`.github/workflows/ci.yml`) matrix on Node 20.x and 22.x.
