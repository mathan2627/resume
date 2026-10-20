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
  Code2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export const RecruiterSearchPage: React.FC = () => {
  const { token } = useAuth();
  const [skillFilter, setSkillFilter] = useState("");

  const searchResults = useQuery(
    api.recruiters.searchConsentedPassports,
    token ? { token, skillFilter: skillFilter || undefined } : "skip"
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Talent Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Consented Candidate Proof Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Discover student portfolios who have voluntarily opted-in to public Proof Passport sharing. Every candidate features concrete verified project and assessment proof.
          </p>
        </div>

        <Link to="/recruiter">
          <Button variant="outline" size="sm">
            <span>Back to Portal</span>
          </Button>
        </Link>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="max-w-md">
        <Input
          placeholder="Filter by technical skill (e.g. React, Python, Docker)..."
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* 3. CANDIDATE RESULTS GRID */}
      {(!searchResults || searchResults.length === 0) ? (
        <EmptyState
          icon={<Users className="w-7 h-7 text-cyan-400" />}
          title="No Candidates Found"
          description="Try searching for a different technical skill or clear the filter to view all consented public candidate passports."
          actionLabel="Clear Filter"
          onAction={() => setSkillFilter("")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {searchResults.map((cand, idx) => (
            <Card key={idx} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm">
                    {cand.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">{cand.name}</h3>
                    {cand.preferredRole && (
                      <p className="text-xs text-cyan-400 light:text-blue-600 font-semibold truncate">{cand.preferredRole}</p>
                    )}
                  </div>
                </div>

                {cand.college && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{cand.college}</span>
                  </p>
                )}

                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.verifiedSkills.map((sk: any, sIdx: number) => (
                      <Badge key={sIdx} variant="evidence" size="sm">
                        {sk.name} ({sk.score}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-end">
                <a
                  href={`/p/${cand.passportSlug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="primary" size="sm">
                    <span>Inspect Proof Passport</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
