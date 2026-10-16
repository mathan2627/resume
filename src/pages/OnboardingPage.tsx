import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  GraduationCap,
  Briefcase,
  Code2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Plus,
  X,
} from "lucide-react";

export const OnboardingPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const completeOnboardingMutation = useMutation(api.profiles.completeOnboarding);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("B.Tech / B.E. Computer Science");
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [preferredRole, setPreferredRole] = useState("Frontend Developer");
  const [remotePreference, setRemotePreference] = useState<"remote" | "hybrid" | "onsite" | "any">("any");
  const [locationPreference, setLocationPreference] = useState("Bengaluru, India");
  const [weeklyAvailability, setWeeklyAvailability] = useState<number>(20);
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "JavaScript", "Python"]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleFinish = async () => {
    if (!token) return;
    setLoading(true);

    try {
      await completeOnboardingMutation({
        token,
        college: college.trim() || "Institute of Technology",
        course,
        graduationYear: Number(graduationYear),
        preferredRole,
        technicalSkills: skills,
        remotePreference,
        locationPreference,
        weeklyAvailabilityHours: Number(weeklyAvailability),
      });
      navigate("/dashboard");
    } catch (e) {
      console.error("Onboarding error:", e);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Profile Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Let's Tailor Your ProofPath Journey</h1>
          <p className="text-xs text-slate-400 mt-1">
            Step {step} of 3 — Tell us your background so we can recommend relevant internships and skill challenges.
          </p>

          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 1 ? "bg-cyan-400" : "bg-slate-800"}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 2 ? "bg-cyan-400" : "bg-slate-800"}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 3 ? "bg-cyan-400" : "bg-slate-800"}`} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* STEP 1: EDUCATION */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">College & Degree Information</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  University / College Name
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Ramco Institute of Technology / MIT / Anna University"
                  className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Major</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="B.Tech Computer Science"
                    className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CAREER GOALS & LOCATION */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Internship Preferences</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Internship Role
                </label>
                <select
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                  <option value="Data Analyst / Data Engineer">Data Analyst / Data Engineer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Arrangement</label>
                  <select
                    value={remotePreference}
                    onChange={(e) => setRemotePreference(e.target.value as any)}
                    className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="any">Any (Remote, Hybrid, or Onsite)</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Location</label>
                  <input
                    type="text"
                    value={locationPreference}
                    onChange={(e) => setLocationPreference(e.target.value)}
                    placeholder="Bengaluru, Hyderabad, Chennai, Remote"
                    className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Weekly Availability (Hours / Week)
                </label>
                <input
                  type="number"
                  min={5}
                  max={45}
                  value={weeklyAvailability}
                  onChange={(e) => setWeeklyAvailability(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TECHNICAL SKILLS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Your Technical Skills</h2>
              </div>
              <p className="text-xs text-slate-400">
                Add skills you currently use. These will initially be marked as <strong className="text-amber-400 font-semibold">Claimed</strong>. You will subsequently connect GitHub projects and complete challenges to turn them into verified evidence!
              </p>

              {/* Skills Tags List */}
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 min-h-24">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill (e.g. Docker, PostgreSQL, Go) and press Add"
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                >
                  Add
                </button>
              </div>

              {/* Suggestions */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block mb-1.5">Commonly added:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Next.js", "Node.js", "Docker", "PostgreSQL", "Tailwind CSS", "Git & GitHub", "Machine Learning"].map(
                    (sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => {
                          if (!skills.includes(sugg)) setSkills([...skills, sugg]);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                      >
                        + {sugg}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? "Saving Profile..." : "Complete & Open Dashboard"}
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
