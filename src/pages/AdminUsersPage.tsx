import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Users, ShieldAlert, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export const AdminUsersPage: React.FC = () => {
  const { token, user } = useAuth();
  const { success, error: toastError } = useToast();
  const allUsers = useQuery(api.admin.listUsers, token ? { token } : "skip");
  const updateRoleMutation = useMutation(api.admin.updateUserRole);

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-xs text-rose-400">Admin privileges required.</div>;
  }

  const handleRoleChange = async (targetUserId: any, newRole: any) => {
    if (!token) return;
    try {
      await updateRoleMutation({
        token,
        targetUserId,
        newRole,
      });
      success("Role Updated", `User role successfully changed to ${newRole}.`);
    } catch (e: any) {
      toastError("Error updating role", e.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] light:border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/30 text-rose-300 light:bg-rose-50 light:text-rose-700 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            User & Role Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Manage student, recruiter, and administrator roles. Every modification is verified server-side and recorded in the audit trail.
          </p>
        </div>

        <Link to="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Console</span>
          </Button>
        </Link>
      </div>

      {/* 2. USERS TABLE */}
      <div className="rounded-2xl border border-slate-800 light:border-slate-200 bg-slate-900/90 light:bg-white overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300 light:text-slate-700">
          <thead className="bg-slate-950/80 light:bg-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 light:border-slate-200">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Registered Date</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4 text-right">Modify Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
            {allUsers?.map((u) => (
              <tr key={u._id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white light:text-slate-900 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="p-4 text-slate-400 font-mono text-[11px]">{u.email}</td>
                <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <Badge variant={u.role === "admin" ? "warning" : u.role === "recruiter" ? "match" : "outline"} size="sm">
                    {u.role}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="text-xs py-1 px-2 w-32 inline-block"
                  >
                    <option value="student">student</option>
                    <option value="recruiter">recruiter</option>
                    <option value="admin">admin</option>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
