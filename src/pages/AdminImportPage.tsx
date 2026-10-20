import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export const AdminImportPage: React.FC = () => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();
  const importCsvMutation = useMutation(api.admin.importListingsCsv);

  const [csvText, setCsvText] = useState(`companyName,roleTitle,description,requiredSkills,location,remoteStatus,stipend,applicationDeadline,originalUrl,sourceName
Adobe,Software Engineer Intern (Creative Cloud),Build desktop and web services using C++ and WebAssembly.,"C++, JavaScript, WebAssembly",Bengaluru,hybrid,"INR 1,00,000 / mo",2026-12-31,https://adobe.com/careers,Adobe College Careers
Atlassian,Site Reliability Engineering Intern,Scale Jira and Confluence cloud backends on AWS.,"Go, Python, Docker, Kubernetes, AWS",Remote,remote,"INR 85,000 / mo",2026-11-30,https://atlassian.com/company/careers,Atlassian University Feed
GitHub,Full Stack Intern (Developer Tools),Contribute to GitHub Codespaces and GitHub Actions.,"TypeScript, React, Ruby, Docker",Remote,remote,"$42 / hr",2026-12-15,https://github.com/about/careers,GitHub Careers`);

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-xs text-rose-400">Admin privileges required.</div>;
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const lines = csvText.trim().split("\n");
      if (lines.length <= 1) {
        throw new Error("CSV contains no rows to import.");
      }

      const parsedListings: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values: string[] = [];
        let inQuote = false;
        let curVal = "";
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === "," && !inQuote) {
            values.push(curVal.trim());
            curVal = "";
          } else {
            curVal += char;
          }
        }
        values.push(curVal.trim());

        if (values.length >= 6) {
          const skills = (values[3] || "General")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          parsedListings.push({
            companyName: values[0] || "Company",
            roleTitle: values[1] || "Intern",
            description: values[2] || "Internship position",
            requiredSkills: skills,
            location: values[4] || "Remote",
            remoteStatus: (values[5] as any) || "remote",
            stipend: values[6] || undefined,
            applicationDeadline: values[7] || undefined,
            originalUrl: values[8] || "https://careers.google.com",
            sourceName: values[9] || "CSV Import",
          });
        }
      }

      const res = await importCsvMutation({
        token,
        listings: parsedListings,
      });
      setResult(res);
      success("Import Finished", `Added ${res.added} new listings; skipped ${res.duplicates} duplicates.`);
    } catch (err: any) {
      setError(err.message || "Failed to parse and import CSV data.");
      toastError("Import Error", err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/30 text-rose-300 light:bg-rose-50 light:text-rose-700 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk Ingestion Adapter</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            CSV Ingestion & Duplicate Deduplication
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Import bulk listings directly via standard CSV format with automatic duplicate detection, skill taxonomy normalization, and audit logging.
          </p>
        </div>

        <Link to="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Console</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <Card className="p-5 bg-emerald-950/20 border-emerald-500/40 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white light:text-slate-900">
              CSV Ingestion Complete
            </h3>
          </div>
          <p className="text-xs text-emerald-300">
            Successfully imported <strong className="text-white">{result.added}</strong> new listings. Skipped{" "}
            <strong className="text-white">{result.duplicates}</strong> existing duplicate records.
          </p>
        </Card>
      )}

      {/* 2. CSV INPUT FORM */}
      <Card className="p-6 sm:p-8 space-y-4">
        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider block">
              Raw CSV Records
            </label>
            <textarea
              rows={12}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Headers required: companyName, roleTitle, description, requiredSkills, location, remoteStatus
            </span>
            <Button variant="glow" size="md" type="submit" isLoading={importing}>
              <Upload className="w-4 h-4 mr-1.5" />
              <span>Import & Deduplicate</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
