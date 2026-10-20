import { describe, it, expect } from "vitest";
import { extractSkillsFromText, normalizeSkillName } from "../convex/lib/taxonomy";

describe("Job Intelligence Normalization & Taxonomy", () => {
  it("extracts recognized technical skills from job descriptions", () => {
    const jobDescription = `
      We are looking for a Software Engineering Intern with experience in React, TypeScript,
      and Node.js. Familiarity with PostgreSQL, Docker, and AWS is a plus.
    `;
    const extracted = extractSkillsFromText(jobDescription);
    expect(extracted.skills).toContain("React");
    expect(extracted.skills).toContain("TypeScript");
    expect(extracted.skills).toContain("Node.js");
    expect(extracted.skills).toContain("PostgreSQL");
    expect(extracted.skills).toContain("Docker");
  });

  it("accurately normalizes skill variants", () => {
    expect(normalizeSkillName("react.js")).toBe("React");
    expect(normalizeSkillName("ts")).toBe("TypeScript");
    expect(normalizeSkillName("py")).toBe("Python");
    expect(normalizeSkillName("golang")).toBe("Go");
  });

  it("handles remote and hybrid detection logic accurately", () => {
    const checkRemote = (location: string, title: string) => {
      const locLower = location.toLowerCase();
      const titleLower = title.toLowerCase();
      if (locLower.includes("remote") || titleLower.includes("remote")) return "remote";
      if (locLower.includes("hybrid") || titleLower.includes("hybrid")) return "hybrid";
      return "onsite";
    };

    expect(checkRemote("San Francisco / Remote", "Frontend Engineer")).toBe("remote");
    expect(checkRemote("Bengaluru, India", "Backend Intern (Remote)")).toBe("remote");
    expect(checkRemote("Hybrid - London, UK", "Data Analyst")).toBe("hybrid");
    expect(checkRemote("Berlin, Germany", "Junior Engineer")).toBe("onsite");
  });

  it("determines freshness status based on observation delta", () => {
    const getFreshness = (observedAt: number, now: number) => {
      const deltaDays = (now - observedAt) / (1000 * 60 * 60 * 24);
      if (deltaDays <= 3) return "fresh";
      if (deltaDays <= 14) return "recent";
      if (deltaDays <= 30) return "aging";
      return "stale";
    };

    const now = 1700000000000;
    const dayMs = 86400000;

    expect(getFreshness(now - 1 * dayMs, now)).toBe("fresh");
    expect(getFreshness(now - 7 * dayMs, now)).toBe("recent");
    expect(getFreshness(now - 20 * dayMs, now)).toBe("aging");
    expect(getFreshness(now - 45 * dayMs, now)).toBe("stale");
  });
});
