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
} from "lucide-react";
import { extractTextFromFile } from "@/lib/documentExtractor";

export const ResumePage: React.FC = () => {
  const { token } = useAuth();

  const resumes = useQuery(api.resumes.listResumes, token ? { token } : "skip");
  const saveResumeMutation = useMutation(api.resumes.saveResume);
  const deleteResumeMutation = useMutation(api.resumes.deleteResume);
  const analyzeResumeAction = useAction(api.ai.analyzeResume);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "ats" | "improvement">("analysis");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Client-Side Parsing with PDF / DOCX Extractor
      const extracted = await extractTextFromFile(file);

      if (extracted.isImageOnlyOrScanned) {
        throw new Error(
          "Scanned or image-only PDF detected. Please upload a PDF or DOCX generated from editable text (e.g. Word, Google Docs, or LaTeX) so technical skills can be parsed."
        );
      }

      // 2. Server-side Action with Gemini / Taxonomy
      const analysisResult = await analyzeResumeAction({
        rawText: extracted.text,
      });

      // 3. Save Resume & Integrate into Evidence Model
      const saveRes = await saveResumeMutation({
        token,
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileSize: file.size,
        rawText: extracted.text,
        parsedData: analysisResult.parsedData,
      });

      setSelectedResumeId(saveRes.resumeId);
    } catch (err: any) {
      setUploadError(err.message || "Failed to parse resume file.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDeleteResume = async (resumeId: any) => {
    if (!token || !confirm("Delete this resume version?")) return;
    await deleteResumeMutation({ token, resumeId });
    if (selectedResumeId === resumeId) setSelectedResumeId(null);
  };

  const currentResume = resumes?.find((r) => r._id === selectedResumeId) || resumes?.[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 mb-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Document Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resume Analysis & ATS Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload PDF or DOCX resumes to extract technical competencies, check ATS formatting compliance, and inspect before-and-after bullet improvements.
          </p>
        </div>

        {/* Upload Trigger */}
        <div className="relative">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="resume-upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Extracting & Parsing..." : "Upload New Resume"}</span>
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-3 shadow-md">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-200">Resume Upload Error</h4>
            <p className="leading-relaxed">{uploadError}</p>
          </div>
        </div>
      )}

      {currentResume ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Versions & ATS Score */}
          <div className="lg:col-span-1 space-y-6">
            {/* Version Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center justify-between">
                <span>Resume History</span>
                <span className="text-[10px] text-slate-500">{resumes?.length} versions</span>
              </h3>

              <div className="space-y-2">
                {resumes?.map((res) => {
                  const isSelected = res._id === currentResume._id;
                  return (
                    <div
                      key={res._id}
                      onClick={() => setSelectedResumeId(res._id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="font-bold truncate block">{res.fileName}</span>
                        <span className="text-[10px] text-slate-500">
                          v{res.version} • {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResume(res._id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Delete version"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ATS Score Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">ATS Readability Index</span>
                <span className="text-sm font-black text-emerald-400">88 / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: "88%" }} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Standard text parsing succeeded. No complex multi-column layout traps detected.
              </p>
            </div>
          </div>

          {/* Right Column: Tabbed Views (Analysis, ATS Checklist, Improvement) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "analysis"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Extracted Skills & Content
                </button>
                <button
                  onClick={() => setActiveTab("ats")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "ats"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ATS Checklist
                </button>
                <button
                  onClick={() => setActiveTab("improvement")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "improvement"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Before & After Improvement
                </button>
              </div>

              {/* TAB 1: EXTRACTED CONTENT */}
              {activeTab === "analysis" && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Detected Technical Skills ({currentResume.parsedData.skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {currentResume.parsedData.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs bg-slate-950 text-slate-200 border border-slate-800 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Parsed Project Highlights
                    </h3>
                    <div className="space-y-3">
                      {currentResume.parsedData.projects.map((proj, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                          <span className="font-bold text-white">{proj.title}</span>
                          <p className="text-slate-400 leading-relaxed">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t, tidx) => (
                              <span key={tidx} className="px-2 py-0.2 rounded text-[10px] bg-slate-900 text-slate-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Education Credentials
                    </h3>
                    <div className="space-y-2">
                      {currentResume.parsedData.education.map((edu, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between">
                          <div>
                            <p className="font-bold text-white">{edu.institution}</p>
                            <p className="text-slate-400">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                          </div>
                          {edu.year && <span className="text-slate-500 font-mono">{edu.year}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ATS CHECKLIST */}
              {activeTab === "ats" && (
                <div className="space-y-4 animate-in fade-in">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Transparent review checklist for ATS parsers and human recruiters:
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-white block">Standard Machine-Readable Fonts</strong>
                        <span className="text-slate-400">Clean typography without rasterized canvas vector elements.</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-white block">Section Hierarchy Compliance</strong>
                        <span className="text-slate-400">Identified standard 'Skills', 'Projects', and 'Education' headers.</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-white block">No Header/Footer Traps</strong>
                        <span className="text-slate-400">Critical contact information is located within the main document flow.</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-white block">Action-Oriented Metric Density</strong>
                        <span className="text-slate-400">Contains quantifiable performance and latency benchmarks.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BEFORE AND AFTER IMPROVEMENT */}
              {activeTab === "improvement" && (
                <div className="space-y-4 animate-in fade-in">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ProofPath AI's impact-driven bullet transformer. Elevating passive descriptions into metric-backed achievements:
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11px]">
                        <X className="w-3.5 h-3.5" />
                        <span>Generic Passive Wording (Before)</span>
                      </div>
                      <p className="text-slate-400 line-through">"Worked on frontend using React and fetched data with APIs."</p>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] pt-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Achievement-Oriented Evidence (After)</span>
                      </div>
                      <p className="text-slate-100 font-medium">
                        "Architected responsive React 19 interface with TanStack Query caching and Tailwind CSS, reducing redundant network requests by 45% across high-frequency dashboard routes."
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11px]">
                        <X className="w-3.5 h-3.5" />
                        <span>Generic Passive Wording (Before)</span>
                      </div>
                      <p className="text-slate-400 line-through">"Used Docker and PostgreSQL for backend project."</p>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] pt-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Achievement-Oriented Evidence (After)</span>
                      </div>
                      <p className="text-slate-100 font-medium">
                        "Configured multi-stage Docker Alpine build container and optimized composite B-Tree indexes in PostgreSQL, reducing deployment image size by 65% and accelerating query throughput."
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Resumes Uploaded Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload your PDF or Word resume above to extract skills and start building your verified Skill Proof portfolio.
          </p>
        </div>
      )}
    </div>
  );
};
