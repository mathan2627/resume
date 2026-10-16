import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
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
} from "lucide-react";

export const InternshipsPage: React.FC = () => {
  const { token } = useAuth();

  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [savingPipeline, setSavingPipeline] = useState(false);

  const internships = useQuery(api.internships.listInternships, {
    search: search || undefined,
    skill: skillFilter || undefined,
    remoteStatus: remoteFilter !== "all" ? remoteFilter : undefined,
    verificationStatus: verificationFilter !== "all" ? verificationFilter : undefined,
  });

  const savedListings = useQuery(api.internships.listSavedInternships, token ? { token } : "skip");
  const saveMutation = useMutation(api.internships.saveInternship);
  const unsaveMutation = useMutation(api.internships.unsaveInternship);
  const userMatches = useQuery(api.matching.getUserMatches, token ? { token } : "skip");
  const calculateMatchesMutation = useMutation(api.matching.calculateMatchesForUser);
  const createApplicationMutation = useMutation(api.applications.createApplication);

  // Map match score by internship ID
  const matchMap = new Map<string, any>();
  if (userMatches) {
    for (const m of userMatches) {
      matchMap.set(m.internship._id, m);
    }
  }

  // Check saved set
  const savedIds = new Set<string>();
  if (savedListings) {
    for (const s of savedListings) {
      savedIds.add(s.internship._id);
    }
  }

  const handleToggleSave = async (internshipId: any) => {
    if (!token) return;
    if (savedIds.has(internshipId)) {
      await unsaveMutation({ token, internshipId });
    } else {
      await saveMutation({ token, internshipId });
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
      alert("Added to your Application Tracker pipeline!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingPipeline(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Intelligence Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Internship Discovery & Matching
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Genuine verified internship opportunities matched against your proven Skill Proof evidence.
          </p>
        </div>

        {token && (
          <button
            onClick={() => calculateMatchesMutation({ token })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 transition-all self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Calculate AI Matches</span>
          </button>
        )}
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Role title or company..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Skill Filter */}
        <div>
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Filter by skill (e.g. React, Python)"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Remote Status Filter */}
        <div>
          <select
            value={remoteFilter}
            onChange={(e) => setRemoteFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="all">All Work Arrangements</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="all">All Verifications</option>
            <option value="verified">Verified Source Links Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {internships && internships.length > 0 ? (
          internships.map((item) => {
            const match = matchMap.get(item._id);
            const isSaved = savedIds.has(item._id);

            return (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Company & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {item.companyName}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {item.roleTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {match && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {match.overallMatchScore}% Match
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleSave(item._id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                        title={isSaved ? "Saved" : "Save opportunity"}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Location & Stipend */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {item.location} ({item.remoteStatus})
                    </span>
                    {item.stipend && (
                      <span className="text-emerald-400 font-semibold">{item.stipend}</span>
                    )}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Required Skills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.requiredSkills.slice(0, 4).map((s: string) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                    {item.requiredSkills.length > 4 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{item.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Verification Status & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px]">
                    {item.verificationStatus === "verified" ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Link
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInternship(item)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
                    >
                      Details
                    </button>
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 text-xs">
            No internships match your active filters. Try clearing search filters.
          </div>
        )}
      </div>

      {/* DETAIL MODAL WITH TRANSPARENT MATCH BREAKDOWN */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedInternship.companyName}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedInternship.roleTitle}</h2>
              </div>
              <button
                onClick={() => setSelectedInternship(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Match Breakdown Card if calculated */}
            {matchMap.get(selectedInternship._id) && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Transparent AI Match Explanation
                  </span>
                  <span className="text-xs font-black text-white">
                    {matchMap.get(selectedInternship._id).overallMatchScore}% Relevance
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {matchMap.get(selectedInternship._id).explanation}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-slate-400 border-t border-indigo-900/40">
                  <div>
                    <span className="block font-bold text-white">
                      {matchMap.get(selectedInternship._id).skillMatchScore}%
                    </span>
                    <span>Skill Coverage (40%)</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white">
                      {matchMap.get(selectedInternship._id).evidenceMatchScore}%
                    </span>
                    <span>Project Proof (25%)</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white">
                      {matchMap.get(selectedInternship._id).semanticMatchScore}%
                    </span>
                    <span>Role Alignment (15%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description & Requirements */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  About the Role
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedInternship.description}
                </p>
              </div>

              {selectedInternship.eligibilityCriteria && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Eligibility Criteria
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedInternship.eligibilityCriteria}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Required Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInternship.requiredSkills.map((sk: string) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-950 text-slate-200 border border-slate-800"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <p>Location: <strong className="text-slate-200">{selectedInternship.location} ({selectedInternship.remoteStatus})</strong></p>
                <p>Published Source: <strong className="text-slate-200">{selectedInternship.sourceName}</strong></p>
                {selectedInternship.applicationDeadline && (
                  <p>Deadline: <strong className="text-slate-200">{selectedInternship.applicationDeadline}</strong></p>
                )}
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToPipeline(selectedInternship._id, "planning")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Track in Pipeline
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInternship(null)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <a
                  href={selectedInternship.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20"
                >
                  Apply on Original Source <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
