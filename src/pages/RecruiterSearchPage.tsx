import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Users,
  Search,
  ShieldCheck,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const RecruiterSearchPage: React.FC = () => {
  const { token } = useAuth();
  const [skillFilter, setSkillFilter] = useState("");

  const searchResults = useQuery(
    api.recruiters.searchConsentedPassports,
    token ? { token, skillFilter: skillFilter || undefined } : "skip"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 mb-2">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Talent Discovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Consented Candidate Proof Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Filter through student portfolios who have voluntarily opted-in to public Proof Passport sharing. Every candidate displays concrete verified project or assessment proof.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          placeholder="Filter by technical skill (e.g. React, TypeScript, Python, Docker)..."
          className="flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        {skillFilter && (
          <button
            onClick={() => setSkillFilter("")}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {searchResults && searchResults.length > 0 ? (
          searchResults.map((cand, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm">
                    {cand.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{cand.name}</h3>
                    {cand.preferredRole && (
                      <p className="text-xs text-cyan-400 font-semibold">{cand.preferredRole}</p>
                    )}
                  </div>
                </div>

                {cand.college && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    {cand.college}
                  </p>
                )}

                {/* Verified Skills */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Verified Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.verifiedSkills.map((sk: any, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-200 border border-slate-800 flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>
                          {sk.name} ({sk.score}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <Link
                  to={`/p/${cand.customSlug || cand.shareToken}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <span>Inspect Passport</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Consented Candidates Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {skillFilter
                ? `No public profiles match the skill "${skillFilter}". Try another keyword.`
                : "Students will appear here when they enable public Proof Passport sharing."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
