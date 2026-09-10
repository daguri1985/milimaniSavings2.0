'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { formatCurrency } from '@/lib/utils';
import UnpaidMembersModal, { UnpaidMemberSummary } from '@/components/dashboard/UnpaidMembersModal';

interface InteractivePendingCardProps {
  unpaidMembersCount: number;
  unpaidAmount: number;
  unpaidMembersList: UnpaidMemberSummary[];
  targetPerMember: number;
}

export default function InteractivePendingCard({
  unpaidMembersCount,
  unpaidAmount,
  unpaidMembersList,
  targetPerMember,
}: InteractivePendingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99]"
        title="Click to view detailed unpaid member breakdown"
      >
        <StatCard
          title="August Unpaid Members"
          value={`${unpaidMembersCount} ${unpaidMembersCount === 1 ? 'Member' : 'Members'}`}
          subtitle={`${formatCurrency(unpaidAmount)} Deficit (Click for list)`}
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      <UnpaidMembersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        unpaidMembers={unpaidMembersList}
        targetPerMember={targetPerMember}
      />
    </>
  );
}