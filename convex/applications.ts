import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const createApplication = mutation({
  args: {
    token: v.string(),
    internshipId: v.id("internships"),
    status: v.union(
      v.literal("saved"),
      v.literal("planning"),
      v.literal("applied"),
      v.literal("assessment"),
      v.literal("interview"),
      v.literal("offer"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    appliedDate: v.optional(v.string()),
    deadlineDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("internshipId"), args.internshipId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        appliedDate: args.appliedDate || existing.appliedDate,
        deadlineDate: args.deadlineDate || existing.deadlineDate,
        notes: args.notes !== undefined ? args.notes : existing.notes,
        updatedAt: now,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("applications", {
      userId: user._id,
      internshipId: args.internshipId,
      status: args.status,
      appliedDate: args.appliedDate,
      deadlineDate: args.deadlineDate,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    const internship = await ctx.db.get(args.internshipId);
    await ctx.db.insert("notifications", {
      userId: user._id,
      title: "Application Pipeline Updated",
      message: `Tracking application for "${internship?.roleTitle} at ${internship?.companyName}" (${args.status.toUpperCase()}).`,
      type: "deadline",
      read: false,
      link: "/applications",
      createdAt: now,
    });

    return id;
  },
});

export const updateApplicationStatus = mutation({
  args: {
    token: v.string(),
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("saved"),
      v.literal("planning"),
      v.literal("applied"),
      v.literal("assessment"),
      v.literal("interview"),
      v.literal("offer"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    notes: v.optional(v.string()),
    appliedDate: v.optional(v.string()),
    deadlineDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const app = await ctx.db.get(args.applicationId);
    if (!app || app.userId !== user._id) {
      throw new Error("Application record not found or unauthorized");
    }

    const now = Date.now();
    await ctx.db.patch(app._id, {
      status: args.status,
      notes: args.notes !== undefined ? args.notes : app.notes,
      appliedDate: args.appliedDate !== undefined ? args.appliedDate : app.appliedDate,
      deadlineDate: args.deadlineDate !== undefined ? args.deadlineDate : app.deadlineDate,
      updatedAt: now,
    });

    return { success: true };
  },
});

export const deleteApplication = mutation({
  args: {
    token: v.string(),
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const app = await ctx.db.get(args.applicationId);
    if (!app || app.userId !== user._id) {
      throw new Error("Application record not found or unauthorized");
    }

    await ctx.db.delete(app._id);
    return { success: true };
  },
});

export const listApplications = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const results: any[] = [];
    for (const app of applications) {
      const internship = await ctx.db.get(app.internshipId);
      if (internship) {
        results.push({
          ...app,
          internship,
        });
      }
    }

    return results;
  },
});
