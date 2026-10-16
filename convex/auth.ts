import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword, verifyPassword, generateSessionToken } from "./lib/auth_helpers";
import type { Doc, Id } from "./_generated/dataModel";

const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Helper function to resolve authenticated user from token
export async function requireUser(
  ctx: { db: any },
  token: string
): Promise<{ user: Doc<"users">; session: Doc<"sessions"> }> {
  if (!token) {
    throw new Error("Authentication token required");
  }

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Invalid or expired session. Please log in again.");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("User associated with session not found");
  }

  return { user, session };
}

// Helper function to check if user has admin privileges
export async function requireAdmin(
  ctx: { db: any },
  token: string
): Promise<{ user: Doc<"users">; session: Doc<"sessions"> }> {
  const { user, session } = await requireUser(ctx, token);
  const adminEmail = process.env.ADMIN_EMAIL;

  const isAdminRole = user.role === "admin";
  const isConfiguredAdmin = adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase();

  if (!isAdminRole && !isConfiguredAdmin) {
    throw new Error("Administrative authorization required for this action");
  }

  return { user, session };
}

// Register a new user
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("student"), v.literal("recruiter"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const emailNormalized = args.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", emailNormalized))
      .first();

    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    // Check if registering user is configured admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    let assignedRole = args.role;
    if (adminEmail && emailNormalized === adminEmail.toLowerCase()) {
      assignedRole = "admin";
    }

    const passwordHash = await hashPassword(args.password);
    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email: emailNormalized,
      passwordHash,
      role: assignedRole,
      createdAt: now,
      updatedAt: now,
    });

    // Create corresponding profile
    if (assignedRole === "student") {
      await ctx.db.insert("profiles", {
        userId,
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      });

      // Initialize public passport settings
      const shareToken = generateSessionToken().slice(0, 16);
      await ctx.db.insert("publicPassports", {
        userId,
        shareToken,
        isPublic: false,
        visibleSections: {
          skills: true,
          repositories: true,
          challenges: true,
          education: true,
          contact: false,
        },
        viewsCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    } else if (assignedRole === "recruiter") {
      await ctx.db.insert("recruiterProfiles", {
        userId,
        companyName: "Pending Verification",
        recruiterTitle: "Hiring Specialist",
        verified: false,
        contactEmail: emailNormalized,
        createdAt: now,
      });
    }

    // Create session
    const token = generateSessionToken();
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: now + SESSION_EXPIRY_MS,
      createdAt: now,
    });

    // Add welcome notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Welcome to ProofPath AI",
      message: "Start by uploading your resume or linking a GitHub repository to build your verified Skill Proof portfolio.",
      type: "system",
      read: false,
      link: "/onboarding",
      createdAt: now,
    });

    return {
      token,
      user: {
        id: userId,
        name: args.name.trim(),
        email: emailNormalized,
        role: assignedRole,
      },
    };
  },
});

// Login existing user
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const emailNormalized = args.email.trim().toLowerCase();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", emailNormalized))
      .first();

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isValid = await verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password.");
    }

    const token = generateSessionToken();
    const now = Date.now();

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: now + SESSION_EXPIRY_MS,
      createdAt: now,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
});

// Logout user
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Get current authenticated user
export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return null;
    }

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token!))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    let profile: any = null;
    if (user.role === "student") {
      profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
    } else if (user.role === "recruiter") {
      profile = await ctx.db
        .query("recruiterProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile,
    };
  },
});
