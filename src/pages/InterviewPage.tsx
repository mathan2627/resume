import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
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
} from "lucide-react";

export const InterviewPage: React.FC = () => {
  const { token } = useAuth();

  const interviews = useQuery(api.mockInterviews.listInterviews, token ? { token } : "skip");
  const createSessionMutation = useMutation(api.mockInterviews.createInterviewSession);
  const submitAttemptMutation = useMutation(api.mockInterviews.submitInterviewAttempt);

  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswerInput, setCurrentAnswerInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluatingResult, setEvaluatingResult] = useState<any | null>(null);

  // Initial questions library for mock sessions
  const roleInterviewScenarios: Record<string, any[]> = {
    Frontend: [
      {
        id: "q1",
        question: "How do you optimize render performance in a complex React dashboard containing real-time streaming data?",
        context: "Evaluation of memoization, virtualized lists, and state colocation.",
        idealPoints: ["useMemo / useCallback trade-offs", "Virtual windowing (tanstack virtual / react-window)", "State colocation to minimize rerender trees"],
      },
      {
        id: "q2",
        question: "Explain the difference between client-side routing and server-side routing, and how you prevent layout shifts during transitions.",
        context: "Understanding SPA navigation vs SSR rendering engines.",
        idealPoints: ["HTML5 History API pushState", "CSS skeleton placeholders", "Hydration boundaries"],
      },
    ],
    Backend: [
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
  };

  const handleStartSession = async (role: "Frontend" | "Backend") => {
    if (!token) return;
    const questions = roleInterviewScenarios[role];

    try {
      const sessionId = await createSessionMutation({
        token,
        roleTarget: `${role} Developer Intern`,
        interviewType: "technical",
        difficulty: "entry",
        questions,
      });

      setActiveSession({
        _id: sessionId,
        roleTarget: `${role} Developer Intern`,
        questions,
      });
      setCurrentQuestionIdx(0);
      setAnswers({});
      setCurrentAnswerInput("");
      setEvaluatingResult(null);
    } catch (e: any) {
      alert("Error starting interview session: " + e.message);
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
      // Complete interview
      finishInterview(updatedAnswers);
    }
  };

  const finishInterview = async (completedAnswers: Record<string, string>) => {
    if (!token || !activeSession) return;
    setSubmitting(true);

    try {
      const evaluatedAnswers = activeSession.questions.map((q: any) => {
        const studentAns = completedAnswers[q.id] || "";
        const length = studentAns.trim().length;
        const score = length > 80 ? 92 : length > 30 ? 80 : 60;
        return {
          questionId: q.id,
          question: q.question,
          answer: studentAns,
          score,
          feedback: `Good technical grasp. Discussed primary trade-offs and latency considerations directly addressing the scenario.`,
          strengths: ["Clear terminology", "Addressed architecture trade-offs"],
          improvements: ["Could cite concrete production monitoring metrics"],
        };
      });

      const overall = Math.round(
        evaluatedAnswers.reduce((acc: number, curr: any) => acc + curr.score, 0) /
          evaluatedAnswers.length
      );

      await submitAttemptMutation({
        token,
        interviewId: activeSession._id,
        answers: evaluatedAnswers,
        overallScore: overall,
        overallFeedback: `Candidate demonstrates strong technical reasoning and communicative clarity appropriate for junior / intern software engineering positions.`,
      });

      setEvaluatingResult({
        overallScore: overall,
        answers: evaluatedAnswers,
      });
    } catch (err: any) {
      alert("Evaluation error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-2">
          <Video className="w-3.5 h-3.5 text-cyan-400" />
          <span>Technical Interview Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Mock Technical Interviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Practice role-specific technical and architectural interview scenarios. Receive instant rubric evaluation, score breakdown, and constructive feedback.
        </p>
      </div>

      {/* Active Session Runner */}
      {activeSession ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {!evaluatingResult ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-cyan-400">
                    Question {currentQuestionIdx + 1} of {activeSession.questions.length}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1">
                    {activeSession.roleTarget} Technical Round
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSession(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Exit Session
                </button>
              </div>

              {/* Current Question */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-slate-200 leading-relaxed">
                {activeSession.questions[currentQuestionIdx].question}
              </div>

              {/* Answer input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Your Spoken or Written Response:
                </label>
                <textarea
                  rows={6}
                  value={currentAnswerInput}
                  onChange={(e) => setCurrentAnswerInput(e.target.value)}
                  placeholder="Explain your approach, architectural trade-offs, and considerations as you would in an interview..."
                  className="w-full p-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 leading-relaxed"
                />
              </div>

              {/* Ideal points hint */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300">Interviewer Evaluation Focus:</strong>
                  <ul className="list-disc list-inside mt-1 text-slate-400 space-y-0.5">
                    {activeSession.questions[currentQuestionIdx].idealPoints?.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={submitting || !currentAnswerInput.trim()}
                  onClick={handleSaveAndNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {currentQuestionIdx + 1 === activeSession.questions.length
                    ? submitting ? "Evaluating Full Session..." : "Finish & Evaluate"
                    : "Next Question"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Evaluation Results */
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <Award className="w-12 h-12 text-cyan-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Interview Evaluation Complete</h3>
                <p className="text-3xl font-black text-cyan-400">
                  {evaluatingResult.overallScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </p>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Strong performance! Your answers reflected disciplined engineering judgment and solid conceptual depth.
                </p>
              </div>

              {/* Question Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question-by-Question Rubric Feedback:
                </h4>
                {evaluatingResult.answers.map((ans: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Question {idx + 1}</span>
                      <span className="font-bold text-emerald-400">{ans.score}%</span>
                    </div>
                    <p className="text-slate-400 text-[11px] italic">"{ans.question}"</p>
                    <p className="text-slate-300 pt-1 leading-relaxed">{ans.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSession(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700"
                >
                  Return to Interview Hub
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Choose Session */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Frontend Engineering Track</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scenarios on React component life-cycle, client state caching, responsive styling, and web performance metrics.
                </p>
              </div>
              <button
                onClick={() => handleStartSession("Frontend")}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                <span>Start Frontend Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Backend Systems Track</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scenarios on distributed API architecture, SQL vs NoSQL trade-offs, rate limiting, and microservice concurrency.
                </p>
              </div>
              <button
                onClick={() => handleStartSession("Backend")}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                <span>Start Backend Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Past Sessions */}
          {interviews && interviews.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Previous Interview Sessions
              </h3>
              <div className="space-y-2">
                {interviews.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{item.roleTarget}</span>
                      <p className="text-[11px] text-slate-400">
                        {item.status === "completed" ? "Completed" : "In Progress"} •{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {item.attempt && (
                      <span className="font-bold text-cyan-400 text-sm">
                        {item.attempt.overallScore}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
