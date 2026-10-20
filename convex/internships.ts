import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName } from "./lib/taxonomy";

export const SEED_INTERNSHIPS = [
  {
    companyName: "Vercel",
    roleTitle: "Frontend Engineering Intern",
    description: "Join the Next.js and frontend infrastructure team to build high-performance web tooling, developer dashboards, and modern UI components using React, TypeScript, and Tailwind CSS.",
    requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    eligibilityCriteria: "Undergraduate / Graduate students in Computer Science or self-taught developers with public GitHub project evidence.",
    location: "Remote",
    remoteStatus: "remote" as const,
    stipend: "$45 - $55 / hr",
    applicationOpenDate: "2026-09-01",
    applicationDeadline: "2026-12-15",
    originalUrl: "https://vercel.com/careers",
    sourceName: "Company Career Portal",
    listingStatus: "active" as const,
    verificationStatus: "verified" as const,
  },
  {
    companyName: "Stripe",
    roleTitle: "Backend Systems Intern",
    description: "Build robust, fault-tolerant financial infrastructure and developer APIs. Work with distributed systems, high-availability databases, and secure payment processing pipelines.",
    requiredSkills: ["Go", "Java", "PostgreSQL", "REST APIs", "Docker"],
    eligibilityCriteria: "Enrolled in a Bachelor's or Master's program graduating in 2026 or 2027.",
    location: "Bengaluru, India / Hybrid",
    remoteStatus: "hybrid" as const,
    stipend: "INR 1,20,000 / month",
    applicationOpenDate: "2026-08-15",
    applicationDeadline: "2026-11-30",
    originalUrl: "https://stripe.com/jobs",
    sourceName: "LinkedIn Talent Feed",
    listingStatus: "active" as const,
    verificationStatus: "verified" as const,
  },
  {
    companyName: "Google",
    roleTitle: "AI & Machine Learning Research Intern",
    description: "Contribute to cutting-edge research and deployment of large language models, computer vision systems, and multimodal generative algorithms using PyTorch and TensorFlow.",
    requiredSkills: ["Python", "PyTorch", "Machine Learning", "Deep Learning", "Data Structures & Algorithms"],
    eligibilityCriteria: "Current BS, MS or PhD student in Computer Science, Data Science, or related STEM field.",
    location: "Bengaluru / Hyderabad, India",
    remoteStatus: "hybrid" as const,
    stipend: "INR 1,50,000 / month",
    applicationOpenDate: "2026-09-10",
    applicationDeadline: "2026-12-01",
    originalUrl: "https://careers.google.com/students",
    sourceName: "Official Student Portal",
    listingStatus: "active" as const,
    verificationStatus: "verified" as const,
  },
  {
    companyName: "Postman",
    roleTitle: "Full Stack Developer Intern",
    description: "Enhance the Postman API platform, API client, and collaborative developer workflows. Build performant full-stack features with React, Node.js, and TypeScript.",
    requiredSkills: ["JavaScript", "TypeScript", "React", "Node.js", "REST APIs"],
    eligibilityCriteria: "Pre-final and final year engineering students with demonstrated REST API and web project experience.",
    location: "Bengaluru, India",
    remoteStatus: "onsite" as const,
    stipend: "INR 70,000 / month",
    applicationOpenDate: "2026-09-20",
    applicationDeadline: "2026-11-15",
    originalUrl: "https://www.postman.com/company/careers",
    sourceName: "Wellfound (AngelList)",
    listingStatus: "active" as const,
    verificationStatus: "verified" as const,
  },
  {
    companyName: "Cloudflare",
    roleTitle: "Cloud & Systems Software Intern",
    description: "Work on global edge computing networks, DNS, security proxies, and serverless compute runtimes using Rust and Go.",
    requiredSkills: ["Rust", "Go", "Docker", "Git & GitHub"],
    eligibilityCriteria: "Students with strong knowledge of networking protocols, OS fundamentals, and systems programming.",
    location: "Remote",
    remoteStatus: "remote" as const,
    stipend: "$40 / hr",
    applicationOpenDate: "2026-08-01",
    applicationDeadline: "2026-11-01",
    originalUrl: "https://www.cloudflare.com/careers/departments/university",
    sourceName: "Company Career Portal",
    listingStatus: "active" as const,
    verificationStatus: "verified" as const,
  },
  {
    companyName: "Razorpay",
    roleTitle: "Frontend Engineering Intern (Fintech)",
    description: "Build seamless, accessible checkout and payment experiences used by millions of merchants. Leverage React, TypeScript, and modern CSS architectures.",
    requiredSkills: ["React", "TypeScript", "Tailwind CSS", "HTML5 & CSS3"],
    eligibilityCriteria: "Undergraduates graduating in 2026 with strong portfolio of responsive web applications.",
    location: "Bengaluru, India",
    remoteStatus: "onsite" as const,
    stipend: "INR 60,000 / month",
    applicationOpenDate: "2026-09-05",
    applicationDeadline: "2026-10-31",
    originalUrl: "https://razorpay.com/jobs",
    sourceName: "Internshala Verified",
    listingStatus: "active" as const,
    verificationStatus: "verified" as const,
  },
];

// Seed initial master internship catalog
export const seedInternships = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("internships").first();
    if (existing) return { count: 0, message: "Internships already seeded." };

    let count = 0;
    const now = Date.now();
    for (const item of SEED_INTERNSHIPS) {
      await ctx.db.insert("internships", {
        companyName: item.companyName,
        roleTitle: item.roleTitle,
        description: item.description,
        requiredSkills: item.requiredSkills.map(normalizeSkillName),
        eligibilityCriteria: item.eligibilityCriteria,
        location: item.location,
        remoteStatus: item.remoteStatus,
        stipend: item.stipend,
        applicationOpenDate: item.applicationOpenDate,
        applicationDeadline: item.applicationDeadline,
        originalUrl: item.originalUrl,
        sourceName: item.sourceName,
        listingStatus: item.listingStatus,
        verificationStatus: item.verificationStatus,
        firstSeenAt: now - 7 * 24 * 60 * 60 * 1000,
        lastCheckedAt: now,
        createdAt: now,
      });
      count++;
    }

    return { count, message: `Successfully seeded ${count} verified internships.` };
  },
});

// List internships with flexible filtering and sorting
export const listInternships = query({
  args: {
    search: v.optional(v.string()),
    skill: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    remoteStatus: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
    freshness: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("internships").collect();

    // Fallback if not yet seeded in database
    if (list.length === 0) {
      list = SEED_INTERNSHIPS.map((item, idx) => ({
        _id: `seed_${idx}` as any,
        _creationTime: Date.now(),
        ...item,
        firstSeenAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        lastCheckedAt: Date.now(),
        createdAt: Date.now(),
      }));
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.roleTitle.toLowerCase().includes(q) ||
          i.companyName.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (args.skill) {
      const canonical = normalizeSkillName(args.skill).toLowerCase();
      list = list.filter((i) =>
        i.requiredSkills.some((s) => s.toLowerCase() === canonical)
      );
    }

    if (args.country && args.country !== "all") {
      const c = args.country.toLowerCase();
      list = list.filter(
        (i) =>
          (i.country && i.country.toLowerCase().includes(c)) ||
          i.location.toLowerCase().includes(c)
      );
    }

    if (args.city && args.city !== "all") {
      const cityLower = args.city.toLowerCase();
      list = list.filter(
        (i) =>
          (i.city && i.city.toLowerCase().includes(cityLower)) ||
          i.location.toLowerCase().includes(cityLower)
      );
    }

    if (args.remoteStatus && args.remoteStatus !== "all") {
      list = list.filter((i) => i.remoteStatus === args.remoteStatus);
    }

    if (args.employmentType && args.employmentType !== "all") {
      list = list.filter((i) => (i.employmentType || "internship") === args.employmentType);
    }

    if (args.verificationStatus && args.verificationStatus !== "all") {
      list = list.filter((i) => i.verificationStatus === args.verificationStatus);
    }

    if (args.freshness && args.freshness !== "all") {
      list = list.filter((i) => (i.freshnessStatus || "recent") === args.freshness);
    }

    if (args.sourceName && args.sourceName !== "all") {
      list = list.filter((i) => i.sourceName.toLowerCase().includes(args.sourceName!.toLowerCase()));
    }

    // Sorting
    if (args.sortBy === "date") {
      list.sort((a, b) => (b.lastCheckedAt || b.createdAt) - (a.lastCheckedAt || a.createdAt));
    } else if (args.sortBy === "deadline") {
      list.sort((a, b) => {
        if (!a.applicationDeadline) return 1;
        if (!b.applicationDeadline) return -1;
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      });
    } else {
      // Default: Most recently verified/observed
      list.sort((a, b) => (b.lastCheckedAt || 0) - (a.lastCheckedAt || 0));
    }

    if (args.limit) {
      list = list.slice(0, args.limit);
    }

    return list;
  },
});

// Get single internship by ID
export const getInternship = query({
  args: {
    internshipId: v.id("internships"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.internshipId);
  },
});

// Save an internship for a student
export const saveInternship = mutation({
  args: {
    token: v.string(),
    internshipId: v.id("internships"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const existing = await ctx.db
      .query("savedInternships")
      .withIndex("by_user_internship", (q) =>
        q.eq("userId", user._id).eq("internshipId", args.internshipId)
      )
      .first();

    if (existing) {
      return { id: existing._id, saved: true };
    }

    const id = await ctx.db.insert("savedInternships", {
      userId: user._id,
      internshipId: args.internshipId,
      notes: args.notes,
      savedAt: Date.now(),
    });

    return { id, saved: true };
  },
});

// Unsave an internship
export const unsaveInternship = mutation({
  args: {
    token: v.string(),
    internshipId: v.id("internships"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const existing = await ctx.db
      .query("savedInternships")
      .withIndex("by_user_internship", (q) =>
        q.eq("userId", user._id).eq("internshipId", args.internshipId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { saved: false };
  },
});

// List all saved internships for user
export const listSavedInternships = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const saved = await ctx.db
      .query("savedInternships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const results: any[] = [];
    for (const item of saved) {
      const internship = await ctx.db.get(item.internshipId);
      if (internship) {
        results.push({
          savedRecordId: item._id,
          savedAt: item.savedAt,
          notes: item.notes,
          internship,
        });
      }
    }

    return results;
  },
});
