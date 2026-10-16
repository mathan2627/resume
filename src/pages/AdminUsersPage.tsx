import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Users, ShieldAlert, Check, ShieldCheck } from "lucide-react";

export const AdminUsersPage: React.FC = () => {
  const { token, user } = useAuth();
  const allUsers = useQuery(api.admin.listUsers, token ? { token } : "skip");
  const updateRoleMutation = useMutation(api.admin.updateUserRole);

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-xs text-red-400">Admin privileges required.</div>;
  }

  const handleRoleChange = async (targetUserId: any, newRole: any) => {
    if (!token) return;
    try {
      await updateRoleMutation({
        token,
        targetUserId,
        newRole,
      });
      alert(`User role successfully changed to ${newRole}.`);
    } catch (e: any) {
      alert("Error updating role: " + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/60 mb-2">
            <Users className="w-3.5 h-3.5 text-red-400" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User & Role Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage student, recruiter, and administrator roles. Every modification is cryptographically verified server-side and recorded in the audit trail.
          </p>
        </div>

        <Link
          to="/admin"
          className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
        >
          Back to Admin Overview
        </Link>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Registered Date</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4 text-right">Modify Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {allUsers?.map((u) => (
              <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-white flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-cyan-400">
                    {u.name.charAt(0)}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="p-4 text-slate-400 font-mono text-[11px]">{u.email}</td>
                <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role === "admin"
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : u.role === "recruiter"
                        ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="student">Student</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Administrator</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
