import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Globe,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  Target,
  Code2,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const InternshipsPage: React.FC = () => {
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState("all");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [freshnessFilter, setFreshnessFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [savingPipeline, setSavingPipeline] = useState(false);

  const internships = useQuery(api.internships.listInternships, {
    search: search || undefined,
    skill: skillFilter || undefined,
    country: countryFilter !== "all" ? countryFilter : undefined,
    remoteStatus: remoteFilter !== "all" ? remoteFilter : undefined,
    employmentType: employmentFilter !== "all" ? employmentFilter : undefined,
    verificationStatus: verificationFilter !== "all" ? verificationFilter : undefined,
    freshness: freshnessFilter !== "all" ? freshnessFilter : undefined,
    sortBy: sortBy || undefined,
  });

  const savedListings = useQuery(api.internships.listSavedInternships, token ? { token } : "skip");
  const saveMutation = useMutation(api.internships.saveInternship);
  const unsaveMutation = useMutation(api.internships.unsaveInternship);
  const userMatches = useQuery(api.matching.getUserMatches, token ? { token } : "skip");
  const createApplicationMutation = useMutation(api.applications.createApplication);

  // Map match score by internship ID
  const matchMap = useMemo(() => {
    const map = new Map<string, any>();
    if (userMatches) {
      for (const m of userMatches) {
        if (m.internship?._id) {
          map.set(m.internship._id, m);
        }
      }
    }
    return map;
  }, [userMatches]);

  // Cover Letter Generator State
  const userProfile = useQuery(api.profiles.getProfile, token ? { token } : "skip");
  const generateCoverLetterAction = useAction(api.ai.generateCoverLetter);
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [coverLetterTone, setCoverLetterTone] = useState("Professional & Evidence-Grounded");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  const handleOpenCoverLetter = (listing: any) => {
    setSelectedInternship(listing);
    setGeneratedCoverLetter("");
    setCoverLetterModalOpen(true);
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedInternship) return;
    setGeneratingCoverLetter(true);
    setCopiedCoverLetter(false);

    try {
      const skills = userProfile?.profile?.technicalSkills || selectedInternship.requiredSkills?.slice(0, 4) || ["Web Development", "TypeScript"];
      const result = await generateCoverLetterAction({
        companyName: selectedInternship.companyName,
        roleTitle: selectedInternship.roleTitle,
        candidateSkills: skills,
        tone: coverLetterTone,
      });

      setGeneratedCoverLetter(result || "");
      success("Cover Letter Generated", "AI has drafted a tailored, evidence-backed cover letter.");
    } catch (err: any) {
      toastError("Generation Failed", err?.message || "Could not generate cover letter. Try again.");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleCopyCoverLetter = () => {
    if (!generatedCoverLetter) return;
    navigator.clipboard.writeText(generatedCoverLetter);
    setCopiedCoverLetter(true);
    success("Copied to Clipboard", "Cover letter content copied successfully.");
    setTimeout(() => setCopiedCoverLetter(false), 2500);
  };

  // Check saved set
  const savedIds = useMemo(() => {
    const set = new Set<string>();
    if (savedListings) {
      for (const s of savedListings) {
        if (s.internship?._id) set.add(s.internship._id);
      }
    }
    return set;
  }, [savedListings]);

  const handleToggleSave = async (internshipId: any) => {
    if (!token) {
      toastError("Sign in required", "Please sign in to save opportunities.");
      return;
    }
    try {
      if (savedIds.has(internshipId)) {
        await unsaveMutation({ token, internshipId });
        success("Removed", "Removed from saved opportunities.");
      } else {
        await saveMutation({ token, internshipId });
        success("Saved", "Opportunity added to your bookmarks.");
      }
    } catch (e: any) {
      toastError("Error saving", e.message);
    }
  };

  const handleAddToPipeline = async (internshipId: any, status: any) => {
    if (!token) return;
    setSavingPipeline(true);
    try {
      await createApplicationMutation({
        token,
        internshipId,
        status,
      });
      success("Added to Pipeline", `Tracked as '${status}' in your Application Tracker.`);
    } catch (e: any) {
      toastError("Pipeline Error", e.message);
    } finally {
      setSavingPipeline(false);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSkillFilter("");
    setCountryFilter("all");
    setRemoteFilter("all");
    setEmploymentFilter("all");
    setVerificationFilter("all");
    setFreshnessFilter("all");
    setSortBy("date");
  };

  const activeFiltersCount = [
    search ? 1 : 0,
    skillFilter ? 1 : 0,
    countryFilter !== "all" ? 1 : 0,
    remoteFilter !== "all" ? 1 : 0,
    employmentFilter !== "all" ? 1 : 0,
    verificationFilter !== "all" ? 1 : 0,
    freshnessFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Automated Global Ingestion Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Opportunity Intelligence Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Continuously discovering internships and developer vacancies from Greenhouse, Lever, and official employer feeds. Genuine source links preserved.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="verified">
            {internships ? `${internships.length} Listings Available` : "Syncing Feed..."}
          </Badge>
        </div>
      </div>

      {/* 2. SEARCH & ADVANCED FILTERS BAR */}
      <Card className="p-5 bg-slate-900/90 light:bg-white border-slate-800 light:border-slate-200 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Keyword Search */}
          <Input
            placeholder="Search role, company, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          {/* Skill Filter */}
          <Input
            placeholder="Filter by skill (e.g. React, Go)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            leftIcon={<Code2 className="w-4 h-4 text-cyan-400" />}
          />

          {/* Remote / Workplace */}
          <Select
            value={remoteFilter}
            onChange={(e) => setRemoteFilter(e.target.value)}
          >
            <option value="all">Workplace: All Modes</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site Only</option>
          </Select>

          {/* Sort By */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort: Most Recently Verified</option>
            <option value="deadline">Sort: Application Deadline</option>
          </Select>
        </div>

        {/* Secondary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 light:border-slate-100">
          <Select
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
          >
            <option value="all">Role Type: All Types</option>
            <option value="internship">Internship Only</option>
            <option value="full-time">Full-Time Only</option>
            <option value="graduate">Graduate / Entry-Level</option>
          </Select>

          <Select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <option value="all">Country: Worldwide</option>
            <option value="india">India</option>
            <option value="united states">United States</option>
            <option value="remote">Remote / Global</option>
            <option value="germany">Germany</option>
            <option value="united kingdom">United Kingdom</option>
          </Select>

          <Select
            value={freshnessFilter}
            onChange={(e) => setFreshnessFilter(e.target.value)}
          >
            <option value="all">Freshness: All</option>
            <option value="fresh">Fresh (Last 3 Days)</option>
            <option value="recent">Recent (Last 14 Days)</option>
          </Select>

          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 3. OPPORTUNITY CARDS LIST */}
      {(!internships || internships.length === 0) ? (
        <EmptyState
          title="No Matching Opportunities Found"
          description="Try broadening your search keywords or clearing active filters to see all available global listings."
          actionLabel="Clear Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internships.map((job) => {
            const matchInfo = matchMap.get(job._id);
            const isSaved = savedIds.has(job._id);

            return (
              <Card
                key={job._id}
                hover
                className="flex flex-col justify-between p-5 bg-slate-900/90 light:bg-white border-slate-800/90 light:border-slate-200"
              >
                <div>
                  {/* Card Top: Company & Match Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 light:bg-slate-100 flex items-center justify-center font-bold text-cyan-400 light:text-blue-600 text-xs shrink-0 border border-slate-700/60 light:border-slate-200">
                        {job.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider block truncate">
                          {job.companyName}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {job.sourceName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {matchInfo ? (
                        <Badge variant="match">
                          {matchInfo.overallMatchScore}% Match
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm">
                          Unranked
                        </Badge>
                      )}
                      <button
                        onClick={() => handleToggleSave(job._id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSaved
                            ? "text-cyan-400 bg-cyan-950/60 border border-cyan-800/60"
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                        }`}
                        title={isSaved ? "Saved" : "Save opportunity"}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <h3 className="text-base font-semibold text-white light:text-slate-900 line-clamp-2 mb-2">
                    {job.roleTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 light:text-slate-600 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{job.location}</span>
                    </span>
                    <Badge variant={job.remoteStatus === "remote" ? "remote" : "outline"} size="sm">
                      {job.remoteStatus}
                    </Badge>
                    {job.employmentType && (
                      <Badge variant="outline" size="sm">
                        {job.employmentType}
                      </Badge>
                    )}
                  </div>

                  {/* Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.requiredSkills || []).slice(0, 4).map((skill: string) => (
                      <Badge key={skill} variant="outline" size="sm">
                        {skill}
                      </Badge>
                    ))}
                    {(job.requiredSkills || []).length > 4 && (
                      <span className="text-[11px] text-slate-500 self-center">
                        +{(job.requiredSkills || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Details & CTAs */}
                <div className="pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 truncate">
                    {job.stipend ? (
                      <span className="text-emerald-400 font-semibold">{job.stipend}</span>
                    ) : (
                      <span>Disclosed on Apply</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenCoverLetter(job)}
                      title="Generate Tailored Cover Letter"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInternship(job)}
                    >
                      Details
                    </Button>

                    <a
                      href={job.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="primary" size="sm">
                        <span>Apply</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. DETAILED OPPORTUNITY & MATCH EXPLANATION MODAL */}
      <Modal
        isOpen={Boolean(selectedInternship)}
        onClose={() => setSelectedInternship(null)}
        title={selectedInternship?.roleTitle}
        description={`${selectedInternship?.companyName} • ${selectedInternship?.location}`}
        maxWidth="2xl"
      >
        {selectedInternship && (
          <div className="space-y-6">
            {/* Source & Freshness Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="verified">Source: {selectedInternship.sourceName}</Badge>
                <Badge variant="remote">{selectedInternship.remoteStatus}</Badge>
              </div>
              <span className="text-slate-400">
                Deadline: {selectedInternship.applicationDeadline || "Open until filled"}
              </span>
            </div>

            {/* AI Transparent Match Breakdown */}
            {matchMap.get(selectedInternship._id) ? (
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white light:text-slate-900">
                      Explainable AI Relevance Score
                    </span>
                  </div>
                  <Badge variant="match">
                    {matchMap.get(selectedInternship._id).overallMatchScore}% Composite Match
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                  {matchMap.get(selectedInternship._id).explanation}
                </p>

                {/* Score Components */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-500/20 text-center">
                  <div className="p-2 rounded-lg bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Skill Coverage</span>
                    <span className="text-sm font-bold text-cyan-400">
                      {matchMap.get(selectedInternship._id).skillMatchScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Project Evidence</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {matchMap.get(selectedInternship._id).evidenceMatchScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Role Fit</span>
                    <span className="text-sm font-bold text-purple-400">
                      {matchMap.get(selectedInternship._id).semanticMatchScore}%
                    </span>
                  </div>
                </div>

                {/* Missing Skills Warning */}
                {matchMap.get(selectedInternship._id).missingSkills?.length > 0 && (
                  <div className="pt-2 text-xs">
                    <span className="text-amber-400 font-semibold block mb-1">
                      Skill Gaps to Address:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {matchMap.get(selectedInternship._id).missingSkills.map((s: string) => (
                        <Badge key={s} variant="unverified" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-xs text-slate-400 flex items-center justify-between">
                <span>No match calculated for this listing yet.</span>
                <span className="text-cyan-400">Run Recalculate on Dashboard</span>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider">
                Opportunity Description
              </h4>
              <div className="text-xs text-slate-300 light:text-slate-600 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line p-3 rounded-xl bg-slate-950/40 light:bg-slate-50 border border-slate-800/60 light:border-slate-200">
                {selectedInternship.description}
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider">
                Required Technical Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(selectedInternship.requiredSkills || []).map((skill: string) => (
                  <Badge key={skill} variant="evidence">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 light:border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={savingPipeline}
                  onClick={() => handleAddToPipeline(selectedInternship._id, "planning")}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Track in Pipeline</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCoverLetterModalOpen(true);
                  }}
                >
                  <FileText className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                  <span>AI Cover Letter</span>
                </Button>
              </div>

              <a
                href={selectedInternship.originalUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="glow" size="md">
                  <span>Apply on Employer Site</span>
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. MODAL: AI COVER LETTER GENERATOR */}
      <Modal
        isOpen={coverLetterModalOpen}
        onClose={() => setCoverLetterModalOpen(false)}
        title={`AI Cover Letter: ${selectedInternship?.roleTitle}`}
        description={`Generate a tailored, evidence-grounded cover letter for ${selectedInternship?.companyName}.`}
        maxWidth="2xl"
      >
        {selectedInternship && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <Select
                  label="Select Writing Tone"
                  value={coverLetterTone}
                  onChange={(e) => setCoverLetterTone(e.target.value)}
                >
                  <option value="Professional & Evidence-Grounded">Professional & Evidence-Grounded</option>
                  <option value="Confident & Technical">Confident & Technical</option>
                  <option value="Enthusiastic Early-Career">Enthusiastic Early-Career</option>
                  <option value="Concise & Impact-Driven">Concise & Impact-Driven</option>
                </Select>
              </div>

              <div className="self-end pb-0.5">
                <Button
                  variant="glow"
                  size="md"
                  isLoading={generatingCoverLetter}
                  onClick={handleGenerateCoverLetter}
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  <span>Generate with Gemini</span>
                </Button>
              </div>
            </div>

            {/* Generated Cover Letter Editor / Preview */}
            {generatedCoverLetter ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 light:text-slate-700">Generated Tailored Draft</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCoverLetter}
                  >
                    {copiedCoverLetter ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        <span>Copy Draft</span>
                      </>
                    )}
                  </Button>
                </div>

                <textarea
                  rows={12}
                  className="w-full rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 p-4 text-xs text-slate-200 light:text-slate-800 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={generatedCoverLetter}
                  onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                />

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-500">
                    Feel free to edit the text directly before submitting with your application.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleAddToPipeline(selectedInternship._id, "planning");
                      setCoverLetterModalOpen(false);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Save to Pipeline</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/40 light:bg-slate-50 border border-dashed border-slate-800 light:border-slate-300 text-center space-y-2">
                <FileText className="w-8 h-8 text-cyan-400/60 mx-auto" />
                <h4 className="text-sm font-semibold text-white light:text-slate-900">
                  Ready to draft your application letter
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Generate with Gemini" above to automatically pull your verified skill evidence and synthesize a compelling cover letter for {selectedInternship.companyName}.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
