import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Code2,
  ExternalLink,
  GraduationCap,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";

export const PublicPassportView: React.FC = () => {
  const { tokenOrSlug } = useParams<{ tokenOrSlug: string }>();

  const passport = useQuery(
    api.passports.getPublicPassport,
    tokenOrSlug ? { tokenOrSlug } : "skip"
  );

  if (passport === undefined) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400 text-xs">
        Loading verified Proof Passport...
      </div>
    );
  }

  if (!passport || !passport.available) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Portfolio Not Available</h1>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          {passport?.reason || "This candidate's Proof Passport is currently set to private or the URL has expired."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
        >
          Explore ProofPath AI
        </Link>
      </div>
    );
  }

  const { user, profile, visibleSections, skillsEvidence, repositories, challengeAttempts } = passport as any;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1.5px]">
              <div className="w-full h-full bg-[#0b0f19] rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              ProofPath <span className="text-cyan-400">AI</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Candidate Passport</span>
          </span>
        </div>

        {/* Candidate Profile Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 p-[2px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-white">
                {user?.name?.charAt(0) || "C"}
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{user?.name}</h1>
              {profile?.preferredRole && (
                <p className="text-sm font-semibold text-cyan-400">{profile.preferredRole}</p>
              )}
              {profile?.college && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  {profile.college} {profile.graduationYear && `(Class of ${profile.graduationYear})`}
                </p>
              )}
            </div>
          </div>

          {user?.email && (
            <a
              href={`mailto:${user.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors self-start sm:self-auto"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contact Candidate</span>
            </a>
          )}
        </div>

        {/* 1. Verified Skills & Proof Evidence */}
        {skillsEvidence && skillsEvidence.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Verified Competence & Supporting Artifacts</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsEvidence
                .filter((s) => s.status !== "evidence_insufficient")
                .map((ev) => (
                  <div
                    key={ev._id}
                    className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{ev.skillName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ev.status === "challenge_assessed"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-blue-950 text-blue-300 border border-blue-800"
                        }`}
                      >
                        {ev.status === "challenge_assessed" ? "Assessed" : "Evidence Found"} ({ev.evidenceScore}%)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{ev.explanation}</p>

                    {ev.sourceUrl && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-cyan-400 truncate max-w-[220px]">
                          {ev.filePath || "Repository Source"}
                        </span>
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                        >
                          View Code <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 2. Public Repositories */}
        {repositories && repositories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>Public Projects & Codebases</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories.map((repo) => (
                <div
                  key={repo._id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <a
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-white hover:text-cyan-400 flex items-center gap-1.5"
                    >
                      <span>{repo.owner}/{repo.repoName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-400 text-[10px]">{repo.language}</span>
                  </div>
                  <p className="text-slate-400 line-clamp-2 leading-relaxed">{repo.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Challenge Certifications */}
        {challengeAttempts && challengeAttempts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Practical Assessment Achievements</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {challengeAttempts.map((att: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{att.skillName}</span>
                    <span className="font-black text-emerald-400">{att.score}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Verified by ProofPath AI Engine</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>Verified through ProofPath AI — Evidence Before Claims.</p>
        </div>
      </div>
    </div>
  );
};
