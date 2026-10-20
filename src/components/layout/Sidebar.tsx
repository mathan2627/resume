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
  Activity,
  LogOut,
  ChevronRight,
  Database,
  Search,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const isStudent = user?.role === "student" || !user?.role;
  const isRecruiter = user?.role === "recruiter";
  const isAdmin = user?.role === "admin";

  const studentLinks: NavItem[] = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/skills", label: t("nav.skills"), icon: ShieldCheck, badge: "Proof" },
    { to: "/challenges", label: t("nav.challenges"), icon: Code2 },
    { to: "/internships", label: t("nav.internships"), icon: Briefcase, badge: "Live" },
    { to: "/roadmap", label: t("nav.roadmap"), icon: Map },
    { to: "/applications", label: t("nav.applications"), icon: CheckSquare },
    { to: "/resume", label: t("nav.resume"), icon: FileText },
    { to: "/interview", label: t("nav.interview"), icon: Video },
    { to: "/passport", label: t("nav.passport"), icon: Share2 },
    { to: "/assistant", label: t("nav.assistant"), icon: Bot },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const recruiterLinks: NavItem[] = [
    { to: "/recruiter", label: "Talent Postings & Candidates", icon: Building2 },
    { to: "/recruiter/search", label: "Verified Student Search", icon: Search },
    { to: "/internships", label: "Opportunity Catalog", icon: Briefcase },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const adminLinks: NavItem[] = [
    { to: "/admin", label: "Global Ingestion Console", icon: Activity, badge: "1-Min" },
    { to: "/admin/listings", label: "Opportunity Quality & Review", icon: CheckSquare },
    { to: "/admin/users", label: "Role & Permission Control", icon: Users },
    { to: "/admin/import", label: "CSV & Source Connectors", icon: Database },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const activeLinks = isAdmin ? adminLinks : isRecruiter ? recruiterLinks : studentLinks;

  return (
    <aside className="w-64 bg-[#080d19] light:bg-slate-50 border-r border-white/[0.08] light:border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-colors">
      {/* User Role Pill */}
      <div className="p-4 border-b border-white/[0.08] light:border-slate-200">
        <div className="bg-slate-900/90 light:bg-white rounded-xl p-3 border border-slate-800/80 light:border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-semibold text-white light:text-slate-900 truncate">
              {user?.name || "Student"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-cyan-300 border border-blue-800/40 light:bg-blue-50 light:text-blue-700">
                {user?.role || "Student"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-500 light:text-slate-400">
          Navigation
        </p>
        {activeLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-400 light:text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 light:bg-cyan-50 light:text-cyan-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-white/[0.08] light:border-slate-200 space-y-1">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 light:hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
