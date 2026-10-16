import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Share2,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";

export const ProofPassportPage: React.FC = () => {
  const { token, user } = useAuth();

  const passportConfig = useQuery(api.passports.getUserPassportConfig, token ? { token } : "skip");
  const updatePassportMutation = useMutation(api.passports.updatePassportConfig);

  const [isPublic, setIsPublic] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [visibleSections, setVisibleSections] = useState({
    skills: true,
    repositories: true,
    challenges: true,
    education: true,
    contact: false,
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (passportConfig) {
      setIsPublic(passportConfig.isPublic);
      setCustomSlug(passportConfig.customSlug || "");
      setVisibleSections(passportConfig.visibleSections);
    }
  }, [passportConfig]);

  const handleSaveConfig = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updatePassportMutation({
        token,
        isPublic,
        visibleSections,
        customSlug: customSlug.trim() || undefined,
      });
      alert("Passport sharing settings saved!");
    } catch (e: any) {
      alert("Error saving settings: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const shareIdentifier = customSlug || passportConfig?.shareToken || "demo";
  const shareUrl = `${window.location.origin}/p/${shareIdentifier}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-2">
          <Share2 className="w-3.5 h-3.5" />
          <span>Verifiable Identity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Proof Passport Portfolio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Create a shareable, privacy-first portfolio containing only your verified skills, repositories, and assessment badges. You decide what information is public.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Public Visibility Controls</span>
            </h3>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Public Link Access</span>
                <span className="text-[11px] text-slate-400">
                  {isPublic ? "Accessible to anyone with URL" : "Private / Inactive"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublic ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPublic ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Custom URL Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom URL Slug (Optional)
              </label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-800 bg-slate-950 text-slate-500 text-xs font-mono">
                  /p/
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="mathan-dev"
                  className="block w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-r-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* Section Toggles */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Visible Sections:
              </span>

              {[
                { key: "skills", label: "Verified Technical Skills" },
                { key: "repositories", label: "Public GitHub Repositories" },
                { key: "challenges", label: "Passed Challenge Badges" },
                { key: "education", label: "Education & Degree Info" },
                { key: "contact", label: "Direct Email Address" },
              ].map(({ key, label }) => {
                const checked = (visibleSections as any)[key];
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs cursor-pointer hover:border-slate-700"
                  >
                    <span className="text-slate-300">{label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setVisibleSections({ ...visibleSections, [key]: e.target.checked })
                      }
                      className="rounded border-slate-700 text-cyan-400 focus:ring-0 bg-slate-900"
                    />
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveConfig}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {saving ? "Saving..." : "Save Visibility Settings"}
            </button>
          </div>
        </div>

        {/* Share Link & Preview Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Share Link Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Public Share URL
            </h3>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-mono select-all focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Link" : "Copy Link"}</span>
              </button>
              <Link
                to={`/p/${shareIdentifier}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
              >
                <span>Open Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Attach this link in applications to let recruiters inspect your verified GitHub evidence and completed challenge results with 1-click.
            </p>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-slate-200">Security Guarantee</strong>
              <p>Your uploaded resume PDF files, uncompleted assessments, and personal notes are never exposed through this public URL.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
