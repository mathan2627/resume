import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { MASTER_TAXONOMY, calculateSkillScore, normalizeSkillName } from "./lib/taxonomy";

// Return the entire master taxonomy
export const getTaxonomy = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db.query("skills").collect();
    if (list.length > 0) return list;
    return MASTER_TAXONOMY;
  },
});

// Seed initial master taxonomy if not already populated
export const seedSkills = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("skills").first();
    if (existing) return { count: 0, message: "Taxonomy already seeded." };

    let count = 0;
    for (const item of MASTER_TAXONOMY) {
      await ctx.db.insert("skills", {
        name: item.name,
        category: item.category,
        synonyms: item.synonyms,
        description: item.description,
        popularity: 10,
      });
      count++;
    }

    return { count, message: `Successfully seeded ${count} master taxonomy skills.` };
  },
});

// Get user's comprehensive skill evidence summary
export const getUserEvidenceSummary = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const evidenceList = await ctx.db
      .query("skillEvidence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const claimed = evidenceList.filter((e) => e.status === "claimed");
    const evidenceFound = evidenceList.filter((e) => e.status === "evidence_found");
    const challengeAssessed = evidenceList.filter((e) => e.status === "challenge_assessed");
    const insufficient = evidenceList.filter((e) => e.status === "evidence_insufficient");

    const totalSkills = evidenceList.length;
    const avgScore =
      totalSkills > 0
        ? Math.round(evidenceList.reduce((acc, curr) => acc + curr.evidenceScore, 0) / totalSkills)
        : 0;

    return {
      totalSkills,
      averageScore: avgScore,
      evidenceList,
      counts: {
        claimed: claimed.length,
        evidenceFound: evidenceFound.length,
        challengeAssessed: challengeAssessed.length,
        insufficient: insufficient.length,
      },
      grouped: {
        claimed,
        evidenceFound,
        challengeAssessed,
        insufficient,
      },
    };
  },
});

// Manually claim or update a skill evidence state
export const updateSkillClaim = mutation({
  args: {
    token: v.string(),
    skillName: v.string(),
    status: v.union(
      v.literal("claimed"),
      v.literal("evidence_found"),
      v.literal("challenge_assessed"),
      v.literal("evidence_insufficient")
    ),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const canonicalName = normalizeSkillName(args.skillName);
    const now = Date.now();

    const existing = await ctx.db
      .query("skillEvidence")
      .withIndex("by_user_skill", (q) =>
        q.eq("userId", user._id).eq("skillName", canonicalName)
      )
      .first();

    const score = calculateSkillScore({ status: args.status });

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        evidenceScore: score,
        explanation:
          args.status === "claimed"
            ? "Claimed on resume/profile without verified project code or assessment."
            : existing.explanation,
        updatedAt: now,
      });
      return { id: existing._id, action: "updated" };
    } else {
      const id = await ctx.db.insert("skillEvidence", {
        userId: user._id,
        skillName: canonicalName,
        status: args.status,
        evidenceScore: score,
        evidenceType: "resume",
        confidence: "medium",
        explanation: "Skill claimed by user on profile.",
        lastAssessedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      return { id, action: "created" };
    }
  },
});
