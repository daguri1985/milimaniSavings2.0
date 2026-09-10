'use client';

import React, { useState } from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface UnpaidMemberSummary {
  member_id: string;
  full_name: string;
  phone_number: string;
  amount_paid: number;
  expected_amount: number;
  deficit: number;
  status: 'UNPAID' | 'PARTIAL';
}

interface UnpaidMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  unpaidMembers: UnpaidMemberSummary[];
  targetPerMember: number;
}

export default function UnpaidMembersModal({
  isOpen,
  onClose,
  unpaidMembers,
  targetPerMember,
}: UnpaidMembersModalProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PARTIAL'>('ALL');

  if (!isOpen) return null;

  const filteredMembers = unpaidMembers.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone_number.includes(search);
    const matchesFilter = filter === 'ALL' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalUnpaidDeficit = unpaidMembers.reduce((sum, m) => sum + m.deficit, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              August Unpaid & Partial Members
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target per member: <span className="font-semibold">{formatCurrency(targetPerMember)}</span> | Total Deficit:{' '}
              <span className="font-semibold text-rose-600">{formatCurrency(totalUnpaidDeficit)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              All ({unpaidMembers.length})
            </button>
            <button
              onClick={() => setFilter('UNPAID')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === 'UNPAID'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
              }`}
            >
              Unpaid ({unpaidMembers.filter((m) => m.status === 'UNPAID').length})
            </button>
            <button
              onClick={() => setFilter('PARTIAL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === 'PARTIAL'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
              }`}
            >
              Partial ({unpaidMembers.filter((m) => m.status === 'PARTIAL').length})
            </button>
          </div>
        </div>

        {/* Member List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No unpaid members found.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.member_id}
                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  {member.status === 'UNPAID' ? (
                    <span className="p-2 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {member.full_name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {member.phone_number || 'No phone'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(member.amount_paid)}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / {formatCurrency(member.expected_amount)}
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full mt-0.5 ${
                      member.status === 'UNPAID'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}
                  >
                    Deficit: {formatCurrency(member.deficit)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}