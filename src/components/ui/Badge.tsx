import React from "react";
import { CheckCircle2, AlertCircle, Sparkles, Clock, Globe, Shield, Terminal } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "verified"
    | "unverified"
    | "evidence"
    | "challenge"
    | "claim"
    | "fresh"
    | "match"
    | "remote"
    | "warning"
    | "outline";
  size?: "sm" | "md";
  icon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  icon = true,
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1 font-medium",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
  };

  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border border-slate-700/80 light:bg-slate-100 light:text-slate-700 light:border-slate-300",
    verified: "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200",
    unverified: "bg-amber-950/40 text-amber-300 border border-amber-500/30 light:bg-amber-50 light:text-amber-700 light:border-amber-200",
    evidence: "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 light:bg-cyan-50 light:text-cyan-700 light:border-cyan-200",
    challenge: "bg-purple-950/40 text-purple-300 border border-purple-500/30 light:bg-purple-50 light:text-purple-700 light:border-purple-200",
    claim: "bg-slate-800/80 text-slate-400 border border-slate-700/60 light:bg-slate-100 light:text-slate-500",
    fresh: "bg-blue-950/50 text-blue-300 border border-blue-500/30 light:bg-blue-50 light:text-blue-700 light:border-blue-200",
    match: "bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 font-semibold light:bg-indigo-50 light:text-indigo-700",
    remote: "bg-teal-950/40 text-teal-300 border border-teal-500/30 light:bg-teal-50 light:text-teal-700",
    warning: "bg-rose-950/40 text-rose-300 border border-rose-500/30 light:bg-rose-50 light:text-rose-700",
    outline: "bg-transparent text-slate-400 border border-slate-700 light:border-slate-300 light:text-slate-600",
  };

  const getIcon = () => {
    if (!icon) return null;
    switch (variant) {
      case "verified":
        return <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />;
      case "evidence":
        return <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />;
      case "challenge":
        return <Shield className="w-3 h-3 text-purple-400 shrink-0" />;
      case "fresh":
        return <Clock className="w-3 h-3 text-blue-400 shrink-0" />;
      case "match":
        return <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />;
      case "remote":
        return <Globe className="w-3 h-3 text-teal-400 shrink-0" />;
      case "unverified":
      case "warning":
        return <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg select-none whitespace-nowrap transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {getIcon()}
      <span>{children}</span>
    </span>
  );
};
