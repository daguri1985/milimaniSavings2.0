'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Member } from '@/lib/types';
import RecordPaymentModal from './RecordPaymentModal';

interface DashboardHeaderProps {
  members: Member[];
}

export default function DashboardHeader({ members }: DashboardHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Group Dashboard</h1>
          <p className="text-sm text-slate-500">
            Milimani Brothers Weekly Savings Overview (Aug – Dec)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Record Payment</span>
        </button>
      </div>

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        members={members}
      />
    </>
  );
}