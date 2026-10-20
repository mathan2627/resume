import { action, internalAction, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { extractSkillsFromText, normalizeSkillName } from "./lib/taxonomy";
import { requireAdmin } from "./auth";

// Source Adapter Interfaces
export interface RawJobListing {
  externalId?: string;
  sourceIdentifier: string;
  sourceName: string;
  companyName: string;
  roleTitle: string;
  description: string;
  location: string;
  country?: string;
  city?: string;
  remoteStatus: "remote" | "hybrid" | "onsite";
  employmentType?: string;
  stipend?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applicationOpenDate?: string;
  applicationDeadline?: string;
  originalUrl: string;
  requiredSkills: string[];
  eligibilityCriteria?: string;
}

export interface IngestionResult {
  sourceName: string;
  status: "success" | "partial" | "failed" | "rate_limited";
  listingsProcessed: number;
  listingsAdded: number;
  listingsUpdated: number;
  listingsExpired: number;
  errorMessage?: string;
}

// 1. Greenhouse Job Board API Connector
async function fetchGreenhouseJobs(boardToken: string): Promise<RawJobListing[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs?content=true`;
  const response = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "ProofPathAI-Intelligence/1.0" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMITED");
    throw new Error(`Greenhouse API responded with ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const jobs = data.jobs || [];
  const results: RawJobListing[] = [];

  for (const job of jobs) {
    const rawContent = (job.content || "").replace(/<[^>]*>?/gm, " ");
    const extracted = extractSkillsFromText(`${job.title} ${rawContent}`);
    const locationName = job.location?.name || "Global / Remote";
    const locLower = locationName.toLowerCase();
    const titleLower = job.title.toLowerCase();

    let remoteStatus: "remote" | "hybrid" | "onsite" = "onsite";
    if (locLower.includes("remote") || titleLower.includes("remote")) {
      remoteStatus = "remote";
    } else if (locLower.includes("hybrid") || titleLower.includes("hybrid")) {
      remoteStatus = "hybrid";
    }

    let employmentType = "full-time";
    if (titleLower.includes("intern") || titleLower.includes("co-op") || titleLower.includes("trainee")) {
      employmentType = "internship";
    } else if (titleLower.includes("graduate") || titleLower.includes("junior") || titleLower.includes("entry")) {
      employmentType = "graduate";
    }

    // Attempt salary extraction from text
    let stipend: string | undefined;
    const salaryMatch = rawContent.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:\/|per)\s*(?:hr|hour|year|mo|month))?/i);
    if (salaryMatch) stipend = salaryMatch[0];

    results.push({
      externalId: String(job.id),
      sourceIdentifier: `gh_${boardToken}_${job.id}`,
      sourceName: `Greenhouse (${boardToken})`,
      companyName: boardToken.charAt(0).toUpperCase() + boardToken.slice(1),
      roleTitle: job.title.trim(),
      description: rawContent.slice(0, 3000),
      location: locationName.trim(),
      remoteStatus,
      employmentType,
      stipend,
      originalUrl: job.absolute_url,
      requiredSkills: extracted.skills.slice(0, 10),
      applicationOpenDate: job.updated_at ? new Date(job.updated_at).toISOString().split("T")[0] : undefined,
    });
  }

  return results;
}

// 2. Lever Postings API Connector
async function fetchLeverJobs(company: string): Promise<RawJobListing[]> {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`;
  const response = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "ProofPathAI-Intelligence/1.0" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMITED");
    throw new Error(`Lever API responded with ${response.status}: ${await response.text()}`);
  }

  const postings = await response.json();
  const results: RawJobListing[] = [];

  for (const post of postings) {
    const rawContent = (post.descriptionPlain || post.description || "").replace(/<[^>]*>?/gm, " ");
    const extracted = extractSkillsFromText(`${post.text} ${rawContent}`);
    const locationName = post.categories?.location || "Unspecified";
    const locLower = locationName.toLowerCase();
    const titleLower = post.text.toLowerCase();

    let remoteStatus: "remote" | "hybrid" | "onsite" = "onsite";
    if (locLower.includes("remote") || titleLower.includes("remote") || post.workplaceType === "remote") {
      remoteStatus = "remote";
    } else if (locLower.includes("hybrid") || titleLower.includes("hybrid") || post.workplaceType === "hybrid") {
      remoteStatus = "hybrid";
    }

    let employmentType = "full-time";
    if (titleLower.includes("intern") || titleLower.includes("co-op")) {
      employmentType = "internship";
    } else if (titleLower.includes("graduate") || titleLower.includes("junior")) {
      employmentType = "graduate";
    }

    results.push({
      externalId: String(post.id),
      sourceIdentifier: `lever_${company}_${post.id}`,
      sourceName: `Lever (${company})`,
      companyName: company.charAt(0).toUpperCase() + company.slice(1),
      roleTitle: post.text.trim(),
      description: rawContent.slice(0, 3000),
      location: locationName.trim(),
      remoteStatus,
      employmentType,
      originalUrl: post.hostedUrl || post.applyUrl,
      requiredSkills: extracted.skills.slice(0, 10),
      applicationOpenDate: post.createdAt ? new Date(post.createdAt).toISOString().split("T")[0] : undefined,
    });
  }

  return results;
}

// 3. Permitted Public Tech Feeds Connector (Arbeitnow Permitted API)
async function fetchPublicFeedJobs(): Promise<RawJobListing[]> {
  const url = "https://www.arbeitnow.com/api/job-board-api";
  const response = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "ProofPathAI-Intelligence/1.0" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMITED");
    throw new Error(`Public feed responded with ${response.status}`);
  }

  const data = await response.json();
  const jobs = data.data || [];
  const results: RawJobListing[] = [];

  for (const job of jobs.slice(0, 25)) {
    const rawContent = (job.description || "").replace(/<[^>]*>?/gm, " ");
    const extracted = extractSkillsFromText(`${job.title} ${rawContent} ${(job.tags || []).join(" ")}`);
    const titleLower = job.title.toLowerCase();

    let remoteStatus: "remote" | "hybrid" | "onsite" = job.remote ? "remote" : "onsite";
    let employmentType = "full-time";
    if (titleLower.includes("intern") || titleLower.includes("working student")) {
      employmentType = "internship";
    } else if (titleLower.includes("junior") || titleLower.includes("graduate")) {
      employmentType = "graduate";
    }

    results.push({
      externalId: job.slug || String(job.id || Math.random()),
      sourceIdentifier: `arbeitnow_${job.slug || job.id}`,
      sourceName: "Arbeitnow Open Feed",
      companyName: job.company_name || "Tech Employer",
      roleTitle: job.title.trim(),
      description: rawContent.slice(0, 3000),
      location: job.location || (job.remote ? "Remote" : "Global"),
      remoteStatus,
      employmentType,
      originalUrl: job.url,
      requiredSkills: extracted.skills.slice(0, 10),
      applicationOpenDate: job.created_at ? new Date(job.created_at * 1000).toISOString().split("T")[0] : undefined,
    });
  }

  return results;
}

// Internal Mutation: Record Ingestion Results
export const recordIngestionBatch = internalMutation({
  args: {
    sourceId: v.optional(v.id("sourceConfigurations")),
    sourceName: v.string(),
    listings: v.array(
      v.object({
        externalId: v.optional(v.string()),
        sourceIdentifier: v.string(),
        sourceName: v.string(),
        companyName: v.string(),
        roleTitle: v.string(),
        description: v.string(),
        location: v.string(),
        country: v.optional(v.string()),
        city: v.optional(v.string()),
        remoteStatus: v.union(v.literal("remote"), v.literal("hybrid"), v.literal("onsite")),
        employmentType: v.optional(v.string()),
        stipend: v.optional(v.string()),
        salaryMin: v.optional(v.number()),
        salaryMax: v.optional(v.number()),
        currency: v.optional(v.string()),
        applicationOpenDate: v.optional(v.string()),
        applicationDeadline: v.optional(v.string()),
        originalUrl: v.string(),
        requiredSkills: v.array(v.string()),
        eligibilityCriteria: v.optional(v.string()),
      })
    ),
    errorMessage: v.optional(v.string()),
    status: v.union(v.literal("success"), v.literal("partial"), v.literal("failed"), v.literal("rate_limited")),
    durationMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let added = 0;
    let updated = 0;

    for (const item of args.listings) {
      // 1. Duplicate detection: Check by sourceIdentifier or exact (companyName + roleTitle)
      const existing = await ctx.db
        .query("internships")
        .withIndex("by_sourceIdentifier", (q) => q.eq("sourceIdentifier", item.sourceIdentifier))
        .first();

      if (existing) {
        // Update freshness and last checked timestamp
        await ctx.db.patch(existing._id, {
          lastCheckedAt: now,
          listingStatus: "active",
          freshnessStatus: "fresh",
          description: item.description,
          location: item.location,
          stipend: item.stipend || existing.stipend,
        });
        updated++;
      } else {
        // Check fuzzy duplicate by company and normalized role
        const companyMatch = await ctx.db
          .query("internships")
          .withIndex("by_company", (q) => q.eq("companyName", item.companyName))
          .filter((q) => q.eq(q.field("roleTitle"), item.roleTitle))
          .first();

        if (companyMatch) {
          await ctx.db.patch(companyMatch._id, {
            lastCheckedAt: now,
            freshnessStatus: "fresh",
          });
          updated++;
        } else {
          // Insert new listing
          await ctx.db.insert("internships", {
            companyName: item.companyName,
            roleTitle: item.roleTitle,
            description: item.description,
            requiredSkills: item.requiredSkills.map(normalizeSkillName),
            eligibilityCriteria: item.eligibilityCriteria,
            location: item.location,
            country: item.country,
            city: item.city,
            remoteStatus: item.remoteStatus,
            employmentType: item.employmentType || "internship",
            stipend: item.stipend,
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            currency: item.currency,
            applicationOpenDate: item.applicationOpenDate || new Date().toISOString().split("T")[0],
            applicationDeadline: item.applicationDeadline,
            originalUrl: item.originalUrl,
            sourceName: item.sourceName,
            sourceIdentifier: item.sourceIdentifier,
            externalId: item.externalId,
            listingStatus: "active",
            freshnessStatus: "fresh",
            verificationStatus: "verified",
            sourceConfidence: "high",
            firstSeenAt: now,
            lastCheckedAt: now,
            lastVerifiedAt: now,
            createdAt: now,
          });
          added++;
        }
      }
    }

    // Update sourceConfiguration stats if ID was provided
    if (args.sourceId) {
      const source = await ctx.db.get(args.sourceId);
      if (source) {
        const nextInterval = (source.updateFrequencyMinutes || 60) * 60 * 1000;
        await ctx.db.patch(source._id, {
          lastRunAt: now,
          lastStatus: args.status,
          nextCheckAt: now + nextInterval,
          totalListingsFound: (source.totalListingsFound || 0) + added,
          consecutiveFailures: args.status === "failed" ? (source.consecutiveFailures || 0) + 1 : 0,
        });
      }
    }

    // Record Ingestion Run
    await ctx.db.insert("ingestionRuns", {
      sourceId: args.sourceId,
      sourceName: args.sourceName,
      status: args.status,
      listingsProcessed: args.listings.length,
      listingsAdded: added,
      listingsUpdated: updated,
      listingsExpired: 0,
      errorMessage: args.errorMessage,
      durationMs: args.durationMs,
      executedAt: now,
    });

    return { added, updated, processed: args.listings.length };
  },
});

// Action: Ingest single source
export const ingestSourceAction = action({
  args: {
    token: v.optional(v.string()),
    sourceId: v.optional(v.id("sourceConfigurations")),
    sourceType: v.string(),
    boardToken: v.optional(v.string()),
    sourceName: v.string(),
    endpointOrUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // When invoked from frontend client, enforce backend administrative authentication
    if (args.token) {
      const currentUser: any = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Administrative authorization required to trigger manual connector ingestion");
      }
    }

    const startTime = Date.now();
    try {
      let rawListings: RawJobListing[] = [];

      if (args.sourceType === "greenhouse" && args.boardToken) {
        rawListings = await fetchGreenhouseJobs(args.boardToken);
      } else if (args.sourceType === "lever" && args.boardToken) {
        rawListings = await fetchLeverJobs(args.boardToken);
      } else if (args.sourceType === "feed") {
        rawListings = await fetchPublicFeedJobs();
      } else if (args.sourceType === "web_discovery") {
        // Safe pluggable provider check
        const searchApiKey = process.env.JOB_SEARCH_API_KEY;
        if (!searchApiKey) {
          return {
            status: "partial" as const,
            message: "Web Discovery connector configured. Connect API credentials in environment variables to enable live programmatic web searches.",
            listingsProcessed: 0,
            listingsAdded: 0,
          };
        }
      } else {
        throw new Error(`Unsupported or unconfigured sourceType: ${args.sourceType}`);
      }

      const durationMs = Date.now() - startTime;
      const res = await ctx.runMutation(internal.jobIntelligence.recordIngestionBatch, {
        sourceId: args.sourceId,
        sourceName: args.sourceName,
        listings: rawListings,
        status: "success",
        durationMs,
      });

      return {
        status: "success" as const,
        listingsProcessed: res.processed,
        listingsAdded: res.added,
        listingsUpdated: res.updated,
      };
    } catch (err: any) {
      const isRateLimited = err?.message === "RATE_LIMITED";
      const durationMs = Date.now() - startTime;

      await ctx.runMutation(internal.jobIntelligence.recordIngestionBatch, {
        sourceId: args.sourceId,
        sourceName: args.sourceName,
        listings: [],
        status: isRateLimited ? "rate_limited" : "failed",
        errorMessage: String(err?.message || err),
        durationMs,
      });

      return {
        status: isRateLimited ? ("rate_limited" as const) : ("failed" as const),
        error: String(err?.message || err),
        listingsProcessed: 0,
        listingsAdded: 0,
      };
    }
  },
});

// Scheduler Tick Action: Called every 1 minute by Convex Cron
export const schedulerTick = internalAction({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch enabled sources that are due for polling
    const dueSources: any[] = await ctx.runQuery(internal.jobIntelligence.getDueSourcesInternal, {});

    if (!dueSources || dueSources.length === 0) {
      return { checked: 0, message: "No source connectors due at this minute." };
    }

    // Process up to 2 sources per minute tick to ensure strict rate-limiting and bounded resource usage
    const batch = dueSources.slice(0, 2);
    let processedSources = 0;

    for (const source of batch) {
      await ctx.runAction(internal.jobIntelligence.ingestSourceAction, {
        sourceId: source._id,
        sourceType: source.sourceType,
        boardToken: source.boardToken,
        sourceName: source.name,
        endpointOrUrl: source.endpointOrUrl,
      });
      processedSources++;
    }

    return { checked: processedSources, totalDue: dueSources.length };
  },
});

// Internal Query: Get due sources
export const getDueSourcesInternal = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const enabledSources = await ctx.db
      .query("sourceConfigurations")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();

    // Filter sources whose nextCheckAt <= now or undefined
    return enabledSources.filter((s) => !s.nextCheckAt || s.nextCheckAt <= now);
  },
});

// Seed default verified connectors
export const seedDefaultSources = mutation({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.token) {
      await requireAdmin(ctx, args.token);
    }
    const existing = await ctx.db.query("sourceConfigurations").first();
    if (existing) return { message: "Sources already initialized." };

    const now = Date.now();
    const defaultSources = [
      {
        name: "Stripe University Careers",
        sourceType: "greenhouse" as const,
        boardToken: "stripe",
        enabled: true,
        updateFrequencyMinutes: 60,
        updateFrequencyHours: 1,
        nextCheckAt: now,
        createdAt: now,
      },
      {
        name: "Figma Global Early Careers",
        sourceType: "greenhouse" as const,
        boardToken: "figma",
        enabled: true,
        updateFrequencyMinutes: 60,
        updateFrequencyHours: 1,
        nextCheckAt: now + 5 * 60 * 1000,
        createdAt: now,
      },
      {
        name: "Cloudflare Student Engineering",
        sourceType: "greenhouse" as const,
        boardToken: "cloudflare",
        enabled: true,
        updateFrequencyMinutes: 60,
        updateFrequencyHours: 1,
        nextCheckAt: now + 10 * 60 * 1000,
        createdAt: now,
      },
      {
        name: "Palantir Global Technology Postings",
        sourceType: "lever" as const,
        boardToken: "palantir",
        enabled: true,
        updateFrequencyMinutes: 60,
        updateFrequencyHours: 1,
        nextCheckAt: now + 15 * 60 * 1000,
        createdAt: now,
      },
      {
        name: "Arbeitnow Open Developer Feed",
        sourceType: "feed" as const,
        enabled: true,
        updateFrequencyMinutes: 30,
        updateFrequencyHours: 1,
        nextCheckAt: now,
        createdAt: now,
      },
      {
        name: "Global Web Search Discovery Adapter",
        sourceType: "web_discovery" as const,
        enabled: false,
        updateFrequencyMinutes: 1440,
        updateFrequencyHours: 24,
        nextCheckAt: now + 24 * 60 * 60 * 1000,
        createdAt: now,
      },
    ];

    for (const src of defaultSources) {
      await ctx.db.insert("sourceConfigurations", src);
    }

    return { count: defaultSources.length, message: "Initialized default global connectors." };
  },
});

// Admin Queries & Mutations for Intelligence System
export const getLiveIntelligenceStatus = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const sources = await ctx.db.query("sourceConfigurations").collect();
    const activeSources = sources.filter((s) => s.enabled);

    const recentRuns = await ctx.db
      .query("ingestionRuns")
      .order("desc")
      .take(15);

    const totalListings = await ctx.db.query("internships").collect();
    const activeListings = totalListings.filter((l) => l.listingStatus === "active");
    const freshListings = totalListings.filter((l) => l.freshnessStatus === "fresh");
    const verifiedListings = totalListings.filter((l) => l.verificationStatus === "verified");

    // Compute stats from recent runs
    let newlyDiscovered = 0;
    let updatedRecords = 0;
    let failedSources = 0;
    let lastSuccessfulRun: number | undefined;

    for (const run of recentRuns) {
      newlyDiscovered += run.listingsAdded;
      updatedRecords += run.listingsUpdated;
      if (run.status === "failed") failedSources++;
      if (run.status === "success" && (!lastSuccessfulRun || run.executedAt > lastSuccessfulRun)) {
        lastSuccessfulRun = run.executedAt;
      }
    }

    return {
      sourcesCount: sources.length,
      activeSourcesCount: activeSources.length,
      totalListingsCount: totalListings.length,
      activeListingsCount: activeListings.length,
      freshListingsCount: freshListings.length,
      verifiedListingsCount: verifiedListings.length,
      lastSuccessfulRun: lastSuccessfulRun || (recentRuns[0]?.executedAt ?? null),
      newlyDiscovered,
      updatedRecords,
      failedSources,
      sources,
      recentRuns,
    };
  },
});

// Toggle source enabled
export const toggleSource = mutation({
  args: {
    token: v.string(),
    sourceId: v.id("sourceConfigurations"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.sourceId, { enabled: args.enabled });
    return { success: true };
  },
});

// Update source polling frequency
export const updateSourceFrequency = mutation({
  args: {
    token: v.string(),
    sourceId: v.id("sourceConfigurations"),
    frequencyMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.sourceId, {
      updateFrequencyMinutes: args.frequencyMinutes,
      updateFrequencyHours: Math.ceil(args.frequencyMinutes / 60),
    });
    return { success: true };
  },
});

// Add new source
export const addSourceConfiguration = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    sourceType: v.union(
      v.literal("api"),
      v.literal("feed"),
      v.literal("csv"),
      v.literal("manual"),
      v.literal("greenhouse"),
      v.literal("lever"),
      v.literal("web_discovery")
    ),
    boardToken: v.optional(v.string()),
    endpointOrUrl: v.optional(v.string()),
    updateFrequencyMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const now = Date.now();
    const id = await ctx.db.insert("sourceConfigurations", {
      name: args.name.trim(),
      sourceType: args.sourceType,
      boardToken: args.boardToken?.trim(),
      endpointOrUrl: args.endpointOrUrl?.trim(),
      enabled: true,
      updateFrequencyMinutes: args.updateFrequencyMinutes,
      updateFrequencyHours: Math.ceil(args.updateFrequencyMinutes / 60),
      nextCheckAt: now,
      createdAt: now,
    });
    return { id, success: true };
  },
});
