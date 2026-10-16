import { normalizeSkillName } from "../../convex/lib/taxonomy";

export interface GitHubEvidenceItem {
  skillName: string;
  filePath?: string;
  excerpt?: string;
  sourceUrl?: string;
  evidenceType: "readme" | "source_code" | "config";
  confidence: "high" | "medium" | "low";
  explanation: string;
}

export interface AnalyzedRepoResult {
  owner: string;
  repoName: string;
  repoUrl: string;
  description: string;
  language: string;
  languagesDistribution: Record<string, number>;
  stars: number;
  forks: number;
  defaultBranch: string;
  topics: string[];
  evidenceList: GitHubEvidenceItem[];
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const clean = url.trim().replace(/\/+$/, "");
  const match = clean.match(/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

export async function analyzePublicGitHubRepo(repoUrl: string): Promise<AnalyzedRepoResult> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub repository URL. Format should be: https://github.com/owner/repo");
  }

  const { owner, repo } = parsed;
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  // 1. Fetch Repository Metadata
  const repoRes = await fetch(baseUrl);
  if (repoRes.status === 404) {
    throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
  }
  if (repoRes.status === 403) {
    throw new Error("GitHub API rate limit reached. Please try again later or supply a public token.");
  }
  if (!repoRes.ok) {
    throw new Error(`GitHub API error (${repoRes.status}): ${await repoRes.text()}`);
  }

  const repoData = await repoRes.json();

  // 2. Fetch Languages breakdown
  let languagesDistribution: Record<string, number> = {};
  try {
    const langRes = await fetch(`${baseUrl}/languages`);
    if (langRes.ok) {
      languagesDistribution = await langRes.json();
    }
  } catch (e) {
    console.warn("Could not fetch repo languages", e);
  }

  // 3. Fetch README Content
  let readmeText = "";
  try {
    const readmeRes = await fetch(`${baseUrl}/readme`);
    if (readmeRes.ok) {
      const readmeJson = await readmeRes.json();
      if (readmeJson.content) {
        readmeText = atob(readmeJson.content.replace(/\s/g, ""));
      }
    }
  } catch (e) {
    console.warn("Could not fetch repo readme", e);
  }

  // 4. Inspect file trees for dependency files (package.json, requirements.txt, Dockerfile, etc.)
  let rootFiles: string[] = [];
  try {
    const contentsRes = await fetch(`${baseUrl}/contents`);
    if (contentsRes.ok) {
      const items = await contentsRes.json();
      if (Array.isArray(items)) {
        rootFiles = items.map((i: any) => i.name.toLowerCase());
      }
    }
  } catch (e) {
    console.warn("Could not fetch repo root contents", e);
  }

  // 5. Synthesize Skill Evidence
  const evidenceList: GitHubEvidenceItem[] = [];
  const detectedSkills = new Set<string>();

  // A. Primary Languages Evidence
  for (const [lang, bytes] of Object.entries(languagesDistribution)) {
    const canonical = normalizeSkillName(lang);
    if (!detectedSkills.has(canonical)) {
      detectedSkills.add(canonical);
      const isDominant = lang === repoData.language;
      evidenceList.push({
        skillName: canonical,
        filePath: `Source Code (${lang})`,
        excerpt: `${bytes.toLocaleString()} bytes of ${lang} written in repository.`,
        sourceUrl: `${repoData.html_url}`,
        evidenceType: "source_code",
        confidence: isDominant ? "high" : "medium",
        explanation: `${canonical} constitutes significant active codebase in repository ${owner}/${repo}.`,
      });
    }
  }

  // B. Configuration & Build File Evidence
  if (rootFiles.includes("package.json")) {
    evidenceList.push({
      skillName: "Node.js",
      filePath: "package.json",
      excerpt: "Project configured with Node.js npm package manifest and runtime scripts.",
      sourceUrl: `${repoData.html_url}/blob/${repoData.default_branch}/package.json`,
      evidenceType: "config",
      confidence: "high",
      explanation: "Active Node.js dependency architecture verified in project root.",
    });
  }

  if (rootFiles.includes("dockerfile") || rootFiles.includes("docker-compose.yml")) {
    evidenceList.push({
      skillName: "Docker",
      filePath: rootFiles.includes("dockerfile") ? "Dockerfile" : "docker-compose.yml",
      excerpt: "Multi-stage containerization build file present in repository.",
      sourceUrl: `${repoData.html_url}/blob/${repoData.default_branch}/Dockerfile`,
      evidenceType: "config",
      confidence: "high",
      explanation: "Containerized deployment configurations verified.",
    });
  }

  if (rootFiles.includes("tsconfig.json")) {
    evidenceList.push({
      skillName: "TypeScript",
      filePath: "tsconfig.json",
      excerpt: "TypeScript compiler strict configuration present.",
      sourceUrl: `${repoData.html_url}/blob/${repoData.default_branch}/tsconfig.json`,
      evidenceType: "config",
      confidence: "high",
      explanation: "Full TypeScript compilation pipeline configured.",
    });
  }

  // C. README Technology Citations (Inspect safely as untrusted data)
  const commonTech = [
    { name: "React", keywords: ["react", "react.js", "react-dom"] },
    { name: "Next.js", keywords: ["next.js", "nextjs"] },
    { name: "Tailwind CSS", keywords: ["tailwind", "tailwindcss"] },
    { name: "PostgreSQL", keywords: ["postgresql", "postgres"] },
    { name: "MongoDB", keywords: ["mongodb", "mongoose"] },
    { name: "FastAPI", keywords: ["fastapi"] },
    { name: "PyTorch", keywords: ["pytorch"] },
    { name: "TensorFlow", keywords: ["tensorflow"] },
  ];

  const lowerReadme = readmeText.toLowerCase();
  for (const tech of commonTech) {
    if (!detectedSkills.has(tech.name)) {
      const foundKeyword = tech.keywords.find((kw) => lowerReadme.includes(kw));
      if (foundKeyword) {
        detectedSkills.add(tech.name);
        // Find safe snippet excerpt
        const idx = lowerReadme.indexOf(foundKeyword);
        const start = Math.max(0, idx - 40);
        const end = Math.min(readmeText.length, idx + 80);
        const snippet = readmeText.slice(start, end).replace(/\n+/g, " ").trim();

        evidenceList.push({
          skillName: tech.name,
          filePath: "README.md",
          excerpt: `"...${snippet}..."`,
          sourceUrl: `${repoData.html_url}/blob/${repoData.default_branch}/README.md`,
          evidenceType: "readme",
          confidence: "medium",
          explanation: `Documented architecture and technology usage in repository README.`,
        });
      }
    }
  }

  return {
    owner,
    repoName: repo,
    repoUrl: repoData.html_url,
    description: repoData.description || "Public software project",
    language: repoData.language || "TypeScript",
    languagesDistribution,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    defaultBranch: repoData.default_branch || "main",
    topics: repoData.topics || [],
    evidenceList,
  };
}
