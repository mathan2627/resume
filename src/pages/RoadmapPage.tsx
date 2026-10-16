import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
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
} from "lucide-react";

export const RoadmapPage: React.FC = () => {
  const { token } = useAuth();

  const learningPlanData = useQuery(api.roadmaps.getLearningPlan, token ? { token } : "skip");
  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const profileData = useQuery(api.profiles.getProfile, token ? { token } : "skip");

  const saveRoadmapMutation = useMutation(api.roadmaps.saveRoadmapPlan);
  const updateTaskStatusMutation = useMutation(api.roadmaps.updateTaskStatus);

  const [generating, setGenerating] = useState(false);

  const plan = learningPlanData?.plan;
  const tasks = learningPlanData?.tasks || [];
  const profile = profileData?.profile;

  // Generate initial or updated roadmap
  const handleGenerateRoadmap = async () => {
    if (!token) return;
    setGenerating(true);

    const targetRole = profile?.preferredRole || "Software Engineering Intern";
    const currentSkills = evidenceSummary?.evidenceList.map((e) => e.skillName) || [];

    const defaultTasks = [
      {
        title: "Implement Strict State Management Architecture",
        description: "Build a persistent state or reactive cache module with comprehensive TypeScript strict types.",
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
      await saveRoadmapMutation({
        token,
        title: `${targetRole} Readiness Plan`,
        description: `Personalized skill gap closure strategy tailored to your target role and current verified evidence.`,
        targetRoleId: targetRole,
        tasks: defaultTasks,
      });
    } catch (e: any) {
      alert("Error generating roadmap: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: any, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    await updateTaskStatusMutation({
      token,
      taskId,
      status: nextStatus,
    });
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 mb-2">
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span>Structured Career Progression</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Actionable daily and weekly tasks designed to turn skill gaps into verifiable project evidence and assessment badges.
          </p>
        </div>

        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{plan ? "Regenerate Roadmap" : "Generate AI Roadmap"}</span>
        </button>
      </div>

      {plan ? (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">{plan.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-cyan-400">{progressPercent}%</span>
                <span className="text-xs text-slate-500 block">Overall Progress</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>{completedCount} of {tasks.length} tasks completed</span>
              <span>Target: {profile?.preferredRole || "Software Engineering"}</span>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Roadmap Milestones & Tasks</h3>

            <div className="space-y-3">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                return (
                  <div
                    key={task._id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      isCompleted
                        ? "bg-slate-950/60 border-slate-800/60 opacity-75"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task._id, task.status)}
                        className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              isCompleted ? "line-through text-slate-400" : "text-white"
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              task.priority === "high"
                                ? "bg-red-950/80 text-red-300 border border-red-800"
                                : task.priority === "medium"
                                ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                                : "bg-blue-950/80 text-blue-300 border border-blue-800"
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {task.dueDate && (
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                          {task.dueDate}
                        </span>
                      )}
                      {task.resourceUrl && (
                        task.resourceUrl.startsWith("/") ? (
                          <Link
                            to={task.resourceUrl}
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                          >
                            Go to action <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <a
                            href={task.resourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                          >
                            Resource <ArrowRight className="w-3 h-3" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <Map className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the button above to generate a structured 4-week learning roadmap tailored directly to your preferred internship role.
          </p>
          <button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Roadmap</span>
          </button>
        </div>
      )}
    </div>
  );
};
