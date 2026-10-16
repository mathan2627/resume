import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  CheckSquare,
  Building2,
  Calendar,
  ExternalLink,
  Trash2,
  Edit2,
  Plus,
  Briefcase,
  Clock,
  ArrowRight,
} from "lucide-react";

const PIPELINE_STATUSES = [
  { id: "saved", label: "Saved", color: "border-slate-700 bg-slate-900/60" },
  { id: "planning", label: "Planning to Apply", color: "border-blue-900/60 bg-blue-950/20" },
  { id: "applied", label: "Applied", color: "border-indigo-900/60 bg-indigo-950/20" },
  { id: "assessment", label: "Assessment", color: "border-cyan-900/60 bg-cyan-950/20" },
  { id: "interview", label: "Interview", color: "border-amber-900/60 bg-amber-950/20" },
  { id: "offer", label: "Offer", color: "border-emerald-900/60 bg-emerald-950/20" },
  { id: "rejected", label: "Rejected", color: "border-red-900/40 bg-red-950/10" },
];

export const ApplicationsPage: React.FC = () => {
  const { token } = useAuth();

  const applications = useQuery(api.applications.listApplications, token ? { token } : "skip");
  const updateStatusMutation = useMutation(api.applications.updateApplicationStatus);
  const deleteMutation = useMutation(api.applications.deleteApplication);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");

  const handleStatusChange = async (applicationId: any, newStatus: any) => {
    if (!token) return;
    await updateStatusMutation({
      token,
      applicationId,
      status: newStatus,
    });
  };

  const handleSaveNotes = async (applicationId: any) => {
    if (!token) return;
    await updateStatusMutation({
      token,
      applicationId,
      status: applications?.find((a) => a._id === applicationId)?.status || "applied",
      notes: notesInput,
    });
    setEditingNotesId(null);
  };

  const handleDelete = async (applicationId: any) => {
    if (!token || !confirm("Remove this application from tracker?")) return;
    await deleteMutation({
      token,
      applicationId,
    });
  };

  const appList = applications || [];
  const filteredApps =
    activeTab === "all" ? appList : appList.filter((a) => a.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Opportunity Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Application Pipeline Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor and advance your internship submissions across every stage from planning to offers.
          </p>
        </div>

        <Link
          to="/internships"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add From Discovery</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "all"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Applications ({appList.length})
        </button>
        {PIPELINE_STATUSES.map((st) => {
          const count = appList.filter((a) => a.status === st.id).length;
          return (
            <button
              key={st.id}
              onClick={() => setActiveTab(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === st.id
                  ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div
              key={app._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {app.internship.companyName}
                    </span>
                    <h3 className="text-sm font-bold text-white">{app.internship.roleTitle}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(app._id)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded"
                    title="Delete from tracker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status Selector Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Pipeline Stage:
                  </label>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    {PIPELINE_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadlines or Applied Dates */}
                <div className="text-xs text-slate-400 space-y-1">
                  {app.appliedDate && (
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Applied on: <strong className="text-slate-200">{app.appliedDate}</strong>
                    </p>
                  )}
                  {app.internship.applicationDeadline && (
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Deadline: <strong className="text-slate-200">{app.internship.applicationDeadline}</strong>
                    </p>
                  )}
                </div>

                {/* Notes Section */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Interview & Prep Notes:</span>
                    <button
                      onClick={() => {
                        setEditingNotesId(app._id);
                        setNotesInput(app.notes || "");
                      }}
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Edit
                    </button>
                  </div>

                  {editingNotesId === app._id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add notes e.g. recruiter name, technical questions asked..."
                        className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1 text-[11px] text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(app._id)}
                          className="px-2.5 py-1 text-[11px] rounded bg-indigo-600 text-white font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2 rounded border border-slate-800/50">
                      {app.notes || "No notes yet. Click edit to record interview rounds."}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {app.internship.location}
                </span>
                <a
                  href={app.internship.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Job Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Applications In This Stage</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Find internships on the discovery feed and click "Track in Pipeline" to monitor your progress here.
            </p>
            <Link
              to="/internships"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
            >
              Browse Internships <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
