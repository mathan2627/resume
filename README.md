# ProofPath AI

**Tagline:** Prove Your Skills. Discover Your Future.  
**Product Category:** AI-powered skill evidence, career readiness, and automated global job intelligence platform.

---

## 1. Product Vision & Core Differentiator

**ProofPath AI** transforms early-career recruiting by eliminating unverified resume claims and opaque keyword filters. Instead of automated keyword rejections or inflated claims, ProofPath AI delivers an end-to-end, evidence-grounded career growth engine:

$$\mathbf{Resume\ Claims} \longrightarrow \mathbf{Project\ Evidence} \longrightarrow \mathbf{Practical\ Assessment} \longrightarrow \mathbf{Skill\ Proof} \longrightarrow \mathbf{Intelligent\ Opportunity\ Matching} \longrightarrow \mathbf{Career\ Growth}$$

### Key Value Propositions
- **Interactive 3D Constellation Hero:** Visualizes the candidate's dynamic skill universe and opportunity pathways using Three.js and React Three Fiber, equipped with automatic CSS and reduced-motion fallbacks for accessibility and device compatibility.
- **Automated Global Job Intelligence:** An extensible connector framework that continuously discovers, deduplicates, verifies, and indexes internships and early-career jobs from Greenhouse, Lever, public feeds, CSV imports, and web search adapters.
- **4-Tier Explainable Competence Scoring:** Replaces arbitrary percentages with verifiable proof:
  - *Claimed (35%):* Declared on resume or profile without external code backing.
  - *Evidence Found (50%–85%):* Backed by AST-scanned GitHub repositories, commit velocity, and implementation depth.
  - *Challenge Assessed (70%–100%):* Validated through timed practical skill assessments with instant rubric evaluations.
  - *Insufficient (20%):* Keyword detected without sufficient implementation context.
- **Multi-Factor Explainable Internship Matching:**
  $$\text{Match Score} = (\text{Skill Coverage} \times 0.40) + (\text{Project Evidence} \times 0.25) + (\text{Challenge Assessed} \times 0.20) + (\text{Role Alignment} \times 0.15)$$
- **Proof Passport™:** A privacy-first, shareable portfolio (`/p/:slugOrToken`) with granular section visibility controls (skills, code repos, challenge badges, education, and contact details).
- **Global & Indian Student Reach:** Pre-configured filters for remote, hybrid, on-site, stipends/salaries in INR/USD, India/US/Europe locations, and full English + Tamil localization.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19, TypeScript, Vite 8
- **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`), CSS custom property tokens, persistent Light & Dark mode support
- **3D Graphics & Animations:** Three.js, `@react-three/fiber`, `@react-three/drei`, Motion
- **Data Visualization & Icons:** Recharts (responsive evidence breakdowns and readiness gauges), Lucide React
- **Forms & Validation:** React Hook Form, Zod
- **Document Extraction:** `pdfjs-dist` and `mammoth` for client-side PDF/DOCX parsing with scanned-image detection
- **Internationalization:** English (`en`) and Tamil (`ta`) localization via `LanguageContext`

### Backend & Database (Convex Cloud Platform)
- **Deployment URL:** `https://content-lemur-582.convex.cloud`
- **Database Schema:** 25 normalized tables with secondary indexes, compound indexes, and vector search
- **Server Execution:** Convex Queries, Mutations, Actions, and Internal Functions
- **Scheduled Jobs & Crons:** 1-minute interval job aggregation tick (`job-intelligence-scheduler-tick`) and hourly listing hygiene (`hourly-listing-hygiene`)
- **File Storage:** Convex File Storage for resumes, project artifacts, and candidate documents

### Artificial Intelligence & Machine Learning
- **SDK:** Official Google Gen AI JavaScript/TypeScript SDK (`@google/genai`)
- **Language Models:** Gemini 2.5 Flash / Gemini 1.5 Flash (configurable via environment variables) for resume AST parsing, structured bullet-point impact enhancement, timed coding challenge generation, personalized 4-week learning roadmaps, and contextual career assistance
- **Semantic Vector Matching:** Convex Vector Search for similarity retrieval across job requirements and candidate skills

---

## 3. Automated Global Job Intelligence Architecture

The job aggregation engine is built modularly in [`convex/jobIntelligence.ts`](file:///D:/devflow/convex/jobIntelligence.ts) and orchestrated by Convex Crons:

```
[Official Company Boards]        [Public Feeds]       [Admin CSV / Web Discovery]
  (Greenhouse, Lever)             (JSON, RSS)            (SerpApi, Manual)
          │                            │                         │
          └─────────────────────┬──────┴─────────────────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │   Modular Source Connectors   │
                │  - Normalize Job Attributes   │
                │  - Standardize Taxonomy Skills│
                │  - Detect Remote / Hybrid / On│
                │  - Parse Compensation & Dates │
                └───────────────┬───────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │ Deduplication & Clustering    │
                │  - Source Identifier Match    │
                │  - Fuzzy (Company + Title)    │
                │  - Update Existing Timestamp  │
                └───────────────┬───────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │ Freshness & Confidence Scorer │
                │  - Source Confidence: 80-95%  │
                │  - Freshness: Fresh / Active  │
                │  - Direct Employer Links Only │
                └───────────────┬───────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │     Convex 'internships'      │
                │   Real-Time Database Table    │
                └───────────────────────────────┘
```

### Connector Specifications
1. **Greenhouse Connector (`fetchGreenhouseJobs`):**
   - Harvests official job listings via Greenhouse Public Boards (`https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs?content=true`).
   - Maps departments, office locations, employment types, and extracts standardized skills against the 35-skill master taxonomy.
   - Assigns 95% source confidence with direct employer application URLs.
2. **Lever Connector (`fetchLeverJobs`):**
   - Ingests verified postings via Lever Postings API (`https://api.lever.co/v0/postings/{companyName}?mode=json`).
   - Normalizes remote status from workplace types, parses salary brackets where published, and assigns 92% confidence.
3. **Public Feeds Connector (`fetchPublicFeedJobs`):**
   - Ingests structured JSON/RSS job feeds with configurable field selectors and 80% confidence scoring.
4. **Pluggable Web Discovery Adapter:**
   - Optional adapter for crawling verified company careers portals or search APIs when configured with `JOB_SEARCH_API_KEY`.
5. **Scheduler & Concurrency Management:**
   - Convex cron job executes every 1 minute (`job-intelligence-scheduler-tick`).
   - Bounded batch processing: processes at most 2 due sources per tick with exponential backoff on failure to prevent rate limits.

---

## 4. Repository Structure

```
devflow/
├── convex/                          # Convex Cloud Backend
│   ├── schema.ts                    # 25 Normalized Tables & Indexes
│   ├── jobIntelligence.ts          # Modular Job Connector Engine & Scheduler
│   ├── crons.ts                     # 1-min & Hourly Cron Definitions
│   ├── internships.ts               # Multi-Attribute Opportunity Queries & Filters
│   ├── matching.ts                  # 4-Factor Explainable Scoring Engine
│   ├── challenges.ts                # Timed Adaptive Assessments & Instant Rubrics
│   ├── skills.ts                    # Evidence Aggregators & Master Taxonomy
│   ├── resumes.ts                   # Resume Storage, ATS Parsing & Bullet Enhancer
│   ├── passports.ts                 # Proof Passport Public Sharing & Privacy Toggles
│   ├── recruiters.ts                # Recruiter Vacancy Postings & Consented Search
│   ├── roadmaps.ts                  # 4-Week Milestone Learning Plans
│   ├── mockInterviews.ts            # AI Technical Interview Practice
│   ├── admin.ts                     # Admin KPIs, RBAC & CSV Ingestion
│   └── ai.ts                        # Gemini SDK Integration & Structured Output
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   └── SkillConstellationScene.tsx  # Three.js / R3F Interactive Hero Scene
│   │   ├── layout/                          # Navbar, Footer, Sidebar, DashboardLayout
│   │   └── ui/                              # Shared Design System Components
│   │       ├── Button.tsx, Card.tsx, Badge.tsx, Modal.tsx
│   │       ├── Tabs.tsx, Input.tsx, Skeleton.tsx, EmptyState.tsx, Toast.tsx
│   ├── context/
│   │   ├── AuthContext.tsx                  # Web Crypto Session Management
│   │   ├── ThemeContext.tsx                 # Light / Dark Mode System
│   │   └── LanguageContext.tsx              # English & Tamil Localization
│   ├── lib/
│   │   ├── documentExtractor.ts             # PDF/DOCX Extraction & OCR Detection
│   │   └── githubAnalyzer.ts                # GitHub REST API & Code Evidence Scanner
│   └── pages/                               # 19 Fully Redesigned Pages
│       ├── LandingPage.tsx                  # 12-Section Hero, Workflow & Features
│       ├── DashboardPage.tsx                # Candidate Readiness & Evidence Dashboard
│       ├── InternshipsPage.tsx              # Opportunity Explorer with Real Filters
│       ├── SkillsProofPage.tsx              # Evidence Inventory & GitHub Linker
│       ├── ChallengesPage.tsx               # Timed Practical Assessment Arena
│       ├── ResumePage.tsx                   # ATS Audit & Bullet Point Impact Enhancer
│       ├── ApplicationsPage.tsx             # Application Kanban Pipeline Tracker
│       ├── RoadmapPage.tsx                  # 4-Week Milestone Learning Roadmaps
│       ├── InterviewPage.tsx                # AI Mock Technical Interview Arena
│       ├── ProofPassportPage.tsx            # Candidate Portfolio Customizer
│       ├── PublicPassportView.tsx           # Recruiter-Facing Public Passport View
│       ├── CareerAssistantPage.tsx          # Grounded AI Career Chatbot
│       ├── SettingsPage.tsx                 # Preferences, GDPR Export & Privacy
│       ├── RecruiterPortalPage.tsx          # Recruiter Vacancies & Applicant Roster
│       ├── RecruiterSearchPage.tsx          # Verified Candidate Search Portal
│       ├── AdminPage.tsx                    # Ingestion Telemetry & Connector Hub
│       ├── AdminListingsPage.tsx            # Opportunity Review & Verification
│       ├── AdminUsersPage.tsx               # RBAC Permissions & Audit Logs
│       ├── AdminImportPage.tsx              # Bulk CSV Import with Deduplication
│       └── LoginPage.tsx, RegisterPage.tsx, OnboardingPage.tsx
├── tests/                                   # Vitest Automated Test Suite
│   ├── jobIntelligence.test.ts              # Skill Extraction, Deduplication & Freshness
│   ├── taxonomy.test.ts                     # Normalization & 4-Tier Scoring Engine
│   ├── matching.test.ts                     # Multi-Factor Match Formula Validation
│   └── documentExtractor.test.ts            # Client-Side PDF/DOCX Parsing Tests
└── dist/                                    # Optimized Production Build Artifacts
```

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js `v20.0.0` or higher (tested on Node `v24.21.0`)
- npm `v10+` or `v11+`

### Installation
```bash
# 1. Clone repository and install dependencies
cd devflow
npm install

# 2. Configure environment file (.env.local)
cp .env.example .env.local
```

### Environment Variables
Configure the following in `.env.local` (client-side) and in your Convex deployment (server-side):

| Variable | Location | Purpose | Required |
| :--- | :--- | :--- | :--- |
| `VITE_CONVEX_URL` | `.env.local` | Convex deployment endpoint (`https://content-lemur-582.convex.cloud`) | Yes |
| `GEMINI_API_KEY` | Convex Environment | Google Gen AI API key for resume analysis, challenges, and roadmaps | Recommended |
| `ADMIN_BOOTSTRAP_KEY` | Convex Environment | Secret key used for authenticating administrative bootstrap operations | Recommended |
| `JOB_SEARCH_API_KEY` | Convex Environment | Search API key for pluggable web discovery adapter | Optional |

To set Convex environment variables securely:
```bash
# 1. Set Google Gemini API Key
npx convex env set GEMINI_API_KEY <your-private-gemini-key>

# 2. Set Admin Bootstrap Key
npx convex env set ADMIN_BOOTSTRAP_KEY <your-strong-bootstrap-secret>
```

### Initial Administrator Bootstrap
ProofPath AI enforces zero-trust role boundaries: public registration strictly permits `student` or `recruiter` roles, and users are **never** promoted to administrator based on an unverified email address.

To initialize the platform administrator account:
```bash
# 1. Register normally as a user at http://localhost:5173/register
# 2. Promote the verified account to administrator via server-side CLI:
npx convex run auth:bootstrapInitialAdmin '{"email": "your-email@example.com", "bootstrapKey": "<your-strong-bootstrap-secret>"}'
```
*Note: Once an administrator exists, further administrative promotions must be executed directly by an authenticated administrator via the Admin Console (`/admin/users`) or authorized with `ADMIN_BOOTSTRAP_KEY`.*

### Running the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` to view the application with live hot module replacement.

### Running Automated Tests
```bash
npm run test
```
Runs 25 automated tests across 6 test suites covering security RBAC enforcement, cross-tenant isolation, job intelligence parsing, skill taxonomy normalization, explainable matching algorithms, and document extraction.

### Building for Production
```bash
npm run build
```
Executes TypeScript type-checking (`tsc -b`) and bundles client assets via Vite with code-split vendor chunks (`three-vendor`, `charts-vendor`, `convex-vendor`, `icons-vendor`).

---

## 6. Verification & Audit Trail

- **Zero Fake Metrics:** All metrics on the student dashboard, opportunity explorer, and recruiter portals are computed dynamically from real database records and ingestion runs.
- **Direct Employer URLs:** Job cards and modals direct candidates to original application pages (e.g., Greenhouse, Lever, company careers sites) without falsifying automated submissions.
- **GDPR & Privacy Compliance:** Candidates can export their complete data profile as JSON or initiate account deletion directly from the [Settings](file:///D:/devflow/src/pages/SettingsPage.tsx) page.
- **WCAG Accessibility & Reduced Motion:** The 3D constellation hero checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and WebGL context availability, rendering a high-contrast CSS constellation fallback whenever appropriate.
