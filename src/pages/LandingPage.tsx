import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
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
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Demo simulator state for section 2
  const [demoStep, setDemoStep] = useState<"claim" | "evidence" | "challenge">("challenge");

  const faqs = [
    {
      q: "How does ProofPath AI differ from an ordinary job board or resume scanner?",
      a: "Traditional job boards trust unverified resume keywords, and generic ATS tools simply count word frequency. ProofPath AI connects claims to real public GitHub commit history, code structure, and adaptive practical coding assessments. We prove competence before claims.",
    },
    {
      q: "Does ProofPath AI share my original resume with recruiters?",
      a: "No. Your raw resume documents are stored privately in secure storage. You control your public Proof Passport, which only exposes the specific skills, repositories, and assessment badges you explicitly choose to share.",
    },
    {
      q: "How are the internship relevance match percentages calculated?",
      a: "Our match percentage is a transparent, explainable relevance score combining: required skill coverage (40%), verified project evidence (25%), practical challenge performance (20%), and semantic role alignment (15%). It is never represented as an unexplained black-box hiring probability.",
    },
    {
      q: "Are the internship listings genuine active opportunities?",
      a: "Yes. All listings include their original source names (e.g. company career portals, verified feeds) and explicit verification badges. We never fabricate placement statistics or guarantee job offers.",
    },
    {
      q: "Can I use ProofPath AI if I haven't completed many open source projects?",
      a: "Absolutely. You can start by uploading your resume, identifying your skill gaps, and taking our adaptive coding challenges to prove your grasp of fundamental concepts directly on the platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden border-b border-slate-800/60">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 to-cyan-500/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-cyan-300 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            {t("hero.title")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              {t("hero.subtitle")}
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed mb-10">
            {t("hero.description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
            >
              <span>{t("hero.cta.start")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/internships"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>{t("hero.cta.explore")}</span>
            </Link>
          </div>

          {/* Principle Badges */}
          <div className="mt-14 pt-8 border-t border-slate-800/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Evidence Before Claims</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Explainable AI Scores</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Source Links</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Privacy-First Architecture</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESUME-TO-EVIDENCE INTERACTIVE DEMONSTRATION */}
      <section className="py-20 bg-[#090e1a]/80 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Live Interactive Simulation
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Watch Claims Transform into Verified Proof
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              See how ProofPath AI evaluates technical skills through three distinct tiers of verification.
            </p>
          </div>

          {/* Demonstration Interactive Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            {/* Step Selector */}
            <div className="flex items-center justify-center gap-2 mb-8 border-b border-slate-800 pb-4">
              <button
                onClick={() => setDemoStep("claim")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  demoStep === "claim"
                    ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1. Resume Claim (35%)
              </button>
              <button
                onClick={() => setDemoStep("evidence")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  demoStep === "evidence"
                    ? "bg-blue-950/80 text-blue-300 border border-blue-800"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2. GitHub Evidence (75%)
              </button>
              <button
                onClick={() => setDemoStep("challenge")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  demoStep === "challenge"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                3. Practical Challenge (94%)
              </button>
            </div>

            {/* Simulated Skill Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Target Skill
                </span>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold">
                    TS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">TypeScript</h4>
                    <p className="text-xs text-slate-400">Frontend / Backend</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Demonstration Context</p>
                  <p>Candidate claims 2 years of TypeScript on resume.</p>
                </div>
              </div>

              {/* Dynamic State Card */}
              <div className="md:col-span-2 bg-[#080d19] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        demoStep === "claim"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : demoStep === "evidence"
                          ? "bg-blue-950 text-blue-400 border border-blue-800"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      }`}
                    >
                      {demoStep === "claim"
                        ? "Claimed Only"
                        : demoStep === "evidence"
                        ? "Evidence Found"
                        : "Challenge Assessed"}
                    </span>
                    <span className="text-xs text-slate-400">Confidence: {demoStep === "challenge" ? "High" : demoStep === "evidence" ? "Medium" : "Low"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">
                      {demoStep === "claim" ? "35" : demoStep === "evidence" ? "75" : "94"}
                    </span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {demoStep === "claim" &&
                    "Keyword 'TypeScript' was parsed from resume.pdf. Without code evidence or assessments, this claim remains unverified."}
                  {demoStep === "evidence" &&
                    "Inspected public repository 'candidate/ecommerce-store'. Found 42,000 bytes of active TypeScript code in 'src/api/orders.ts' and strict tsconfig.json."}
                  {demoStep === "challenge" &&
                    "Completed adaptive challenge 'TypeScript Discriminated Unions & Exhaustiveness Checking'. Scored 94% on bug detection and compiler safety rules."}
                </p>

                {/* Citation Artifact */}
                {demoStep !== "claim" && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                    <span className="truncate">
                      {demoStep === "evidence"
                        ? "github.com/candidate/ecommerce-store/blob/main/src/api/orders.ts"
                        : "ProofPath Challenge Attempt #8491 — Passed with 94/100"}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase shrink-0 ml-2">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW THE WORKFLOW OPERATES */}
      <section id="how-it-works" className="py-20 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Systematic Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              How ProofPath AI Works
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              Four transparent steps to validate your competence and connect with genuine internships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 font-bold text-sm">
                01
              </div>
              <h4 className="text-base font-bold text-white">Upload & Extract</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your PDF or DOCX resume. Our parser extracts skills, projects, and experiences into canonical taxonomy records.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold text-sm">
                02
              </div>
              <h4 className="text-base font-bold text-white">Inspect Public GitHub</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit public repositories. The GitHub analyzer detects real language distributions, configuration files, and documentation.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold text-sm">
                03
              </div>
              <h4 className="text-base font-bold text-white">Pass Practical Challenges</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take adaptive coding and debugging challenges tailored to target roles. Elevate claimed skills to "Challenge Assessed".
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-sm">
                04
              </div>
              <h4 className="text-base font-bold text-white">Discover & Apply</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive explainable internship matches with verified application links, transparent score breakdowns, and custom cover letters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SKILL EVIDENCE & ADAPTIVE CHALLENGES SHOWCASE */}
      <section id="features" className="py-20 bg-[#090e1a]/60 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Core Differentiator
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Honest Skill Proof Engine & Adaptive Challenges
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                We reject binary "verified vs fake" labels. The Skill Proof Engine scores your abilities across four transparent states: claimed, supporting evidence found, challenge assessed, and evidence insufficient.
              </p>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Explainable Scoring:</strong> Weights for resume relevance (40%), project code (25%), and practical test results (20%).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Code2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Role-Specific Assessments:</strong> Rigorous debugging, code-reading, and conceptual tasks with clear evaluation rubrics.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Target className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Actionable Gap Roadmaps:</strong> Exact daily and weekly tasks to convert missing requirements into proven strengths.
                  </span>
                </li>
              </ul>
            </div>

            {/* Visual Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Skill Evidence Distribution</span>
                <span className="text-[10px] text-cyan-400 font-mono">Real-Time Convex Engine</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">React & Next.js</p>
                    <p className="text-[11px] text-slate-400">Assessed via Timer Hook Closure Challenge</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Challenge Assessed (95%)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">PostgreSQL & SQL</p>
                    <p className="text-[11px] text-slate-400">Indexed queries in public repo /db/schema.sql</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    Evidence Found (78%)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Docker Containerization</p>
                    <p className="text-[11px] text-slate-400">Claimed on uploaded resume</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    Claimed (35%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROOF PASSPORT PORTFOLIO SHOWCASE */}
      <section className="py-20 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Shareable Candidate Identity
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Your Public Proof Passport
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              A verifiable, revocable profile link you can share with recruiters, containing your proven skills and code evidence with zero resume clutter.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white">
                  M
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mathan Kumar</h4>
                  <p className="text-xs text-slate-400">B.Tech Computer Science (2026)</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Verified Passport
              </span>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300 font-semibold">Consented Verified Skills:</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  TypeScript (94%)
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  React (95%)
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  Node.js (80%)
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  PostgreSQL (78%)
                </span>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-slate-400">
                  Public Share Link: <code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">proofpath.ai/p/mathan-dev</code>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-right">
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Create your passport <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECURITY AND PRIVACY EXPLANATION */}
      <section className="py-16 bg-[#080c14] border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 p-2 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs mb-4">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Privacy & Zero Data Scraping</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Your Code and Resume Remain Entirely Yours
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            We never share your private resume files, email addresses, or unconsented assessments with external employers. Recruiters only see what you explicitly choose to publish on your Proof Passport.
          </p>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              FAQ
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Prove Your Skills and Land Your Dream Internship?
          </h3>
          <p className="text-slate-400 text-sm mb-8">
            Join ProofPath AI today. Upload your resume or connect a public GitHub repository in under 2 minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/25 transition-all"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};
