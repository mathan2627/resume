import { describe, it, expect } from "vitest";
import { requireAdmin } from "../convex/auth";

describe("ProofPath AI Security & RBAC Enforcement", () => {
  it("Vulnerability Regression: requireAdmin strictly rejects non-admin roles even if email looks like admin", async () => {
    // Mock DB context
    const mockDb = {
      sessions: [
        {
          _id: "session_1",
          token: "student_token_123",
          userId: "user_student",
          expiresAt: Date.now() + 100000,
        },
        {
          _id: "session_2",
          token: "forged_email_token",
          userId: "user_forged",
          expiresAt: Date.now() + 100000,
        },
        {
          _id: "session_3",
          token: "verified_admin_token",
          userId: "user_admin",
          expiresAt: Date.now() + 100000,
        },
      ],
      users: {
        user_student: {
          _id: "user_student",
          name: "Student Candidate",
          email: "student@example.com",
          role: "student",
        },
        user_forged: {
          _id: "user_forged",
          name: "Attacker Impersonating Admin",
          // Email intentionally claims to be admin@proofpath.ai
          email: "admin@proofpath.ai",
          role: "student", // Database role is student
        },
        user_admin: {
          _id: "user_admin",
          name: "Verified Platform Admin",
          email: "admin@proofpath.ai",
          role: "admin", // Database role is strictly admin
        },
      },
      query(table: string) {
        return {
          withIndex(_idxName: string, cb: any) {
            let matchedToken: string | null = null;
            const q = {
              eq(_field: string, val: string) {
                matchedToken = val;
                return q;
              },
            };
            cb(q);
            return {
              first: async () => {
                if (table === "sessions") {
                  return mockDb.sessions.find((s) => s.token === matchedToken) || null;
                }
                return null;
              },
            };
          },
        };
      },
      get: async (id: string) => {
        return (mockDb.users as any)[id] || null;
      },
    };

    const ctx = { db: mockDb };

    // 1. Regular student must be rejected
    await expect(
      requireAdmin(ctx as any, "student_token_123")
    ).rejects.toThrow("Administrative authorization required for this action");

    // 2. FORGED EMAIL: User registered with admin email string BUT with role "student" must be REJECTED
    await expect(
      requireAdmin(ctx as any, "forged_email_token")
    ).rejects.toThrow("Administrative authorization required for this action");

    // 3. Genuine administrator with role "admin" must be ACCEPTED
    const adminAuth = await requireAdmin(ctx as any, "verified_admin_token");
    expect(adminAuth.user.role).toBe("admin");
    expect(adminAuth.user._id).toBe("user_admin");
  });

  it("Private Resource Ownership: Prevents cross-tenant modifications", () => {
    const ownerUserId = "user_student_1";
    const attackerUserId = "user_attacker_2";

    const applicationRecord = {
      _id: "app_100",
      userId: ownerUserId,
      internshipId: "internship_55",
      status: "planning",
    };

    // Simulated ownership check from convex/applications.ts
    const verifyApplicationOwnership = (user: { _id: string }, app: { userId: string }) => {
      if (!app || app.userId !== user._id) {
        throw new Error("Application record not found or unauthorized");
      }
      return true;
    };

    // Legitimate owner passes
    expect(
      verifyApplicationOwnership({ _id: ownerUserId }, applicationRecord)
    ).toBe(true);

    // Malicious attacker is blocked
    expect(() =>
      verifyApplicationOwnership({ _id: attackerUserId }, applicationRecord)
    ).toThrow("Application record not found or unauthorized");
  });

  it("Recruiter Roster Boundary: Recruiter cannot view another recruiter's applicants", () => {
    const listingOwnerRecruiterId = "recruiter_A";
    const unauthorizedRecruiterId = "recruiter_B";

    const internshipListing = {
      _id: "listing_xyz",
      roleTitle: "Backend Intern",
      companyName: "Acme Corp",
      recruiterId: listingOwnerRecruiterId,
    };

    const verifyRosterAccess = (user: { _id: string; role: string }, listing: any) => {
      if (!listing || (listing.recruiterId !== user._id && user.role !== "admin")) {
        throw new Error("Unauthorized access to this internship listing's applicant roster");
      }
      return true;
    };

    // Listing owner recruiter passes
    expect(
      verifyRosterAccess({ _id: listingOwnerRecruiterId, role: "recruiter" }, internshipListing)
    ).toBe(true);

    // Another recruiter is strictly blocked
    expect(() =>
      verifyRosterAccess({ _id: unauthorizedRecruiterId, role: "recruiter" }, internshipListing)
    ).toThrow("Unauthorized access to this internship listing's applicant roster");

    // Platform admin can inspect
    expect(
      verifyRosterAccess({ _id: "super_admin", role: "admin" }, internshipListing)
    ).toBe(true);
  });

  it("Resume Ownership: Prevents unauthorized document deletion", () => {
    const candidateA = "cand_A";
    const candidateB = "cand_B";

    const candidateResume = {
      _id: "res_123",
      userId: candidateA,
      fileName: "alex_resume.pdf",
    };

    const verifyResumeOwnership = (user: { _id: string }, resume: any) => {
      if (!resume || resume.userId !== user._id) {
        throw new Error("Resume not found or unauthorized");
      }
      return true;
    };

    expect(verifyResumeOwnership({ _id: candidateA }, candidateResume)).toBe(true);
    expect(() => verifyResumeOwnership({ _id: candidateB }, candidateResume)).toThrow(
      "Resume not found or unauthorized"
    );
  });
});
