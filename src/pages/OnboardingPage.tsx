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
  ChevronLeft,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export const OnboardingPage: React.FC = () => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();
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
      success("Profile Configured", "Welcome to your ProofPath AI workspace!");
      navigate("/dashboard");
    } catch (e: any) {
      toastError("Onboarding error", e.message);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] light:bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 light:text-slate-900 transition-colors">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Profile Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Tailor Your Career Intelligence
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Step {step} of 3 — Tell us your background so we can recommend relevant opportunities and practical challenges.
          </p>

          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`h-1.5 w-14 rounded-full transition-all ${step >= 1 ? "bg-cyan-400" : "bg-slate-800"}`} />
            <div className={`h-1.5 w-14 rounded-full transition-all ${step >= 2 ? "bg-cyan-400" : "bg-slate-800"}`} />
            <div className={`h-1.5 w-14 rounded-full transition-all ${step >= 3 ? "bg-cyan-400" : "bg-slate-800"}`} />
          </div>
        </div>

        <Card className="p-6 sm:p-8 shadow-2xl border-slate-800 light:border-slate-200">
          {/* STEP 1: EDUCATION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 light:border-slate-200">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white light:text-slate-900">Education & Academic Background</h3>
              </div>

              <Input
                label="College / University Name"
                placeholder="e.g. National Institute of Technology, Trichy"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
              />

              <Select
                label="Course / Degree"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="B.Tech / B.E. Computer Science">B.Tech / B.E. Computer Science</option>
                <option value="B.Tech / B.E. Information Technology">B.Tech / B.E. Information Technology</option>
                <option value="B.Tech / B.E. AI & Data Science">B.Tech / B.E. AI & Data Science</option>
                <option value="BCA / MCA (Computer Applications)">BCA / MCA (Computer Applications)</option>
                <option value="B.Sc / M.Sc Computer Science">B.Sc / M.Sc Computer Science</option>
                <option value="Self-Taught Developer">Self-Taught / Bootcamp Developer</option>
              </Select>

              <Select
                label="Expected Graduation Year"
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
              >
                <option value={2025}>2025 (Immediate Graduate)</option>
                <option value={2026}>2026 (Final Year)</option>
                <option value={2027}>2027 (Pre-Final Year)</option>
                <option value={2028}>2028</option>
              </Select>

              <div className="pt-4 flex justify-end">
                <Button variant="glow" size="md" onClick={() => setStep(2)}>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PREFERENCES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 light:border-slate-200">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white light:text-slate-900">Target Role & Preferences</h3>
              </div>

              <Select
                label="Preferred Target Role"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
              >
                <option value="Frontend Developer">Frontend Developer (React / Next.js)</option>
                <option value="Backend Systems Engineer">Backend Systems Engineer (Go / Node / Java)</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="AI & Machine Learning Engineer">AI & Machine Learning Engineer</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                <option value="Mobile App Developer">Mobile App Developer (Flutter / React Native)</option>
              </Select>

              <Select
                label="Workplace Preference"
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value as any)}
              >
                <option value="any">Open to Any (Remote, Hybrid, or On-site)</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid (1-3 days in office)</option>
                <option value="onsite">On-site Only</option>
              </Select>

              <Input
                label="Location Preference"
                placeholder="e.g. Bengaluru, India or Global Remote"
                value={locationPreference}
                onChange={(e) => setLocationPreference(e.target.value)}
              />

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Back</span>
                </Button>
                <Button variant="glow" size="md" onClick={() => setStep(3)}>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SKILLS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 light:border-slate-200">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white light:text-slate-900">Your Technical Competencies</h3>
              </div>

              <p className="text-xs text-slate-400 light:text-slate-500">
                Add skills you know or are currently studying. You can link GitHub projects or take adaptive challenges later to verify them.
              </p>

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
                  placeholder="e.g. Docker, PostgreSQL, Go..."
                  className="flex-1 bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <Button variant="secondary" size="sm" type="button" onClick={handleAddSkill}>
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Add</span>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs font-semibold text-cyan-300"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-800 light:border-slate-200">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Back</span>
                </Button>
                <Button
                  variant="glow"
                  size="md"
                  isLoading={loading}
                  onClick={handleFinish}
                >
                  <span>Complete Onboarding</span>
                  <Check className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
