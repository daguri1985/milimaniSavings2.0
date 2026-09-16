export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Wallet, Users, Calendar, UserCheck } from 'lucide-react';
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
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import InteractivePendingCard from '@/components/dashboard/InteractivePendingCard';

interface MemberRecord {
  id: string;
  role: string;
  email?: string | null;
  phone?: string | null;
}

interface ContributionRecord {
  amount_paid: number | string;
}

const MONTHLY_TARGET = 400; // KSh 400 per month
const REQUIRED_MONTHS_TO_DATE = 2; // August + September
const EXPECTED_AMOUNT_TO_DATE = MONTHLY_TARGET * REQUIRED_MONTHS_TO_DATE; // KSh 800

export default async function DashboardPage() {
  const [user, stats, recentTransactions, members] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    getRecentTransactions(5),
    getMembersList(),
  ]);

  let isAdmin = false;
  let userTotalSaved = 0;

  const userEmail = user?.email?.trim().toLowerCase();

  if (userEmail) {
    // 1. Fetch member matching user email (case-insensitive)
    const { data: dbMember } = await supabase
      .from('members')
      .select('id, role, email')
      .ilike('email', userEmail)
      .maybeSingle<MemberRecord>();

    let currentMember: MemberRecord | null = dbMember;

    // Fallback: Check in pre-fetched members list
    if (!currentMember && members && members.length > 0) {
      const found = (members as MemberRecord[]).find(
        (m) => m.email?.trim().toLowerCase() === userEmail
      );
      if (found) {
        currentMember = found;
      }
    }

    if (currentMember) {
      isAdmin = currentMember.role === 'admin';

      // 2. Query 'amount_paid' from the 'contributions' table
      const { data: userContributions, error: contributionErr } = await supabase
        .from('contributions')
        .select('amount_paid')
        .eq('member_id', currentMember.id);

      if (contributionErr) {
        console.error('[Dashboard] Contributions query error:', contributionErr.message);
      }

      if (userContributions && userContributions.length > 0) {
        userTotalSaved = (userContributions as ContributionRecord[]).reduce((sum, item) => {
          const val = Number(item.amount_paid);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
      }
    }
  }

  // Deficit based on KSh 800 requirement (Aug + Sep)
  const userDeficit = Math.max(0, EXPECTED_AMOUNT_TO_DATE - userTotalSaved);
  const isUpToDate = userTotalSaved >= EXPECTED_AMOUNT_TO_DATE;

  return (
    <div className="space-y-6">
      <DashboardHeader 
        members={members} 
        isAdmin={isAdmin}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="My Savings"
          value={formatCurrency(userTotalSaved)}
          subtitle={
            userDeficit > 0
              ? `Deficit: ${formatCurrency(userDeficit)} (Aug–Sep)`
              : 'Up to date for Aug & Sep 🎉'
          }
          icon={UserCheck}
          variant={isUpToDate ? 'success' : 'warning'}
          trend={isUpToDate ? 'On Track' : `Behind by ${formatCurrency(userDeficit)}`}
        />

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

        <InteractivePendingCard
          unpaidMembersCount={stats.unpaidMembersCount}
          unpaidAmount={stats.unpaidAmount}
          unpaidMembersList={stats.unpaidMembersList}
          targetPerMember={stats.augustTargetPerMember}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SavingsChart />
        </div>
        <div>
          <RecentActivity transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}