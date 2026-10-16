import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const createInterviewSession = mutation({
  args: {
    token: v.string(),
    roleTarget: v.string(),
    interviewType: v.union(v.literal("technical"), v.literal("behavioral"), v.literal("mixed")),
    difficulty: v.union(v.literal("entry"), v.literal("mid")),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        context: v.optional(v.string()),
        idealPoints: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    const id = await ctx.db.insert("mockInterviews", {
      userId: user._id,
      roleTarget: args.roleTarget,
      interviewType: args.interviewType,
      difficulty: args.difficulty,
      questions: args.questions,
      status: "in_progress",
      createdAt: now,
    });

    return id;
  },
});

export const submitInterviewAttempt = mutation({
  args: {
    token: v.string(),
    interviewId: v.id("mockInterviews"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        question: v.string(),
        answer: v.string(),
        score: v.number(),
        feedback: v.string(),
        strengths: v.array(v.string()),
        improvements: v.array(v.string()),
      })
    ),
    overallScore: v.number(),
    overallFeedback: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const interview = await ctx.db.get(args.interviewId);
    if (!interview || interview.userId !== user._id) {
      throw new Error("Interview session not found or unauthorized");
    }

    const now = Date.now();
    await ctx.db.patch(interview._id, {
      status: "completed",
    });

    const attemptId = await ctx.db.insert("interviewAttempts", {
      interviewId: interview._id,
      userId: user._id,
      answers: args.answers,
      overallScore: args.overallScore,
      overallFeedback: args.overallFeedback,
      completedAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: user._id,
      title: "Mock Technical Interview Evaluated",
      message: `Completed "${interview.roleTarget}" session with score ${args.overallScore}%. Review your question-by-question feedback.`,
      type: "milestone",
      read: false,
      link: "/interview",
      createdAt: now,
    });

    return attemptId;
  },
});

export const listInterviews = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);

    const interviews = await ctx.db
      .query("mockInterviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const results: any[] = [];
    for (const item of interviews) {
      const attempt = await ctx.db
        .query("interviewAttempts")
        .withIndex("by_interview", (q) => q.eq("interviewId", item._id))
        .first();

      results.push({
        ...item,
        attempt,
      });
    }

    return results;
  },
});
