import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName } from "./lib/taxonomy";

// Ensure current user is an authenticated recruiter or admin
async function requireRecruiter(ctx: { db: any }, token: string) {
  const { user, session } = await requireUser(ctx, token);
  if (user.role !== "recruiter" && user.role !== "admin") {
    throw new Error("Recruiter authorization required to access this endpoint");
  }
  return { user, session };
}

export const getRecruiterProfile = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireRecruiter(ctx, args.token);
    const profile = await ctx.db
      .query("recruiterProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    };
  },
});

export const updateRecruiterProfile = mutation({
  args: {
    token: v.string(),
    companyName: v.string(),
    companyWebsite: v.optional(v.string()),
    recruiterTitle: v.string(),
    contactEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireRecruiter(ctx, args.token);

    const existing = await ctx.db
      .query("recruiterProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const data = {
      companyName: args.companyName.trim(),
      companyWebsite: args.companyWebsite?.trim(),
      recruiterTitle: args.recruiterTitle.trim(),
      contactEmail: args.contactEmail.trim().toLowerCase(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("recruiterProfiles", {
        userId: user._id,
        ...data,
        verified: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const createRecruiterListing = mutation({
  args: {
    token: v.string(),
    companyName: v.string(),
    roleTitle: v.string(),
    description: v.string(),
    requiredSkills: v.array(v.string()),
    eligibilityCriteria: v.optional(v.string()),
    location: v.string(),
    remoteStatus: v.union(v.literal("remote"), v.literal("hybrid"), v.literal("onsite")),
    stipend: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    originalUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireRecruiter(ctx, args.token);
    const now = Date.now();

    const normalizedSkills = args.requiredSkills.map(normalizeSkillName);

    const listingId = await ctx.db.insert("internships", {
      companyName: args.companyName.trim(),
      roleTitle: args.roleTitle.trim(),
      description: args.description.trim(),
      requiredSkills: normalizedSkills,
      eligibilityCriteria: args.eligibilityCriteria?.trim(),
      location: args.location.trim(),
      remoteStatus: args.remoteStatus,
      stipend: args.stipend?.trim(),
      applicationOpenDate: new Date().toISOString().split("T")[0],
      applicationDeadline: args.applicationDeadline?.trim(),
      originalUrl: args.originalUrl.trim(),
      sourceName: "Recruiter Portal",
      listingStatus: "active",
      verificationStatus: "verified",
      recruiterId: user._id,
      firstSeenAt: now,
      lastCheckedAt: now,
      createdAt: now,
    });

    return listingId;
  },
});

export const listMyListings = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireRecruiter(ctx, args.token);

    const listings = await ctx.db
      .query("internships")
      .withIndex("by_recruiter", (q) => q.eq("recruiterId", user._id))
      .order("desc")
      .collect();

    const results: any[] = [];
    for (const item of listings) {
      const applicants = await ctx.db
        .query("applications")
        .withIndex("by_internship", (q) => q.eq("internshipId", item._id))
        .collect();

      results.push({
        ...item,
        applicantCount: applicants.length,
      });
    }

    return results;
  },
});

export const listApplicantsForListing = query({
  args: {
    token: v.string(),
    listingId: v.id("internships"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireRecruiter(ctx, args.token);
    const listing = await ctx.db.get(args.listingId);

    // Enforce ownership: one recruiter cannot view another recruiter's applicants
    if (!listing || (listing.recruiterId !== user._id && user.role !== "admin")) {
      throw new Error("Unauthorized access to this internship listing's applicant roster");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_internship", (q) => q.eq("internshipId", listing._id))
      .collect();

    const applicantCards: any[] = [];
    for (const app of applications) {
      const studentUser = await ctx.db.get(app.userId);
      const studentProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", app.userId))
        .first();

      const studentPassport = await ctx.db
        .query("publicPassports")
        .withIndex("by_user", (q) => q.eq("userId", app.userId))
        .first();

      const studentEvidence = await ctx.db
        .query("skillEvidence")
        .withIndex("by_user", (q) => q.eq("userId", app.userId))
        .collect();

      applicantCards.push({
        applicationId: app._id,
        status: app.status,
        appliedDate: app.appliedDate,
        notes: app.notes,
        student: {
          name: studentUser?.name || "Student Candidate",
          email: studentUser?.email,
          college: studentProfile?.college,
          course: studentProfile?.course,
          graduationYear: studentProfile?.graduationYear,
        },
        passport: studentPassport?.isPublic
          ? {
              shareToken: studentPassport.shareToken,
              customSlug: studentPassport.customSlug,
            }
          : null,
        provenSkills: studentEvidence
          .filter((e) => e.status === "challenge_assessed" || e.status === "evidence_found")
          .map((e) => ({
            skillName: e.skillName,
            status: e.status,
            score: e.evidenceScore,
            repoName: e.repoName,
          })),
      });
    }

    return {
      listing,
      applicantCards,
    };
  },
});

export const searchConsentedPassports = query({
  args: {
    token: v.string(),
    skillFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRecruiter(ctx, args.token);

    const publicPassports = await ctx.db
      .query("publicPassports")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(25);

    const results: any[] = [];
    for (const p of publicPassports) {
      const u = await ctx.db.get(p.userId);
      const prof = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", p.userId))
        .first();

      const evidence = await ctx.db
        .query("skillEvidence")
        .withIndex("by_user", (q) => q.eq("userId", p.userId))
        .collect();

      if (args.skillFilter) {
        const canonical = normalizeSkillName(args.skillFilter).toLowerCase();
        const hasSkill = evidence.some(
          (e) =>
            e.skillName.toLowerCase() === canonical &&
            (e.status === "challenge_assessed" || e.status === "evidence_found")
        );
        if (!hasSkill) continue;
      }

      results.push({
        shareToken: p.shareToken,
        customSlug: p.customSlug,
        name: u?.name || "Candidate",
        college: p.visibleSections.education ? prof?.college : undefined,
        preferredRole: prof?.preferredRole,
        verifiedSkills: evidence
          .filter((e) => e.status === "challenge_assessed" || e.status === "evidence_found")
          .map((e) => ({
            name: e.skillName,
            status: e.status,
            score: e.evidenceScore,
          })),
      });
    }

    return results;
  },
});
