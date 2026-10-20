import React, { useState } from "react";
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
  Calendar,
  AlertCircle,
  RefreshCw,
  Target,
  BookOpen,
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const profileData = useQuery(api.profiles.getProfile, token ? { token } : "skip");
  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const userMatches = useQuery(api.matching.getUserMatches, token ? { token, limit: 3 } : "skip");
  const savedInternships = useQuery(api.internships.listSavedInternships, token ? { token } : "skip");
  const applications = useQuery(api.applications.listApplications, token ? { token } : "skip");
  const learningPlan = useQuery(api.roadmaps.getLearningPlan, token ? { token } : "skip");
  const recentAttempts = useQuery(api.challenges.listUserAttempts, token ? { token } : "skip");
  const recentListings = useQuery(api.internships.listInternships, { limit: 3, sortBy: "date" });

  const calculateMatchesMutation = useMutation(api.matching.calculateMatchesForUser);

  const profile = profileData?.profile;

  // Career Readiness Score Calculation (0 - 100)
  let readinessScore = 25;
  if (profile?.onboardingCompleted) readinessScore += 15;
  if (profile?.technicalSkills && profile.technicalSkills.length > 0) readinessScore += 15;
  if (evidenceSummary && evidenceSummary.totalSkills > 0) readinessScore += 20;
  if (recentAttempts && recentAttempts.length > 0) readinessScore += 15;
  if (learningPlan?.plan && learningPlan.plan.overallProgress > 0) readinessScore += 10;
  readinessScore = Math.min(readinessScore, 100);

  // Evidence distribution data
  const chartData = [
    { name: "Claimed", count: evidenceSummary?.counts?.claimed || 0, color: "#64748b" },
    { name: "Evidence Found", count: evidenceSummary?.counts?.evidenceFound || 0, color: "#06b6d4" },
    { name: "Assessed", count: evidenceSummary?.counts?.challengeAssessed || 0, color: "#8b5cf6" },
    { name: "Insufficient", count: evidenceSummary?.counts?.insufficient || 0, color: "#f43f5e" },
  ];

  const handleRecalculateMatches = async () => {
    if (!token) return;
    setIsRecalculating(true);
    try {
      const res = await calculateMatchesMutation({ token });
      success("Matches Updated", `Calculated explainable relevance scores for ${res.calculatedCount} opportunities.`);
    } catch (err: any) {
      toastError("Recalculation Failed", err?.message || "Please check your network connection.");
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. WELCOME & READINESS HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800/80 light:from-white light:via-blue-50/50 light:to-white light:border-slate-200 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Career Intelligence Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 max-w-2xl leading-relaxed">
              Targeting: <strong className="text-white light:text-slate-900">{profile?.preferredRole || "Software Engineering Intern"}</strong>. You have{" "}
              <strong className="text-cyan-400 font-semibold">{evidenceSummary?.counts?.challengeAssessed || 0} assessed skills</strong>,{" "}
              <strong className="text-blue-400 font-semibold">{evidenceSummary?.counts?.evidenceFound || 0} GitHub-verified projects</strong>, and{" "}
              <strong className="text-emerald-400 font-semibold">{userMatches?.length || 0} high-match opportunities</strong>.
            </p>
          </div>

          {/* Readiness Score Ring Card */}
          <div className="flex items-center gap-4 bg-slate-950/70 light:bg-slate-50 p-4 rounded-2xl border border-slate-800 light:border-slate-200 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800 light:text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400"
                  strokeDasharray={`${readinessScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-white light:text-slate-900">
                {readinessScore}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Career Readiness
              </span>
              <span className="text-xs font-semibold text-cyan-300 light:text-blue-700">
                {readinessScore >= 80 ? "Interview Ready" : readinessScore >= 50 ? "Competence Progressing" : "Baseline Stage"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 light:border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/resume">
              <Button variant="primary" size="sm">
                <FileText className="w-3.5 h-3.5 mr-1" />
                <span>Upload Resume</span>
              </Button>
            </Link>
            <Link to="/skills">
              <Button variant="secondary" size="sm">
                <GitBranch className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                <span>Link GitHub</span>
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="outline" size="sm">
                <Code2 className="w-3.5 h-3.5 mr-1 text-purple-400" />
                <span>Take Challenge</span>
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="sm"
            isLoading={isRecalculating}
            onClick={handleRecalculateMatches}
            className="text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Recalculate Matches</span>
          </Button>
        </div>
      </div>

      {/* 2. STATS & EVIDENCE DISTRIBUTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: 4 Metric Cards */}
        <div className="md:col-span-7 grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Proven Skills</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900">
              {evidenceSummary?.totalSkills || 0}
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1">
              {evidenceSummary?.counts?.challengeAssessed || 0} assessed with timed tests
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Live Opportunities</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {userMatches?.length || 0}
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1">
              Top match: {userMatches?.[0]?.overallMatchScore ? `${userMatches[0].overallMatchScore}% relevance` : "No matches calculated yet"}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Saved Opportunities</span>
              <Bookmark className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900">
              {savedInternships?.length || 0}
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1">
              Bookmarked for deadlines
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Pipeline</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
              {applications?.length || 0}
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1">
              Applications tracked
            </p>
          </Card>
        </div>

        {/* Right: Evidence Distribution Chart */}
        <div className="md:col-span-5">
          <Card className="p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                Skill Evidence Distribution
              </h3>
              <Badge variant="evidence" size="sm">Proof Engine</Badge>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
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
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 light:border-slate-200">
              <span>ProofPath AI Verification Index</span>
              <Link to="/skills" className="text-cyan-400 hover:underline">
                View Proof Details →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. RECOMMENDED MATCHES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white light:text-slate-900 tracking-tight">
              Top Recommended Opportunities
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Matched against your verified GitHub code, challenge scores, and career preferences.
            </p>
          </div>
          <Link to="/internships">
            <Button variant="ghost" size="sm">
              <span>View All</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {(!userMatches || userMatches.length === 0) ? (
          <EmptyState
            title="No Matched Opportunities Yet"
            description="Upload your resume and click 'Recalculate Matches' to discover genuine internships aligned with your proven skills."
            actionLabel="Recalculate Matches"
            onAction={handleRecalculateMatches}
            secondaryActionLabel="Explore All Opportunities"
            onSecondaryAction={() => window.location.assign("/internships")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {userMatches.map((m) => (
              <Card key={m.matchId} hover className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {m.internship?.companyName}
                    </span>
                    <Badge variant="match">{m.overallMatchScore}% Match</Badge>
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {m.internship?.roleTitle}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{m.internship?.location}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-2">
                    {m.explanation}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(m.internship?.requiredSkills || []).slice(0, 4).map((s: string) => (
                      <Badge key={s} variant="outline" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <span className="text-[11px] text-slate-500">
                    {m.internship?.stipend || "Stipend Disclosed on Apply"}
                  </span>
                  <a
                    href={m.internship?.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. LEARNING ROADMAP & UPCOMING DEADLINES TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Learning Roadmap Status */}
        <div className="md:col-span-7">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 light:border-slate-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white light:text-slate-900">
                    Active Career Roadmap
                  </h3>
                </div>
                <Link to="/roadmap" className="text-xs text-cyan-400 hover:underline">
                  Manage Roadmap →
                </Link>
              </div>

              {learningPlan?.plan ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-semibold text-white light:text-slate-900">{learningPlan.plan.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{learningPlan.plan.description}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                      <span>Overall Milestone Progress</span>
                      <span className="text-cyan-400 font-bold">{learningPlan.plan.overallProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${learningPlan.plan.overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    You don't have an active learning roadmap. Generate a personalized 4-week acceleration plan.
                  </p>
                  <Link to="/roadmap">
                    <Button variant="primary" size="sm">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Generate Career Roadmap</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 light:border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Grounded in actual missing skills</span>
              <span>Gemini Rubric Verified</span>
            </div>
          </Card>
        </div>

        {/* Right: Upcoming Deadlines & Saved Opportunities */}
        <div className="md:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 light:border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white light:text-slate-900">
                    Upcoming Application Deadlines
                  </h3>
                </div>
                <Link to="/applications" className="text-xs text-cyan-400 hover:underline">
                  Pipeline →
                </Link>
              </div>

              {(!savedInternships || savedInternships.length === 0) ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-slate-400">No saved listings yet.</p>
                  <Link to="/internships">
                    <Button variant="outline" size="sm">
                      <span>Browse Opportunities</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedInternships.slice(0, 3).map((item) => (
                    <div
                      key={item.savedRecordId}
                      className="p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-semibold text-white light:text-slate-900 truncate">
                          {item.internship?.roleTitle}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.internship?.companyName}
                        </p>
                      </div>
                      <Badge variant="fresh" size="sm">
                        {item.internship?.applicationDeadline || "Ongoing"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 light:border-slate-200 text-[11px] text-slate-500">
              Preserving original employer application links
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
