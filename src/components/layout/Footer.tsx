import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Globe, Lock, Cpu, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-[#050811] light:bg-slate-50 border-t border-white/[0.08] light:border-slate-200 text-slate-400 light:text-slate-600 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px]">
                <div className="w-full h-full bg-[#080c14] light:bg-white rounded-[9px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 light:text-blue-600" />
                </div>
              </div>
              <span className="text-lg font-bold text-white light:text-slate-900 tracking-tight">
                ProofPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 light:from-blue-600 light:to-cyan-600">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed max-w-sm">
              The evidence-first AI career intelligence platform. Transforming unverified resume claims into verifiable GitHub code evidence, adaptive assessments, and automated global opportunity matching.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Global Ingestion Active (1-Min Scheduler)
              </span>
            </div>
          </div>

          {/* Platform Columns */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 light:text-slate-900 mb-3.5">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/skills" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  Skill Proof Engine
                </Link>
              </li>
              <li>
                <Link to="/challenges" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  Adaptive Challenges
                </Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  Opportunity Explorer
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  Career Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/passport" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  Proof Passport
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 light:text-slate-900 mb-3.5">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/interview" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  AI Mock Interview
                </Link>
              </li>
              <li>
                <Link to="/resume" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  ATS Resume Audit
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  AI Career Copilot
                </Link>
              </li>
              <li>
                <Link to="/recruiter" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  Recruiter Network
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
                  Connector Console
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 light:text-slate-900 mb-3.5">
              Transparency
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-400 light:text-slate-500">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Data Monetization</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 light:text-slate-500">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Explainable AI Scores</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 light:text-slate-500">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Employer Links</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                  className="text-xs text-blue-400 hover:underline cursor-pointer"
                >
                  {language === "en" ? "தமிழ் மொழிக்கு மாற்றுக" : "Switch to English"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} ProofPath AI. All rights reserved. Original employer links preserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span>Evidence Before Claims</span>
            <span>•</span>
            <span>GDPR-Compliant Storage</span>
            <span>•</span>
            <span>Powered by Gemini & Convex</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
