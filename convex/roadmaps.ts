import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { normalizeSkillName } from "./lib/taxonomy";

export const getLearningPlan = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);

    const plan = await ctx.db
      .query("learningPlans")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (!plan) return null;

    const tasks = await ctx.db
      .query("learningTasks")
      .withIndex("by_plan", (q) => q.eq("planId", plan._id))
      .collect();

    return {
      plan,
      tasks,
    };
  },
});

export const saveRoadmapPlan = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.string(),
    targetRoleId: v.optional(v.string()),
    tasks: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        skillName: v.string(),
        taskType: v.union(
          v.literal("reading"),
          v.literal("practice_challenge"),
          v.literal("mini_project"),
          v.literal("milestone")
        ),
        priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
        dueDate: v.optional(v.string()),
        resourceUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    // Check if an existing plan exists
    let plan = await ctx.db
      .query("learningPlans")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    let planId: any;
    if (plan) {
      planId = plan._id;
      await ctx.db.patch(plan._id, {
        title: args.title,
        description: args.description,
        targetRoleId: args.targetRoleId,
        updatedAt: now,
      });

      // Clear previous pending tasks
      const existingTasks = await ctx.db
        .query("learningTasks")
        .withIndex("by_plan", (q) => q.eq("planId", planId))
        .collect();
      for (const t of existingTasks) {
        if (t.status !== "completed") {
          await ctx.db.delete(t._id);
        }
      }
    } else {
      planId = await ctx.db.insert("learningPlans", {
        userId: user._id,
        title: args.title,
        description: args.description,
        targetRoleId: args.targetRoleId,
        overallProgress: 0,
        generatedAt: now,
        updatedAt: now,
      });
    }

    // Insert new roadmap tasks
    for (const t of args.tasks) {
      await ctx.db.insert("learningTasks", {
        planId,
        userId: user._id,
        title: t.title,
        description: t.description,
        skillName: normalizeSkillName(t.skillName),
        taskType: t.taskType,
        priority: t.priority,
        status: "pending",
        dueDate: t.dueDate,
        resourceUrl: t.resourceUrl,
      });
    }

    return { planId, tasksCreated: args.tasks.length };
  },
});

export const updateTaskStatus = mutation({
  args: {
    token: v.string(),
    taskId: v.id("learningTasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("dismissed")
    ),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Learning task not found or unauthorized");
    }

    const now = Date.now();
    await ctx.db.patch(task._id, {
      status: args.status,
      completedAt: args.status === "completed" ? now : undefined,
    });

    // Recalculate plan overall progress
    const allTasks = await ctx.db
      .query("learningTasks")
      .withIndex("by_plan", (q) => q.eq("planId", task.planId))
      .collect();

    const nonDismissed = allTasks.filter((t) => t.status !== "dismissed");
    const completedCount = nonDismissed.filter((t) => t.status === "completed").length;
    const progress =
      nonDismissed.length > 0 ? Math.round((completedCount / nonDismissed.length) * 100) : 0;

    await ctx.db.patch(task.planId, {
      overallProgress: progress,
      updatedAt: now,
    });

    return { progress };
  },
});
