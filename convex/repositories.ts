import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName, calculateSkillScore } from "./lib/taxonomy";

export const addRepositoryAndEvidence = mutation({
  args: {
    token: v.string(),
    repoUrl: v.string(),
    repoName: v.string(),
    owner: v.string(),
    description: v.optional(v.string()),
    language: v.optional(v.string()),
    languagesDistribution: v.optional(v.record(v.string(), v.number())),
    stars: v.number(),
    forks: v.number(),
    defaultBranch: v.string(),
    topics: v.array(v.string()),
    evidenceList: v.array(
      v.object({
        skillName: v.string(),
        filePath: v.optional(v.string()),
        excerpt: v.optional(v.string()),
        sourceUrl: v.optional(v.string()),
        evidenceType: v.union(
          v.literal("readme"),
          v.literal("source_code"),
          v.literal("config")
        ),
        confidence: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
        explanation: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    // Check if repo already registered for user
    const existingRepo = await ctx.db
      .query("repositories")
      .withIndex("by_user_repo", (q) =>
        q.eq("userId", user._id).eq("repoUrl", args.repoUrl)
      )
      .first();

    let repositoryId;
    if (existingRepo) {
      repositoryId = existingRepo._id;
      await ctx.db.patch(existingRepo._id, {
        description: args.description,
        language: args.language,
        languagesDistribution: args.languagesDistribution,
        stars: args.stars,
        forks: args.forks,
        topics: args.topics,
        lastAnalyzedAt: now,
      });
    } else {
      repositoryId = await ctx.db.insert("repositories", {
        userId: user._id,
        repoUrl: args.repoUrl,
        repoName: args.repoName,
        owner: args.owner,
        description: args.description,
        language: args.language,
        languagesDistribution: args.languagesDistribution,
        stars: args.stars,
        forks: args.forks,
        defaultBranch: args.defaultBranch,
        topics: args.topics,
        lastAnalyzedAt: now,
        createdAt: now,
      });
    }

    // Process detected skill evidence
    let provenCount = 0;
    for (const ev of args.evidenceList) {
      const canonicalSkill = normalizeSkillName(ev.skillName);
      if (!canonicalSkill) continue;

      const existingEvidence = await ctx.db
        .query("skillEvidence")
        .withIndex("by_user_skill", (q) =>
          q.eq("userId", user._id).eq("skillName", canonicalSkill)
        )
        .first();

      // If already challenge_assessed, maintain that highest verified tier
      const shouldUpgrade = !existingEvidence || existingEvidence.status !== "challenge_assessed";
      const newStatus = shouldUpgrade ? "evidence_found" : "challenge_assessed";
      const score = calculateSkillScore({
        status: newStatus,
        confidence: ev.confidence,
        assessmentScore: existingEvidence?.evidenceScore,
      });

      if (existingEvidence) {
        await ctx.db.patch(existingEvidence._id, {
          status: newStatus,
          evidenceScore: Math.max(existingEvidence.evidenceScore, score),
          repositoryId,
          repoName: args.repoName,
          filePath: ev.filePath || existingEvidence.filePath,
          excerpt: ev.excerpt || existingEvidence.excerpt,
          sourceUrl: ev.sourceUrl || existingEvidence.sourceUrl,
          evidenceType: ev.evidenceType,
          confidence: ev.confidence,
          explanation: ev.explanation,
          lastAssessedAt: now,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("skillEvidence", {
          userId: user._id,
          skillName: canonicalSkill,
          status: "evidence_found",
          evidenceScore: score,
          repositoryId,
          repoName: args.repoName,
          filePath: ev.filePath,
          excerpt: ev.excerpt,
          sourceUrl: ev.sourceUrl,
          evidenceType: ev.evidenceType,
          confidence: ev.confidence,
          explanation: ev.explanation,
          lastAssessedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }
      provenCount++;
    }

    // Add notification
    await ctx.db.insert("notifications", {
      userId: user._id,
      title: "GitHub Repository Analyzed",
      message: `Analyzed "${args.owner}/${args.repoName}". Discovered supporting project evidence for ${provenCount} skills.`,
      type: "match",
      read: false,
      link: "/skills",
      createdAt: now,
    });

    return {
      repositoryId,
      evidenceFoundCount: provenCount,
    };
  },
});

export const listUserRepositories = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    return await ctx.db
      .query("repositories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const removeRepository = mutation({
  args: {
    token: v.string(),
    repositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const repo = await ctx.db.get(args.repositoryId);
    if (!repo || repo.userId !== user._id) {
      throw new Error("Repository not found or unauthorized");
    }

    // Find attached evidence
    const attachedEvidence = await ctx.db
      .query("skillEvidence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const ev of attachedEvidence) {
      if (ev.repositoryId === repo._id) {
        if (ev.status === "evidence_found") {
          // Downgrade back to claimed or insufficient
          await ctx.db.patch(ev._id, {
            status: "claimed",
            evidenceScore: calculateSkillScore({ status: "claimed" }),
            repositoryId: undefined,
            repoName: undefined,
            filePath: undefined,
            excerpt: undefined,
            sourceUrl: undefined,
            confidence: "low",
            explanation: "Repository evidence was detached by user.",
            updatedAt: Date.now(),
          });
        }
      }
    }

    await ctx.db.delete(repo._id);
    return { success: true };
  },
});
