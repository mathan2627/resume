import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Map,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  Code2,
  FolderGit2,
  Flag,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Target,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const RoadmapPage: React.FC = () => {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  const learningPlanData = useQuery(api.roadmaps.getLearningPlan, token ? { token } : "skip");
  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const profileData = useQuery(api.profiles.getProfile, token ? { token } : "skip");

  const saveRoadmapMutation = useMutation(api.roadmaps.saveRoadmapPlan);
  const updateTaskStatusMutation = useMutation(api.roadmaps.updateTaskStatus);
  const generateRoadmapAction = useAction(api.ai.generateRoadmap);

  const [generating, setGenerating] = useState(false);

  const plan = learningPlanData?.plan;
  const tasks = learningPlanData?.tasks || [];
  const profile = profileData?.profile;

  const handleGenerateRoadmap = async () => {
    if (!token) return;
    setGenerating(true);

    const targetRole = profile?.preferredRole || "Software Engineering Intern";

    const defaultTasks = [
      {
        title: "Implement Strict State Management Architecture",
        description: "Build a persistent state or reactive cache module with comprehensive TypeScript strict types to create GitHub evidence.",
        skillName: "TypeScript",
        taskType: "mini_project" as const,
        priority: "high" as const,
        dueDate: "Week 1",
        resourceUrl: "https://www.typescriptlang.org/docs/",
      },
      {
        title: "Pass Practical React Hook Lifecycle Assessment",
        description: "Complete the timed debugging challenge to verify your grasp of closures and render lifecycles.",
        skillName: "React",
        taskType: "practice_challenge" as const,
        priority: "high" as const,
        dueDate: "Week 2",
        resourceUrl: "/challenges",
      },
      {
        title: "Dockerize a Full-Stack Node.js & Database Service",
        description: "Create an optimized multi-stage Dockerfile that excludes build tools from the final production runner.",
        skillName: "Docker",
        taskType: "mini_project" as const,
        priority: "medium" as const,
        dueDate: "Week 3",
        resourceUrl: "https://docs.docker.com/develop/develop-images/multistage-build/",
      },
      {
        title: "Publish Verifiable Proof Passport Link",
        description: "Enable public visibility for your Proof Passport and attach your URL to internship applications.",
        skillName: "General Career",
        taskType: "milestone" as const,
        priority: "medium" as const,
        dueDate: "Week 4",
        resourceUrl: "/passport",
      },
    ];

    try {
      let finalTasks = defaultTasks;
      const provenSkills = (evidenceSummary?.evidenceList || []).map((e: any) => e.skillName);

      try {
        const aiRes = await generateRoadmapAction({
          targetRole,
          missingSkills: ["Docker", "REST APIs", "System Architecture"].filter((s) => !provenSkills.includes(s)),
          currentSkills: provenSkills,
        });

        if (aiRes?.tasks && aiRes.tasks.length > 0) {
          finalTasks = aiRes.tasks.map((t: any, idx: number) => ({
            title: t.title,
            description: t.description,
            skillName: t.skillName || "General",
            taskType: t.taskType || "mini_project",
            priority: t.priority || "high",
            dueDate: `Week ${idx + 1}`,
            resourceUrl: t.resourceUrl || "https://github.com",
          }));
        }
      } catch (aiErr) {
        console.warn("AI generation fallback to deterministic sprint", aiErr);
      }

      await saveRoadmapMutation({
        token,
        title: `${targetRole} Acceleration Roadmap`,
        description: `Personalized skill gap closure strategy tailored to your target role and current verified evidence.`,
        targetRoleId: targetRole,
        tasks: finalTasks,
      });
      success("Roadmap Generated", "Created your 4-week structured skill development milestones.");
    } catch (e: any) {
      toastError("Error", e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: any, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await updateTaskStatusMutation({
        token,
        taskId,
        status: nextStatus,
      });
      success("Progress Updated", nextStatus === "completed" ? "Marked milestone complete!" : "Reopened task.");
    } catch (e: any) {
      toastError("Error", e.message);
    }
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "practice_challenge":
        return <Code2 className="w-4 h-4 text-purple-400" />;
      case "mini_project":
        return <FolderGit2 className="w-4 h-4 text-cyan-400" />;
      case "reading":
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      default:
        return <Flag className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span>Targeted Progression</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Personalized Career Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            A 4-week structured milestone plan designed to eliminate missing skill gaps for your desired role with hands-on projects and challenges.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          isLoading={generating}
          onClick={handleGenerateRoadmap}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          <span>{plan ? "Regenerate Roadmap" : "Generate Roadmap"}</span>
        </Button>
      </div>

      {/* 2. ACTIVE PLAN PROGRESS BANNER */}
      {plan ? (
        <Card highlight className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="verified">Active Career Plan</Badge>
                <span className="text-xs text-slate-400">
                  Target: <strong className="text-white light:text-slate-900">{profile?.preferredRole || "Software Engineering"}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white light:text-slate-900">{plan.title}</h2>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold text-cyan-400">{progressPercent}%</span>
              <span className="text-xs text-slate-400 block">Milestones Completed</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 leading-relaxed">
            {plan.description}
          </p>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>
      ) : null}

      {/* 3. TASKS & MILESTONES */}
      {(!tasks || tasks.length === 0) ? (
        <EmptyState
          icon={<Map className="w-7 h-7 text-cyan-400" />}
          title="No Learning Plan Generated Yet"
          description="Click 'Generate Roadmap' to create a personalized 4-week milestone plan based on your current skill gaps."
          actionLabel="Generate Career Roadmap"
          onAction={handleGenerateRoadmap}
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
            Weekly Learning Milestones ({completedCount}/{tasks.length})
          </h2>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isCompleted = task.status === "completed";
              return (
                <Card
                  key={task._id}
                  className={`p-5 transition-all ${
                    isCompleted
                      ? "bg-slate-950/40 border-slate-800/40 opacity-75"
                      : "bg-slate-900/90 light:bg-white border-slate-800 light:border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleTask(task._id, task.status)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-slate-950"
                            : "border-slate-700 hover:border-cyan-400"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getTaskIcon(task.taskType)}
                          <h3
                            className={`text-sm font-semibold ${
                              isCompleted
                                ? "line-through text-slate-500"
                                : "text-white light:text-slate-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={task.priority === "high" ? "warning" : "outline"} size="sm">
                        {task.priority} Priority
                      </Badge>
                      {task.dueDate && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {task.resourceUrl && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-end">
                      {task.resourceUrl.startsWith("/") ? (
                        <Link
                          to={task.resourceUrl}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Open in ProofPath</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <a
                          href={task.resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Official Docs Resource</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
