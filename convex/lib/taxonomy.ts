// Comprehensive TypeScript Skill Taxonomy & Synonym Dictionary

export interface TaxonomySkill {
  name: string;
  category: "Languages" | "Frontend" | "Backend" | "AI/ML" | "DevOps & Cloud" | "Databases" | "Mobile" | "Core CS";
  synonyms: string[];
  description: string;
}

export const MASTER_TAXONOMY: TaxonomySkill[] = [
  // Programming Languages
  {
    name: "TypeScript",
    category: "Languages",
    synonyms: ["ts", "typescript", "types script", "type-script"],
    description: "Typed superset of JavaScript that compiles to plain JavaScript.",
  },
  {
    name: "JavaScript",
    category: "Languages",
    synonyms: ["js", "javascript", "ecmascript", "es6", "es2020", "esnext"],
    description: "High-level, interpreted programming language of the Web.",
  },
  {
    name: "Python",
    category: "Languages",
    synonyms: ["py", "python", "python3", "python 3"],
    description: "Interpreted, high-level, general-purpose programming language.",
  },
  {
    name: "Java",
    category: "Languages",
    synonyms: ["java", "jdk", "jvm", "java 8", "java 11", "java 17"],
    description: "Class-based, object-oriented programming language.",
  },
  {
    name: "C++",
    category: "Languages",
    synonyms: ["cpp", "c++", "cplusplus", "c/c++"],
    description: "General-purpose programming language created as an extension of C.",
  },
  {
    name: "Go",
    category: "Languages",
    synonyms: ["golang", "go lang", "go"],
    description: "Statically typed, compiled programming language designed at Google.",
  },
  {
    name: "Rust",
    category: "Languages",
    synonyms: ["rust", "rustlang"],
    description: "Multi-paradigm, high-performance language focused on safety and concurrency.",
  },
  {
    name: "SQL",
    category: "Languages",
    synonyms: ["sql", "structured query language", "t-sql", "pl/sql"],
    description: "Domain-specific language used in programming and managing databases.",
  },

  // Frontend
  {
    name: "React",
    category: "Frontend",
    synonyms: ["reactjs", "react.js", "react js", "react"],
    description: "A free and open-source front-end JavaScript library for building user interfaces.",
  },
  {
    name: "Next.js",
    category: "Frontend",
    synonyms: ["nextjs", "next.js", "next js", "next"],
    description: "React framework for building full-stack web applications.",
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    synonyms: ["tailwind", "tailwindcss", "tailwind-css"],
    description: "Utility-first CSS framework for rapid UI development.",
  },
  {
    name: "HTML5 & CSS3",
    category: "Frontend",
    synonyms: ["html", "html5", "css", "css3", "sass", "scss", "responsive design"],
    description: "Core markup and styling standards of the World Wide Web.",
  },
  {
    name: "Vue.js",
    category: "Frontend",
    synonyms: ["vue", "vuejs", "vue.js", "vue 3"],
    description: "Progressive JavaScript framework for building user interfaces.",
  },

  // Backend
  {
    name: "Node.js",
    category: "Backend",
    synonyms: ["node", "nodejs", "node.js"],
    description: "Asynchronous event-driven JavaScript runtime environment.",
  },
  {
    name: "Express.js",
    category: "Backend",
    synonyms: ["express", "expressjs", "express.js"],
    description: "Fast, unopinionated, minimalist web framework for Node.js.",
  },
  {
    name: "FastAPI",
    category: "Backend",
    synonyms: ["fastapi", "fast-api"],
    description: "Modern, fast web framework for building APIs with Python.",
  },
  {
    name: "Django",
    category: "Backend",
    synonyms: ["django", "django rest framework", "drf"],
    description: "High-level Python web framework encouraging rapid development.",
  },
  {
    name: "Spring Boot",
    category: "Backend",
    synonyms: ["spring", "springboot", "spring boot", "spring framework"],
    description: "Java-based framework used to create a microservice.",
  },
  {
    name: "Convex",
    category: "Backend",
    synonyms: ["convex", "convex.dev", "convex db"],
    description: "Reactive backend platform with database, serverless functions, and vector search.",
  },

  // Databases
  {
    name: "PostgreSQL",
    category: "Databases",
    synonyms: ["postgres", "postgresql", "psql"],
    description: "Powerful, open source object-relational database system.",
  },
  {
    name: "MongoDB",
    category: "Databases",
    synonyms: ["mongo", "mongodb", "mongoose"],
    description: "Source-available, cross-platform, document-oriented database program.",
  },
  {
    name: "Redis",
    category: "Databases",
    synonyms: ["redis", "in-memory cache", "redis cache"],
    description: "In-memory data structure store used as a database, cache, and message broker.",
  },

  // AI & Machine Learning
  {
    name: "Machine Learning",
    category: "AI/ML",
    synonyms: ["ml", "machine learning", "scikit-learn", "sklearn"],
    description: "Field of inquiry devoted to understanding and building methods that 'learn'.",
  },
  {
    name: "Deep Learning",
    category: "AI/ML",
    synonyms: ["deep learning", "neural networks", "cnn", "rnn", "transformers"],
    description: "Subset of machine learning based on artificial neural networks.",
  },
  {
    name: "PyTorch",
    category: "AI/ML",
    synonyms: ["pytorch", "torch"],
    description: "Optimized tensor library for deep learning using GPUs and CPUs.",
  },
  {
    name: "TensorFlow",
    category: "AI/ML",
    synonyms: ["tensorflow", "tf", "keras"],
    description: "End-to-end open source platform for machine learning.",
  },
  {
    name: "Large Language Models",
    category: "AI/ML",
    synonyms: ["llm", "llms", "genai", "generative ai", "gemini", "gpt", "rag", "embeddings"],
    description: "Foundational AI models for language generation, reasoning, and semantic search.",
  },

  // DevOps & Cloud
  {
    name: "Docker",
    category: "DevOps & Cloud",
    synonyms: ["docker", "containerization", "containers", "dockerfile", "docker-compose"],
    description: "Platform designed to help developers build, share, and run modern applications.",
  },
  {
    name: "Kubernetes",
    category: "DevOps & Cloud",
    synonyms: ["k8s", "kubernetes"],
    description: "Open-source system for automating deployment, scaling, and management of containerized applications.",
  },
  {
    name: "Git & GitHub",
    category: "DevOps & Cloud",
    synonyms: ["git", "github", "gitlab", "version control", "vcs"],
    description: "Distributed version control system for tracking changes in source code.",
  },
  {
    name: "CI/CD",
    category: "DevOps & Cloud",
    synonyms: ["ci/cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    description: "Combined practice of continuous integration and continuous delivery/deployment.",
  },
  {
    name: "AWS",
    category: "DevOps & Cloud",
    synonyms: ["aws", "amazon web services", "s3", "ec2", "lambda"],
    description: "Comprehensive, evolving cloud computing platform provided by Amazon.",
  },
  {
    name: "Google Cloud",
    category: "DevOps & Cloud",
    synonyms: ["gcp", "google cloud platform", "google cloud"],
    description: "Suite of cloud computing services that runs on the same infrastructure as Google.",
  },

  // Core CS
  {
    name: "Data Structures & Algorithms",
    category: "Core CS",
    synonyms: ["dsa", "data structures", "algorithms", "problem solving", "leetcode"],
    description: "Fundamental formats for organizing, processing, retrieving and storing data.",
  },
  {
    name: "REST APIs",
    category: "Core CS",
    synonyms: ["rest", "restful", "rest api", "apis", "api design", "graphql"],
    description: "Architectural style for an application programming interface.",
  },
];

// Normalize any user-supplied or extracted skill string to its canonical taxonomy name
export function normalizeSkillName(raw: string): string {
  const clean = raw.trim().toLowerCase();
  if (!clean) return "";

  for (const item of MASTER_TAXONOMY) {
    if (item.name.toLowerCase() === clean) return item.name;
    for (const syn of item.synonyms) {
      if (syn.toLowerCase() === clean) {
        return item.name;
      }
    }
  }

  // Capitalize nicely if not found in taxonomy
  return raw
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Extract detected skills from raw text using boundary matching
export function extractSkillsFromText(text: string): {
  skills: string[];
  frameworks: string[];
  languages: string[];
} {
  const lowerText = ` ${text.toLowerCase().replace(/[^a-z0-9#+.\s]/g, " ")} `;
  const matched = new Set<string>();

  for (const item of MASTER_TAXONOMY) {
    for (const syn of [item.name, ...item.synonyms]) {
      const synLower = syn.toLowerCase();
      // Match with word boundary or spaces
      const escaped = synLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
      if (regex.test(lowerText)) {
        matched.add(item.name);
        break;
      }
    }
  }

  const skillsList = Array.from(matched);
  const frameworks = skillsList.filter((s) => {
    const item = MASTER_TAXONOMY.find((t) => t.name === s);
    return item?.category === "Frontend" || item?.category === "Backend";
  });
  const languages = skillsList.filter((s) => {
    const item = MASTER_TAXONOMY.find((t) => t.name === s);
    return item?.category === "Languages";
  });

  return {
    skills: skillsList,
    frameworks,
    languages,
  };
}

// Calculate explainable skill score
export function calculateSkillScore(params: {
  status: "claimed" | "evidence_found" | "challenge_assessed" | "evidence_insufficient";
  evidenceCount?: number;
  confidence?: "high" | "medium" | "low";
  assessmentScore?: number;
}): number {
  const { status, evidenceCount = 1, confidence = "medium", assessmentScore } = params;

  if (status === "evidence_insufficient") {
    return 20;
  }

  if (status === "claimed") {
    return 35; // Resume claimed only
  }

  if (status === "evidence_found") {
    const confWeight = confidence === "high" ? 75 : confidence === "medium" ? 65 : 50;
    const bonus = Math.min(evidenceCount * 5, 15);
    return Math.min(confWeight + bonus, 85);
  }

  if (status === "challenge_assessed") {
    const base = assessmentScore ? Math.round(assessmentScore * 0.9) : 85;
    return Math.min(Math.max(base, 70), 100);
  }

  return 30;
}
