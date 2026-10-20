import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  ShieldCheck,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "recruiter") return "/recruiter";
    return "/dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#080c14]/90 light:bg-white/90 backdrop-blur-xl border-b border-white/[0.08] light:border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20 group-hover:shadow-cyan-500/30 transition-all">
              <div className="w-full h-full bg-[#0b0f19] light:bg-white rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400 light:text-blue-600" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white light:text-slate-900 flex items-center gap-1.5">
                ProofPath{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 light:from-blue-600 light:to-cyan-600 font-extrabold">
                  AI
                </span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-400 light:text-slate-500 tracking-wider uppercase">
                {t("app.tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/#workflow"
              className="text-sm font-medium text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              to="/#features"
              className="text-sm font-medium text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
            >
              {t("nav.features")}
            </Link>
            <Link
              to="/internships"
              className="text-sm font-medium text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-cyan-400 light:text-blue-600" />
              {t("nav.internships")}
            </Link>

            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === "en" ? "ta" : "en")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 light:bg-slate-100 light:text-slate-700 light:border-slate-300 transition-all cursor-pointer"
              title="Toggle English / தமிழ்"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 light:text-blue-600" />
              <span>{language === "en" ? "தமிழ்" : "English"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100 transition-all cursor-pointer"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>

          {/* Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardPath()}>
                  <Button variant="primary" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    <span>{t("nav.dashboard")}</span>
                  </Button>
                </Link>
                <div className="h-5 w-px bg-slate-800 light:bg-slate-200" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-cyan-300 light:bg-blue-100 light:text-blue-700 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t("nav.signIn")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="glow" size="sm">
                    <span>{t("nav.getStarted")}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 light:text-slate-600 light:hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 light:border-slate-200 bg-slate-900/98 light:bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            to="/#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 light:text-slate-700 light:hover:bg-slate-100"
          >
            {t("nav.howItWorks")}
          </Link>
          <Link
            to="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 light:text-slate-700 light:hover:bg-slate-100"
          >
            {t("nav.features")}
          </Link>
          <Link
            to="/internships"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 light:text-slate-700 light:hover:bg-slate-100"
          >
            {t("nav.internships")}
          </Link>

          <div className="pt-2 border-t border-slate-800 light:border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setLanguage(language === "en" ? "ta" : "en")}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 light:text-slate-700 px-3 py-2 rounded-lg bg-slate-800 light:bg-slate-100"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{language === "en" ? "Switch to தமிழ்" : "Switch to English"}</span>
            </button>
          </div>

          <div className="pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button variant="primary" size="md" className="w-full">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-950/20 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    {t("nav.signIn")}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="glow" size="md" className="w-full">
                    {t("nav.getStarted")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
