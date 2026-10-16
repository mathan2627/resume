import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const listNotifications = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const markAsRead = mutation({
  args: {
    token: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const notif = await ctx.db.get(args.notificationId);
    if (notif && notif.userId === user._id) {
      await ctx.db.patch(notif._id, { read: true });
    }
    return { success: true };
  },
});

export const markAllAsRead = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx, args.token);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("read", false))
      .collect();

    for (const item of unread) {
      await ctx.db.patch(item._id, { read: true });
    }

    return { markedCount: unread.length };
  },
});
