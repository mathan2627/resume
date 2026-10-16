import React, { useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Bell, Bot, Check, X, ShieldAlert } from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = useQuery(
    api.notifications.listNotifications,
    token ? { token } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-cyan-400 rounded-full animate-spin" />
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
    <div className="min-h-screen bg-[#0b0f19] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Role-Aware Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar with Notifications */}
          <div className="h-14 border-b border-slate-800/80 bg-[#080d1a]/50 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Workspace</span>
              <span>/</span>
              <span className="text-white font-medium capitalize">{user?.role || "Student"} Portal</span>
            </div>

            <div className="flex items-center gap-3 relative">
              {/* Notifications Bell */}
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#080d1a]" />
                )}
              </button>

              {/* Floating AI Assistant Link */}
              <Link
                to="/assistant"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 shadow-sm transition-all"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">AI Career Assistant</span>
              </Link>

              {/* Notifications Dropdown Drawer */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => token && markAllAsRead({ token })}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.read && token) markAsRead({ token, notificationId: n._id });
                          }}
                          className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            n.read
                              ? "bg-slate-900/40 text-slate-400"
                              : "bg-slate-800/80 text-slate-200 border-l-2 border-cyan-400"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-semibold text-slate-100">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs text-slate-500">
                        No notifications yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Page Outlet */}
          <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
