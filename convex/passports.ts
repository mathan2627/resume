import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const getPassportConfig = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);

    const config = await ctx.db
      .query("publicPassports")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return config;
  },
});

export const getUserPassportConfig = getPassportConfig;

export const updatePassportConfig = mutation({
  args: {
    token: v.string(),
    isPublic: v.boolean(),
    visibleSections: v.object({
      skills: v.boolean(),
      repositories: v.boolean(),
      challenges: v.boolean(),
      education: v.boolean(),
      contact: v.boolean(),
    }),
    customSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    // Check custom slug uniqueness if provided
    if (args.customSlug) {
      const cleanSlug = args.customSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      const existing = await ctx.db
        .query("publicPassports")
        .withIndex("by_slug", (q) => q.eq("customSlug", cleanSlug))
        .first();

      if (existing && existing.userId !== user._id) {
        throw new Error("This custom passport URL slug is already taken. Please choose another.");
      }
    }

    const config = await ctx.db
      .query("publicPassports")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (config) {
      await ctx.db.patch(config._id, {
        isPublic: args.isPublic,
        visibleSections: args.visibleSections,
        customSlug: args.customSlug?.trim().toLowerCase(),
        updatedAt: now,
      });
      return config._id;
    } else {
      const shareToken = Math.random().toString(36).substring(2, 12);
      return await ctx.db.insert("publicPassports", {
        userId: user._id,
        shareToken,
        isPublic: args.isPublic,
        visibleSections: args.visibleSections,
        customSlug: args.customSlug?.trim().toLowerCase(),
        viewsCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const getPublicPassport = query({
  args: {
    tokenOrSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const clean = args.tokenOrSlug.trim();

    // Try finding by token first
    let passport = await ctx.db
      .query("publicPassports")
      .withIndex("by_token", (q) => q.eq("shareToken", clean))
      .first();

    // If not found, try finding by custom slug
    if (!passport) {
      passport = await ctx.db
        .query("publicPassports")
        .withIndex("by_slug", (q) => q.eq("customSlug", clean.toLowerCase()))
        .first();
    }

    if (!passport || !passport.isPublic) {
      return {
        available: false,
        reason: "This Proof Passport is either private or does not exist.",
      };
    }

    const user = await ctx.db.get(passport.userId);
    if (!user) {
      return { available: false, reason: "Profile not found." };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Only return consented data based on visibleSections
    let skillsEvidence: any = null;
    if (passport.visibleSections.skills) {
      skillsEvidence = await ctx.db
        .query("skillEvidence")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }

    let repositories: any = null;
    if (passport.visibleSections.repositories) {
      repositories = await ctx.db
        .query("repositories")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }

    let challengeAttempts: any = null;
    if (passport.visibleSections.challenges) {
      const attempts = await ctx.db
        .query("challengeAttempts")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("passed"), true))
        .collect();

      challengeAttempts = attempts.map((a) => ({
        skillName: a.skillName,
        score: a.score,
        completedAt: a.completedAt,
      }));
    }

    return {
      available: true,
      user: {
        name: user.name,
        email: passport.visibleSections.contact ? user.email : undefined,
      },
      profile: {
        college: passport.visibleSections.education ? profile?.college : undefined,
        course: passport.visibleSections.education ? profile?.course : undefined,
        graduationYear: passport.visibleSections.education ? profile?.graduationYear : undefined,
        preferredRole: profile?.preferredRole,
        bio: profile?.bio,
      },
      visibleSections: passport.visibleSections,
      skillsEvidence,
      repositories,
      challengeAttempts,
    };
  },
});
