import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Authentication & Core Users
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("student"), v.literal("recruiter"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // Student Profiles
  profiles: defineTable({
    userId: v.id("users"),
    college: v.optional(v.string()),
    course: v.optional(v.string()),
    graduationYear: v.optional(v.number()),
    preferredRole: v.optional(v.string()),
    technicalSkills: v.optional(v.array(v.string())),
    locationPreference: v.optional(v.string()),
    remotePreference: v.optional(v.union(v.literal("remote"), v.literal("hybrid"), v.literal("onsite"), v.literal("any"))),
    preferredStipendMin: v.optional(v.number()),
    weeklyAvailabilityHours: v.optional(v.number()),
    languages: v.optional(v.array(v.string())),
    careerInterests: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Resumes
  resumes: defineTable({
    userId: v.id("users"),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    version: v.number(),
    rawText: v.string(),
    parsedData: v.object({
      skills: v.array(v.string()),
      frameworks: v.array(v.string()),
      programmingLanguages: v.array(v.string()),
      education: v.array(v.object({
        institution: v.string(),
        degree: v.string(),
        fieldOfStudy: v.optional(v.string()),
        year: v.optional(v.string()),
      })),
      projects: v.array(v.object({
        title: v.string(),
        description: v.string(),
        technologies: v.array(v.string()),
        link: v.optional(v.string()),
      })),
      experience: v.array(v.object({
        role: v.string(),
        company: v.string(),
        duration: v.string(),
        summary: v.string(),
      })),
      certifications: v.array(v.string()),
      careerPreferences: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_version", ["userId", "version"]),

  // Skills Master Taxonomy
  skills: defineTable({
    name: v.string(),
    category: v.string(), // "Frontend", "Backend", "AI/ML", "DevOps", "Database", "Mobile"
    synonyms: v.array(v.string()),
    description: v.string(),
    popularity: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"]),

  // GitHub Repositories
  repositories: defineTable({
    userId: v.id("users"),
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
    lastAnalyzedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_repo", ["userId", "repoUrl"]),

  // Skill Proof Engine Evidence
  skillEvidence: defineTable({
    userId: v.id("users"),
    skillName: v.string(),
    status: v.union(
      v.literal("claimed"),
      v.literal("evidence_found"),
      v.literal("challenge_assessed"),
      v.literal("evidence_insufficient")
    ),
    evidenceScore: v.number(), // 0 to 100
    repositoryId: v.optional(v.id("repositories")),
    repoName: v.optional(v.string()),
    filePath: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    evidenceType: v.union(
      v.literal("resume"),
      v.literal("readme"),
      v.literal("source_code"),
      v.literal("config"),
      v.literal("challenge")
    ),
    confidence: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    explanation: v.string(),
    lastAssessedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_skill", ["userId", "skillName"])
    .index("by_user_status", ["userId", "status"]),

  // Adaptive Challenges
  challenges: defineTable({
    title: v.string(),
    skillName: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    challengeType: v.union(
      v.literal("mcq"),
      v.literal("conceptual"),
      v.literal("debugging"),
      v.literal("code_reading"),
      v.literal("output_prediction"),
      v.literal("sql_data"),
      v.literal("practical")
    ),
    instructions: v.string(),
    question: v.string(),
    options: v.optional(v.array(v.string())),
    correctAnswerIndex: v.optional(v.number()),
    starterCode: v.optional(v.string()),
    expectedOutputOrCriteria: v.optional(v.string()),
    rubric: v.string(),
    allowedTimeMinutes: v.number(),
    createdAt: v.number(),
  })
    .index("by_skill", ["skillName"])
    .index("by_difficulty", ["difficulty"]),

  // Challenge Attempts
  challengeAttempts: defineTable({
    userId: v.id("users"),
    challengeId: v.id("challenges"),
    skillName: v.string(),
    studentAnswer: v.string(),
    score: v.number(), // 0 - 100
    passed: v.boolean(),
    feedback: v.string(),
    rubricEvaluation: v.optional(v.string()),
    timeSpentSeconds: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_skill", ["userId", "skillName"])
    .index("by_challenge", ["challengeId"]),

  // Internships Master Catalog
  internships: defineTable({
    companyName: v.string(),
    roleTitle: v.string(),
    description: v.string(),
    requiredSkills: v.array(v.string()),
    eligibilityCriteria: v.optional(v.string()),
    educationRequirement: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    location: v.string(),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    remoteStatus: v.union(v.literal("remote"), v.literal("hybrid"), v.literal("onsite")),
    employmentType: v.optional(v.string()), // "internship", "full-time", "part-time", "graduate"
    stipend: v.optional(v.string()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    applicationOpenDate: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    originalUrl: v.string(),
    sourceName: v.string(),
    sourceIdentifier: v.optional(v.string()),
    externalId: v.optional(v.string()),
    listingStatus: v.union(v.literal("active"), v.literal("expired"), v.literal("stale"), v.literal("pending_review")),
    freshnessStatus: v.optional(v.union(v.literal("fresh"), v.literal("recent"), v.literal("aging"), v.literal("stale"))),
    verificationStatus: v.union(v.literal("verified"), v.literal("unverified")),
    sourceConfidence: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    duplicateClusterId: v.optional(v.string()),
    recruiterId: v.optional(v.id("users")),
    firstSeenAt: v.number(),
    lastCheckedAt: v.number(),
    lastVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_company", ["companyName"])
    .index("by_status", ["listingStatus"])
    .index("by_verification", ["verificationStatus"])
    .index("by_recruiter", ["recruiterId"])
    .index("by_sourceIdentifier", ["sourceIdentifier"]),

  // Embeddings for Vector Search
  internshipEmbeddings: defineTable({
    internshipId: v.id("internships"),
    embedding: v.array(v.float64()),
    model: v.string(),
    updatedAt: v.number(),
  })
    .index("by_internship", ["internshipId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["internshipId"],
    }),

  // Transparent Matches
  internshipMatches: defineTable({
    userId: v.id("users"),
    internshipId: v.id("internships"),
    overallMatchScore: v.number(), // 0-100%
    skillMatchScore: v.number(),
    semanticMatchScore: v.number(),
    evidenceMatchScore: v.number(),
    explanation: v.string(),
    missingSkills: v.array(v.string()),
    recommendedLearning: v.string(),
    calculatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_internship", ["userId", "internshipId"])
    .index("by_user_score", ["userId", "overallMatchScore"]),

  // Saved Internships
  savedInternships: defineTable({
    userId: v.id("users"),
    internshipId: v.id("internships"),
    notes: v.optional(v.string()),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_internship", ["userId", "internshipId"]),

  // Application Pipeline Tracker
  applications: defineTable({
    userId: v.id("users"),
    internshipId: v.id("internships"),
    status: v.union(
      v.literal("saved"),
      v.literal("planning"),
      v.literal("applied"),
      v.literal("assessment"),
      v.literal("interview"),
      v.literal("offer"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    appliedDate: v.optional(v.string()),
    deadlineDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    customResumeId: v.optional(v.id("resumes")),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_internship", ["internshipId"]),

  // Learning Roadmap & Plans
  learningPlans: defineTable({
    userId: v.id("users"),
    targetRoleId: v.optional(v.string()),
    targetInternshipId: v.optional(v.id("internships")),
    title: v.string(),
    description: v.string(),
    overallProgress: v.number(), // 0 - 100%
    generatedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  learningTasks: defineTable({
    planId: v.id("learningPlans"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    skillName: v.string(),
    taskType: v.union(
      v.literal("reading"),
      v.literal("practice_challenge"),
      v.literal("mini_project"),
      v.literal("milestone")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("dismissed")
    ),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    dueDate: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    resourceUrl: v.optional(v.string()),
  })
    .index("by_plan", ["planId"])
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  // Mock Interviews
  mockInterviews: defineTable({
    userId: v.id("users"),
    roleTarget: v.string(),
    interviewType: v.union(v.literal("technical"), v.literal("behavioral"), v.literal("mixed")),
    difficulty: v.union(v.literal("entry"), v.literal("mid")),
    questions: v.array(v.object({
      id: v.string(),
      question: v.string(),
      context: v.optional(v.string()),
      idealPoints: v.optional(v.array(v.string())),
    })),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  interviewAttempts: defineTable({
    interviewId: v.id("mockInterviews"),
    userId: v.id("users"),
    answers: v.array(v.object({
      questionId: v.string(),
      question: v.string(),
      answer: v.string(),
      score: v.number(),
      feedback: v.string(),
      strengths: v.array(v.string()),
      improvements: v.array(v.string()),
    })),
    overallScore: v.number(),
    overallFeedback: v.string(),
    completedAt: v.number(),
  })
    .index("by_interview", ["interviewId"])
    .index("by_user", ["userId"]),

  // Cover Letters
  coverLetters: defineTable({
    userId: v.id("users"),
    internshipId: v.optional(v.id("internships")),
    companyName: v.string(),
    roleTitle: v.string(),
    content: v.string(),
    tone: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Notifications Center
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("deadline"), v.literal("challenge"), v.literal("match"), v.literal("milestone"), v.literal("system")),
    read: v.boolean(),
    link: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  // Recruiter Profiles
  recruiterProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    companyWebsite: v.optional(v.string()),
    recruiterTitle: v.string(),
    verified: v.boolean(),
    contactEmail: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Proof Passport (Shareable Portfolios)
  publicPassports: defineTable({
    userId: v.id("users"),
    shareToken: v.string(),
    isPublic: v.boolean(),
    visibleSections: v.object({
      skills: v.boolean(),
      repositories: v.boolean(),
      challenges: v.boolean(),
      education: v.boolean(),
      contact: v.boolean(),
    }),
    customSlug: v.optional(v.string()),
    viewsCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["shareToken"])
    .index("by_slug", ["customSlug"]),

  // Abuse / Listing Reports
  reports: defineTable({
    reporterUserId: v.id("users"),
    reportedListingId: v.optional(v.id("internships")),
    reason: v.string(),
    details: v.string(),
    status: v.union(v.literal("pending"), v.literal("investigating"), v.literal("resolved"), v.literal("dismissed")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Source Configurations (Admin)
  sourceConfigurations: defineTable({
    name: v.string(),
    sourceType: v.union(
      v.literal("api"),
      v.literal("feed"),
      v.literal("csv"),
      v.literal("manual"),
      v.literal("greenhouse"),
      v.literal("lever"),
      v.literal("web_discovery")
    ),
    endpointOrUrl: v.optional(v.string()),
    boardToken: v.optional(v.string()),
    enabled: v.boolean(),
    updateFrequencyMinutes: v.optional(v.number()),
    updateFrequencyHours: v.number(),
    nextCheckAt: v.optional(v.number()),
    lastRunAt: v.optional(v.number()),
    lastStatus: v.optional(v.string()),
    rateLimitPerMinute: v.optional(v.number()),
    consecutiveFailures: v.optional(v.number()),
    backoffUntil: v.optional(v.number()),
    totalListingsFound: v.optional(v.number()),
    activeListingsCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_enabled", ["enabled"])
    .index("by_type", ["sourceType"]),

  // Ingestion Runs (Admin)
  ingestionRuns: defineTable({
    sourceId: v.optional(v.id("sourceConfigurations")),
    sourceName: v.string(),
    status: v.union(v.literal("success"), v.literal("partial"), v.literal("failed"), v.literal("rate_limited")),
    listingsProcessed: v.number(),
    listingsAdded: v.number(),
    listingsUpdated: v.number(),
    listingsExpired: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    executedAt: v.number(),
  }).index("by_executedAt", ["executedAt"]),

  // AI Usage & Guardrails
  aiUsage: defineTable({
    userId: v.id("users"),
    taskType: v.string(),
    model: v.string(),
    promptTokensEstimated: v.optional(v.number()),
    completionTokensEstimated: v.optional(v.number()),
    status: v.union(v.literal("success"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
    executedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "executedAt"]),

  // Audit Logs for Privileged & Sensitive Actions
  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
});
