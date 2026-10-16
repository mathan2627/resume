import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName, calculateSkillScore } from "./lib/taxonomy";

export const getProfile = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);

    const profile = await ctx.db
      .query("profiles")
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

export const updateProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
    college: v.optional(v.string()),
    course: v.optional(v.string()),
    graduationYear: v.optional(v.number()),
    preferredRole: v.optional(v.string()),
    technicalSkills: v.optional(v.array(v.string())),
    locationPreference: v.optional(v.string()),
    remotePreference: v.optional(
      v.union(v.literal("remote"), v.literal("hybrid"), v.literal("onsite"), v.literal("any"))
    ),
    preferredStipendMin: v.optional(v.number()),
    weeklyAvailabilityHours: v.optional(v.number()),
    languages: v.optional(v.array(v.string())),
    careerInterests: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    if (args.name && args.name.trim() !== user.name) {
      await ctx.db.patch(user._id, {
        name: args.name.trim(),
        updatedAt: now,
      });
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const normalizedSkills = args.technicalSkills?.map(normalizeSkillName);

    const updateFields: any = {
      updatedAt: now,
    };

    if (args.college !== undefined) updateFields.college = args.college;
    if (args.course !== undefined) updateFields.course = args.course;
    if (args.graduationYear !== undefined) updateFields.graduationYear = args.graduationYear;
    if (args.preferredRole !== undefined) updateFields.preferredRole = args.preferredRole;
    if (args.locationPreference !== undefined) updateFields.locationPreference = args.locationPreference;
    if (args.remotePreference !== undefined) updateFields.remotePreference = args.remotePreference;
    if (args.preferredStipendMin !== undefined) updateFields.preferredStipendMin = args.preferredStipendMin;
    if (args.weeklyAvailabilityHours !== undefined) updateFields.weeklyAvailabilityHours = args.weeklyAvailabilityHours;
    if (args.languages !== undefined) updateFields.languages = args.languages;
    if (args.careerInterests !== undefined) updateFields.careerInterests = args.careerInterests;
    if (args.bio !== undefined) updateFields.bio = args.bio;
    if (normalizedSkills !== undefined) updateFields.technicalSkills = normalizedSkills;

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, updateFields);
      return existingProfile._id;
    } else {
      return await ctx.db.insert("profiles", {
        userId: user._id,
        onboardingCompleted: true,
        createdAt: now,
        ...updateFields,
      });
    }
  },
});

export const completeOnboarding = mutation({
  args: {
    token: v.string(),
    college: v.optional(v.string()),
    course: v.optional(v.string()),
    graduationYear: v.optional(v.number()),
    preferredRole: v.optional(v.string()),
    technicalSkills: v.array(v.string()),
    locationPreference: v.optional(v.string()),
    remotePreference: v.optional(
      v.union(v.literal("remote"), v.literal("hybrid"), v.literal("onsite"), v.literal("any"))
    ),
    preferredStipendMin: v.optional(v.number()),
    weeklyAvailabilityHours: v.optional(v.number()),
    languages: v.optional(v.array(v.string())),
    careerInterests: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    const normalizedSkills = args.technicalSkills.map(normalizeSkillName);

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const profileData = {
      college: args.college,
      course: args.course,
      graduationYear: args.graduationYear,
      preferredRole: args.preferredRole,
      technicalSkills: normalizedSkills,
      locationPreference: args.locationPreference,
      remotePreference: args.remotePreference || "any",
      preferredStipendMin: args.preferredStipendMin,
      weeklyAvailabilityHours: args.weeklyAvailabilityHours,
      languages: args.languages,
      careerInterests: args.careerInterests,
      onboardingCompleted: true,
      updatedAt: now,
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
    } else {
      await ctx.db.insert("profiles", {
        userId: user._id,
        createdAt: now,
        ...profileData,
      });
    }

    // Populate initial claimed skillEvidence records
    for (const skill of normalizedSkills) {
      const existingEvidence = await ctx.db
        .query("skillEvidence")
        .withIndex("by_user_skill", (q) =>
          q.eq("userId", user._id).eq("skillName", skill)
        )
        .first();

      if (!existingEvidence) {
        await ctx.db.insert("skillEvidence", {
          userId: user._id,
          skillName: skill,
          status: "claimed",
          evidenceScore: calculateSkillScore({ status: "claimed" }),
          evidenceType: "resume",
          confidence: "low",
          explanation: "Declared during student profile onboarding. Requires GitHub project evidence or practical assessment to verify.",
          lastAssessedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Add milestone notification
    await ctx.db.insert("notifications", {
      userId: user._id,
      title: "Profile Onboarding Completed",
      message: "Your initial profile is ready! Upload your resume or link a GitHub repo to turn claimed skills into verified evidence.",
      type: "milestone",
      read: false,
      link: "/dashboard",
      createdAt: now,
    });

    return { success: true };
  },
});
