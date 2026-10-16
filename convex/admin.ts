import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";
import { normalizeSkillName } from "./lib/taxonomy";

export const getAdminOverview = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const allUsers = await ctx.db.query("users").collect();
    const students = allUsers.filter((u) => u.role === "student");
    const recruiters = allUsers.filter((u) => u.role === "recruiter");
    const admins = allUsers.filter((u) => u.role === "admin");

    const allListings = await ctx.db.query("internships").collect();
    const activeListings = allListings.filter((l) => l.listingStatus === "active");
    const verifiedListings = allListings.filter((l) => l.verificationStatus === "verified");

    const recentLogs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(10);

    const recentAiUsage = await ctx.db
      .query("aiUsage")
      .order("desc")
      .take(10);

    const runs = await ctx.db
      .query("ingestionRuns")
      .order("desc")
      .take(5);

    return {
      metrics: {
        totalUsers: allUsers.length,
        studentCount: students.length,
        recruiterCount: recruiters.length,
        adminCount: admins.length,
        totalListings: allListings.length,
        activeListings: activeListings.length,
        verifiedListings: verifiedListings.length,
      },
      recentLogs,
      recentAiUsage,
      recentIngestionRuns: runs,
    };
  },
});

export const listUsers = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    token: v.string(),
    targetUserId: v.id("users"),
    newRole: v.union(v.literal("student"), v.literal("recruiter"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const { user: adminUser } = await requireAdmin(ctx, args.token);
    const target = await ctx.db.get(args.targetUserId);
    if (!target) throw new Error("Target user not found");

    const now = Date.now();
    await ctx.db.patch(target._id, {
      role: args.newRole,
      updatedAt: now,
    });

    // Record audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUser._id,
      action: "ROLE_CHANGE",
      resourceType: "users",
      resourceId: target._id,
      details: `Changed role of ${target.email} from ${target.role} to ${args.newRole}`,
      timestamp: now,
    });

    return { success: true };
  },
});

export const listAllListings = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.db.query("internships").order("desc").collect();
  },
});

export const verifyListing = mutation({
  args: {
    token: v.string(),
    listingId: v.id("internships"),
    verificationStatus: v.union(v.literal("verified"), v.literal("unverified")),
  },
  handler: async (ctx, args) => {
    const { user: adminUser } = await requireAdmin(ctx, args.token);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const now = Date.now();
    await ctx.db.patch(listing._id, {
      verificationStatus: args.verificationStatus,
      lastCheckedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      userId: adminUser._id,
      action: "LISTING_VERIFICATION",
      resourceType: "internships",
      resourceId: listing._id,
      details: `Updated verification of ${listing.roleTitle} at ${listing.companyName} to ${args.verificationStatus}`,
      timestamp: now,
    });

    return { success: true };
  },
});

export const updateListingStatus = mutation({
  args: {
    token: v.string(),
    listingId: v.id("internships"),
    listingStatus: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("stale"),
      v.literal("pending_review")
    ),
  },
  handler: async (ctx, args) => {
    const { user: adminUser } = await requireAdmin(ctx, args.token);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const now = Date.now();
    await ctx.db.patch(listing._id, {
      listingStatus: args.listingStatus,
      lastCheckedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      userId: adminUser._id,
      action: "LISTING_STATUS_CHANGE",
      resourceType: "internships",
      resourceId: listing._id,
      details: `Updated status of ${listing.roleTitle} at ${listing.companyName} to ${args.listingStatus}`,
      timestamp: now,
    });

    return { success: true };
  },
});

// Import listings from CSV with duplicate detection
export const importListingsCsv = mutation({
  args: {
    token: v.string(),
    listings: v.array(
      v.object({
        companyName: v.string(),
        roleTitle: v.string(),
        description: v.string(),
        requiredSkills: v.array(v.string()),
        location: v.string(),
        remoteStatus: v.union(v.literal("remote"), v.literal("hybrid"), v.literal("onsite")),
        stipend: v.optional(v.string()),
        applicationDeadline: v.optional(v.string()),
        originalUrl: v.string(),
        sourceName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { user: adminUser } = await requireAdmin(ctx, args.token);
    const now = Date.now();
    let added = 0;
    let duplicates = 0;

    for (const item of args.listings) {
      // Duplicate detection by company name and role title
      const existing = await ctx.db
        .query("internships")
        .withIndex("by_company", (q) => q.eq("companyName", item.companyName.trim()))
        .filter((q) => q.eq(q.field("roleTitle"), item.roleTitle.trim()))
        .first();

      if (existing) {
        duplicates++;
        continue;
      }

      await ctx.db.insert("internships", {
        companyName: item.companyName.trim(),
        roleTitle: item.roleTitle.trim(),
        description: item.description.trim(),
        requiredSkills: item.requiredSkills.map(normalizeSkillName),
        location: item.location.trim(),
        remoteStatus: item.remoteStatus,
        stipend: item.stipend?.trim(),
        applicationOpenDate: new Date().toISOString().split("T")[0],
        applicationDeadline: item.applicationDeadline?.trim(),
        originalUrl: item.originalUrl.trim(),
        sourceName: item.sourceName.trim() || "CSV Ingestion",
        listingStatus: "active",
        verificationStatus: "verified",
        firstSeenAt: now,
        lastCheckedAt: now,
        createdAt: now,
      });
      added++;
    }

    // Record ingestion run
    await ctx.db.insert("ingestionRuns", {
      sourceName: "CSV Bulk Import",
      status: "success",
      listingsProcessed: args.listings.length,
      listingsAdded: added,
      listingsUpdated: duplicates,
      executedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      userId: adminUser._id,
      action: "CSV_IMPORT",
      resourceType: "internships",
      details: `Imported ${added} new listings; skipped ${duplicates} duplicates.`,
      timestamp: now,
    });

    return {
      processed: args.listings.length,
      added,
      duplicates,
    };
  },
});

export const listAuditLogs = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(args.limit || 50);
  },
});
