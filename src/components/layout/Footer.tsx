import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Heart, Globe, Share2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#080c14] border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1.5px]">
                <div className="w-full h-full bg-[#080c14] rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                ProofPath <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered skill evidence, career readiness, and transparent internship intelligence platform. Proving practical competence before claims.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-md bg-slate-800/80 flex items-center justify-center hover:text-white transition-colors text-xs font-bold"
                title="GitHub"
              >
                GH
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-md bg-slate-800/80 flex items-center justify-center hover:text-white transition-colors text-xs font-bold"
                title="LinkedIn"
              >
                in
              </a>
            </div>
          </div>

          {/* Platform Columns */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/skills" className="hover:text-cyan-400 transition-colors">
                  Skill Proof Engine
                </Link>
              </li>
              <li>
                <Link to="/challenges" className="hover:text-cyan-400 transition-colors">
                  Adaptive Coding Challenges
                </Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-cyan-400 transition-colors">
                  Verified Internships
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-cyan-400 transition-colors">
                  Personalized Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/passport" className="hover:text-cyan-400 transition-colors">
                  Proof Passport Portfolio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              For Candidates & Teams
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register" className="hover:text-cyan-400 transition-colors">
                  Student Sign Up
                </Link>
              </li>
              <li>
                <Link to="/recruiter" className="hover:text-cyan-400 transition-colors">
                  Recruiter Portal
                </Link>
              </li>
              <li>
                <Link to="/interview" className="hover:text-cyan-400 transition-colors">
                  AI Mock Technical Interview
                </Link>
              </li>
              <li>
                <Link to="/resume" className="hover:text-cyan-400 transition-colors">
                  ATS Resume Review
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cyan-400 transition-colors">
                  Admin Verification Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Principles & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">
                <span className="text-white font-medium">Evidence Before Claims:</span> Public GitHub proof and practical assessments.
              </li>
              <li className="text-slate-400">
                <span className="text-white font-medium">Privacy-First:</span> Resumes and code are never shared without explicit student consent.
              </li>
              <li className="text-slate-400">
                <span className="text-white font-medium">Verified Links:</span> Direct original company career portals.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ProofPath AI. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for ambitious software engineers
          </p>
        </div>
      </div>
    </footer>
  );
};
