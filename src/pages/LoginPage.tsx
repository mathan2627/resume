import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      success("Welcome Back", `Signed in as ${res.user?.name || "Student"}.`);
      if (res.user?.role === "admin") {
        navigate("/admin");
      } else if (res.user?.role === "recruiter") {
        navigate("/recruiter");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please verify your credentials.");
      toastError("Authentication Failed", err.message);
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
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
          Or{" "}
          <Link to="/register" className="font-semibold text-cyan-400 light:text-blue-600 hover:underline">
            create a new student or recruiter account
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
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 light:border-slate-200 text-center text-xs text-slate-400">
            <span>Demo student account: </span>
            <button
              onClick={() => {
                setEmail("student@proofpath.ai");
                setPassword("password123");
              }}
              className="text-cyan-400 hover:underline font-mono ml-1"
            >
              Fill Demo Credentials
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
