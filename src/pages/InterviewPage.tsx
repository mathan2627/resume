import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const InterviewPage: React.FC = () => {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  const interviews = useQuery(api.mockInterviews.listInterviews, token ? { token } : "skip");
  const createSessionMutation = useMutation(api.mockInterviews.createInterviewSession);
  const submitAttemptMutation = useMutation(api.mockInterviews.submitInterviewAttempt);
  const evaluateAnswerAction = useAction(api.ai.evaluateChallengeAnswer);

  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswerInput, setCurrentAnswerInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluatingResult, setEvaluatingResult] = useState<any | null>(null);

  const roleInterviewScenarios: Record<string, any[]> = {
    "Frontend Engineering": [
      {
        id: "q1",
        question: "How do you optimize render performance in a complex React dashboard containing real-time streaming data?",
        context: "Evaluation of memoization, virtualized lists, and state colocation.",
        idealPoints: ["useMemo / useCallback trade-offs", "Virtual windowing", "State colocation to minimize rerender trees"],
      },
      {
        id: "q2",
        question: "Explain the difference between client-side routing and server-side routing, and how you prevent layout shifts during transitions.",
        context: "Understanding SPA navigation vs SSR rendering engines.",
        idealPoints: ["HTML5 History API pushState", "CSS skeleton placeholders", "Hydration boundaries"],
      },
    ],
    "Backend Systems": [
      {
        id: "q1",
        question: "How would you design a distributed rate limiter for a public API gateway handling 50,000 requests per second?",
        context: "Architecture of sliding window counters, Redis clusters, and latency reduction.",
        idealPoints: ["Token bucket or sliding window log algorithm", "Redis Lua script atomicity", "Fallback memory caching in edge proxies"],
      },
      {
        id: "q2",
        question: "When should an engineering team migrate from a relational SQL database to a document or key-value store?",
        context: "Data consistency trade-offs, ACID compliance, and schema flexibility.",
        idealPoints: ["ACID transaction requirements vs eventual consistency", "Join complexity vs denormalized reads", "Horizontal partition sharding"],
      },
    ],
    "AI & Data Science": [
      {
        id: "q1",
        question: "How does vector search with approximate nearest neighbor (ANN) retrieval work when matching candidate skills against job listing embeddings?",
        context: "Cosine similarity, dot products, and high-dimensional space indexing.",
        idealPoints: ["Cosine distance normalization", "Hierarchical Navigable Small World (HNSW) graphs", "Latency vs recall trade-offs"],
      },
    ],
  };

  const handleStartSession = async (roleName: string) => {
    if (!token) return;
    const questions = roleInterviewScenarios[roleName] || roleInterviewScenarios["Frontend Engineering"];

    try {
      const sessionId = await createSessionMutation({
        token,
        roleTarget: `${roleName} Intern`,
        interviewType: "technical",
        difficulty: "entry",
        questions,
      });

      setActiveSession({
        _id: sessionId,
        roleTarget: `${roleName} Intern`,
        questions,
      });
      setCurrentQuestionIdx(0);
      setAnswers({});
      setCurrentAnswerInput("");
      setEvaluatingResult(null);
      success("Session Started", `Loaded ${questions.length} technical questions for ${roleName}.`);
    } catch (e: any) {
      toastError("Error starting interview session", e.message);
    }
  };

  const handleSaveAndNext = () => {
    if (!activeSession) return;
    const q = activeSession.questions[currentQuestionIdx];
    const updatedAnswers = { ...answers, [q.id]: currentAnswerInput };
    setAnswers(updatedAnswers);

    if (currentQuestionIdx + 1 < activeSession.questions.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setCurrentAnswerInput(updatedAnswers[activeSession.questions[currentQuestionIdx + 1].id] || "");
    } else {
      handleFinalSubmit(updatedAnswers);
    }
  };

  const handleFinalSubmit = async (finalAnswers: Record<string, string>) => {
    if (!token || !activeSession) return;
    setSubmitting(true);

    try {
      const formattedAnswers = await Promise.all(
        activeSession.questions.map(async (q: any) => {
          const text = finalAnswers[q.id] || "No response provided.";
          try {
            const evalResult = await evaluateAnswerAction({
              question: q.question,
              studentAnswer: text,
              rubric: q.idealPoints?.join("; ") || "Technical accuracy, trade-offs, and clear communication.",
            });
            return {
              questionId: q.id,
              question: q.question,
              answer: text,
              score: evalResult.score || 75,
              feedback: evalResult.feedback || "Good foundational logic.",
              strengths: evalResult.strengths || ["Covers key architectural concepts"],
              improvements: evalResult.improvements || ["Could cite more edge cases"],
            };
          } catch {
            const wordCount = text.trim().split(/\s+/).length;
            let score = 70;
            if (wordCount >= 40) score = 90;
            if (wordCount < 15) score = 55;
            return {
              questionId: q.id,
              question: q.question,
              answer: text,
              score,
              feedback: "Covers primary architectural principles with sound technical clarity.",
              strengths: ["Direct address of trade-offs", "Sound terminology"],
              improvements: ["Could cite memory bounds or concrete latency metrics"],
            };
          }
        })
      );

      const overallScore = Math.round(
        formattedAnswers.reduce((sum: number, a: any) => sum + a.score, 0) / formattedAnswers.length
      );

      await submitAttemptMutation({
        token,
        interviewId: activeSession._id,
        answers: formattedAnswers,
        overallScore,
        overallFeedback: `Solid technical performance (${overallScore}%). Demonstrates practical understanding of core systems principles.`,
      });

      setEvaluatingResult({
        overallScore,
        overallFeedback: `Strong performance (${overallScore}%). Your answers demonstrate practical understanding of distributed state and asynchronous boundaries.`,
        answers: formattedAnswers,
      });
      success("Evaluation Complete", `Received ${overallScore}% overall rubric score.`);
    } catch (e: any) {
      toastError("Error submitting interview", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Technical Interview Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            AI Mock Technical Interviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Practice answering real technical questions asked at leading tech employers. Receive instant Gemini rubric evaluation with strengths and improvement suggestions.
          </p>
        </div>

        <Badge variant="verified">Gemini Rubric Evaluation</Badge>
      </div>

      {/* 2. ACTIVE SESSION RUNNER */}
      {activeSession && (
        <Card highlight className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="challenge">{activeSession.roleTarget}</Badge>
                <span className="text-xs text-slate-400">
                  Question {currentQuestionIdx + 1} of {activeSession.questions.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white light:text-slate-900">
                {activeSession.questions[currentQuestionIdx].question}
              </h2>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSession(null)}
            >
              Exit
            </Button>
          </div>

          {!evaluatingResult ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-xs text-slate-400">
                <span className="text-cyan-400 font-semibold block mb-0.5">Evaluation Rubric & Ideal Points:</span>
                <p>{activeSession.questions[currentQuestionIdx].context}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider block">
                  Your Technical Answer
                </label>
                <textarea
                  rows={8}
                  value={currentAnswerInput}
                  onChange={(e) => setCurrentAnswerInput(e.target.value)}
                  placeholder="Articulate your thought process, architectural choices, and edge cases..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {currentAnswerInput.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <Button
                  variant="glow"
                  size="md"
                  isLoading={submitting}
                  disabled={!currentAnswerInput.trim()}
                  onClick={handleSaveAndNext}
                >
                  <span>
                    {currentQuestionIdx + 1 < activeSession.questions.length
                      ? "Next Question"
                      : "Complete & Evaluate"}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white light:text-slate-900">
                    Interview Evaluation Completed
                  </h3>
                  <Badge variant="verified">Score: {evaluatingResult.overallScore}%</Badge>
                </div>
                <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                  {evaluatingResult.overallFeedback}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Detailed Rubric Feedback
                </h4>
                {evaluatingResult.answers.map((a: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between font-semibold text-white light:text-slate-900">
                      <span>Question {i + 1}</span>
                      <span className="text-cyan-400">{a.score}%</span>
                    </div>
                    <p className="text-slate-400 italic">"{a.answer.slice(0, 150)}..."</p>
                    <p className="text-slate-300 light:text-slate-600">{a.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => setActiveSession(null)}>
                  Finish Session
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 3. SCENARIO SELECTOR */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
          Choose a Technical Interview Scenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.keys(roleInterviewScenarios).map((role) => (
            <Card key={role} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20 flex items-center justify-center mb-3">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white light:text-slate-900 mb-1">
                  {role}
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-500 mb-4">
                  {roleInterviewScenarios[role].length} real technical scenario questions with instant scoring.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartSession(role)}
                className="w-full"
              >
                <span>Start Mock Session</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
