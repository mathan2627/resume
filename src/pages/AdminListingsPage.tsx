import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";

export const AdminListingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [search, setSearch] = useState("");

  const listings = useQuery(api.admin.listAllListings, token ? { token } : "skip");
  const verifyMutation = useMutation(api.admin.verifyListing);
  const statusMutation = useMutation(api.admin.updateListingStatus);

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-xs text-red-400">Admin privileges required.</div>;
  }

  const handleToggleVerification = async (listingId: any, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === "verified" ? "unverified" : "verified";
    await verifyMutation({
      token,
      listingId,
      verificationStatus: nextStatus,
    });
  };

  const handleStatusChange = async (listingId: any, newStatus: any) => {
    if (!token) return;
    await statusMutation({
      token,
      listingId,
      listingStatus: newStatus,
    });
  };

  const allListings = listings || [];
  const filtered = allListings.filter(
    (l) =>
      l.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
      l.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/60 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-red-400" />
            <span>Listing Quality Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Internship Review & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Audit public and recruiter postings to guarantee authentic source links and eliminate outdated or misleading listings.
          </p>
        </div>

        <Link
          to="/admin"
          className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
        >
          Back to Admin Overview
        </Link>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3 max-w-md">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter listings by role or company..."
          className="w-full bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Opportunity</th>
                <th className="p-4">Location</th>
                <th className="p-4">Source</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white text-xs">{item.roleTitle}</p>
                    <p className="text-[11px] text-slate-400">{item.companyName}</p>
                  </td>
                  <td className="p-4 text-slate-400">
                    {item.location} ({item.remoteStatus})
                  </td>
                  <td className="p-4">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>{item.sourceName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleVerification(item._id, item.verificationStatus)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        item.verificationStatus === "verified"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {item.verificationStatus === "verified" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      <span>{item.verificationStatus}</span>
                    </button>
                  </td>
                  <td className="p-4">
                    <select
                      value={item.listingStatus}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="stale">Stale</option>
                      <option value="pending_review">Pending Review</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      Verify Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
