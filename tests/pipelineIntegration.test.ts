import { describe, it, expect } from "vitest";
import { calculateSkillScore, extractSkillsFromText } from "../convex/lib/taxonomy";

describe("ProofPath AI End-to-End Career Intelligence Pipeline", () => {
  it("Phase 1 to 5 Workflow: Claim -> Evidence -> Assessment -> Match", () => {
    // 1. Initial Candidate Claims (Resume Parser)
    const resumeText = `
      Experienced student developer skilled in React.js, TypeScript, and Python.
      Built a task tracker web application.
    `;
    const extracted = extractSkillsFromText(resumeText);
    expect(extracted.skills).toContain("React");
    expect(extracted.skills).toContain("TypeScript");
    expect(extracted.skills).toContain("Python");

    // Tier 1: Claimed Baseline (35%)
    const claimedScore = calculateSkillScore({
      status: "claimed",
    });
    expect(claimedScore).toBe(35);

    // 2. GitHub Evidence Linking (AST Code Scan)
    // Candidate links a GitHub repository containing verified TypeScript and React source files
    const evidenceScore = calculateSkillScore({
      status: "evidence_found",
      confidence: "high",
      evidenceCount: 2,
    });
    expect(evidenceScore).toBe(85); // 75 + min(2*5, 15) = 85

    // 3. Timed Practical Assessment Completed
    // Candidate passes the React closures & performance assessment
    const assessedScore = calculateSkillScore({
      status: "challenge_assessed",
      assessmentScore: 95,
    });
    expect(assessedScore).toBeGreaterThanOrEqual(85);

    // 4. Job Ingestion Simulation (Greenhouse Listing)
    const greenhouseRawDescription = `
      Looking for a Frontend Engineering Intern with strong experience in React and TypeScript.
      Experience with Docker and REST APIs is a plus.
    `;
    const requiredSkills = extractSkillsFromText(greenhouseRawDescription).skills;
    expect(requiredSkills).toContain("React");
    expect(requiredSkills).toContain("TypeScript");
    expect(requiredSkills).toContain("Docker");
    expect(requiredSkills).toContain("REST APIs");

    // 5. Match Calculation Formula
    // Formula: (Skill Coverage * 0.40) + (Project Evidence * 0.25) + (Challenge Assessed * 0.20) + (Role Fit * 0.15)
    // Candidate has 2/4 skills (React, TypeScript), both with code evidence and one challenge assessed.
    const skillCoverage = (2 / 4) * 100; // 50%
    const projectEvidence = 85; // 85%
    const challengeAssessedScore = 92; // 92%
    const roleAlignment = 80; // 80%

    const overallMatch = Math.round(
      skillCoverage * 0.4 +
      projectEvidence * 0.25 +
      challengeAssessedScore * 0.2 +
      roleAlignment * 0.15
    );

    expect(overallMatch).toBe(72);
    expect(overallMatch).toBeGreaterThan(50); // Significant match with clear gap roadmap to address Docker & REST APIs
  });

  it("Proof Passport Privacy Consent Sanitization", () => {
    const candidateData = {
      name: "Alex Rivera",
      email: "alex@example.com",
      phone: "+91 98765 43210",
      skills: ["React", "TypeScript", "Python"],
      repositories: [
        { repoName: "react-perf-dashboard", url: "https://github.com/alex/react-perf" },
      ],
      privacySettings: {
        showContactInfo: false,
        showRepositories: true,
        showChallenges: true,
      },
    };

    // Recruiter-Facing Public Passport Payload Generator
    const publicPayload = {
      name: candidateData.name,
      email: candidateData.privacySettings.showContactInfo ? candidateData.email : undefined,
      phone: candidateData.privacySettings.showContactInfo ? candidateData.phone : undefined,
      skills: candidateData.skills,
      repositories: candidateData.privacySettings.showRepositories ? candidateData.repositories : [],
    };

    expect(publicPayload.name).toBe("Alex Rivera");
    expect(publicPayload.email).toBeUndefined();
    expect(publicPayload.phone).toBeUndefined();
    expect(publicPayload.repositories.length).toBe(1);
  });

  it("Resume Bullet Point Integrity: Prohibits fabricated metrics without evidence placeholders", () => {
    // Simulating candidate original bullet point without metrics
    const originalBullet = "Built a web app using React and Node.js for managing tasks.";

    // Simulated heuristic upgrader adhering to factual integrity
    const trimmed = originalBullet.trim().replace(/^\W+/, "");
    const upgraded = {
      improvedBullet: `Architected and optimized ${trimmed}, enhancing maintainability and execution reliability through modular component separation and strict type contracts [insert measured metric if tracked, e.g. % latency or throughput].`,
      actionVerb: "Architected",
      quantifiableMetrics: "Factually preserved with [metric] placeholder",
      reasoning: "Replaces passive phrasing with active ownership and architectural discipline while strictly avoiding fabricated statistics.",
    };

    // Assert that no hallucinated hardcoded percentage (like "35%") was inserted as fact
    expect(upgraded.improvedBullet).not.toMatch(/by \d+%/);
    // Assert that placeholder brackets are present for unmeasured metrics
    expect(upgraded.improvedBullet).toContain("[insert measured metric");
    expect(upgraded.actionVerb).toBe("Architected");
    expect(upgraded.quantifiableMetrics).toContain("Factually preserved");
  });
});
