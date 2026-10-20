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
  MapPin,
  Kanban,
  List,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

const PIPELINE_STATUSES = [
  { id: "saved", label: "Saved", badge: "outline" as const },
  { id: "planning", label: "Planning", badge: "fresh" as const },
  { id: "applied", label: "Applied", badge: "evidence" as const },
  { id: "assessment", label: "Assessment", badge: "challenge" as const },
  { id: "interview", label: "Interview", badge: "match" as const },
  { id: "offer", label: "Offer", badge: "verified" as const },
  { id: "rejected", label: "Rejected", badge: "warning" as const },
];

export const ApplicationsPage: React.FC = () => {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  const applications = useQuery(api.applications.listApplications, token ? { token } : "skip");
  const updateStatusMutation = useMutation(api.applications.updateApplicationStatus);
  const deleteMutation = useMutation(api.applications.deleteApplication);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "kanban">("cards");

  const handleStatusChange = async (applicationId: any, newStatus: any) => {
    if (!token) return;
    try {
      await updateStatusMutation({
        token,
        applicationId,
        status: newStatus,
      });
      success("Status Updated", `Moved application to '${newStatus}'.`);
    } catch (e: any) {
      toastError("Error", e.message);
    }
  };

  const handleSaveNotes = async (applicationId: any) => {
    if (!token) return;
    const current = applications?.find((a) => a._id === applicationId);
    if (!current) return;
    try {
      await updateStatusMutation({
        token,
        applicationId,
        status: current.status,
        notes: notesInput,
      });
      setEditingNotesId(null);
      success("Notes Saved", "Updated application notes.");
    } catch (e: any) {
      toastError("Error", e.message);
    }
  };

  const handleDelete = async (applicationId: any) => {
    if (!token) return;
    try {
      await deleteMutation({ token, applicationId });
      success("Removed", "Application untracked.");
    } catch (e: any) {
      toastError("Error", e.message);
    }
  };

  const appList = applications || [];
  const filteredApps =
    activeTab === "all" ? appList : appList.filter((a) => a.status === activeTab);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Application Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Application Pipeline Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Track and advance your job and internship applications from initial bookmarking through technical assessments, interviews, and offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/internships">
            <Button variant="glow" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Track New Opportunity</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. FILTER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "all", label: "All Applications", badge: appList.length },
            ...PIPELINE_STATUSES.map((st) => ({
              id: st.id,
              label: st.label,
              badge: appList.filter((a) => a.status === st.id).length,
            })),
          ]}
        />
      </div>

      {/* 3. PIPELINE CARDS LIST */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-7 h-7 text-cyan-400" />}
          title="No Tracked Applications"
          description="Explore verified opportunities on the Discovery page and click 'Track in Pipeline' to monitor your application progress."
          actionLabel="Browse Opportunities"
          onAction={() => window.location.assign("/internships")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <Card key={app._id} className="p-5 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {app.internship?.companyName}
                    </span>
                    <h3 className="text-base font-semibold text-white light:text-slate-900 mt-0.5">
                      {app.internship?.roleTitle}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(app._id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove from tracker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{app.internship?.location}</span>
                </div>

                {/* Pipeline Stage Selector */}
                <div className="my-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Stage
                  </span>
                  <Select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="text-xs py-1.5"
                  >
                    {PIPELINE_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Notes Editor */}
                <div className="pt-2">
                  {editingNotesId === app._id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add notes (e.g. recruiter contact, interview date)..."
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                      />
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNotesId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveNotes(app._id)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingNotesId(app._id);
                        setNotesInput(app.notes || "");
                      }}
                      className="p-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 text-[11px] text-slate-400 cursor-pointer hover:border-slate-700"
                    >
                      {app.notes ? (
                        <span>{app.notes}</span>
                      ) : (
                        <span className="text-slate-500 italic">+ Add private note...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-4">
                <span>
                  Deadline: {app.internship?.applicationDeadline || "Ongoing"}
                </span>
                <a
                  href={app.internship?.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <span>Apply on Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
