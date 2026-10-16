import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Briefcase,
  Compass,
  User,
  LogOut,
  Menu,
  X,
  Globe,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                ProofPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-400 tracking-wider uppercase">
                {t("app.tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/#how-it-works"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              to="/#features"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {t("nav.features")}
            </Link>
            <Link
              to="/internships"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-cyan-400" />
              {t("nav.internships")}
            </Link>

            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === "en" ? "ta" : "en")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all"
              title="Toggle English / தமிழ்"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === "en" ? "தமிழ்" : "English"}</span>
            </button>
          </div>

          {/* Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={
                    user?.role === "admin"
                      ? "/admin"
                      : user?.role === "recruiter"
                      ? "/recruiter"
                      : "/dashboard"
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t("nav.dashboard")}</span>
                </Link>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>{t("nav.getStarted")}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === "en" ? "ta" : "en")}
              className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              {language === "en" ? "தமிழ்" : "EN"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0f172a] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/internships"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-300 hover:text-white"
          >
            {t("nav.internships")}
          </Link>
          <Link
            to="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-300 hover:text-white"
          >
            {t("nav.howItWorks")}
          </Link>
          <Link
            to="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-300 hover:text-white"
          >
            {t("nav.features")}
          </Link>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={
                    user?.role === "admin"
                      ? "/admin"
                      : user?.role === "recruiter"
                      ? "/recruiter"
                      : "/dashboard"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600"
                >
                  {t("nav.dashboard")} ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded-lg text-sm font-medium text-red-400 bg-red-950/30 border border-red-900/50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-800"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600"
                >
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
