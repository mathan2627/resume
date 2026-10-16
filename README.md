# ProofPath AI

**Tagline:** Prove Your Skills. Discover Your Path.  
**Product Category:** AI-powered skill evidence, career readiness, and internship intelligence platform.

---

## 1. Executive Overview

**ProofPath AI** solves a critical gap in early-career recruiting: resumes are full of unverified claims, applicant tracking systems reject qualified candidates based on raw keyword counts, and students lack transparent guidance on how to bridge real technical skill gaps.

ProofPath AI replaces blind keyword matching with an **evidence-grounded career platform**:
- **4-Tier Explainable Competence Scoring:** Unverified claims receive baseline credit (35%), supporting GitHub repository artifacts elevate confidence (50–85%), and verified practical timed assessments award top-tier standing (70–100%).
- **Multi-Factor Explainable Internship Matching:** Ranks verified opportunities using transparent weighted scoring: 40% skill coverage, 25% project evidence depth, 20% challenge performance, and 15% role alignment.
- **Proof Passport™ Portfolios:** Students generate privacy-first, shareable portfolio links (`/p/:slugOrToken`) with granular section visibility controls (skills, code repos, challenge badges, education, and contact details).
- **Recruiter & Admin Intelligence:** Verified recruiters can publish opportunities and review consented applicant dossiers. Platform administrators inspect data hygiene, audit logs, and bulk import listings via CSV.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7.
- **Data Visualization & Icons:** Recharts (responsive evidence breakdowns and readiness charts), Lucide React.
- **Backend & Database:** Convex Real-time Cloud Platform (25 relational and vector tables, queries, mutations, actions, internal functions, and scheduled cron jobs).
- **Backend Target:** Existing deployment `https://content-lemur-582.convex.cloud` (`mathankumar05112006:resume`).
- **AI/ML Layer:** Google Gemini 2.5/Flash SDK (`@google/genai`) for structured resume analysis, adaptive challenge generation, and contextual career assistance.
- **Client Document Extraction:** `pdfjs-dist` and `mammoth` for browser-side parsing with scanned image-only PDF detection.
- **Internationalization:** English and Tamil interface localization context (`LanguageContext`).

---

## 3. Architecture & Core Modules

```
proofpath-ai/
├── convex/                          # Convex Real-time Backend
│   ├── schema.ts                    # 25 Database Tables, Indexes, & Vector Search
│   ├── auth.ts                      # PBKDF2/SHA-256 Web Crypto Authentication & Sessions
│   ├── skills.ts                    # Master Taxonomy & Evidence Aggregators
│   ├── profiles.ts                  # Student Profile Management & Onboarding
│   ├── challenges.ts                # Timed Practical Assessment Runner & Rubrics
│   ├── matching.ts                  # 4-Factor Explainable Recommendation Algorithm
│   ├── internships.ts               # Verified Listing Directory & Bookmarks
│   ├── applications.ts              # Kanban Application Pipeline Tracker
│   ├── repositories.ts              # GitHub Project Repository Ingestion
│   ├── resumes.ts                   # Resume File Storage & ATS Readability Index
│   ├── passports.ts                 # Proof Passport Public Sharing & Privacy Toggles
│   ├── recruiters.ts                # Recruiter Dossiers, Postings, & Consented Search
│   ├── roadmaps.ts                  # Personalized Skill-Gap Learning Milestones
│   ├── mockInterviews.ts            # Technical Interview Scenarios & Evaluation
│   ├── admin.ts                     # Admin KPIs, RBAC Promotion, CSV Bulk Import, Audit Logs
│   ├── ai.ts                        # Gemini Structured Actions & Resilient Fallbacks
│   ├── crons.ts                     # Hourly Listing Expiration & Hygiene Crons
│   └── lib/
│       ├── auth_helpers.ts          # Password Salt/Hashing via Web Crypto API
│       └── taxonomy.ts              # 35-Skill Master Taxonomy & 4-Tier Scoring Engine
├── src/
│   ├── components/layout/           # Navbar, Footer, Sidebar, DashboardLayout
│   ├── context/                     # AuthContext, LanguageContext
│   ├── lib/                         # documentExtractor.ts, githubAnalyzer.ts
│   └── pages/                       # 17 High-Polish SaaS Views & Public Pages
└── tests/                           # Vitest Unit Test Suite (15 Passing Tests)
    ├── taxonomy.test.ts             # Normalization, Alias Mapping, 4-Tier Scoring
    ├── matching.test.ts             # Explainable Multi-Factor Scoring Engine
    └── documentExtractor.test.ts    # File Limits & Plain-Text Document Parsing
```

---

## 4. Explainable Scoring Engine

ProofPath AI enforces evidence transparency across all calculations:

### Skill Competence Tiers
| Tier | Score Range | Description |
| :--- | :--- | :--- |
| **Claimed** | 35% | Listed on resume or declared in profile, but lacking verified code or assessment. |
| **Evidence Found** | 50% – 85% | Verified public repository, source code commit, or project implementation detected. |
| **Challenge Assessed** | 70% – 100% | Practical timed challenge completed and evaluated via deterministic/rubric criteria. |
| **Insufficient** | 20% | Keyword mentioned without contextual project depth or runnable artifacts. |

### Internship Match Composite Formula
$$\text{Overall Match} = (\text{Skill Coverage} \times 0.40) + (\text{Project Evidence} \times 0.25) + (\text{Challenge Assessed} \times 0.20) + (\text{Role Alignment} \times 0.15)$$

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js `v20.0.0` or later (tested on Node `v24.21.0`)
- npm `v10+` or `v11+`

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd devflow

# Install project dependencies
npm install
```

### Environment Configuration
The application is pre-linked to the live Convex deployment:
```env
# .env.local
VITE_CONVEX_URL=https://content-lemur-582.convex.cloud
```

To configure private server-side secrets on your Convex deployment:
```bash
# Set your Google Gemini API Key
npx convex env set GEMINI_API_KEY <your-gemini-api-key>

# Set the Platform Administrator Email
npx convex env set ADMIN_EMAIL admin@proofpath.ai
```

### Running Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to explore the application.

### Running Unit Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```
The compiled, type-checked production bundle will be output to `dist/`.

---

## 6. Seeded Demonstration Data

The deployment is initialized with verified live data:
- **Master Skill Taxonomy:** 35 standardized engineering competencies across Languages, Frontend, Backend, AI/ML, DevOps, Databases, and Core CS.
- **Verified Internship Opportunities:** Active listings for companies including Vercel, Postman, MongoDB, Stripe, Razorpay, and Cloudflare.
- **Practical Challenges:** Timed assessment scenarios covering React closures, TypeScript exhaustiveness, Python generators, SQL index optimization, Docker multi-stage builds, and Machine Learning overfitting.

---

## 7. Security & Privacy Guarantees

- **No Plaintext Passwords:** Client passwords are salted with cryptographic entropy and hashed using PBKDF2/SHA-256 with 100,000 iterations.
- **Server-Side Token Verification:** All database operations authenticate the caller's session token and enforce role-based access control (Student, Recruiter, Admin).
- **Proof Passport Privacy:** Candidates have absolute consent over public data. Disabling contact, repository, or educational sections instantly strips those attributes server-side from public API payloads.
- **Zero Hallucinated Metrics:** Match percentages and scores display exact transparent mathematical breakdowns rather than opaque placement guarantees.
