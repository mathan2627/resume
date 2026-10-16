import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Building2,
  Plus,
  Users,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";

export const RecruiterPortalPage: React.FC = () => {
  const { token, user } = useAuth();

  const myListings = useQuery(api.recruiters.listMyListings, token ? { token } : "skip");
  const createListingMutation = useMutation(api.recruiters.createRecruiterListing);

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedListingForApplicants, setSelectedListingForApplicants] = useState<any | null>(null);

  // Applicant Roster Query
  const applicantRoster = useQuery(
    api.recruiters.listApplicantsForListing,
    token && selectedListingForApplicants
      ? { token, listingId: selectedListingForApplicants._id }
      : "skip"
  );

  // New Listing Form State
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkillsInput, setRequiredSkillsInput] = useState("React, TypeScript, Tailwind CSS");
  const [location, setLocation] = useState("Remote");
  const [remoteStatus, setRemoteStatus] = useState<"remote" | "hybrid" | "onsite">("remote");
  const [stipend, setStipend] = useState("$35 / hr");
  const [applicationDeadline, setApplicationDeadline] = useState("2026-12-31");
  const [originalUrl, setOriginalUrl] = useState("https://company.com/careers");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    try {
      const skillsArray = requiredSkillsInput.split(",").map((s) => s.trim()).filter(Boolean);

      await createListingMutation({
        token,
        companyName: companyName.trim() || user?.name || "Company",
        roleTitle: roleTitle.trim(),
        description: description.trim(),
        requiredSkills: skillsArray,
        location: location.trim(),
        remoteStatus,
        stipend: stipend.trim(),
        applicationDeadline: applicationDeadline.trim(),
        originalUrl: originalUrl.trim(),
      });

      setPostModalOpen(false);
      // Reset form
      setRoleTitle("");
      setDescription("");
    } catch (err: any) {
      alert("Error creating listing: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 mb-2">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recruiter Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Employer & Recruiter Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Publish verified internship listings and review consenting candidate applicants backed by real GitHub evidence and practical challenge scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Search Passports</span>
          </Link>
          <button
            onClick={() => setPostModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Listing</span>
          </button>
        </div>
      </div>

      {/* Recruiter Listings */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          <span>Your Active Postings ({myListings?.length || 0})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myListings && myListings.length > 0 ? (
            myListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {listing.companyName}
                      </span>
                      <h3 className="text-sm font-bold text-white">{listing.roleTitle}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Active
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {listing.location} ({listing.remoteStatus})
                    </span>
                    {listing.stipend && (
                      <span className="text-emerald-400 font-semibold">{listing.stipend}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {listing.requiredSkills.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {listing.applicantCount} Applicants
                  </span>

                  <button
                    onClick={() => setSelectedListingForApplicants(listing)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    View Roster
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Listings Published Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Post New Listing" above to publish your company's internship opportunity to students.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* APPLICANT ROSTER DRAWER / MODAL */}
      {selectedListingForApplicants && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Candidate Roster
                </span>
                <h3 className="text-base font-bold text-white">
                  Applicants for: {selectedListingForApplicants.roleTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedListingForApplicants(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {applicantRoster?.applicantCards && applicantRoster.applicantCards.length > 0 ? (
                applicantRoster.applicantCards.map((card: any) => (
                  <div
                    key={card.applicationId}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{card.student.name}</h4>
                        <p className="text-slate-400 text-xs">
                          {card.student.college} • Class of {card.student.graduationYear || 2026}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {card.status}
                      </span>
                    </div>

                    {/* Verified Skills badges */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Verified Skills with Project/Assessment Proof:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {card.provenSkills.map((sk: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-200 border border-slate-800 flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            <span>
                              {sk.skillName} ({sk.score}%)
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Proof Passport link */}
                    {card.passport && (
                      <div className="pt-2 border-t border-slate-900 flex justify-end">
                        <Link
                          to={`/p/${card.passport.customSlug || card.passport.shareToken}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          <span>Inspect Verified Proof Passport</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No student candidates have applied for this listing yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST LISTING MODAL */}
      {postModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Post Internship Opportunity</span>
              </h3>
              <button
                onClick={() => setPostModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer Intern"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key responsibilities and project initiatives..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={requiredSkillsInput}
                  onChange={(e) => setRequiredSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Node.js, SQL"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote / Bengaluru"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Arrangement</label>
                  <select
                    value={remoteStatus}
                    onChange={(e) => setRemoteStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stipend / Comp</label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    placeholder="e.g. INR 50,000 / mo"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Application URL</label>
                <input
                  type="url"
                  required
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://company.com/apply"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
