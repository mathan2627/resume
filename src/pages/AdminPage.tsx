import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ShieldAlert,
  Users,
  Briefcase,
  CheckCircle2,
  Activity,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";

export const AdminPage: React.FC = () => {
  const { token, user } = useAuth();

  const overview = useQuery(api.admin.getAdminOverview, token ? { token } : "skip");

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400">
          This administration console is restricted to authorized platform administrators.
        </p>
      </div>
    );
  }

  const metrics = overview?.metrics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/60 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor platform health, verify internship data quality, manage RBAC permissions, and review security audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/listings"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Review Listings
          </Link>
          <Link
            to="/admin/users"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            User Roles
          </Link>
          <Link
            to="/admin/import"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Import</span>
          </Link>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics?.totalUsers || 0}</p>
          <p className="text-[11px] text-slate-500">
            {metrics?.studentCount || 0} students • {metrics?.recruiterCount || 0} recruiters
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Internships</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics?.totalListings || 0}</p>
          <p className="text-[11px] text-slate-500">
            {metrics?.activeListings || 0} currently active
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Source Links</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{metrics?.verifiedListings || 0}</p>
          <p className="text-[11px] text-slate-500">Official career feeds</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Convex Database</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">Live</p>
          <p className="text-[11px] text-slate-500">content-lemur-582 deployment</p>
        </div>
      </div>

      {/* Two Column Section: Audit Trail & Ingestion Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Audit Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Security Audit Trail</span>
            </h3>
            <span className="text-[10px] text-slate-500">Immutable Log</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {overview?.recentLogs && overview.recentLogs.length > 0 ? (
              overview.recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 font-mono text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{log.details}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-slate-500">No audit events recorded yet.</p>
            )}
          </div>
        </div>

        {/* Ingestion Runs History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Background Ingestion Runs</span>
            </h3>
            <span className="text-[10px] text-slate-500">Convex Crons</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {overview?.recentIngestionRuns && overview.recentIngestionRuns.length > 0 ? (
              overview.recentIngestionRuns.map((run) => (
                <div
                  key={run._id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">{run.sourceName}</span>
                    <p className="text-[11px] text-slate-400">
                      Processed: {run.listingsProcessed} • Added: {run.listingsAdded} • Updated: {run.listingsUpdated}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {run.status.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-slate-500">No ingestion runs logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
