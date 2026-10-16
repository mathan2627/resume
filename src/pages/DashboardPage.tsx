import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ShieldCheck,
  Briefcase,
  FileText,
  Code2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink,
  Sparkles,
  GitBranch,
  Layers,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();

  const profileData = useQuery(api.profiles.getProfile, token ? { token } : "skip");
  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const userMatches = useQuery(api.matching.getUserMatches, token ? { token, limit: 3 } : "skip");
  const savedInternships = useQuery(api.internships.listSavedInternships, token ? { token } : "skip");
  const applications = useQuery(api.applications.listApplications, token ? { token } : "skip");
  const learningPlan = useQuery(api.roadmaps.getLearningPlan, token ? { token } : "skip");
  const recentAttempts = useQuery(api.challenges.listUserAttempts, token ? { token } : "skip");
  const calculateMatchesMutation = useMutation(api.matching.calculateMatchesForUser);

  const profile = profileData?.profile;

  // Calculate profile completeness
  let completeness = 20;
  if (profile?.onboardingCompleted) completeness += 20;
  if (profile?.technicalSkills && profile.technicalSkills.length > 0) completeness += 20;
  if (evidenceSummary && evidenceSummary.totalSkills > 0) completeness += 20;
  if (learningPlan) completeness += 20;

  // Chart data for Evidence Distribution
  const chartData = [
    {
      name: "Claimed",
      count: evidenceSummary?.counts?.claimed || 0,
      color: "#f59e0b",
    },
    {
      name: "Evidence Found",
      count: evidenceSummary?.counts?.evidenceFound || 0,
      color: "#3b82f6",
    },
    {
      name: "Assessed",
      count: evidenceSummary?.counts?.challengeAssessed || 0,
      color: "#10b981",
    },
    {
      name: "Insufficient",
      count: evidenceSummary?.counts?.insufficient || 0,
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Candidate Readiness Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || "Student"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Targeting: <strong className="text-white">{profile?.preferredRole || "Software Engineering Intern"}</strong>. You have{" "}
            <strong className="text-cyan-400">{evidenceSummary?.counts?.challengeAssessed || 0} assessed skills</strong> and{" "}
            <strong className="text-blue-400">{evidenceSummary?.counts?.evidenceFound || 0} GitHub-verified projects</strong>.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Resume</span>
          </Link>
          <Link
            to="/skills"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>Link GitHub Repo</span>
          </Link>
        </div>
      </div>

      {/* 4 CORE KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Readiness</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {evidenceSummary?.averageScore || 0}%
            </span>
            <span className="text-xs text-slate-500">proven score</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all"
              style={{ width: `${evidenceSummary?.averageScore || 10}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Challenge Assessed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">
              {evidenceSummary?.counts?.challengeAssessed || 0}
            </span>
            <span className="text-xs text-slate-500">skills tested</span>
          </div>
          <p className="text-[11px] text-slate-400">Highest verification tier</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>GitHub Project Evidence</span>
            <GitBranch className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">
              {evidenceSummary?.counts?.evidenceFound || 0}
            </span>
            <span className="text-xs text-slate-500">skills verified</span>
          </div>
          <p className="text-[11px] text-slate-400">Linked to code repositories</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Pipeline</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {applications?.length || 0}
            </span>
            <span className="text-xs text-slate-500">tracked</span>
          </div>
          <p className="text-[11px] text-slate-400">Applications in progress</p>
        </div>
      </div>

      {/* TWO COLUMN GRID: Evidence Visual & Recommended Internships */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Skill Proof Breakdown & Chart */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Skill Evidence Breakdown</span>
              </h2>
              <Link to="/skills" className="text-xs text-cyan-400 hover:underline">
                View All
              </Link>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary List */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Challenge Assessed (85-100%)
                </span>
                <span className="font-bold text-white">{evidenceSummary?.counts?.challengeAssessed || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Project Evidence Found (65-80%)
                </span>
                <span className="font-bold text-white">{evidenceSummary?.counts?.evidenceFound || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Resume Claimed (35%)
                </span>
                <span className="font-bold text-white">{evidenceSummary?.counts?.claimed || 0}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/challenges"
                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Take Practical Challenges</span>
              </Link>
            </div>
          </div>

          {/* Profile Completeness Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Profile Completeness</span>
              <span className="text-xs font-bold text-cyan-400">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Complete all milestones to generate your official public Proof Passport share link.
            </p>
          </div>
        </div>

        {/* Right Column: Top Internship Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>AI Recommended Internships</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Ranked by required skill coverage, project evidence, and challenge performance.
                </p>
              </div>

              <button
                onClick={() => token && calculateMatchesMutation({ token })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800 transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Refresh AI Matches</span>
              </button>
            </div>

            {/* Matches List */}
            <div className="space-y-4">
              {userMatches && userMatches.length > 0 ? (
                userMatches.map((m) => (
                  <div
                    key={m.matchId}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">
                            {m.internship.roleTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {m.internship.companyName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {m.internship.location} ({m.internship.remoteStatus})
                          </span>
                          {m.internship.stipend && (
                            <span className="text-emerald-400 font-semibold">
                              {m.internship.stipend}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold text-sm">
                          <span>{m.overallMatchScore}%</span>
                          <span className="text-[10px] text-slate-400 font-normal">Relevance</span>
                        </div>
                      </div>
                    </div>

                    {/* Transparent Explanation */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      <p className="font-medium text-slate-200 mb-1">{m.explanation}</p>
                      <p className="text-[11px] text-cyan-400">{m.recommendedLearning}</p>
                    </div>

                    {/* Required Skills Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {m.internship.requiredSkills.map((sk: string) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Source: {m.internship.sourceName}
                      </span>
                      <a
                        href={m.internship.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        Apply on original portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-3">
                  <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No matches calculated yet. Click "Refresh AI Matches" to run semantic vector matching against your profile.
                  </p>
                  <button
                    onClick={() => token && calculateMatchesMutation({ token })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                  >
                    Calculate Matches
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/internships"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                Browse full catalog of verified opportunities <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
