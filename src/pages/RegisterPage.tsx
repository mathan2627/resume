import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle, Building2, GraduationCap } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "recruiter">("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await register(name, email, password, role);
      if (role === "student") {
        navigate("/onboarding");
      } else {
        navigate("/recruiter");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-[2px]">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            ProofPath <span className="text-cyan-400">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-white tracking-tight">Create your ProofPath account</h2>
        <p className="mt-1 text-xs text-slate-400">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                    role === "student"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <GraduationCap className={`w-5 h-5 ${role === "student" ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="text-xs font-bold">Student Candidate</span>
                  <span className="text-[10px] text-slate-400">Prove skills & apply</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                    role === "recruiter"
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${role === "recruiter" ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="text-xs font-bold">Recruiter / Employer</span>
                  <span className="text-[10px] text-slate-400">Post & discover talent</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full name</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mathan Kumar"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password (min. 8 characters)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            By creating an account, you agree to ProofPath AI's evidence-based platform guidelines and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};
