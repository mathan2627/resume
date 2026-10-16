import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard,
  ShieldCheck,
  Code2,
  Briefcase,
  FileText,
  Map,
  Share2,
  CheckSquare,
  Bot,
  Video,
  Settings,
  Users,
  Building2,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const isStudent = user?.role === "student" || !user?.role;
  const isRecruiter = user?.role === "recruiter";
  const isAdmin = user?.role === "admin";

  const studentLinks: NavItem[] = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/skills", label: t("nav.skills"), icon: ShieldCheck, badge: "Core" },
    { to: "/challenges", label: t("nav.challenges"), icon: Code2 },
    { to: "/internships", label: t("nav.internships"), icon: Briefcase },
    { to: "/roadmap", label: t("nav.roadmap"), icon: Map },
    { to: "/applications", label: t("nav.applications"), icon: CheckSquare },
    { to: "/resume", label: t("nav.resume"), icon: FileText },
    { to: "/interview", label: t("nav.interview"), icon: Video },
    { to: "/passport", label: t("nav.passport"), icon: Share2 },
    { to: "/assistant", label: t("nav.assistant"), icon: Bot },
  ];

  const recruiterLinks = [
    { to: "/recruiter", label: "My Listings & Applicants", icon: Building2 },
    { to: "/recruiter/search", label: "Consented Candidate Search", icon: Users },
    { to: "/internships", label: "Browse All Opportunities", icon: Briefcase },
  ];

  const adminLinks = [
    { to: "/admin", label: "System Analytics & Overview", icon: LayoutDashboard },
    { to: "/admin/listings", label: "Listing Quality & Verification", icon: CheckSquare },
    { to: "/admin/users", label: "User & Role Management", icon: Users },
    { to: "/admin/import", label: "CSV Ingestion & Sources", icon: FileText },
  ];

  const activeLinks = isAdmin ? adminLinks : isRecruiter ? recruiterLinks : studentLinks;

  return (
    <aside className="w-64 bg-[#080d1a] border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Banner */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Student"}</p>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800/50">
              {user?.role || "Student"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {activeLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Proof Passport Quick Promo */}
      {isStudent && (
        <div className="p-3 border-t border-slate-800/80">
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-900/30 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>Proof Passport</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              Share your verified evidence with prospective employers.
            </p>
            <Link
              to="/passport"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Configure sharing <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
};
