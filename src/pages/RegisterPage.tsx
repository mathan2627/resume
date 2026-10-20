import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle, Building2, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
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
      success("Account Created", `Welcome to ProofPath AI, ${name}!`);
      if (role === "student") {
        navigate("/onboarding");
      } else {
        navigate("/recruiter");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register account. Please try again.");
      toastError("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] light:bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 light:text-slate-900 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px]">
            <div className="w-full h-full bg-[#080c14] light:bg-white rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400 light:text-blue-600" />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white light:text-slate-900">
            ProofPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-white light:text-slate-900 tracking-tight">
          Create Your ProofPath Account
        </h2>
        <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-cyan-400 light:text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border-slate-800 light:border-slate-200">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 uppercase tracking-wider">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-3.5 rounded-xl border text-left flex flex-col items-start gap-1 transition-all cursor-pointer ${
                    role === "student"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                      : "bg-slate-950/40 light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <GraduationCap className={`w-5 h-5 ${role === "student" ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="text-xs font-bold text-white light:text-slate-900">Student Candidate</span>
                  <span className="text-[10px] text-slate-400">Prove skills & match</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`p-3.5 rounded-xl border text-left flex flex-col items-start gap-1 transition-all cursor-pointer ${
                    role === "recruiter"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                      : "bg-slate-950/40 light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${role === "recruiter" ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="text-xs font-bold text-white light:text-slate-900">Recruiter / Team</span>
                  <span className="text-[10px] text-slate-400">Discover verified talent</span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Kumar"
              leftIcon={<User className="w-4 h-4 text-slate-500" />}
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              leftIcon={<Lock className="w-4 h-4 text-slate-500" />}
            />

            <div className="pt-2">
              <Button
                variant="glow"
                size="md"
                type="submit"
                isLoading={loading}
                className="w-full"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
