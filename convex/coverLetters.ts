import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const listCoverLetters = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    return await ctx.db
      .query("coverLetters")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const saveCoverLetter = mutation({
  args: {
    token: v.string(),
    internshipId: v.optional(v.id("internships")),
    companyName: v.string(),
    roleTitle: v.string(),
    content: v.string(),
    tone: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const now = Date.now();

    const id = await ctx.db.insert("coverLetters", {
      userId: user._id,
      internshipId: args.internshipId,
      companyName: args.companyName,
      roleTitle: args.roleTitle,
      content: args.content,
      tone: args.tone,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const deleteCoverLetter = mutation({
  args: {
    token: v.string(),
    letterId: v.id("coverLetters"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const letter = await ctx.db.get(args.letterId);
    if (!letter || letter.userId !== user._id) {
      throw new Error("Cover letter not found or unauthorized");
    }

    await ctx.db.delete(letter._id);
    return { success: true };
  },
});
