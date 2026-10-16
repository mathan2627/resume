import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const refreshListingsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeListings = await ctx.db
      .query("internships")
      .withIndex("by_status", (q) => q.eq("listingStatus", "active"))
      .collect();

    let expiredCount = 0;
    for (const listing of activeListings) {
      if (listing.applicationDeadline) {
        const deadlineDate = new Date(listing.applicationDeadline).getTime();
        if (!isNaN(deadlineDate) && deadlineDate < now) {
          await ctx.db.patch(listing._id, {
            listingStatus: "expired",
            lastCheckedAt: now,
          });
          expiredCount++;
        }
      }
    }

    await ctx.db.insert("ingestionRuns", {
      sourceName: "Scheduled Stale/Expired Listing Review Cron",
      status: "success",
      listingsProcessed: activeListings.length,
      listingsAdded: 0,
      listingsUpdated: expiredCount,
      executedAt: now,
    });
  },
});

const crons = cronJobs();
crons.hourly(
  "hourly-listing-hygiene",
  { minuteUTC: 0 },
  internal.crons.refreshListingsInternal
);

export default crons;
