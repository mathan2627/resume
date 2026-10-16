import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName } from "./lib/taxonomy";

export const calculateMatchesForUser = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const userEvidence = await ctx.db
      .query("skillEvidence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const internships = await ctx.db
      .query("internships")
      .withIndex("by_status", (q) => q.eq("listingStatus", "active"))
      .collect();

    const evidenceMap = new Map<string, typeof userEvidence[0]>();
    for (const ev of userEvidence) {
      evidenceMap.set(ev.skillName.toLowerCase(), ev);
    }

    const now = Date.now();
    let calculatedCount = 0;

    for (const internship of internships) {
      const required = internship.requiredSkills || [];
      if (required.length === 0) continue;

      let matchedSkillsCount = 0;
      let totalEvidenceScore = 0;
      let totalChallengeScore = 0;
      const missingSkills: string[] = [];
      const presentEvidenceBreakdown: string[] = [];

      for (const reqSkill of required) {
        const canonical = normalizeSkillName(reqSkill).toLowerCase();
        const ev = evidenceMap.get(canonical);

        if (ev) {
          matchedSkillsCount++;
          totalEvidenceScore += ev.evidenceScore;
          if (ev.status === "challenge_assessed") {
            totalChallengeScore += 100;
            presentEvidenceBreakdown.push(`${ev.skillName} (Assessed: ${ev.evidenceScore}%)`);
          } else if (ev.status === "evidence_found") {
            totalChallengeScore += 60;
            presentEvidenceBreakdown.push(`${ev.skillName} (Project Evidence)`);
          } else {
            totalChallengeScore += 30;
            presentEvidenceBreakdown.push(`${ev.skillName} (Resume Claim)`);
          }
        } else {
          missingSkills.push(reqSkill);
        }
      }

      // 1. Skill Coverage Score (0 - 100) - Weight: 40%
      const skillCoverageRatio = matchedSkillsCount / required.length;
      const skillMatchScore = Math.round(skillCoverageRatio * 100);

      // 2. Project Evidence Score (0 - 100) - Weight: 25%
      const evidenceMatchScore =
        matchedSkillsCount > 0
          ? Math.round(totalEvidenceScore / (matchedSkillsCount * 100) * 100)
          : 0;

      // 3. Challenge Assessed Score (0 - 100) - Weight: 20%
      const challengeScore =
        matchedSkillsCount > 0
          ? Math.round(totalChallengeScore / (matchedSkillsCount * 100) * 100)
          : 0;

      // 4. Role & Preference Alignment (0 - 100) - Weight: 15%
      let semanticScore = 50;
      if (profile?.preferredRole) {
        const pref = profile.preferredRole.toLowerCase();
        if (internship.roleTitle.toLowerCase().includes(pref)) {
          semanticScore = 95;
        }
      }
      if (profile?.remotePreference && profile.remotePreference !== "any") {
        if (profile.remotePreference === internship.remoteStatus) {
          semanticScore = Math.min(semanticScore + 10, 100);
        }
      }

      // Composite explainable match score
      const overallMatchScore = Math.round(
        skillMatchScore * 0.4 +
        evidenceMatchScore * 0.25 +
        challengeScore * 0.2 +
        semanticScore * 0.15
      );

      // Generate transparent explanation
      let explanation = "";
      if (overallMatchScore >= 80) {
        explanation = `High relevance (${overallMatchScore}%). You cover ${matchedSkillsCount}/${required.length} required skills with verified project or assessment evidence.`;
      } else if (overallMatchScore >= 60) {
        explanation = `Moderate relevance (${overallMatchScore}%). You demonstrate ${matchedSkillsCount}/${required.length} skills. Proving ${missingSkills.slice(0, 2).join(", ")} will substantially raise your match.`;
      } else {
        explanation = `Emerging fit (${overallMatchScore}%). Strongest gaps are in: ${missingSkills.slice(0, 3).join(", ")}. Complete recommended practice challenges to boost alignment.`;
      }

      const recommendedLearning =
        missingSkills.length > 0
          ? `Prioritize building a practical project or completing a challenge in ${missingSkills[0]}.`
          : "Your skills match this role well. Consider preparing role-specific mock interview questions.";

      // Upsert into internshipMatches
      const existingMatch = await ctx.db
        .query("internshipMatches")
        .withIndex("by_user_internship", (q) =>
          q.eq("userId", user._id).eq("internshipId", internship._id)
        )
        .first();

      if (existingMatch) {
        await ctx.db.patch(existingMatch._id, {
          overallMatchScore,
          skillMatchScore,
          semanticMatchScore: semanticScore,
          evidenceMatchScore,
          explanation,
          missingSkills,
          recommendedLearning,
          calculatedAt: now,
        });
      } else {
        await ctx.db.insert("internshipMatches", {
          userId: user._id,
          internshipId: internship._id,
          overallMatchScore,
          skillMatchScore,
          semanticMatchScore: semanticScore,
          evidenceMatchScore,
          explanation,
          missingSkills,
          recommendedLearning,
          calculatedAt: now,
        });
      }
      calculatedCount++;
    }

    return {
      success: true,
      calculatedCount,
    };
  },
});

export const getUserMatches = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);

    const matches = await ctx.db
      .query("internshipMatches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort by overallMatchScore descending
    matches.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

    const results: any[] = [];
    const targetMatches = args.limit ? matches.slice(0, args.limit) : matches;

    for (const match of targetMatches) {
      const internship = await ctx.db.get(match.internshipId);
      if (internship) {
        results.push({
          matchId: match._id,
          overallMatchScore: match.overallMatchScore,
          skillMatchScore: match.skillMatchScore,
          semanticMatchScore: match.semanticMatchScore,
          evidenceMatchScore: match.evidenceMatchScore,
          explanation: match.explanation,
          missingSkills: match.missingSkills,
          recommendedLearning: match.recommendedLearning,
          calculatedAt: match.calculatedAt,
          internship,
        });
      }
    }

    return results;
  },
});
