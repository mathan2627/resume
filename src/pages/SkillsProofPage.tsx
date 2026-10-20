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
  Star,
  Layers,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { analyzePublicGitHubRepo } from "@/lib/githubAnalyzer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const SkillsProofPage: React.FC = () => {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const repositories = useQuery(api.repositories.listUserRepositories, token ? { token } : "skip");
  const addRepoMutation = useMutation(api.repositories.addRepositoryAndEvidence);
  const removeRepoMutation = useMutation(api.repositories.removeRepository);
  const updateClaimMutation = useMutation(api.skills.updateSkillClaim);

  // Filter state
  const [activeTab, setActiveTab] = useState<string>("all");
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

      success("Repository Scanned", `Extracted authentic code evidence from ${analyzed.repoName}.`);
      setRepoModalOpen(false);
      setRepoUrlInput("");
    } catch (err: any) {
      setRepoError(err.message || "Failed to analyze repository. Verify URL is public and valid.");
      toastError("Analysis Failed", err.message);
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
      success("Skill Claimed", `Added ${newSkillClaim.trim()} to your claimed skills.`);
      setClaimModalOpen(false);
      setNewSkillClaim("");
    } catch (err: any) {
      toastError("Error", err.message);
    }
  };

  const handleRemoveRepo = async (repoId: any) => {
    if (!token) return;
    try {
      await removeRepoMutation({ token, repositoryId: repoId });
      success("Repository Removed", "Unlinked repository and associated evidence.");
    } catch (err: any) {
      toastError("Error", err.message);
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

  const getStatusBadge = (status: string, score: number) => {
    switch (status) {
      case "challenge_assessed":
        return <Badge variant="challenge">Assessed ({score}%)</Badge>;
      case "evidence_found":
        return <Badge variant="evidence">Project Evidence ({score}%)</Badge>;
      case "claimed":
        return <Badge variant="claim">Claimed (Unverified)</Badge>;
      case "evidence_insufficient":
        return <Badge variant="warning">Evidence Insufficient</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verification Index</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Skill Proof Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Convert self-declared resume claims into verifiable evidence backed by public GitHub repositories and timed adaptive assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => setClaimModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Claim Skill</span>
          </Button>
          <Button variant="glow" size="sm" onClick={() => setRepoModalOpen(true)}>
            <GitBranch className="w-4 h-4 mr-1 text-cyan-400" />
            <span>Link GitHub Repo</span>
          </Button>
        </div>
      </div>

      {/* 2. REPOSITORIES CAROUSEL / GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Linked Public GitHub Repositories</span>
          </h2>
          <span className="text-xs text-slate-400">
            {repositories?.length || 0} repositories analyzed
          </span>
        </div>

        {(!repositories || repositories.length === 0) ? (
          <EmptyState
            icon={<GitBranch className="w-6 h-6 text-emerald-400" />}
            title="No GitHub Repositories Linked"
            description="Link your public GitHub projects to automatically extract code evidence, language distributions, and commit proofs."
            actionLabel="Link First Repository"
            onAction={() => setRepoModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.map((repo) => (
              <Card key={repo._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <a
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-white light:text-slate-900 hover:text-cyan-400 flex items-center gap-1.5 truncate"
                    >
                      <span className="truncate">{repo.repoName}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    </a>
                    <button
                      onClick={() => handleRemoveRepo(repo._id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Unlink repository"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 light:text-slate-500 line-clamp-2 mb-3">
                    {repo.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars}
                    </span>
                    <Badge variant="outline" size="sm">
                      {repo.language || "Multi-language"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Last scanned: {new Date(repo.lastAnalyzedAt).toLocaleDateString()}</span>
                  <Badge variant="verified" size="sm">AST Verified</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. SKILL EVIDENCE EXPLORER */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08] light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
              Technical Skill Evidence Inventory
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Filter by verification status to inspect excerpts and pass adaptive challenges.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search verified skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Tab Filters */}
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "all", label: "All Skills", badge: evidenceList.length },
            { id: "challenge_assessed", label: "Assessed", badge: evidenceSummary?.counts?.challengeAssessed || 0 },
            { id: "evidence_found", label: "Project Proven", badge: evidenceSummary?.counts?.evidenceFound || 0 },
            { id: "claimed", label: "Claimed Only", badge: evidenceSummary?.counts?.claimed || 0 },
            { id: "evidence_insufficient", label: "Gaps", badge: evidenceSummary?.counts?.insufficient || 0 },
          ]}
        />

        {/* Evidence List */}
        {filteredEvidence.length === 0 ? (
          <EmptyState
            title="No Skills in this Category"
            description="Upload your resume or link a GitHub repository to automatically populate your Skill Proof Engine."
            actionLabel="Add Skill Claim"
            onAction={() => setClaimModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {filteredEvidence.map((ev) => (
              <Card key={ev._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white light:text-slate-900 truncate">
                      {ev.skillName}
                    </h3>
                    {getStatusBadge(ev.status, ev.evidenceScore)}
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      Confidence: <strong className="text-slate-300 light:text-slate-700 uppercase">{ev.confidence}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                    {ev.explanation}
                  </p>

                  {ev.excerpt && (
                    <div className="p-2.5 rounded-lg bg-slate-950 light:bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px] truncate">
                      <Terminal className="w-3 h-3 text-cyan-400 inline mr-1.5" />
                      {ev.excerpt}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ev.status !== "challenge_assessed" && (
                    <Link to="/challenges">
                      <Button variant="primary" size="sm">
                        <Code2 className="w-3.5 h-3.5 mr-1" />
                        <span>Prove with Challenge</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL: LINK GITHUB REPOSITORY */}
      <Modal
        isOpen={repoModalOpen}
        onClose={() => setRepoModalOpen(false)}
        title="Link Public GitHub Repository"
        description="Enter the URL of any public GitHub project to analyze source files, commit history, and AST architecture."
        maxWidth="md"
      >
        <form onSubmit={handleAnalyzeGitHub} className="space-y-4">
          <Input
            label="Public GitHub Repository URL"
            placeholder="https://github.com/username/project"
            value={repoUrlInput}
            onChange={(e) => setRepoUrlInput(e.target.value)}
            required
            error={repoError || undefined}
            helperText="Repository must be public and contain genuine code files."
          />

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setRepoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" type="submit" isLoading={analyzingRepo}>
              <GitBranch className="w-4 h-4 mr-1 text-cyan-400" />
              <span>Scan & Verify Evidence</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. MODAL: CLAIM SKILL */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Add Skill Claim"
        description="Add a technical skill to your profile inventory. You can subsequently prove it with repository code or a timed assessment."
        maxWidth="sm"
      >
        <form onSubmit={handleAddClaim} className="space-y-4">
          <Input
            label="Skill Name"
            placeholder="e.g. React, PostgreSQL, Docker, Go"
            value={newSkillClaim}
            onChange={(e) => setNewSkillClaim(e.target.value)}
            required
          />

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setClaimModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              <span>Save Claim</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
