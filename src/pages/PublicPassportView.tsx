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
  Terminal,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const PublicPassportView: React.FC = () => {
  const { tokenOrSlug } = useParams<{ tokenOrSlug: string }>();

  const passport = useQuery(
    api.passports.getPublicPassport,
    tokenOrSlug ? { tokenOrSlug } : "skip"
  );

  if (passport === undefined) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-cyan-400 rounded-full animate-spin" />
          <span>Loading verified Proof Passport...</span>
        </div>
      </div>
    );
  }

  if (!passport || !passport.available) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Portfolio Currently Unavailable</h1>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          {passport?.reason || "This candidate's Proof Passport is currently set to private or the share token has been revoked."}
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            <span>Explore ProofPath AI</span>
          </Button>
        </Link>
      </div>
    );
  }

  const { user, profile, visibleSections, skillsEvidence, repositories, challengeAttempts } = passport as any;

  return (
    <div className="min-h-screen bg-[#080c14] light:bg-slate-50 text-slate-100 light:text-slate-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] light:border-slate-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1.5px]">
              <div className="w-full h-full bg-[#080c14] light:bg-white rounded-[9px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400 light:text-blue-600" />
              </div>
            </div>
            <span className="text-base font-bold text-white light:text-slate-900 tracking-tight">
              ProofPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-extrabold">AI</span>
            </span>
          </Link>

          <Badge variant="verified">Cryptographically Verified Passport</Badge>
        </div>

        {/* Candidate Profile Header Card */}
        <Card highlight className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shrink-0">
                <div className="w-full h-full bg-slate-950 light:bg-white rounded-[14px] flex items-center justify-center text-xl font-bold text-white light:text-slate-900">
                  {user?.name?.charAt(0) || "C"}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white light:text-slate-900">{user?.name}</h1>
                {profile?.preferredRole && (
                  <p className="text-sm font-semibold text-cyan-400 light:text-blue-600">{profile.preferredRole}</p>
                )}
                {profile?.college && (
                  <p className="text-xs text-slate-400 light:text-slate-500 flex items-center gap-1.5 mt-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.college} {profile.graduationYear && `(Class of ${profile.graduationYear})`}</span>
                  </p>
                )}
              </div>
            </div>

            {user?.email && visibleSections.contact && (
              <a href={`mailto:${user.email}`}>
                <Button variant="glow" size="sm">
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  <span>Contact Candidate</span>
                </Button>
              </a>
            )}
          </div>
        </Card>

        {/* Section 1: Verified Skills */}
        {visibleSections.skills && skillsEvidence && skillsEvidence.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Verified Technical Skills ({skillsEvidence.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skillsEvidence.map((ev: any) => (
                <Card key={ev._id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">
                      {ev.skillName}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {ev.explanation}
                    </p>
                  </div>
                  <Badge variant={ev.status === "challenge_assessed" ? "challenge" : "evidence"} size="sm">
                    {ev.evidenceScore}% Proof
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Public GitHub Repositories */}
        {visibleSections.repositories && repositories && repositories.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Public GitHub Projects ({repositories.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {repositories.map((repo: any) => (
                <Card key={repo._id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <a
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-white light:text-slate-900 hover:text-cyan-400 flex items-center gap-1.5 truncate"
                      >
                        <span className="truncate">{repo.repoName}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      </a>
                      <Badge variant="outline" size="sm">
                        {repo.language || "Code"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 light:text-slate-500 line-clamp-2 mb-3">
                      {repo.description || "No description provided."}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" /> {repo.stars} stars
                    </span>
                    <Badge variant="verified" size="sm">AST Analyzed</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Adaptive Challenge Badges */}
        {visibleSections.challenges && challengeAttempts && challengeAttempts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Passed Technical Assessments ({challengeAttempts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {challengeAttempts.map((att: any) => (
                <Card key={att._id} className="p-4 text-center space-y-2">
                  <Badge variant="challenge" size="sm">
                    {att.skillName}
                  </Badge>
                  <div className="text-xl font-extrabold text-cyan-400">
                    {att.score}%
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Passed on {new Date(att.completedAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer Verification Stamp */}
        <div className="text-center pt-8 border-t border-white/[0.08] light:border-slate-200 text-xs text-slate-500 space-y-1">
          <p>Verified Candidate Passport powered by ProofPath AI.</p>
          <p className="text-[10px] text-slate-600">All claims backed by factual GitHub commit history and timed evaluations.</p>
        </div>
      </div>
    </div>
  );
};
