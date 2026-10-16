import { describe, it, expect } from "vitest";
import {
  MASTER_TAXONOMY,
  normalizeSkillName,
  extractSkillsFromText,
  calculateSkillScore,
} from "../convex/lib/taxonomy";

describe("Skill Taxonomy & Normalization Engine", () => {
  it("verifies master taxonomy contains at least 30 core tech skills", () => {
    expect(MASTER_TAXONOMY.length).toBeGreaterThanOrEqual(30);
  });

  it("normalizes synonym aliases to canonical skill names", () => {
    expect(normalizeSkillName("ts")).toBe("TypeScript");
    expect(normalizeSkillName("react.js")).toBe("React");
    expect(normalizeSkillName("reactjs")).toBe("React");
    expect(normalizeSkillName("golang")).toBe("Go");
    expect(normalizeSkillName("k8s")).toBe("Kubernetes");
    expect(normalizeSkillName("postgres")).toBe("PostgreSQL");
    expect(normalizeSkillName("py")).toBe("Python");
  });

  it("gracefully capitalizes unregistered skills instead of crashing", () => {
    expect(normalizeSkillName("sveltekit")).toBe("Sveltekit");
    expect(normalizeSkillName("apache kafka")).toBe("Apache Kafka");
  });

  it("extracts detected skills and separates frameworks from languages", () => {
    const sampleResumeSnippet = `
      Software Engineer Intern
      Built high-performance microservices using TypeScript, Node.js, and Docker.
      Designed responsive web interfaces with React and Tailwind CSS.
      Automated CI/CD deployments using GitHub Actions.
    `;

    const extracted = extractSkillsFromText(sampleResumeSnippet);

    expect(extracted.skills).toContain("TypeScript");
    expect(extracted.skills).toContain("React");
    expect(extracted.skills).toContain("Docker");
    expect(extracted.skills).toContain("Node.js");
    expect(extracted.skills).toContain("Tailwind CSS");

    expect(extracted.languages).toContain("TypeScript");
    expect(extracted.frameworks).toContain("React");
    expect(extracted.frameworks).toContain("Node.js");
  });

  describe("Explainable 4-Tier Skill Scoring Formula", () => {
    it("assigns 35% for claimed-only resume skills without repos or challenges", () => {
      const score = calculateSkillScore({ status: "claimed" });
      expect(score).toBe(35);
    });

    it("assigns 20% for skills with insufficient evidence", () => {
      const score = calculateSkillScore({ status: "evidence_insufficient" });
      expect(score).toBe(20);
    });

    it("rewards evidence_found with confidence rating and evidence count bonus", () => {
      const lowConf = calculateSkillScore({
        status: "evidence_found",
        confidence: "low",
        evidenceCount: 1,
      });
      expect(lowConf).toBe(55); // 50 base + 5 bonus

      const highConf = calculateSkillScore({
        status: "evidence_found",
        confidence: "high",
        evidenceCount: 3,
      });
      expect(highConf).toBe(85); // 75 base + 15 bonus (capped at 85)
    });

    it("awards 70-100% for challenge_assessed based on verified test performance", () => {
      const passedHigh = calculateSkillScore({
        status: "challenge_assessed",
        assessmentScore: 100,
      });
      expect(passedHigh).toBe(90); // 100 * 0.9

      const passedPerfect = calculateSkillScore({
        status: "challenge_assessed",
        assessmentScore: 90,
      });
      expect(passedPerfect).toBe(81);
    });
  });
});
