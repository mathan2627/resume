import { describe, it, expect } from "vitest";

describe("Internship Matching & Explainable Recommendation Engine", () => {
  // Test function reproducing the exact multi-factor matching formula
  function computeMatchScore(params: {
    requiredSkills: string[];
    userEvidence: Array<{ name: string; score: number; status: string }>;
    preferredRole?: string;
    roleTitle: string;
    remotePreference?: string;
    remoteStatus?: string;
  }) {
    const { requiredSkills, userEvidence, preferredRole, roleTitle, remotePreference, remoteStatus } = params;
    const evidenceMap = new Map(userEvidence.map((e) => [e.name.toLowerCase(), e]));

    let matchedSkillsCount = 0;
    let totalEvidenceScore = 0;
    let totalChallengeScore = 0;
    const missingSkills: string[] = [];

    for (const reqSkill of requiredSkills) {
      const ev = evidenceMap.get(reqSkill.toLowerCase());
      if (ev) {
        matchedSkillsCount++;
        totalEvidenceScore += ev.score;
        if (ev.status === "challenge_assessed") {
          totalChallengeScore += 100;
        } else if (ev.status === "evidence_found") {
          totalChallengeScore += 60;
        } else {
          totalChallengeScore += 30;
        }
      } else {
        missingSkills.push(reqSkill);
      }
    }

    const skillMatchScore = Math.round((matchedSkillsCount / requiredSkills.length) * 100);
    const evidenceMatchScore =
      matchedSkillsCount > 0 ? Math.round((totalEvidenceScore / (matchedSkillsCount * 100)) * 100) : 0;
    const challengeScore =
      matchedSkillsCount > 0 ? Math.round((totalChallengeScore / (matchedSkillsCount * 100)) * 100) : 0;

    let semanticScore = 50;
    if (preferredRole && roleTitle.toLowerCase().includes(preferredRole.toLowerCase())) {
      semanticScore = 95;
    }
    if (remotePreference && remotePreference !== "any" && remotePreference === remoteStatus) {
      semanticScore = Math.min(semanticScore + 10, 100);
    }

    const overallMatchScore = Math.round(
      skillMatchScore * 0.4 +
      evidenceMatchScore * 0.25 +
      challengeScore * 0.2 +
      semanticScore * 0.15
    );

    return {
      overallMatchScore,
      skillMatchScore,
      evidenceMatchScore,
      challengeScore,
      semanticScore,
      missingSkills,
    };
  }

  it("yields 0 skill match when applicant possesses none of the required skills", () => {
    const result = computeMatchScore({
      requiredSkills: ["Rust", "Solidity"],
      userEvidence: [{ name: "Python", score: 80, status: "evidence_found" }],
      roleTitle: "Blockchain Core Engineer",
    });

    expect(result.skillMatchScore).toBe(0);
    expect(result.evidenceMatchScore).toBe(0);
    expect(result.challengeScore).toBe(0);
    expect(result.overallMatchScore).toBe(Math.round(50 * 0.15)); // baseline semantic only
    expect(result.missingSkills).toEqual(["Rust", "Solidity"]);
  });

  it("weights verified challenges and repository evidence higher than unverified claims", () => {
    const claimedCandidate = computeMatchScore({
      requiredSkills: ["React", "TypeScript"],
      userEvidence: [
        { name: "React", score: 35, status: "claimed" },
        { name: "TypeScript", score: 35, status: "claimed" },
      ],
      roleTitle: "Frontend Engineering Intern",
      preferredRole: "Frontend",
    });

    const verifiedCandidate = computeMatchScore({
      requiredSkills: ["React", "TypeScript"],
      userEvidence: [
        { name: "React", score: 90, status: "challenge_assessed" },
        { name: "TypeScript", score: 85, status: "evidence_found" },
      ],
      roleTitle: "Frontend Engineering Intern",
      preferredRole: "Frontend",
    });

    // Both have 100% skill coverage (40 points) and matching role (14.25 points)
    expect(claimedCandidate.skillMatchScore).toBe(100);
    expect(verifiedCandidate.skillMatchScore).toBe(100);

    // But verified candidate scores significantly higher due to 25% project evidence + 20% challenge verification
    expect(verifiedCandidate.overallMatchScore).toBeGreaterThan(claimedCandidate.overallMatchScore);
    expect(verifiedCandidate.overallMatchScore - claimedCandidate.overallMatchScore).toBeGreaterThanOrEqual(20);
  });

  it("correctly calculates explainable weights summing up to 100%", () => {
    // 40% + 25% + 20% + 15% = 100%
    const perfectCandidate = computeMatchScore({
      requiredSkills: ["Python", "FastAPI"],
      userEvidence: [
        { name: "Python", score: 100, status: "challenge_assessed" },
        { name: "FastAPI", score: 100, status: "challenge_assessed" },
      ],
      roleTitle: "Backend Intern",
      preferredRole: "Backend",
      remotePreference: "remote",
      remoteStatus: "remote",
    });

    expect(perfectCandidate.skillMatchScore).toBe(100);
    expect(perfectCandidate.evidenceMatchScore).toBe(100);
    expect(perfectCandidate.challengeScore).toBe(100);
    expect(perfectCandidate.semanticScore).toBe(100);
    expect(perfectCandidate.overallMatchScore).toBe(100);
  });
});
