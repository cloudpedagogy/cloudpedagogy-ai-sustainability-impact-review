# CloudPedagogy — AI Sustainability Impact Review

A local-first institutional governance application for assessing the long-term sustainability, proportionality, environmental impact, resilience, and operational viability of AI-supported systems, workflows, curricula, and research initiatives.

This application is part of the **CloudPedagogy Open-Source AI Governance Suite**, helping higher education, public sector, and enterprise institutions answer the central governance question:  
*Can this AI-supported system remain viable, responsible, proportional, maintainable, and governable over time?*

---

## 🌐 Live Hosted Version
The static application is hosted directly on AWS S3 Static Website Hosting:  
[http://cloudpedagogy-ai-sustainability-impact-review.s3-website.eu-west-2.amazonaws.com/](http://cloudpedagogy-ai-sustainability-impact-review.s3-website.eu-west-2.amazonaws.com/)

---

## 🖼️ Application Screenshot
![AI Sustainability Impact Review System](assets/screenshot.png)

---

## Key Features & Capabilities

- **Comprehensive 8-Dimension Evaluation Framework:** Evaluates systems across Technical, Organisational, Capability, Educational & Research, Governance, Vendor Dependency, Environmental, and Social & Human Impact dimensions.
- **Sustainability Methodologies v1 & v2:**
  - **Methodology v1 (34 Questions):** Preserves complete historical backward compatibility for existing institutional audits.
  - **Methodology v2 (38 Questions):** Expands the environmental dimension from 4 to 8 targeted questions covering compute proportionality, training vs. inference demand, scaling volume, grid carbon intensity, hosting efficiency, embodied hardware lifecycle, water cooling footprint, and model refresh cadence.
- **Evidence & Uncertainty Model:** Every assessment question supports structured empirical grounding, recording:
  - **Evidence Basis:** *Measured Evidence*, *Estimate / Model*, *Qualitative Judgement*, or *Unknown / Unavailable*.
  - **Evidence Source:** Primary documentation or ESG reference.
  - **Stated Assumptions:** Baseline usage and parameter assumptions.
  - **Confidence Level:** *High*, *Medium*, or *Low / Highly Uncertain*.
  - *Explicit Uncertainty Notice:* An "Unknown" evidence status does not imply low risk.
- **Severe Concern Visibility:** Prevents catastrophic risks from being concealed by arithmetic averaging. Severe ratings (Score 4 - Significant Concern and Score 5 - Critical Concern) are surfaced directly in governance callouts regardless of category averages.
- **Context-Sensitive Advisory Mitigations:** Automatically generates prioritized advisory actions for categories exceeding risk thresholds (> 2.6), questions with severe ratings (≥ 4), or dimensions with uncertain evidence bases.
- **Multiple Assessments & Historical Reassessment Provenance:**
  - Manage multiple saved assessments directly within the application.
  - Non-destructive upgrade path: upgrading a historical v1 assessment creates a distinct v2 reassessment revision (`sourceAssessmentId`), preserving the original v1 record, its completion status (100%), historical scores, and prior decision completely unchanged.
  - Fresh decision provenance: v2 revisions start with undecided governance recommendations, requiring explicit human evaluation of the expanded scope.
- **Versioned JSON Import / Export:**
  - Secure schema versioning with schema validation and strict enum checking.
  - Safe ID collision resolution: renames conflicting IDs on import and automatically updates historical revision links.
  - 5 MB file size limit and resilient legacy state migration.
- **Complete Printable Governance Review Pack:**
  - Browser-native `Print / Save as PDF` generates an institutional-grade multi-page governance review pack.
  - Includes system metadata, provisional vs. complete status, highest-severity concerns, category score matrices, context-sensitive mitigations, formal governance decisions, full question-by-question audit details with evidence sources, and methodological limitations.
- **Accessible & Responsive:**
  - Native accessible radio controls supporting keyboard arrow navigation and screen reader announcements.
  - Accessible mobile drawer navigation with Escape key dismissal and focus management.
  - High-contrast monochrome print stylesheet with clean page-break controls.
- **Local-First Privacy Architecture:**
  - 100% in-browser execution with zero telemetry, zero server-side storage, and zero external tracking.

---

## Assessment Scoring Scale

Each question is evaluated on a consistent 1–5 sustainability concern scale:

| Score | Classification | Governance Interpretation |
| :---: | :--- | :--- |
| **1** | **Sustainable** | Negligible concern; proactive controls and efficient resource alignment. |
| **2** | **Minor Concern** | Low risk; manageable with standard operational oversight. |
| **3** | **Moderate Concern** | Medium risk; requires active monitoring and targeted mitigation planning. |
| **4** | **Significant Concern** | High risk; requires immediate governance conditions and mitigation milestones. |
| **5** | **Critical Concern** | Severe risk; unacceptable operational, environmental, or institutional exposure. |

### Scoring & Completion Rules
- **Explicit Unanswered State:** Missing answers are never treated as score 0. Unanswered questions do not lower the average and are excluded from score calculations.
- **Provisional Status:** Assessments are flagged as **Provisional** until 100% of questions in the active methodology (34 in v1, 38 in v2) have been evaluated. Provisional assessments are never displayed as definitively Sustainable or Low Risk.

---

## Local-First Architecture & Storage

All application state is maintained in the user's browser `localStorage` under the key:
```
cp-sustainability-review-storage
```

### Storage Safeguards & User Responsibility
- Because data is held in browser local storage, clearing browser site data or using ephemeral private/incognito browsing windows will remove stored records.
- To maintain permanent records across machines and institutional archiving cycles, export versioned JSON bundles using the **Export** button in the header.

---

## Technology Stack

- **Runtime & UI:** React 19, TypeScript
- **Styling:** Tailwind CSS v3, Tailwind Merge, CLSX
- **Icons:** Lucide React
- **Routing:** React Router v7 (`HashRouter` for static hosting compatibility)
- **State Management:** Zustand with `persist` middleware
- **Build Tool:** Vite v8
- **Testing:** Vitest v4 with JSDOM
- **Code Quality:** ESLint 10, TypeScript-ESLint

---

## Development & Verification Commands

```bash
# Clone the repository
git clone https://github.com/cloudpedagogy/cloudpedagogy-ai-sustainability-impact-review.git
cd cloudpedagogy-ai-sustainability-impact-review

# Install clean dependencies
npm ci

# Start local development server
npm run dev

# Run automated test suite (47 unit and integration tests)
npm test

# Run ESLint validation
npm run lint

# Build production bundle with TypeScript type-checking
npm run build

# Preview production build locally
npm run preview
```

---

## Continuous Integration

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) validating:
- Node.js compatibility across active LTS versions (`20.x`, `22.x`).
- Clean installation with `npm ci`.
- Linting validation (`npm run lint`).
- Full automated test suite execution (`npm test`).
- Type checking and Vite production compilation (`npm run build`).

---

## Methodological Limitations & Governance Disclaimers

> [!IMPORTANT]
> **Qualitative Heuristic Assessment Notice:** This review system provides structured qualitative and semi-quantitative heuristic evaluation across institutional, technical, environmental, and social dimensions. Numerical scores represent comparative risk ratings rather than empirical physical measurements of energy consumption (kWh) or verified greenhouse gas emissions ($CO_2e$).
>
> **Advisory Nature of Mitigations:** Context-sensitive priority mitigations and advisory recommendations are automated governance prompts generated from identified concern ratings and evidence gaps. They represent advisory guidance to inform institutional deliberation, not certified corrective actions or institutional warranties.
>
> **Self-Reported Evidence:** Any resource figures, query volumes, or vendor metrics recorded in evidence fields are self-reported by the evaluating institution and have not been independently verified or certified by CloudPedagogy.
>
> **Open-Source Independence:** This software is licensed under the MIT Licence. Assessment results do not constitute formal institutional approval, legal compliance, or accreditation by CloudPedagogy, third-party model providers, or regulatory bodies.

---

## Licence

Distributed under the [MIT Licence](LICENSE). Part of the CloudPedagogy Open-Source AI Governance Portfolio.
