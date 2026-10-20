import React, { useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Bell, Bot, Check, X, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const DashboardLayout: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const notifications = useQuery(
    api.notifications.listNotifications,
    token ? { token } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Authenticating ProofPath AI session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-[#080c14] light:bg-slate-100 flex flex-col text-slate-100 light:text-slate-900 transition-colors">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 flex-1 max-w-xs w-full bg-[#080d19] light:bg-slate-50 flex flex-col shadow-2xl">
              <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-bold text-white light:text-slate-900 uppercase tracking-wider">
                  Workspace Menu
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar with Mobile Toggle & Notification Center */}
          <div className="h-14 border-b border-white/[0.08] light:border-slate-200 bg-[#080c14]/80 light:bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-500">
                <span className="text-slate-500 light:text-slate-400 hidden sm:inline">Workspace</span>
                <span className="hidden sm:inline">/</span>
                <span className="text-white light:text-slate-900 font-semibold capitalize">
                  {user?.role || "Student"} Console
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
              {/* Notifications Bell */}
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 light:hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#080c14]" />
                )}
              </button>

              {/* Floating AI Assistant Link */}
              <Link to="/assistant">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Bot className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                  <span>AI Copilot</span>
                </Button>
              </Link>

              {/* Notifications Dropdown Drawer */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 light:border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white light:text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => token && markAllAsRead({ token })}
                        className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {(!notifications || notifications.length === 0) ? (
                      <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 rounded-xl border text-xs transition-colors ${
                            n.read
                              ? "bg-slate-900/50 light:bg-slate-50 border-slate-800/40 light:border-slate-200 text-slate-400"
                              : "bg-slate-800/80 light:bg-blue-50/50 border-blue-500/30 text-slate-200 light:text-slate-800 font-medium"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-white light:text-slate-900">{n.title}</span>
                            {!n.read && (
                              <button
                                onClick={() => token && markAsRead({ token, notificationId: n._id })}
                                className="text-slate-500 hover:text-cyan-400"
                                title="Mark read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subview Outlet */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
