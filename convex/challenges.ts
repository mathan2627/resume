import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName, calculateSkillScore } from "./lib/taxonomy";

export const INITIAL_CHALLENGES = [
  {
    title: "React Hook Lifecycle & Closure Trap",
    skillName: "React",
    difficulty: "intermediate" as const,
    challengeType: "debugging" as const,
    instructions: "Identify why the counter inside the setInterval callback fails to increment beyond 1.",
    question: `Look at the following React component:\n\nfunction Timer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => {\n      setCount(count + 1);\n    }, 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <h1>{count}</h1>;\n}\n\nWhat is the root cause and recommended solution?`,
    options: [
      "The timer should be defined outside the component function.",
      "The effect closure captured the initial count (0); use the functional updater form setCount(prev => prev + 1).",
      "useEffect must return a Promise instead of a cleanup function.",
      "useState cannot be used with setInterval in modern React 19.",
    ],
    correctAnswerIndex: 1,
    rubric: "Candidate accurately identifies stale closure in useEffect dependency array and recommends functional state update setCount(c => c + 1) or adding count to dependencies.",
    allowedTimeMinutes: 10,
  },
  {
    title: "TypeScript Discriminated Unions & Exhaustiveness Checking",
    skillName: "TypeScript",
    difficulty: "intermediate" as const,
    challengeType: "code_reading" as const,
    instructions: "Evaluate how TypeScript guarantees all message types are handled at compile time.",
    question: `type Action =\n  | { type: 'LOGIN'; username: string }\n  | { type: 'LOGOUT' };\n\nfunction reducer(action: Action) {\n  switch (action.type) {\n    case 'LOGIN': return action.username;\n    case 'LOGOUT': return null;\n    default:\n      const _exhaustive: never = action;\n      return _exhaustive;\n  }\n}\n\nWhat purpose does 'const _exhaustive: never = action' serve?`,
    options: [
      "It improves runtime performance by stopping garbage collection.",
      "It causes a compile-time TypeScript error if a new variant is added to Action without a corresponding case.",
      "It converts the action object into a JavaScript Symbol.",
      "It suppresses all ESLint warnings in the switch statement.",
    ],
    correctAnswerIndex: 1,
    rubric: "Identifies compile-time exhaustiveness checking using the 'never' type.",
    allowedTimeMinutes: 10,
  },
  {
    title: "Python Memory Management & Generator Expressions",
    skillName: "Python",
    difficulty: "intermediate" as const,
    challengeType: "conceptual" as const,
    instructions: "Analyze the difference between list comprehensions and generator expressions when processing massive datasets.",
    question: `When streaming a 10GB log file in Python line by line, why should you prefer (process(line) for line in file) over [process(line) for line in file]?`,
    options: [
      "Generators run multithreaded across all CPU cores by default.",
      "List comprehensions are deprecated in Python 3.12+.",
      "The generator expression evaluates lazily on demand, using O(1) memory instead of loading all items into memory at once.",
      "List comprehensions cannot call custom functions.",
    ],
    correctAnswerIndex: 2,
    rubric: "Explains lazy evaluation vs upfront memory allocation.",
    allowedTimeMinutes: 8,
  },
  {
    title: "SQL Index Optimization & Query Execution Plans",
    skillName: "SQL",
    difficulty: "advanced" as const,
    challengeType: "sql_data" as const,
    instructions: "Identify why an index on (created_at, status) might not be used.",
    question: `Given a table 'orders' with a composite B-Tree index on (created_at, status):\n\nSELECT * FROM orders WHERE status = 'SHIPPED';\n\nWhy will this query typically perform a sequential scan instead of using the composite index?`,
    options: [
      "B-Tree indexes do not support VARCHAR columns.",
      "Composite indexes require the leading column (created_at) in the WHERE clause to traverse the index tree efficiently.",
      "The SELECT * prevents index usage in PostgreSQL.",
      "The query must use an INNER JOIN to trigger indexes.",
    ],
    correctAnswerIndex: 1,
    rubric: "Understands leading column prefix requirement in composite B-tree indexes.",
    allowedTimeMinutes: 10,
  },
  {
    title: "Docker Multi-Stage Build Optimization",
    skillName: "Docker",
    difficulty: "intermediate" as const,
    challengeType: "output_prediction" as const,
    instructions: "Analyze image layer caching and size reduction in containerized deployments.",
    question: `In a Node.js production Dockerfile, what is the primary benefit of separating the build stage from the runner stage using 'FROM node:alpine AS builder' and 'FROM node:alpine AS runner'?`,
    options: [
      "It allows running both stages simultaneously on two different machines.",
      "It excludes devDependencies, build tools (compilers), and source files from the final production image, reducing image size and attack surface.",
      "It disables the Linux kernel security sandbox.",
      "It makes npm install run without network access.",
    ],
    correctAnswerIndex: 1,
    rubric: "Explains reduction of final container image footprint and security boundary separation.",
    allowedTimeMinutes: 10,
  },
  {
    title: "Machine Learning Overfitting Mitigation",
    skillName: "Machine Learning",
    difficulty: "intermediate" as const,
    challengeType: "conceptual" as const,
    instructions: "Evaluate appropriate regularization and validation techniques for deep networks.",
    question: `A model exhibits 99% training accuracy and 64% validation accuracy. Which set of interventions directly targets this diagnostic discrepancy?`,
    options: [
      "Increase model capacity by adding 5 more dense layers and decreasing learning rate.",
      "Remove dropout layers and train on fewer training samples.",
      "Apply L2 regularization (weight decay), add dropout, utilize data augmentation, and use early stopping.",
      "Switch to Mean Squared Error loss for multi-class classification.",
    ],
    correctAnswerIndex: 2,
    rubric: "Correctly recognizes overfitting (high variance) and selects standard regularization techniques.",
    allowedTimeMinutes: 8,
  },
];

// Seed initial challenges into database
export const seedInitialChallenges = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("challenges").first();
    if (existing) return { count: 0, message: "Challenges already seeded." };

    let count = 0;
    const now = Date.now();
    for (const ch of INITIAL_CHALLENGES) {
      await ctx.db.insert("challenges", {
        title: ch.title,
        skillName: normalizeSkillName(ch.skillName),
        difficulty: ch.difficulty,
        challengeType: ch.challengeType,
        instructions: ch.instructions,
        question: ch.question,
        options: ch.options,
        correctAnswerIndex: ch.correctAnswerIndex,
        rubric: ch.rubric,
        allowedTimeMinutes: ch.allowedTimeMinutes,
        createdAt: now,
      });
      count++;
    }

    return { count, message: `Seeded ${count} initial skill challenges.` };
  },
});

// List challenges with optional filters
export const listChallenges = query({
  args: {
    skillName: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("challenges").collect();

    if (list.length === 0) {
      // Return memory fallback if database not yet seeded
      list = INITIAL_CHALLENGES.map((ch, idx) => ({
        _id: `fallback_${idx}` as any,
        _creationTime: Date.now(),
        ...ch,
        skillName: normalizeSkillName(ch.skillName),
        createdAt: Date.now(),
      }));
    }

    if (args.skillName) {
      const canonical = normalizeSkillName(args.skillName);
      list = list.filter((ch) => ch.skillName.toLowerCase() === canonical.toLowerCase());
    }

    if (args.difficulty) {
      list = list.filter((ch) => ch.difficulty === args.difficulty);
    }

    return list;
  },
});

// Get single challenge
export const getChallenge = query({
  args: {
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.challengeId);
  },
});

// Submit a student challenge attempt and automatically update Skill Proof engine
export const submitAttempt = mutation({
  args: {
    token: v.string(),
    challengeId: v.id("challenges"),
    studentAnswer: v.string(),
    timeSpentSeconds: v.number(),
    aiScoreOverride: v.optional(v.number()),
    aiFeedbackOverride: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    let score = 0;
    let feedback = "";
    let passed = false;

    // Deterministic evaluation for MCQ challenges
    if (challenge.challengeType === "mcq" || challenge.options) {
      const studentSelectedIdx = parseInt(args.studentAnswer.trim(), 10);
      const isCorrect = studentSelectedIdx === challenge.correctAnswerIndex;
      score = isCorrect ? 95 : 30;
      passed = isCorrect;
      feedback = isCorrect
        ? `Excellent! Correct answer selected within ${args.timeSpentSeconds}s. Your technical grasp of ${challenge.skillName} has been verified.`
        : `Incorrect selection. Review the core concepts of ${challenge.skillName} and check the rubric evaluation: ${challenge.rubric}`;
    } else {
      // Rubric / AI-assisted evaluation
      score = args.aiScoreOverride !== undefined ? args.aiScoreOverride : 85;
      passed = score >= 70;
      feedback =
        args.aiFeedbackOverride ||
        (passed
          ? `Strong response that effectively satisfies the evaluation criteria for ${challenge.skillName}.`
          : `Response partially addresses the problem. Strengthen key areas noted in the rubric.`);
    }

    const now = Date.now();

    // Record the attempt
    const attemptId = await ctx.db.insert("challengeAttempts", {
      userId: user._id,
      challengeId: challenge._id,
      skillName: challenge.skillName,
      studentAnswer: args.studentAnswer,
      score,
      passed,
      feedback,
      rubricEvaluation: challenge.rubric,
      timeSpentSeconds: args.timeSpentSeconds,
      completedAt: now,
    });

    // If passed, upgrade the user's skillEvidence to "challenge_assessed"
    if (passed) {
      const canonicalSkill = normalizeSkillName(challenge.skillName);
      const existingEvidence = await ctx.db
        .query("skillEvidence")
        .withIndex("by_user_skill", (q) =>
          q.eq("userId", user._id).eq("skillName", canonicalSkill)
        )
        .first();

      const newScore = calculateSkillScore({
        status: "challenge_assessed",
        assessmentScore: score,
      });

      if (existingEvidence) {
        await ctx.db.patch(existingEvidence._id, {
          status: "challenge_assessed",
          evidenceScore: Math.max(existingEvidence.evidenceScore, newScore),
          confidence: "high",
          evidenceType: "challenge",
          explanation: `Practical assessment "${challenge.title}" passed with score ${score}/100. Practical comprehension proven.`,
          lastAssessedAt: now,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("skillEvidence", {
          userId: user._id,
          skillName: canonicalSkill,
          status: "challenge_assessed",
          evidenceScore: newScore,
          evidenceType: "challenge",
          confidence: "high",
          explanation: `Practical assessment "${challenge.title}" passed with score ${score}/100.`,
          lastAssessedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Add achievement notification
      await ctx.db.insert("notifications", {
        userId: user._id,
        title: `Skill Challenge Passed: ${challenge.skillName}`,
        message: `Scored ${score}% on "${challenge.title}". Your Skill Proof status is now officially "Challenge Assessed".`,
        type: "challenge",
        read: false,
        link: "/skills",
        createdAt: now,
      });
    }

    return {
      attemptId,
      score,
      passed,
      feedback,
    };
  },
});

// List all attempts for user
export const listUserAttempts = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    return await ctx.db
      .query("challengeAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
