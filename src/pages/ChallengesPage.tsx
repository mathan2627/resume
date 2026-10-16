import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Code2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export const ChallengesPage: React.FC = () => {
  const { token } = useAuth();

  const challenges = useQuery(api.challenges.listChallenges, {});
  const userAttempts = useQuery(api.challenges.listUserAttempts, token ? { token } : "skip");
  const submitAttemptMutation = useMutation(api.challenges.submitAttempt);

  // Active Challenge Runner State
  const [activeChallenge, setActiveChallenge] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!activeChallenge || timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeChallenge, timeLeft, result]);

  const handleStartChallenge = (challenge: any) => {
    setActiveChallenge(challenge);
    setSelectedOption(null);
    setTextAnswer("");
    setResult(null);
    setTimeLeft((challenge.allowedTimeMinutes || 10) * 60);
  };

  const handleSubmit = async () => {
    if (!token || !activeChallenge) return;
    setSubmitting(true);

    const studentAnswer =
      activeChallenge.options && selectedOption !== null
        ? String(selectedOption)
        : textAnswer;

    const timeSpent = (activeChallenge.allowedTimeMinutes || 10) * 60 - timeLeft;

    try {
      const res = await submitAttemptMutation({
        token,
        challengeId: activeChallenge._id,
        studentAnswer,
        timeSpentSeconds: Math.max(timeSpent, 5),
      });
      setResult(res);
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 mb-2">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Adaptive Technical Assessments</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Adaptive Skill Challenge Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Complete practical bug-hunting, code-reading, and architectural evaluations. Passing an assessment upgrades your skill directly to "Challenge Assessed" (85-100% score).
        </p>
      </div>

      {/* ACTIVE CHALLENGE RUNNER MODAL / CONTAINER */}
      {activeChallenge && (
        <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header & Countdown Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                  {activeChallenge.skillName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 capitalize">
                  {activeChallenge.difficulty}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{activeChallenge.title}</h2>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm self-start sm:self-auto">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className={timeLeft < 60 ? "text-red-400 font-bold" : "text-slate-300"}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {!result ? (
            <div className="space-y-6">
              {/* Instructions & Question */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Instructions & Question:
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {activeChallenge.question}
                </div>
              </div>

              {/* Options (MCQ) or Textarea */}
              {activeChallenge.options ? (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-300">Select the correct solution:</p>
                  <div className="space-y-2">
                    {activeChallenge.options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                          selectedOption === idx
                            ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                            selectedOption === idx
                              ? "border-cyan-400 text-cyan-400"
                              : "border-slate-600 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Your Technical Solution & Analysis:</label>
                  <textarea
                    rows={6}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Provide your solution, root cause diagnosis, or SQL query here..."
                    className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                </div>
              )}

              {/* Rubric Citation */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300">Evaluation Rubric:</strong> {activeChallenge.rubric}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveChallenge(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Exit Challenge
                </button>
                <button
                  type="button"
                  disabled={submitting || (activeChallenge.options ? selectedOption === null : !textAnswer.trim())}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-md shadow-blue-600/20"
                >
                  {submitting ? "Evaluating..." : "Submit Answer"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Result Banner */
            <div className="space-y-6 animate-in fade-in">
              <div
                className={`p-6 rounded-xl border flex flex-col items-center text-center space-y-3 ${
                  result.passed
                    ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
                    : "bg-red-950/40 border-red-800/80 text-red-200"
                }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-red-400" />
                )}
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    {result.passed ? "Assessment Passed!" : "Assessment Incomplete"}
                  </h3>
                  <p className="text-2xl font-black mt-1">
                    Score: {result.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </p>
                </div>
                <p className="text-xs max-w-lg leading-relaxed text-slate-300">{result.feedback}</p>
                {result.passed && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Skill status upgraded to "Challenge Assessed"</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveChallenge(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Back to Challenges List
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Challenges Master Catalog */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Available Challenges</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges && challenges.length > 0 ? (
            challenges.map((ch: any) => (
              <div
                key={ch._id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                      {ch.skillName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 capitalize">
                      {ch.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{ch.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {ch.instructions}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ch.allowedTimeMinutes} mins
                  </span>
                  <button
                    onClick={() => handleStartChallenge(ch)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 transition-all"
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-xs text-slate-500">
              Loading challenges catalog...
            </div>
          )}
        </div>
      </div>

      {/* User's Past Attempt History */}
      {userAttempts && userAttempts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Your Assessment History</span>
          </h2>

          <div className="space-y-2">
            {userAttempts.map((attempt) => (
              <div
                key={attempt._id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{attempt.skillName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        attempt.passed
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-red-950 text-red-400 border border-red-800"
                      }`}
                    >
                      {attempt.passed ? "PASSED" : "REVISE"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{attempt.feedback}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-white">{attempt.score}%</span>
                  <p className="text-[10px] text-slate-500">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
