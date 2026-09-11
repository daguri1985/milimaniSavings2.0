'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Search, UserPlus, Users, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { getMembers, MemberWithStats } from '@/app/actions/members';
import { formatCurrency } from '@/lib/utils';
import AddMemberModal from '@/components/dashboard/AddMemberModal';
import { supabase } from '@/lib/supabase';

export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchMembers = useCallback(() => {
    startTransition(async () => {
      // 1. Get client-side user and metadata directly (Same way Record Payment works)
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      const currentUser = session?.user || user;

      // Extract metadata roles
      const appRole = currentUser?.app_metadata?.role?.toLowerCase();
      const userRole = currentUser?.user_metadata?.role?.toLowerCase();
      const activeEmail = currentUser?.email?.toLowerCase() || '';

      const userInfo = currentUser ? {
        email: activeEmail,
        phone: currentUser.phone || currentUser.user_metadata?.phone_number || null,
        app_role: appRole,
        user_role: userRole,
      } : null;

      // 2. Fetch members roster
      const { members: memberList, isAdmin: serverAdminStatus } = await getMembers(search, userInfo);

      // 3. Fallback check against member table records or metadata
      const isMetadataAdmin = appRole === 'admin' || userRole === 'admin';
      const isTableAdmin = memberList.some(
        (m) => m.email?.trim().toLowerCase() === activeEmail && m.role?.trim().toLowerCase() === 'admin'
      );

      // Set Admin state if ANY of the checks pass
      const finalAdminState = serverAdminStatus || isMetadataAdmin || isTableAdmin;

      setMembers(memberList);
      setIsAdmin(finalAdminState);
    });
  }, [search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const totalGroupSavings = members.reduce((sum, m) => sum + (m.total_contributions || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Group Members</h1>
          <p className="text-xs text-slate-500">
            Manage members, roles, and track cumulative savings contributions.
          </p>
        </div>

        {/* Add Member button - Render if Admin */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Add New Member
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Roster</p>
            <p className="text-lg font-bold text-slate-900">{totalMembers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Active Members</p>
            <p className="text-lg font-bold text-slate-900">{activeMembers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Group Savings</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(totalGroupSavings)}</p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isPending ? (
          <div className="p-8 text-center text-slate-400 flex justify-center items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No members match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Member Name</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total Saved</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      {member.full_name}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {member.phone_number}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 capitalize">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          member.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-600">
                      {formatCurrency(member.total_contributions || 0)}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(member.created_at).toLocaleDateString('en-KE', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAdmin && (
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onMemberAdded={fetchMembers}
        />
      )}
    </div>
  );
}