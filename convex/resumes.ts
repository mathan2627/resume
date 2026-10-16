import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName, calculateSkillScore } from "./lib/taxonomy";

// Generate an upload URL for Convex File Storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save analyzed resume and integrate claimed skills into evidence model
export const saveResume = mutation({
  args: {
    token: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    rawText: v.string(),
    parsedData: v.object({
      skills: v.array(v.string()),
      frameworks: v.array(v.string()),
      programmingLanguages: v.array(v.string()),
      education: v.array(
        v.object({
          institution: v.string(),
          degree: v.string(),
          fieldOfStudy: v.optional(v.string()),
          year: v.optional(v.string()),
        })
      ),
      projects: v.array(
        v.object({
          title: v.string(),
          description: v.string(),
          technologies: v.array(v.string()),
          link: v.optional(v.string()),
        })
      ),
      experience: v.array(
        v.object({
          role: v.string(),
          company: v.string(),
          duration: v.string(),
          summary: v.string(),
        })
      ),
      certifications: v.array(v.string()),
      careerPreferences: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    // Determine version number
    const pastResumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const nextVersion = pastResumes.length + 1;

    // Normalize all detected skills
    const normalizedSkills = Array.from(
      new Set(
        [
          ...args.parsedData.skills,
          ...args.parsedData.frameworks,
          ...args.parsedData.programmingLanguages,
        ].map(normalizeSkillName).filter(Boolean)
      )
    );

    const resumeId = await ctx.db.insert("resumes", {
      userId: user._id,
      fileStorageId: args.fileStorageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      version: nextVersion,
      rawText: args.rawText,
      parsedData: {
        ...args.parsedData,
        skills: args.parsedData.skills.map(normalizeSkillName),
        frameworks: args.parsedData.frameworks.map(normalizeSkillName),
        programmingLanguages: args.parsedData.programmingLanguages.map(normalizeSkillName),
      },
      createdAt: now,
      updatedAt: now,
    });

    // Populate or update skillEvidence records as "claimed" (preserving any already proven evidence)
    for (const skill of normalizedSkills) {
      const existing = await ctx.db
        .query("skillEvidence")
        .withIndex("by_user_skill", (q) =>
          q.eq("userId", user._id).eq("skillName", skill)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("skillEvidence", {
          userId: user._id,
          skillName: skill,
          status: "claimed",
          evidenceScore: calculateSkillScore({ status: "claimed" }),
          evidenceType: "resume",
          confidence: "low",
          explanation: `Extracted from resume "${args.fileName}". Currently claimed without external verification.`,
          lastAssessedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Update profile technicalSkills
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (profile) {
      const existingSkills = profile.technicalSkills || [];
      const merged = Array.from(new Set([...existingSkills, ...normalizedSkills]));
      await ctx.db.patch(profile._id, {
        technicalSkills: merged,
        updatedAt: now,
      });
    }

    // Add notification
    await ctx.db.insert("notifications", {
      userId: user._id,
      title: "Resume Analyzed Successfully",
      message: `Parsed ${normalizedSkills.length} skills from "${args.fileName}". Link your GitHub projects to discover supporting evidence.`,
      type: "milestone",
      read: false,
      link: "/skills",
      createdAt: now,
    });

    return {
      resumeId,
      version: nextVersion,
      extractedSkillsCount: normalizedSkills.length,
      skills: normalizedSkills,
    };
  },
});

// List all uploaded resumes for the user
export const listResumes = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    return await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get a single resume
export const getResume = query({
  args: {
    token: v.string(),
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userId !== user._id) {
      throw new Error("Resume not found or unauthorized");
    }
    return resume;
  },
});

// Delete a resume
export const deleteResume = mutation({
  args: {
    token: v.string(),
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userId !== user._id) {
      throw new Error("Resume not found or unauthorized");
    }

    if (resume.fileStorageId) {
      await ctx.storage.delete(resume.fileStorageId);
    }

    await ctx.db.delete(resume._id);
    return { success: true };
  },
});
