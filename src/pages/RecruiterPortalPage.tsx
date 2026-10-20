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
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export const RecruiterPortalPage: React.FC = () => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();

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

      success("Listing Published", "Your opportunity has been published with verified status.");
      setPostModalOpen(false);
      setRoleTitle("");
      setDescription("");
    } catch (err: any) {
      toastError("Error creating listing", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-cyan-300 light:bg-blue-50 light:text-blue-700 mb-2">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recruiter Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Employer & Recruiter Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Publish verified opportunities and review consenting candidate applicants backed by real GitHub evidence and practical challenge scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/recruiter/search">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-1 text-cyan-400" />
              <span>Search Candidates</span>
            </Button>
          </Link>
          <Button variant="glow" size="sm" onClick={() => setPostModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Post Opportunity</span>
          </Button>
        </div>
      </div>

      {/* 2. MY LISTINGS GRID */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
          Your Active Opportunity Postings ({myListings?.length || 0})
        </h2>

        {(!myListings || myListings.length === 0) ? (
          <EmptyState
            icon={<Briefcase className="w-6 h-6 text-cyan-400" />}
            title="No Postings Yet"
            description="Post your first internship or early-career role to discover students with verified GitHub evidence and challenge scores."
            actionLabel="Post Opportunity"
            onAction={() => setPostModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myListings.map((item) => (
              <Card key={item._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="verified">Active</Badge>
                    <Badge variant="remote">{item.remoteStatus}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-white light:text-slate-900 mb-1">
                    {item.roleTitle}
                  </h3>
                  <p className="text-xs text-slate-400 light:text-slate-500 mb-3">
                    {item.location} • {item.stipend || "Stipend Disclosed"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(item.requiredSkills || []).map((s: string) => (
                      <Badge key={s} variant="outline" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Deadline: {item.applicationDeadline || "Ongoing"}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedListingForApplicants(item)}
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    <span>View Applicants</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. MODAL: APPLICANT ROSTER */}
      <Modal
        isOpen={Boolean(selectedListingForApplicants)}
        onClose={() => setSelectedListingForApplicants(null)}
        title={`Applicants for ${selectedListingForApplicants?.roleTitle}`}
        description="Review candidate applications with verified GitHub evidence and proof passport links."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {(!applicantRoster?.applicantCards || applicantRoster.applicantCards.length === 0) ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No applicants have tracked this opportunity yet.
            </p>
          ) : (
            <div className="space-y-3">
              {applicantRoster.applicantCards.map((app: any) => {
                const passportUrl = app.passport?.customSlug
                  ? `/p/${app.passport.customSlug}`
                  : app.passport?.shareToken
                  ? `/passport/${app.passport.shareToken}`
                  : null;

                return (
                  <div
                    key={app.applicationId}
                    className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white light:text-slate-900">{app.student?.name || "Student Candidate"}</h4>
                      <p className="text-slate-400 text-[11px]">{app.student?.email}</p>
                      <span className="text-cyan-400 text-[10px] block mt-0.5">Stage: {app.status}</span>
                    </div>
                    {passportUrl ? (
                      <a href={passportUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                          <span>Proof Passport</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                    ) : (
                      <Badge variant="outline" size="sm">Private Passport</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* 4. MODAL: POST OPPORTUNITY */}
      <Modal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        title="Publish Verified Opportunity"
        description="Create a vacancy listing with required skills and original application links."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateListing} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Acme Tech"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <Input
            label="Opportunity / Role Title"
            placeholder="e.g. Full Stack Engineering Intern"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider block">
              Role Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities, team context, and required stack..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              required
            />
          </div>

          <Input
            label="Required Skills (Comma separated)"
            placeholder="React, TypeScript, PostgreSQL"
            value={requiredSkillsInput}
            onChange={(e) => setRequiredSkillsInput(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location"
              placeholder="Bengaluru / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <Select
              label="Workplace Mode"
              value={remoteStatus}
              onChange={(e) => setRemoteStatus(e.target.value as any)}
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Stipend / Salary"
              placeholder="e.g. INR 60,000 / month"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
            />

            <Input
              label="Application Deadline"
              type="date"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
            />
          </div>

          <Input
            label="Original Application URL"
            type="url"
            placeholder="https://company.com/jobs/role-123"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setPostModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" type="submit" isLoading={submitting}>
              <span>Publish Verified Listing</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
