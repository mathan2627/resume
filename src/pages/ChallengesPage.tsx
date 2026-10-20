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
  Terminal,
  Check,
  X,
  Target,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const ChallengesPage: React.FC = () => {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

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
      if (res.passed) {
        success("Challenge Passed!", `Upgraded ${activeChallenge.skillName} to Challenge Assessed (${res.score}%).`);
      } else {
        toastError("Assessment Incomplete", `Score: ${res.score}%. Review the rubric feedback below.`);
      }
    } catch (err: any) {
      toastError("Submission error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-500/30 text-purple-300 light:bg-purple-50 light:text-purple-700 mb-2">
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Timed Adaptive Assessments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Adaptive Skill Challenge Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Demonstrate real-world problem solving, code reading, and bug hunting. Passing an assessment upgrades your skill to "Challenge Assessed" status with an explainable proof score.
          </p>
        </div>

        <Badge variant="verified">
          {userAttempts?.filter((a) => a.passed).length || 0} Challenges Passed
        </Badge>
      </div>

      {/* 2. ACTIVE CHALLENGE RUNNER */}
      {activeChallenge && (
        <Card highlight className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="challenge">{activeChallenge.skillName}</Badge>
                <Badge variant="outline">{activeChallenge.difficulty}</Badge>
              </div>
              <h2 className="text-xl font-bold text-white light:text-slate-900">
                {activeChallenge.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveChallenge(null)}
              >
                Exit
              </Button>
            </div>
          </div>

          {/* Question / Instructions */}
          <div className="space-y-3">
            <p className="text-xs text-slate-400 light:text-slate-500">
              {activeChallenge.instructions}
            </p>
            <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-sm text-slate-200 light:text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
              {activeChallenge.question}
            </div>
          </div>

          {/* Options (MCQ / Practical) */}
          {activeChallenge.options && !result && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Select Your Solution
              </span>
              {activeChallenge.options.map((opt: string, idx: number) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500 text-white font-medium shadow-sm"
                        : "bg-slate-950/40 light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-300 light:text-slate-700 hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-400 text-slate-950"
                          : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Free-form code or answer input if no options */}
          {!activeChallenge.options && !result && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Your Technical Explanation & Code
              </span>
              <textarea
                rows={6}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Explain the architectural trade-offs, edge-case mitigation, and implementation logic..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          )}

          {/* Result Breakdown Card */}
          {result && (
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                result.passed
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/20 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <h3 className="text-base font-bold text-white light:text-slate-900">
                    {result.passed ? "Assessment Passed" : "Needs Revision"}
                  </h3>
                </div>
                <Badge variant={result.passed ? "verified" : "warning"}>
                  Score: {result.score}/100
                </Badge>
              </div>

              <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                {result.feedback}
              </p>

              {result.passed && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300">
                  ✓ Successfully updated {activeChallenge.skillName} in your Skill Proof Engine and Proof Passport.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveChallenge(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Submit Action */}
          {!result && (
            <div className="pt-4 border-t border-slate-800 light:border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Evaluation: {activeChallenge.rubric}
              </span>
              <Button
                variant="glow"
                size="md"
                isLoading={submitting}
                disabled={selectedOption === null && !textAnswer.trim()}
                onClick={handleSubmit}
              >
                <span>Submit Assessment</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 3. AVAILABLE CHALLENGES CATALOG */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
          Available Practical Skill Challenges
        </h2>

        {(!challenges || challenges.length === 0) ? (
          <EmptyState
            icon={<Code2 className="w-6 h-6 text-purple-400" />}
            title="Initializing Challenge Engine"
            description="Adaptive challenges will appear here to test your architectural and debugging competence."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((c) => {
              const attempt = userAttempts?.find((a) => a.challengeId === c._id);

              return (
                <Card key={c._id} hover className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="challenge">{c.skillName}</Badge>
                      <Badge variant="outline">{c.difficulty}</Badge>
                    </div>

                    <h3 className="text-base font-semibold text-white light:text-slate-900 mb-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 light:text-slate-500 line-clamp-2 mb-4">
                      {c.instructions}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {c.allowedTimeMinutes} mins
                    </span>

                    {attempt?.passed ? (
                      <Badge variant="verified">Passed ({attempt.score}%)</Badge>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartChallenge(c)}
                      >
                        Start Challenge
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. PAST ATTEMPTS HISTORY */}
      {userAttempts && userAttempts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/[0.08] light:border-slate-200">
          <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
            Assessment Attempt History
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 light:text-slate-700">
              <thead className="bg-slate-900/80 light:bg-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Skill</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Rubric Score</th>
                  <th className="py-3 px-4">Time Spent</th>
                  <th className="py-3 px-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                {userAttempts.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-900/40 light:hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-white light:text-slate-900">
                      {att.skillName}
                    </td>
                    <td className="py-3.5 px-4">
                      {att.passed ? (
                        <Badge variant="verified" size="sm">Passed</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Failed</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-400">
                      {att.score}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {att.timeSpentSeconds}s
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(att.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
