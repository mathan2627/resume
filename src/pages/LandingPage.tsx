import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { SkillConstellationScene } from "@/components/3d/SkillConstellationScene";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  CheckCircle2,
  Code2,
  Briefcase,
  Share2,
  Lock,
  ArrowRight,
  Sparkles,
  GitBranch,
  Terminal,
  HelpCircle,
  ChevronDown,
  Layers,
  FileCheck,
  Target,
  Zap,
  Globe,
  Check,
  Clock,
  ExternalLink,
  ChevronRight,
  Cpu,
  BookOpen,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [activeDemoTab, setActiveDemoTab] = useState<"claim" | "evidence" | "challenge">("evidence");

  const workflowSteps = [
    {
      step: 1,
      title: "Resume Claims",
      desc: "Extract technical claims, frameworks, and projects from PDF/DOCX resumes using structured taxonomy parsing.",
      badge: "Step 01",
      preview: {
        type: "claim",
        title: "Unverified Resume Statement",
        content: '"Proficient in React, TypeScript, and Node.js with distributed REST API microservices experience."',
        status: "Claimed (Not yet proven)",
        badgeVariant: "claim" as const,
      },
    },
    {
      step: 2,
      title: "Project Evidence",
      desc: "Analyze public GitHub repositories to find real commit history, package manifests, and code excerpts backing claims.",
      badge: "Step 02",
      preview: {
        type: "evidence",
        title: "GitHub Repository AST Scan",
        content: "Found 1,420 lines of TypeScript in github.com/student/ecommerce-api. Detected Express routing and Jest unit tests.",
        status: "Evidence Found (High Confidence)",
        badgeVariant: "evidence" as const,
      },
    },
    {
      step: 3,
      title: "Practical Assessment",
      desc: "Solve adaptive, rubric-evaluated mini challenges that test architectural patterns, debugging, and code reading.",
      badge: "Step 03",
      preview: {
        type: "challenge",
        title: "Adaptive Challenge Evaluation",
        content: "Passed TypeScript Concurrency & Asynchronous Error Boundaries challenge with 92% rubric score.",
        status: "Challenge Assessed",
        badgeVariant: "challenge" as const,
      },
    },
    {
      step: 4,
      title: "Skill Proof Score",
      desc: "Generate an explainable, tamper-evident proof score based on factual code and challenge performance.",
      badge: "Step 04",
      preview: {
        type: "proof",
        title: "Verified Skill Index",
        content: "React (Assessed: 94%), TypeScript (Assessed: 92%), Docker (Config Proven), Node.js (AST Found: 88%).",
        status: "Verified Proof Generated",
        badgeVariant: "verified" as const,
      },
    },
    {
      step: 5,
      title: "Intelligent Matching",
      desc: "Automatically correlate verified skills with real opportunities from Greenhouse, Lever, and official employer feeds.",
      badge: "Step 05",
      preview: {
        type: "matching",
        title: "Transparent Match Breakdown",
        content: "88% Match with Stripe Backend Systems Intern: Covers 4/5 skills, verified evidence present, role alignment 95%.",
        status: "Verified Opportunity Match",
        badgeVariant: "match" as const,
      },
    },
    {
      step: 6,
      title: "Career Growth",
      desc: "Follow personalized 4-week roadmaps and share a revocable Proof Passport directly with prospective recruiters.",
      badge: "Step 06",
      preview: {
        type: "growth",
        title: "Career Acceleration",
        content: "Target role achieved. Public Proof Passport shared with 4 prospective tech recruiters with verifiable badges.",
        status: "Proof Passport Active",
        badgeVariant: "fresh" as const,
      },
    },
  ];

  const previewListings = [
    {
      company: "Stripe",
      title: "Backend Systems Software Intern",
      location: "Bengaluru, India / Hybrid",
      remoteStatus: "hybrid" as const,
      skills: ["Go", "Java", "PostgreSQL", "Docker"],
      stipend: "INR 1,20,000 / month",
      source: "Greenhouse API",
      url: "https://stripe.com/jobs",
      matchScore: 92,
      deadline: "2026-11-30",
    },
    {
      company: "Figma",
      title: "Frontend Engineering Intern (Editor Tools)",
      location: "San Francisco, CA / Remote",
      remoteStatus: "remote" as const,
      skills: ["TypeScript", "React", "WebGL", "Performance"],
      stipend: "$52 / hr",
      source: "Greenhouse API",
      url: "https://figma.com/careers",
      matchScore: 88,
      deadline: "2026-12-15",
    },
    {
      company: "Cloudflare",
      title: "Systems & Edge Network Engineering Intern",
      location: "Remote / Global",
      remoteStatus: "remote" as const,
      skills: ["Rust", "Go", "Docker", "Networking"],
      stipend: "$45 / hr",
      source: "Greenhouse API",
      url: "https://cloudflare.com/careers",
      matchScore: 84,
      deadline: "2026-11-01",
    },
  ];

  const faqs = [
    {
      q: "How does ProofPath AI differ from traditional job boards or ATS resume scanners?",
      a: "Traditional job boards trust unverified resume keywords, and generic ATS scanners simply count word frequencies. ProofPath AI connects claims to real public GitHub commit history, code structure (AST), and adaptive practical assessments. We prove competence before claims.",
    },
    {
      q: "How does the automated 1-minute job intelligence discovery system work?",
      a: "Our scheduler continuously polls permitted company job board APIs (such as public Greenhouse and Lever endpoints) and verified developer feeds on a bounded, rate-limited schedule. New vacancies are validated, deduplicated, and matched against student skill proofs in real-time.",
    },
    {
      q: "Does ProofPath AI share my original resume without my permission?",
      a: "No. Your raw resume files are stored privately in encrypted cloud storage. You control your public Proof Passport, which only exposes the specific skills, projects, and assessment badges you explicitly choose to make public.",
    },
    {
      q: "How are the internship and job match percentages calculated?",
      a: "Our match percentage is a transparent, explainable relevance score combining: required skill coverage (40%), verified project evidence (25%), practical challenge performance (20%), and semantic role alignment (15%). It is never represented as an unexplained black-box hiring probability.",
    },
    {
      q: "Are the job listings genuine active opportunities with direct application links?",
      a: "Yes. Every listing features its original employer application URL and verified source identifier. We never fabricate placement figures or pretend applications are submitted automatically.",
    },
    {
      q: "Can I use ProofPath AI if I haven't built large open-source projects yet?",
      a: "Absolutely. You can start by uploading your resume, identifying your skill gaps, and taking our adaptive coding challenges to prove your grasp of foundational concepts directly on the platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors">
      <Navbar />

      {/* 1. HERO SECTION WITH 3D CONSTELLATION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-white/[0.08] light:border-slate-200">
        {/* Ambient Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 border border-slate-700/80 text-cyan-300 light:bg-white light:border-slate-300 light:text-blue-700 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 light:text-blue-600" />
                <span>{t("hero.badge")}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white light:text-slate-900 leading-[1.08]">
                {t("hero.title")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 light:from-blue-600 light:via-indigo-600 light:to-cyan-600">
                  {t("hero.subtitle")}
                </span>
              </h1>

              <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 light:text-slate-600 leading-relaxed font-normal">
                {t("hero.description")}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="glow" size="lg" className="w-full sm:w-auto text-base">
                    <span>{t("hero.cta.start")}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/internships" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                    <Briefcase className="w-4 h-4 text-cyan-400 light:text-blue-600 mr-2" />
                    <span>{t("hero.cta.explore")}</span>
                  </Button>
                </Link>
              </div>

              {/* Principle Trust Signals */}
              <div className="pt-8 border-t border-white/[0.08] light:border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Evidence First</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Explainable AI</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Source Links</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Data Sovereignty</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Impact 3D Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-slate-900/40 border border-white/[0.08] light:bg-slate-100/60 light:border-slate-200 shadow-2xl overflow-hidden p-2">
                <SkillConstellationScene />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT WORKFLOW DEMONSTRATION (THE 6-STEP PIPELINE) */}
      <section id="workflow" className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200 bg-[#090e1c]/40 light:bg-slate-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="evidence" className="mb-3">
              Core Differentiator
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
              {t("workflow.title")}
            </h2>
            <p className="mt-3 text-slate-400 light:text-slate-600 text-sm sm:text-base">
              {t("workflow.subtitle")}
            </p>
          </div>

          {/* Stepped Interactive Selector */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 mb-8">
            {workflowSteps.map((step, idx) => {
              const isSelected = activeWorkflowStep === idx;
              return (
                <button
                  key={step.step}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-[1.02]"
                      : "bg-slate-900/80 light:bg-white border-slate-800 light:border-slate-200 text-slate-400 light:text-slate-600 hover:border-slate-700"
                  }`}
                >
                  <span className={`text-[10px] font-bold block ${isSelected ? "text-cyan-200" : "text-slate-500"}`}>
                    {step.badge}
                  </span>
                  <span className="text-xs font-semibold block mt-1 truncate">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stepped Detail Visual Card */}
          <Card className="p-6 sm:p-8 bg-slate-900/90 light:bg-white border-slate-800 light:border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4">
                <Badge variant={workflowSteps[activeWorkflowStep].preview.badgeVariant}>
                  {workflowSteps[activeWorkflowStep].title}
                </Badge>
                <h3 className="text-2xl font-bold text-white light:text-slate-900">
                  {workflowSteps[activeWorkflowStep].preview.title}
                </h3>
                <p className="text-sm text-slate-300 light:text-slate-600 leading-relaxed">
                  {workflowSteps[activeWorkflowStep].desc}
                </p>
                <div className="pt-2">
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      <span>Experience In Your Workspace</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-6">
                <div className="rounded-xl bg-slate-950 light:bg-slate-900 p-5 border border-slate-800 text-slate-100 font-mono text-xs space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>proofpath-pipeline-output</span>
                    </div>
                    <Badge variant={workflowSteps[activeWorkflowStep].preview.badgeVariant} size="sm">
                      {workflowSteps[activeWorkflowStep].preview.status}
                    </Badge>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {workflowSteps[activeWorkflowStep].preview.content}
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>verified_by: proofpath_engine_v2</span>
                    <span>checksum: 0x8f2a...4b19</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. RESUME-TO-SKILL EVIDENCE FEATURE */}
      <section id="features" className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <Badge variant="evidence">Unstructured to Structured</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
                Turn Unverified Claims into Documented Evidence
              </h2>
              <p className="text-sm sm:text-base text-slate-300 light:text-slate-600 leading-relaxed">
                Ordinary resumes are full of unsupported keywords. ProofPath AI's taxonomy engine parses your resume, classifies skills into standardized categories (Frontend, Backend, AI/ML, DevOps), and creates an evidence roadmap.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white light:text-slate-900">Standardized Taxonomy Mapping</h4>
                    <p className="text-xs text-slate-400 light:text-slate-500">Normalizes variants like "ReactJS" or "TS" into canonical recognized industry skills.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white light:text-slate-900">ATS Score & Format Audits</h4>
                    <p className="text-xs text-slate-400 light:text-slate-500">Identifies missing sections, weak bullet points, and provides quantifiable action verbs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card className="p-6 bg-slate-900 light:bg-white border-slate-800 light:border-slate-200 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200 mb-4">
                  <span className="text-xs font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider">
                    Resume Parsing & Taxonomy Audit
                  </span>
                  <Badge variant="verified">ATS Score: 88/100</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Extracted Technical Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="evidence" size="sm">React</Badge>
                      <Badge variant="evidence" size="sm">TypeScript</Badge>
                      <Badge variant="evidence" size="sm">Node.js</Badge>
                      <Badge variant="evidence" size="sm">PostgreSQL</Badge>
                      <Badge variant="evidence" size="sm">Docker</Badge>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Verification Status
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-300 light:text-slate-700">
                      <div className="flex justify-between">
                        <span>Project Evidence:</span>
                        <span className="text-emerald-400 font-semibold">3 Repos Found</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Challenges Passed:</span>
                        <span className="text-purple-400 font-semibold">2 Completed</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Readiness Level:</span>
                        <span className="text-cyan-400 font-semibold">Intermediate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GITHUB REPOSITORY EVIDENCE ANALYSIS */}
      <section className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200 bg-[#090e1c]/40 light:bg-slate-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800 text-slate-100 font-mono text-xs space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200 font-semibold">github.com/alex-dev/api-gateway</span>
                  </div>
                  <Badge variant="verified" size="sm">Evidence Score: 95/100</Badge>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p className="text-cyan-300 font-semibold">// AST Analysis Breakdown</p>
                  <p>✓ Language distribution: TypeScript (78%), Go (15%), Dockerfile (7%)</p>
                  <p>✓ Detected REST endpoints: 14 routed controllers with express-validator</p>
                  <p>✓ Commit history: 42 commits spanning 4 months with authentic commit logs</p>
                  <p>✓ Test coverage: Jest unit test suites with 88% statement coverage</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
                  "Excerpt: src/middleware/auth.ts (Line 18) - JWT token verification with Redis revoked-token blacklist."
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
              <Badge variant="evidence">Code Speaks Louder Than Claims</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
                Authentic GitHub Project Verification
              </h2>
              <p className="text-sm sm:text-base text-slate-300 light:text-slate-600 leading-relaxed">
                Connect your public GitHub repositories. ProofPath AI reads real files, commit frequencies, README documentation, and package manifests to verify that you actually wrote the software you listed on your resume.
              </p>
              <div className="pt-2">
                <Link to="/skills">
                  <Button variant="outline" size="sm">
                    <GitBranch className="w-4 h-4 mr-1.5 text-cyan-400" />
                    <span>Explore Skill Proof Engine</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRACTICAL ASSESSMENT ENGINE */}
      <section className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto mb-14">
          <Badge variant="challenge" className="mb-3">
            Adaptive Skill Challenges
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Prove Competence with Timed Practical Tests
          </h2>
          <p className="mt-3 text-slate-400 light:text-slate-600 text-sm sm:text-base">
            Don't have public open-source code for every technology? Complete targeted bug-hunting, code-reading, and system design challenges evaluated with Gemini rubrics.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 sm:p-8 bg-slate-900 light:bg-white border-slate-800 light:border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <Badge variant="challenge">TypeScript</Badge>
                <Badge variant="outline">Intermediate</Badge>
              </div>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 10 Mins Allowed
              </span>
            </div>

            <h3 className="text-lg font-bold text-white light:text-slate-900 mb-2">
              Asynchronous Connection Pooling & Error Boundaries
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 mb-6">
              In a high-concurrency Node.js / TypeScript microservice, which pattern most effectively guarantees that unhandled promise rejections do not leak database connections?
            </p>

            <div className="space-y-3 mb-6 text-left">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 light:bg-slate-50 text-xs text-slate-400">
                A) Setting process.env.NODE_ENV to production and muting console output.
              </div>
              <div className="p-3.5 rounded-xl border border-blue-500/50 bg-blue-950/30 text-xs text-blue-200 font-semibold flex items-center justify-between">
                <span>B) Wrapping async handlers in try/finally blocks with client.release() in connection pool lifecycle.</span>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 light:bg-slate-50 text-xs text-slate-400">
                C) Increasing the default V8 heap memory size limit to 8 GB.
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 light:border-slate-200">
              <span className="text-xs text-emerald-400 font-medium">✓ Instant Rubric Grading Enabled</span>
              <Link to="/challenges">
                <Button variant="primary" size="sm">
                  <span>Take a Live Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. INTELLIGENT INTERNSHIP & JOB MATCHING */}
      <section className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200 bg-[#090e1c]/40 light:bg-slate-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="fresh" className="mb-3">
              Automated Global Intelligence
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
              Genuine Opportunities with Verified Source Links
            </h2>
            <p className="mt-3 text-slate-400 light:text-slate-600 text-sm sm:text-base">
              Discovered from official company career portals (Greenhouse, Lever) and authorized feeds. Transparently explained match scores with original employer application links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewListings.map((item, idx) => (
              <Card key={idx} hover className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {item.company}
                    </span>
                    <Badge variant="match">{item.matchScore}% Match</Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.location}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((s) => (
                      <Badge key={s} variant="outline" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 light:border-slate-200">
                    <span>Stipend: {item.stipend}</span>
                    <Badge variant="fresh" size="sm">{item.source}</Badge>
                  </div>
                </CardContent>

                <CardFooter>
                  <span className="text-[11px] text-slate-500">
                    Deadline: {item.deadline}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Apply on Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/internships">
              <Button variant="glow" size="md">
                <span>Explore All Global Opportunities</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. SKILL GAP AND PERSONALIZED ROADMAP */}
      <section className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <Badge variant="evidence">Targeted Progression</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
                Close Skill Gaps with 4-Week Milestones
              </h2>
              <p className="text-sm sm:text-base text-slate-300 light:text-slate-600 leading-relaxed">
                When you target a dream role (like Backend Systems Engineer at Stripe), ProofPath AI isolates the exact skills you're missing, generates a structured milestone plan, and links to free practical resources.
              </p>
              <div className="pt-2">
                <Link to="/roadmap">
                  <Button variant="primary" size="sm">
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    <span>View Career Roadmap</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 light:bg-white light:border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    W1
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white light:text-slate-900">Build a Verified Mini-Project in Go</h4>
                    <p className="text-[11px] text-slate-400">Implement goroutines and connection pooling to create GitHub evidence.</p>
                  </div>
                </div>
                <Badge variant="verified" size="sm">Completed</Badge>
              </div>

              <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-950/20 light:bg-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    W2
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white light:text-slate-900">Pass PostgreSQL Indexing & Locking Challenge</h4>
                    <p className="text-[11px] text-slate-400">Complete the adaptive coding challenge to upgrade status to Challenge Assessed.</p>
                  </div>
                </div>
                <Badge variant="challenge" size="sm">In Progress</Badge>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 light:bg-white light:border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                    W3
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white light:text-slate-900">Containerize & Deploy with Docker</h4>
                    <p className="text-[11px] text-slate-400">Write multi-stage Dockerfile and push to public GitHub repository.</p>
                  </div>
                </div>
                <Badge variant="outline" size="sm">Upcoming</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PROOF PASSPORT DEMONSTRATION */}
      <section className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200 bg-[#090e1c]/40 light:bg-slate-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto mb-14">
          <Badge variant="verified" className="mb-3">
            Shareable Cryptographic Portfolio
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Your Proof Passport: A Recruiter-Ready Portfolio
          </h2>
          <p className="mt-3 text-slate-400 light:text-slate-600 text-sm sm:text-base">
            Instead of emailing unverified PDFs, share your unique Proof Passport URL. Recruiters see verified GitHub evidence, passed assessment scores, and live project code with revocable privacy toggles.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <Card className="p-6 sm:p-8 bg-slate-900 light:bg-white border-slate-800 light:border-slate-200 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800 light:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                  AK
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-white light:text-slate-900">Alex Kumar</h3>
                  <p className="text-xs text-slate-400">proofpath.ai/p/alex-kumar</p>
                </div>
              </div>
              <Badge variant="verified">Verified Proof Passport</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6">
              <div className="p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Overall Proof</span>
                <span className="text-xl font-extrabold text-cyan-400">92/100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Assessed Skills</span>
                <span className="text-xl font-extrabold text-purple-400">6 Proven</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">GitHub Repos</span>
                <span className="text-xl font-extrabold text-emerald-400">4 Scanned</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Status</span>
                <span className="text-xl font-extrabold text-blue-400">Active</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Recruiter Inspection View</span>
              <Link to="/passport">
                <Button variant="primary" size="sm">
                  <span>Create Your Passport</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 9. PRIVACY AND TRANSPARENCY */}
      <section className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3">
              Trust & Safety
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
              Privacy-First, Student-Owned Architecture
            </h2>
            <p className="mt-3 text-slate-400 light:text-slate-600 text-sm sm:text-base">
              We believe students should own their data. ProofPath AI never sells candidate records, monetizes raw resumes, or hides matching logic behind opaque algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-slate-900 light:bg-white border-slate-800 light:border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white light:text-slate-900 mb-2">
                Revocable Privacy Controls
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
                You toggle exactly which sections are public on your Proof Passport. Disable access at any moment with a single click.
              </p>
            </Card>

            <Card className="p-6 bg-slate-900 light:bg-white border-slate-800 light:border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white light:text-slate-900 mb-2">
                100% Explainable AI
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
                Every percentage score shows its exact formula: required skills, repository evidence, assessment scores, and role alignment.
              </p>
            </Card>

            <Card className="p-6 bg-slate-900 light:bg-white border-slate-800 light:border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white light:text-slate-900 mb-2">
                Direct Official Links
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
                Apply directly on the employer's genuine website. We preserve source attribution and never intercept external applications.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 10. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 md:py-28 border-b border-white/[0.08] light:border-slate-200 bg-[#090e1c]/40 light:bg-slate-100/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-3">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 light:border-slate-200 bg-slate-900/90 light:bg-white overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white light:text-slate-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 light:text-slate-600 leading-relaxed border-t border-slate-800/60 light:border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. CTA BANNER */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to Prove Your Skills?
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              Join students and developers using ProofPath AI to back up their claims with verified GitHub projects, timed coding challenges, and real-time opportunity intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="glow" size="lg" className="w-full sm:w-auto text-base">
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/internships" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  <span>Explore Open Opportunities</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. PROFESSIONAL FOOTER */}
      <Footer />
    </div>
  );
};
