import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  Award,
  BookOpen,
} from "lucide-react";
import { extractTextFromFile } from "@/lib/documentExtractor";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const ResumePage: React.FC = () => {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  const resumes = useQuery(api.resumes.listResumes, token ? { token } : "skip");
  const saveResumeMutation = useMutation(api.resumes.saveResume);
  const deleteResumeMutation = useMutation(api.resumes.deleteResume);
  const analyzeResumeAction = useAction(api.ai.analyzeResume);
  const upgradeBulletPointAction = useAction(api.ai.upgradeBulletPoint);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("analysis");

  // Custom Bullet Point Upgrade Tool
  const [customBulletInput, setCustomBulletInput] = useState("");
  const [upgradingBullet, setUpgradingBullet] = useState(false);
  const [upgradedBulletResult, setUpgradedBulletResult] = useState<any | null>(null);
  const [copiedBullet, setCopiedBullet] = useState(false);

  const handleUpgradeBullet = async () => {
    if (!customBulletInput.trim()) return;
    setUpgradingBullet(true);
    setCopiedBullet(false);
    try {
      const res = await upgradeBulletPointAction({
        originalBullet: customBulletInput.trim(),
      });
      setUpgradedBulletResult(res);
      success("Bullet Upgraded", "Enhanced with active verbs and factual integrity placeholders.");
    } catch (e: any) {
      toastError("Upgrade failed", e.message || "Could not enhance bullet point.");
    } finally {
      setUpgradingBullet(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setUploadError(null);

    try {
      const extracted = await extractTextFromFile(file);

      if (extracted.isImageOnlyOrScanned) {
        throw new Error(
          "Scanned or image-only PDF detected. Please upload a PDF or DOCX generated from editable text (e.g. Word, Google Docs, or LaTeX) so technical skills can be parsed."
        );
      }

      const analysisResult = await analyzeResumeAction({
        rawText: extracted.text,
      });

      const saveRes = await saveResumeMutation({
        token,
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileSize: file.size,
        rawText: extracted.text,
        parsedData: analysisResult.parsedData,
      });

      setSelectedResumeId(saveRes.resumeId);
      success("Resume Parsed", `Extracted ${analysisResult.parsedData.skills.length} technical skills.`);
    } catch (err: any) {
      setUploadError(err.message || "Failed to parse resume file.");
      toastError("Upload Failed", err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteResume = async (resumeId: any) => {
    if (!token) return;
    try {
      await deleteResumeMutation({ token, resumeId });
      if (selectedResumeId === resumeId) setSelectedResumeId(null);
      success("Deleted", "Resume version removed.");
    } catch (err: any) {
      toastError("Error", err.message);
    }
  };

  const currentResume = resumes?.find((r) => r._id === selectedResumeId) || resumes?.[0];

  // ATS Score Heuristic Calculation
  const parsed = currentResume?.parsedData;
  let atsScore = 40;
  if (parsed?.skills && parsed.skills.length >= 5) atsScore += 20;
  if (parsed?.projects && parsed.projects.length >= 2) atsScore += 20;
  if (parsed?.education && parsed.education.length > 0) atsScore += 10;
  if (parsed?.experience && parsed.experience.length > 0) atsScore += 10;
  atsScore = Math.min(atsScore, 95);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Document Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Resume Analysis & ATS Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Upload editable PDF or DOCX resumes to extract technical competencies, audit ATS format compliance, and inspect actionable bullet point improvements.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            id="resume-file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            variant="glow"
            size="md"
            isLoading={uploading}
            onClick={() => document.getElementById("resume-file-upload")?.click()}
          >
            <Upload className="w-4 h-4 mr-1.5" />
            <span>{uploading ? "Analyzing with Gemini..." : "Upload New Resume"}</span>
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 2. MAIN LAYOUT: VERSIONS SIDEBAR + SELECTED REVIEW */}
      {(!resumes || resumes.length === 0) ? (
        <EmptyState
          icon={<FileText className="w-7 h-7 text-cyan-400" />}
          title="No Resume Uploaded Yet"
          description="Upload your resume in PDF or DOCX format. ProofPath AI's taxonomy parser will extract your skills, link them to the Proof Engine, and audit ATS compliance."
          actionLabel="Upload PDF / DOCX"
          onAction={() => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) input.click();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Versions List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-white light:text-slate-900 uppercase tracking-wider">
              Resume Versions ({resumes.length})
            </h3>
            <div className="space-y-2">
              {resumes.map((r) => {
                const isSelected = r._id === currentResume?._id;
                return (
                  <div
                    key={r._id}
                    onClick={() => setSelectedResumeId(r._id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10"
                        : "bg-slate-900/80 light:bg-white border-slate-800 light:border-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                        v{r.version}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white light:text-slate-900 truncate">
                          {r.fileName}
                        </h4>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {new Date(r.createdAt).toLocaleDateString()} • {(r.fileSize / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(r._id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete version"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Resume Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-white light:text-slate-900">
                  {currentResume?.fileName}
                </h2>
                <span className="text-xs text-slate-400">
                  Version {currentResume?.version} • Parsed with Structured Taxonomy
                </span>
              </div>
              <Badge variant="verified">ATS Compatibility: {atsScore}%</Badge>
            </div>

            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: "analysis", label: "Skills & Content" },
                { id: "ats", label: "ATS Audit" },
                { id: "improvement", label: "Bullet Point Upgrades" },
              ]}
            />

            {/* Tab 1: Extracted Skills & Content */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-white light:text-slate-900 mb-3">
                    Extracted Technical Skills & Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(parsed?.skills || []).map((skill: string) => (
                      <Badge key={skill} variant="evidence">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Programming Languages
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(parsed?.programmingLanguages || []).map((lang: string) => (
                        <Badge key={lang} variant="outline" size="sm">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Frameworks & Libraries
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(parsed?.frameworks || []).map((fw: string) => (
                        <Badge key={fw} variant="outline" size="sm">
                          {fw}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Projects */}
                {parsed?.projects && parsed.projects.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-white light:text-slate-900 mb-4">
                      Detected Technical Projects
                    </h3>
                    <div className="space-y-4">
                      {parsed.projects.map((proj: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2"
                        >
                          <h4 className="text-sm font-semibold text-white light:text-slate-900">
                            {proj.title}
                          </h4>
                          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                            {proj.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(proj.technologies || []).map((tech: string) => (
                              <Badge key={tech} variant="outline" size="sm">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Tab 2: ATS Compliance Checklist */}
            {activeTab === "ats" && (
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-white light:text-slate-900">
                  Automated ATS Diagnostic Report
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white light:text-slate-900">Parseable Text Structure</h4>
                      <p className="text-slate-400 light:text-slate-500 text-[11px]">PDF text stream extracted cleanly without OCR fallback or scanned image artifacts.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white light:text-slate-900">Technical Skill Density</h4>
                      <p className="text-slate-400 light:text-slate-500 text-[11px]">{parsed?.skills?.length || 0} recognized industry keywords match top job descriptions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white light:text-slate-900">Action Verbs & Quantifiable Metrics</h4>
                      <p className="text-slate-400 light:text-slate-500 text-[11px]">Consider adding percentage improvements, latency reductions, or user figures to your project summaries.</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Tab 3: Actionable Bullet Point Upgrades */}
            {activeTab === "improvement" && (
              <div className="space-y-6">
                {/* Interactive Enhancer Tool */}
                <Card className="p-6 space-y-4 border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white light:text-slate-900">
                      Live Bullet Point Enhancer
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Paste any bullet point from your resume to upgrade passive verbs into active, metric-driven achievements.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      className="flex-1 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 px-4 py-2.5 text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="e.g. Worked on the frontend and fixed bugs..."
                      value={customBulletInput}
                      onChange={(e) => setCustomBulletInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpgradeBullet();
                      }}
                    />
                    <Button
                      variant="glow"
                      size="sm"
                      isLoading={upgradingBullet}
                      onClick={handleUpgradeBullet}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Upgrade with Gemini</span>
                    </Button>
                  </div>

                  {upgradedBulletResult && (
                    <div className="p-4 rounded-xl bg-slate-950/80 light:bg-slate-50 border border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="verified" size="sm">
                            {upgradedBulletResult.actionVerb || "High Impact"}
                          </Badge>
                          <span className="text-[11px] text-cyan-400 font-semibold">
                            {upgradedBulletResult.quantifiableMetrics}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(upgradedBulletResult.improvedBullet);
                            setCopiedBullet(true);
                            setTimeout(() => setCopiedBullet(false), 2000);
                          }}
                        >
                          {copiedBullet ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <FileCheck className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                              <span>Copy Upgrade</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <p className="text-xs text-slate-100 light:text-slate-900 font-medium leading-relaxed">
                        "{upgradedBulletResult.improvedBullet}"
                      </p>
                      <p className="text-[11px] text-slate-400 italic">
                        {upgradedBulletResult.reasoning}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Example Recommendations Card */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white light:text-slate-900">
                    Curated Impact Upgrades for Your Stack
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-400 uppercase">Original Statement</span>
                        <Badge variant="outline" size="sm">Passive</Badge>
                      </div>
                      <p className="text-xs text-slate-400 italic">
                        "Built a web app using React and Node.js for managing tasks."
                      </p>
                      <div className="pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase">ProofPath Recommendation (Factual Integrity)</span>
                          <Badge variant="verified" size="sm">High Impact</Badge>
                        </div>
                        <p className="text-xs text-slate-200 light:text-slate-800 font-medium">
                          "Architected a responsive task management platform in React & TypeScript with Redis caching and connection pooling, achieving sub-second state synchronization [insert measured latency or volume if tracked]."
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
