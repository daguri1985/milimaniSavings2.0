export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Wallet, Users, AlertCircle, Calendar } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import SavingsChart from '@/components/dashboard/SavingsChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { formatCurrency } from '@/lib/utils';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
    getRecentTransactions,
    getDashboardStats,
    getMembersList,
  } from '@/app/actions/dashboard';



export default async function DashboardPage() {

  const [stats, recentTransactions, members] = await Promise.all ([getDashboardStats()
    , getRecentTransactions(5),
     getMembersList()
    ]);

  return (
    <div className="space-y-6">
    {/* Header with Record Payment Modal Trigger */}
      <DashboardHeader members={members} />
      
      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Funds Saved"
          value={formatCurrency(stats.totalSaved)}
          subtitle={`Target: ${formatCurrency(stats.totalTarget)}`}
          icon={Wallet}
          variant="success"
          trend={`${stats.progressPercentage}% Goal`}
        />
        <StatCard
          title="Active Members"
          value={`${stats.totalMembers} Members`}
          subtitle="100% Onboarded"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Season Duration"
          value="22 Weeks"
          subtitle="August to December"
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="Pending Payments"
          value={`${stats.pendingPayments} Unpaid`}
          subtitle="Awaiting Verification"
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Analytics & Transaction Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SavingsChart />
        </div>
        <div>
          <RecentActivity transactions={recentTransactions}/>
        </div>
      </div>
    </div>
  );
}