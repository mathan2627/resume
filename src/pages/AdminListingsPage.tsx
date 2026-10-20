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
  ArrowLeft,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export const AdminListingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const listings = useQuery(api.admin.listAllListings, token ? { token } : "skip");
  const verifyMutation = useMutation(api.admin.verifyListing);
  const statusMutation = useMutation(api.admin.updateListingStatus);

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-xs text-rose-400">Admin privileges required.</div>;
  }

  const handleToggleVerification = async (listingId: any, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === "verified" ? "unverified" : "verified";
    try {
      await verifyMutation({
        token,
        listingId,
        verificationStatus: nextStatus,
      });
      success("Verification Updated", `Set listing verification to '${nextStatus}'.`);
    } catch (e: any) {
      toastError("Error", e.message);
    }
  };

  const handleStatusChange = async (listingId: any, newStatus: any) => {
    if (!token) return;
    try {
      await statusMutation({
        token,
        listingId,
        listingStatus: newStatus,
      });
      success("Status Changed", `Set listing status to '${newStatus}'.`);
    } catch (e: any) {
      toastError("Error", e.message);
    }
  };

  const allListings = listings || [];
  const filtered = allListings.filter((l) => {
    const matchesSearch =
      l.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
      l.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.listingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/30 text-rose-300 light:bg-rose-50 light:text-rose-700 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Listing Quality Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Opportunity Review & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Audit external postings from Greenhouse, Lever, feeds, and manual entries to guarantee authentic source links and eliminate expired vacancies.
          </p>
        </div>

        <Link to="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Console</span>
          </Button>
        </Link>
      </div>

      {/* 2. SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
            <option value="stale">Stale Only</option>
          </Select>
        </div>
      </div>

      {/* 3. LISTINGS TABLE */}
      <div className="rounded-2xl border border-slate-800 light:border-slate-200 bg-slate-900/90 light:bg-white overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 light:text-slate-700">
            <thead className="bg-slate-950/80 light:bg-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 light:border-slate-200">
              <tr>
                <th className="p-4">Opportunity</th>
                <th className="p-4">Location</th>
                <th className="p-4">Source</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Listing Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <p className="font-semibold text-white light:text-slate-900">{item.roleTitle}</p>
                    <p className="text-[11px] text-slate-400">{item.companyName}</p>
                  </td>
                  <td className="p-4 text-slate-300 light:text-slate-600">
                    {item.location} ({item.remoteStatus})
                  </td>
                  <td className="p-4">
                    <Badge variant="fresh" size="sm">{item.sourceName}</Badge>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleVerification(item._id, item.verificationStatus)}
                      className="cursor-pointer"
                    >
                      <Badge variant={item.verificationStatus === "verified" ? "verified" : "warning"} size="sm">
                        {item.verificationStatus}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-4">
                    <Select
                      value={item.listingStatus}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className="text-xs py-1 px-2 w-32"
                    >
                      <option value="active">active</option>
                      <option value="expired">expired</option>
                      <option value="stale">stale</option>
                      <option value="pending_review">pending_review</option>
                    </Select>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                    >
                      <span>Test URL</span>
                      <ExternalLink className="w-3 h-3" />
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
