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
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export const ProofPassportPage: React.FC = () => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();

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
      success("Settings Saved", "Proof Passport privacy controls updated.");
    } catch (e: any) {
      toastError("Error saving settings", e.message);
    } finally {
      setSaving(false);
    }
  };

  const shareIdentifier = customSlug || passportConfig?.shareToken || "demo";
  const shareUrl = `${window.location.origin}/p/${shareIdentifier}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    success("Link Copied", "Proof Passport public URL copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verifiable Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Proof Passport Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Create a shareable, privacy-first portfolio containing only your verified skills, repositories, and assessment badges. You decide what information is public.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isPublic ? "verified" : "warning"}>
            {isPublic ? "Public Access Enabled" : "Private / Draft Mode"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Public Visibility Controls</span>
            </h3>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
              <div>
                <span className="text-xs font-bold text-white light:text-slate-900 block">
                  Public Link Access
                </span>
                <span className="text-[11px] text-slate-400 light:text-slate-500 block">
                  Allow recruiters to view your verified passport.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Custom Slug Input */}
            <Input
              label="Vanity URL Slug"
              placeholder="e.g. your-name"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              helperText="Share url: proofpath.ai/p/[slug]"
            />

            {/* Section Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80 light:border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Visible Passport Sections
              </span>

              {[
                { key: "skills", label: "Verified Skill Index" },
                { key: "repositories", label: "Public GitHub Repositories" },
                { key: "challenges", label: "Adaptive Challenge Badges" },
                { key: "education", label: "Education & Degree Info" },
                { key: "contact", label: "Direct Recruiter Contact Info" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 text-xs text-slate-300 light:text-slate-700 cursor-pointer"
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(visibleSections as any)[item.key]}
                    onChange={(e) =>
                      setVisibleSections({
                        ...visibleSections,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <Button
              variant="glow"
              size="md"
              className="w-full"
              isLoading={saving}
              onClick={handleSaveConfig}
            >
              <span>Save Privacy Settings</span>
            </Button>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Public Share Link
                </span>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-sm">
                  {shareUrl}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400 mr-1" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1 text-cyan-400" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </Button>

                <a
                  href={`/p/${shareIdentifier}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="primary" size="sm">
                    <span>Open Preview</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Visual Mini Passport Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-6 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {user?.name || "Candidate Name"}
                    </h3>
                    <p className="text-xs text-slate-400">Verified Candidate Passport</p>
                  </div>
                </div>
                <Badge variant="verified">ProofPath Verified</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Status</span>
                  <span className="text-xs font-bold text-emerald-400">Evidence Verified</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Audit Level</span>
                  <span className="text-xs font-bold text-cyan-400">AST + Challenge</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Views</span>
                  <span className="text-xs font-bold text-purple-400">{passportConfig?.viewsCount || 0}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                This public passport will render according to your active privacy toggles on the left.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
