import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ShieldCheck,
  GitBranch,
  Code2,
  FileText,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Search,
} from "lucide-react";
import { analyzePublicGitHubRepo } from "@/lib/githubAnalyzer";

export const SkillsProofPage: React.FC = () => {
  const { token } = useAuth();

  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const repositories = useQuery(api.repositories.listUserRepositories, token ? { token } : "skip");
  const addRepoMutation = useMutation(api.repositories.addRepositoryAndEvidence);
  const removeRepoMutation = useMutation(api.repositories.removeRepository);
  const updateClaimMutation = useMutation(api.skills.updateSkillClaim);

  // Filter state
  const [activeTab, setActiveTab] = useState<"all" | "challenge_assessed" | "evidence_found" | "claimed" | "evidence_insufficient">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // GitHub Modal state
  const [repoModalOpen, setRepoModalOpen] = useState(false);
  const [repoUrlInput, setRepoUrlInput] = useState("");
  const [analyzingRepo, setAnalyzingRepo] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  // Manual Claim Modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [newSkillClaim, setNewSkillClaim] = useState("");

  const handleAnalyzeGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !repoUrlInput.trim()) return;

    setAnalyzingRepo(true);
    setRepoError(null);

    try {
      const analyzed = await analyzePublicGitHubRepo(repoUrlInput.trim());

      await addRepoMutation({
        token,
        repoUrl: analyzed.repoUrl,
        repoName: analyzed.repoName,
        owner: analyzed.owner,
        description: analyzed.description,
        language: analyzed.language,
        languagesDistribution: analyzed.languagesDistribution,
        stars: analyzed.stars,
        forks: analyzed.forks,
        defaultBranch: analyzed.defaultBranch,
        topics: analyzed.topics,
        evidenceList: analyzed.evidenceList,
      });

      setRepoModalOpen(false);
      setRepoUrlInput("");
    } catch (err: any) {
      setRepoError(err.message || "Failed to analyze repository. Verify URL is public and valid.");
    } finally {
      setAnalyzingRepo(false);
    }
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newSkillClaim.trim()) return;

    try {
      await updateClaimMutation({
        token,
        skillName: newSkillClaim.trim(),
        status: "claimed",
      });
      setClaimModalOpen(false);
      setNewSkillClaim("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const evidenceList = evidenceSummary?.evidenceList || [];

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesTab = activeTab === "all" || item.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      item.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The Proof Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skill Proof Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Connecting resume claims, GitHub project artifacts, and practical challenge performance into an explainable verification matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRepoModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
          >
            <GitBranch className="w-4 h-4 text-cyan-300" />
            <span>Inspect GitHub Repo</span>
          </button>
          <button
            onClick={() => setClaimModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Claim Skill</span>
          </button>
        </div>
      </div>

      {/* Linked GitHub Repositories Banner */}
      {repositories && repositories.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connected Repositories ({repositories.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">Auto-scanned for technology artifacts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {repositories.map((repo) => (
              <div
                key={repo._id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="overflow-hidden">
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-white hover:text-cyan-400 flex items-center gap-1 truncate"
                  >
                    <span>{repo.owner}/{repo.repoName}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{repo.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2">
                    <span>{repo.language}</span>
                    <span>★ {repo.stars}</span>
                    <span>⑂ {repo.forks}</span>
                  </div>
                </div>

                <button
                  onClick={() => token && removeRepoMutation({ token, repositoryId: repo._id })}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                  title="Remove repository"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Skills ({evidenceList.length})
          </button>
          <button
            onClick={() => setActiveTab("challenge_assessed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "challenge_assessed"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Challenge Assessed ({evidenceSummary?.counts?.challengeAssessed || 0})
          </button>
          <button
            onClick={() => setActiveTab("evidence_found")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "evidence_found"
                ? "bg-blue-950 text-blue-300 border border-blue-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Evidence Found ({evidenceSummary?.counts?.evidenceFound || 0})
          </button>
          <button
            onClick={() => setActiveTab("claimed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "claimed"
                ? "bg-amber-950 text-amber-300 border border-amber-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Claimed Only ({evidenceSummary?.counts?.claimed || 0})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified skills..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Evidence Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidence.length > 0 ? (
          filteredEvidence.map((ev) => (
            <div
              key={ev._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{ev.skillName}</h3>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ev.status === "challenge_assessed"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : ev.status === "evidence_found"
                          ? "bg-blue-950 text-blue-300 border border-blue-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {ev.status === "challenge_assessed"
                        ? "Assessed"
                        : ev.status === "evidence_found"
                        ? "Evidence Found"
                        : "Claimed"}
                    </span>
                    <p className="text-xs font-extrabold text-white mt-1">
                      {ev.evidenceScore} <span className="text-[10px] font-normal text-slate-500">/100</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{ev.explanation}</p>

                {/* Supporting Code Citation */}
                {ev.filePath && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-cyan-400">
                      <span className="truncate">{ev.filePath}</span>
                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {ev.excerpt && (
                      <p className="text-[10px] text-slate-400 truncate">{ev.excerpt}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px] capitalize">Confidence: {ev.confidence}</span>
                {ev.status !== "challenge_assessed" && (
                  <Link
                    to="/challenges"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Take Challenge <Code2 className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Skills In This Category Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upload your resume or inspect a public GitHub repository to populate your verified Skill Proof matrix.
            </p>
          </div>
        )}
      </div>

      {/* GITHUB INSPECTION MODAL */}
      {repoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>Inspect Public GitHub Repository</span>
              </h3>
              <button
                onClick={() => setRepoModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ProofPath AI's GitHub analyzer inspects public language breakdown, README architectural descriptions, and configuration manifests to extract supporting proof.
            </p>

            {repoError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{repoError}</span>
              </div>
            )}

            <form onSubmit={handleAnalyzeGitHub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Public Repository URL
                </label>
                <input
                  type="url"
                  required
                  value={repoUrlInput}
                  onChange={(e) => setRepoUrlInput(e.target.value)}
                  placeholder="https://github.com/facebook/react"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRepoModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={analyzingRepo}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                >
                  {analyzingRepo ? "Analyzing Repo..." : "Analyze & Extract Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL CLAIM MODAL */}
      {claimModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Claim a Technical Skill</h3>
            <p className="text-xs text-slate-400">
              Claimed skills start at 35% base score until supported by GitHub code evidence or practical assessment.
            </p>

            <form onSubmit={handleAddClaim} className="space-y-4">
              <input
                type="text"
                required
                value={newSkillClaim}
                onChange={(e) => setNewSkillClaim(e.target.value)}
                placeholder="e.g. Docker, Rust, Kubernetes"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Save Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
