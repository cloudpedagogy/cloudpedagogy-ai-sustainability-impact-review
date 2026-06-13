# Project Specification: AI Sustainability Impact Review System

## 1. Project Overview

**Name**: AI Sustainability Impact Review System
**Repository**: `cloudpedagogy-ai-sustainability-impact-review`
**Ecosystem**: CloudPedagogy Governance Engineering Suite
**Type**: Local-first React Web Application

### 1.1 Purpose
The AI Sustainability Impact Review System is a governance tool designed to assess the long-term sustainability, maintainability, resilience, and wider impact of AI-supported systems, workflows, curricula, research projects, and organisational initiatives. 

It helps institutional decision-makers answer the core question:
> *Can this AI-supported system remain viable, responsible, maintainable, and governable over time?*

## 2. Target Audience
* Institutional Governance Leads
* Educators and Curriculum Designers
* Academic Researchers
* IT Procurement and Architecture Teams
* Public Sector Decision Makers

## 3. Technology Stack

The application adheres to the established CloudPedagogy local-first technology pattern:

* **Framework**: React 19 + TypeScript
* **Build Tool**: Vite
* **Routing**: React Router (`HashRouter` for AWS S3 static hosting compatibility)
* **State Management**: Zustand (with `persist` middleware)
* **Styling**: Tailwind CSS v3 (monochrome, institutional aesthetic)
* **Icons**: Lucide React
* **Data Persistence**: Browser `localStorage` only (Local-first architecture)
* **Backend**: None (No database, no API calls, no telemetry)

## 4. Application Architecture

The application is structured into four primary views, navigable via a persistent left-hand sidebar:

1. **System Overview**: Captures metadata about the system being reviewed, including the explicit "Review Purpose" (e.g., Pre-Deployment Review, Annual Review).
2. **Assessment Categories**: An 8-step review workflow covering distinct governance themes. Each question includes institutional guidance text to aid reflection.
3. **Decision Notes**: A concluding step where the reviewer logs a formal governance recommendation and rationale.
4. **Review Summary**: An aggregated dashboard displaying risk scores, identified priority mitigations, and printing/export options.

### 4.1 Local-First Principles
The system never transmits data over a network. All review data remains securely within the user's browser storage. To support collaboration or record-keeping, the app provides explicit `JSON Export` and `JSON Import` functionality.

## 5. Assessment Categories & Scoring Model

### 5.1 Categories
The review covers eight dimensions:
1. **Technical Sustainability**: Maintainability, tech debt, gracefully degrading fallbacks.
2. **Organisational Sustainability**: Long-term ownership, funding, and operational support.
3. **Capability Sustainability**: Staff training, confidence, and knowledge transfer.
4. **Educational / Research Sustainability**: Curriculum maintainability, reproducibility.
5. **Governance Sustainability**: Oversight cycles, auditability, and policy alignment.
6. **Vendor and Infrastructure Dependency**: API lock-in, procurement risks, alternatives.
7. **Environmental Considerations**: Proportionality of compute usage, infrastructure justification.
8. **Social and Human Impact**: Equity, inclusion, and preservation of meaningful human judgement.

### 5.2 Scoring Mechanism
Each question is rated on a 1-5 scale:
* `1 - Sustainable`
* `2 - Minor Concern`
* `3 - Moderate Concern`
* `4 - Significant Concern`
* `5 - Critical Sustainability Concern`

The application calculates the mean score for each category. An overall system score is also generated based on the mean of all completed categories. Categories scoring `3.0` or higher trigger an automated "Priority Mitigation" flag in the Review Summary.

## 6. Integration and Future Expansion

While currently a standalone tool, the data schema (JSON export structure) is designed to be ingested by future CloudPedagogy orchestration systems, such as:
* AI System Governance Passport
* Evidence Pack Generator
* AI Governance Risk Scanner

## 7. Deployment Requirements
The system is built to generate entirely static assets (`HTML/CSS/JS`). The output of `npm run build` (`dist/` folder) can be hosted directly on AWS S3 Static Website Hosting. Hash routing ensures that deep linking operates flawlessly without the need for server-level URL rewriting.
