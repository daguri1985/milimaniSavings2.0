'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Search, Download, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { getFilteredPayments, TransactionRecord } from '@/app/actions/payments';
import { exportTransactionsToCSV } from '@/lib/export-csv';
import { formatCurrency } from '@/lib/utils';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<TransactionRecord[]>([]);
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [weekId, setWeekId] = useState('all');

  const fetchPayments = useCallback(() => {
    startTransition(async () => {
      const data = await getFilteredPayments({ search, status, weekId });
      setPayments(data);
    });
  }, [search, status, weekId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Helper functions to safely handle single vs array Supabase relation returns
  const getMemberDetails = (tx: TransactionRecord) => {
    const member = Array.isArray(tx.member) ? tx.member[0] : tx.member;
    return {
      fullName: member?.full_name || 'Unknown Member',
      phoneNumber: member?.phone_number || '',
    };
  };

  const getWeekId = (tx: TransactionRecord) => {
    const week = Array.isArray(tx.week) ? tx.week[0] : tx.week;
    return week?.id ? `Week ${week.id}` : '—';
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">M-Pesa Contribution Logs</h1>
          <p className="text-xs text-slate-500">View, filter, and export overall group savings history.</p>
        </div>
        <button
          onClick={() => exportTransactionsToCSV(payments)}
          disabled={payments.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV ({payments.length})
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member or M-Pesa code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified / Paid</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={weekId}
            onChange={(e) => setWeekId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">All Weeks</option>
            {Array.from({ length: 22 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isPending ? (
          <div className="p-8 text-center text-slate-400 flex justify-center items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Filtering payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No transaction records match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Member</th>
                  <th className="p-3">M-Pesa Code</th>
                  <th className="p-3">Week</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((tx) => {
                  const member = getMemberDetails(tx);
                  const weekText = getWeekId(tx);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-medium text-slate-900">
                        <div>{member.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {member.phoneNumber}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-700">
                        {tx.mpesa_receipt_number || '—'}
                      </td>
                      <td className="p-3 text-slate-600">
                        {weekText}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        +{formatCurrency(Number(tx.amount_paid))}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                            tx.status?.toLowerCase() === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {tx.status?.toLowerCase() === 'pending' ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(tx.paid_at || tx.created_at).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}