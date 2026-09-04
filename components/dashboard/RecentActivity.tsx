'use client';

import { ArrowDownLeft, CheckCircle, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface TransactionRecord {
  id: string;
  amount_paid: number;
  status: string;
  mpesa_receipt_number?: string | null;
  paid_at?: string | null;
  created_at: string;
  member?: {
    full_name: string;
    phone_number: string;
  } | null;
  week?: {
    id: number;
    month_name: string;
  } | null;
}

interface RecentActivityProps {
  transactions?: TransactionRecord[];
}

export default function RecentActivity({ transactions = [] }: RecentActivityProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent M-Pesa Logs</h2>
          <Link 
            href="/dashboard/payments" 
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            View All
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-100 text-slate-400 rounded-full mb-2">
              <Receipt className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-slate-600">No M-Pesa payments recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the &quot;+ Record Payment&quot; button above to log one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const formattedDate = tx.paid_at || tx.created_at
                ? new Date(tx.paid_at || tx.created_at).toLocaleDateString('en-KE', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                        {tx.member?.full_name || 'Member'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {tx.mpesa_receipt_number || 'N/A'} • {tx.week?.id ? `Week ${tx.week.id}` : formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-slate-900">
                      +{formatCurrency(Number(tx.amount_paid))}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="capitalize">{tx.status?.toLowerCase() || 'paid'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}