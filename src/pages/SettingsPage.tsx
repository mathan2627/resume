import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Settings,
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Globe,
  Sun,
  Moon,
  User,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export const SettingsPage: React.FC = () => {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { success, error: toastError } = useToast();

  const profileData = useQuery(api.profiles.getProfile, token ? { token } : "skip");
  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const updateProfileMutation = useMutation(api.profiles.updateProfile);

  const profile = profileData?.profile;

  const [preferredRole, setPreferredRole] = useState(profile?.preferredRole || "");
  const [locationPreference, setLocationPreference] = useState(profile?.locationPreference || "");
  const [remotePreference, setRemotePreference] = useState(profile?.remotePreference || "any");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await updateProfileMutation({
        token,
        preferredRole: preferredRole || undefined,
        locationPreference: locationPreference || undefined,
        remotePreference: remotePreference as any,
      });
      success("Settings Saved", "Your profile preferences have been updated.");
    } catch (err: any) {
      toastError("Save Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
      profile,
      skills: evidenceSummary?.evidenceList || [],
      exportedAt: new Date().toISOString(),
      platform: "ProofPath AI",
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `proofpath_data_export_${user?.name?.toLowerCase().replace(/\s+/g, "_") || "user"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    success("Data Exported", "Your full profile and verification data has been downloaded as JSON.");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preferences & Privacy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Account Settings & Privacy Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Manage your personal profile, interface appearance, data sovereignty exports, and cryptographic privacy settings.
          </p>
        </div>
      </div>

      {/* 2. PROFILE SETTINGS */}
      <Card className="p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Profile & Opportunity Preferences</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={user?.name || ""}
              disabled
              helperText="Managed by account authentication."
            />
            <Input
              label="Account Email"
              value={user?.email || ""}
              disabled
              helperText="Primary email used for verification notifications."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Preferred Role"
              placeholder="e.g. Software Engineering Intern"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
            />
            <Input
              label="Location Preference"
              placeholder="e.g. Bengaluru, India or Global Remote"
              value={locationPreference}
              onChange={(e) => setLocationPreference(e.target.value)}
            />
          </div>

          <Select
            label="Workplace Mode"
            value={remotePreference}
            onChange={(e) => setRemotePreference(e.target.value as "any" | "remote" | "hybrid" | "onsite")}
          >
            <option value="any">Open to Any (Remote, Hybrid, On-site)</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site Only</option>
          </Select>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" type="submit" isLoading={saving}>
              <span>Save Preferences</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. INTERFACE APPEARANCE & LOCALIZATION */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Appearance & Language</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white light:text-slate-900 block">Theme</span>
              <span className="text-[11px] text-slate-400 capitalize">Currently: {theme} Mode</span>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="ml-1.5">{theme === "dark" ? "Light" : "Dark"}</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white light:text-slate-900 block">Language</span>
              <span className="text-[11px] text-slate-400">{language === "en" ? "English" : "தமிழ்"}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            >
              <Globe className="w-4 h-4 text-cyan-400 mr-1.5" />
              <span>{language === "en" ? "தமிழ்" : "English"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. DATA SOVEREIGNTY & PRIVACY EXPORT */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Data Sovereignty & Portability</span>
        </h2>

        <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
          In adherence to strict GDPR and data protection principles, ProofPath AI allows you to download an unencrypted JSON package of your complete profile, parsed resume skills, GitHub repository proofs, and challenge assessment history.
        </p>

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-1.5 text-cyan-400" />
            <span>Export My Data (JSON)</span>
          </Button>
        </div>
      </Card>

      {/* 5. DANGER ZONE */}
      <Card className="p-6 sm:p-8 border-rose-900/50 space-y-4">
        <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Account Deletion</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Permanently remove your candidate profile, uploaded resumes, and public Proof Passport. This action cannot be reversed.
        </p>
        <div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Delete Account</span>
          </Button>
        </div>
      </Card>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        description="Are you sure you wish to delete your ProofPath AI candidate account?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 light:text-slate-600">
            Deleting your account will revoke your Proof Passport public URL, erase your resume documents, and reset all skill proofs.
          </p>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeleteModalOpen(false);
                logout();
              }}
            >
              Permanently Delete & Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
