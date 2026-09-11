'use client';

import { useState } from 'react';
import { Download, Search, Filter, Calendar, FileSpreadsheet, RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface Member {
  id: string;
  full_name: string;
  member_number?: string;
  phone_number?: string;
  email?: string;
}

export interface Contribution {
  id: string;
  member_id: string;
  amount_paid?: number;
  amount?: number;
  payment_method?: string;
  method?: string;
  status?: string;
  payment_status?: string;
  created_at: string;
  members?: Member;
}

export default function ReportsClient({
  initialMembers = [],
  initialContributions = [],
}: {
  initialMembers?: Member[];
  initialContributions?: Contribution[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  // Safe Arrays
  const safeMembers = Array.isArray(initialMembers) ? initialMembers : [];
  const safeContributions = Array.isArray(initialContributions) ? initialContributions : [];

  // Helper getters to strictly resolve amount_paid and status
  const getAmount = (c: Contribution) => Number(c.amount_paid ?? c.amount ?? 0);
  const getMethod = (c: Contribution) => String(c.payment_method ?? c.method ?? 'M-Pesa').toUpperCase();
  const getStatus = (c: Contribution) => String(c.status ?? c.payment_status ?? 'completed').toLowerCase();

  // Filter Contributions
  const filteredContributions = safeContributions.filter((c) => {
    if (!c) return false;

    // Status Filter
    const cStatus = getStatus(c);
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        if (!['completed', 'success', 'verified', 'paid'].includes(cStatus)) return false;
      } else if (statusFilter === 'pending') {
        if (!['pending', 'processing', 'queued'].includes(cStatus)) return false;
      } else if (statusFilter === 'failed') {
        if (!['failed', 'cancelled', 'rejected', 'error'].includes(cStatus)) return false;
      }
    }

    // Date Range Filter
    const contribDate = new Date(c.created_at);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (contribDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (contribDate > end) return false;
    }

    // Selected Member Filter
    if (selectedMember && c.member_id !== selectedMember.id) {
      return false;
    }

    return true;
  });

  // Search Members for Dropdown
  const searchedMembers = safeMembers.filter((m) =>
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.member_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone_number?.includes(searchTerm)
  );

  // Stats Calculations
  const totalAmount = filteredContributions.reduce((sum, c) => sum + getAmount(c), 0);
  const totalCount = filteredContributions.length;

  // Export Excel Function
  const exportToExcel = () => {
    const reportData = filteredContributions.map((c) => {
      const member = safeMembers.find((m) => m.id === c.member_id) || c.members;
      return {
        'Date & Time': new Date(c.created_at).toLocaleString('en-KE'),
        'Member Name': member?.full_name || 'N/A',
        'Member No.': member?.member_number || 'N/A',
        'Amount Paid (KES)': getAmount(c),
        'Payment Method': getMethod(c),
        Status: getStatus(c).toUpperCase(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contributions Report');
    XLSX.writeFile(workbook, `Milimani_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setSelectedMember(null);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Filter, audit, and export verified system contributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reset Filters
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Start Date</label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">End Date</label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Status Filter</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'pending' | 'failed')}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 appearance-none font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Member Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Member Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search name or number..."
              value={selectedMember ? selectedMember.full_name : searchTerm}
              onChange={(e) => {
                setSelectedMember(null);
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          </div>
          {searchTerm && !selectedMember && (
            <div className="absolute z-20 w-full md:w-64 bg-white mt-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null);
                  setSearchTerm('');
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 font-semibold text-emerald-600"
              >
                Clear / All Members
              </button>
              {searchedMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMember(m);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 text-slate-700"
                >
                  <p className="font-medium text-slate-800">{m.full_name}</p>
                  <p className="text-[10px] text-slate-400">No: {m.member_number || 'N/A'}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Amount Paid</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              KES {totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-lg">
            💵
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtered Records</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg">
            📊
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Date & Time</th>
                <th className="p-4">Member</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount Paid (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">No matching contributions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting status filters or clearing the date parameters.</p>
                  </td>
                </tr>
              ) : (
                filteredContributions.map((c) => {
                  const member = safeMembers.find((m) => m.id === c.member_id) || c.members;
                  const status = getStatus(c);
                  const amount = getAmount(c);
                  const method = getMethod(c);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-medium text-slate-600">
                        {new Date(c.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{member?.full_name || 'Unknown Member'}</p>
                        <p className="text-[11px] text-slate-400">{member?.member_number || member?.phone_number || 'No ID'}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                        {method}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ['completed', 'success', 'verified', 'paid'].includes(status)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : ['pending', 'processing', 'queued'].includes(status)
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          {['completed', 'success', 'verified', 'paid'].includes(status) && <CheckCircle2 className="w-3 h-3" />}
                          {['pending', 'processing', 'queued'].includes(status) && <Clock className="w-3 h-3" />}
                          {['failed', 'cancelled', 'rejected', 'error'].includes(status) && <AlertCircle className="w-3 h-3" />}
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-slate-900 text-sm">
                        {amount > 0 ? amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '0.00'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}