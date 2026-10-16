import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export const AdminImportPage: React.FC = () => {
  const { token, user } = useAuth();
  const importCsvMutation = useMutation(api.admin.importListingsCsv);

  const [csvText, setCsvText] = useState(`companyName,roleTitle,description,requiredSkills,location,remoteStatus,stipend,applicationDeadline,originalUrl,sourceName
Adobe,Software Engineer Intern (Creative Cloud),Build desktop and web services using C++ and WebAssembly.,"C++, JavaScript, WebAssembly",Bengaluru,hybrid,"INR 1,00,000 / mo",2026-12-31,https://adobe.com/careers,Adobe College Careers
Atlassian,Site Reliability Engineering Intern,Scale Jira and Confluence cloud backends on AWS.,"Go, Python, Docker, Kubernetes, AWS",Remote,remote,"INR 85,000 / mo",2026-11-30,https://atlassian.com/company/careers,Atlassian University Feed
GitHub,Full Stack Intern (Developer Tools),Contribute to GitHub Codespaces and GitHub Actions.,"TypeScript, React, Ruby, Docker",Remote,remote,"$42 / hr",2026-12-15,https://github.com/about/careers,GitHub Careers`);

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-xs text-red-400">Admin privileges required.</div>;
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

      const headers = lines[0].split(",").map((h) => h.trim());
      const parsedListings: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV regex to handle commas inside quotes
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
    } catch (err: any) {
      setError(err.message || "Failed to parse and import CSV data.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/60 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-red-400" />
            <span>Data Ingestion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bulk CSV Internship Ingestion
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Ingest structured listings from verified external partners, campus placement drives, and official feeds with automatic duplicate suppression.
          </p>
        </div>

        <Link
          to="/admin"
          className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
        >
          Back to Admin Overview
        </Link>
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white">Ingestion Completed Successfully</h4>
            <p className="mt-0.5">
              Processed: {result.processed} listings • Added: <strong>{result.added}</strong> new • Skipped: <strong>{result.duplicates}</strong> existing duplicates.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Import Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">CSV Data Stream</h3>
        <p className="text-xs text-slate-400">
          Paste comma-separated listings below. Columns: <code className="text-cyan-400">companyName, roleTitle, description, requiredSkills, location, remoteStatus, stipend, applicationDeadline, originalUrl, sourceName</code>
        </p>

        <form onSubmit={handleImport} className="space-y-4">
          <textarea
            rows={10}
            required
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={importing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {importing ? "Processing..." : "Run Ingestion Batch"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
