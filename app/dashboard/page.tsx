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
  getMonthlyProgression,
} from '@/app/actions/dashboard';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

import PersonalMilestoneCard from '@/components/dashboard/PersonalMilestoneCard';

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
const SEASON_MONTHS = 5; // August to December (5 months)
const REQUIRED_MONTHS_TO_DATE = 2; // August + September
const EXPECTED_AMOUNT_TO_DATE = MONTHLY_TARGET * REQUIRED_MONTHS_TO_DATE; // KSh 800

export default async function DashboardPage() {
  const [user, stats, recentTransactions, members, monthlyProgression] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    getRecentTransactions(5),
    getMembersList(),
    getMonthlyProgression(),
  ]);

  let isAdmin = false;
  let userTotalSaved = 0;

  const userEmail = user?.email?.trim().toLowerCase();

  if (userEmail) {
    const { data: dbMember } = await supabase
      .from('members')
      .select('id, role, email')
      .ilike('email', userEmail)
      .maybeSingle<MemberRecord>();

    let currentMember: MemberRecord | null = dbMember;

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

  const userDeficit = Math.max(0, EXPECTED_AMOUNT_TO_DATE - userTotalSaved);
  const isUpToDate = userTotalSaved >= EXPECTED_AMOUNT_TO_DATE;

  // Correct dynamic group target calculation: Active Members × 400 KES × 5 Months
  const activeMemberCount = stats.totalMembers || (members ? members.length : 0);
  const dynamicTotalTarget = activeMemberCount * MONTHLY_TARGET * SEASON_MONTHS;
  const dynamicProgressPercentage = dynamicTotalTarget > 0
    ? Math.min(100, Math.round((stats.totalSaved / dynamicTotalTarget) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <DashboardHeader 
        members={members} 
        isAdmin={isAdmin}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. My Savings: Dynamic Green (Success) or Orange (Warning) */}
        <StatCard
          title="My Savings"
          value={formatCurrency(userTotalSaved)}
          subtitle={
            userDeficit > 0
              ? `Deficit: ${formatCurrency(userDeficit)} (Aug–Dec)`
              : 'Up to date for Aug to Dec 🎉'
          }
          icon={UserCheck}
          variant={isUpToDate ? 'success' : 'warning'}
          trend={isUpToDate ? 'On Track' : `Behind by ${formatCurrency(userDeficit)}`}
        />

        {/* 2. Total Funds Saved: Soft Blue / Indigo (Info Theme) */}
        <StatCard
          title="Total Funds Saved"
          value={formatCurrency(stats.totalSaved)}
          subtitle={`Target: ${formatCurrency(dynamicTotalTarget)}`}
          icon={Wallet}
          variant="info"
          trend={`${dynamicProgressPercentage}% Goal`}
        />

        {/* 3. Active Members: Soft Purple (Community Theme) */}
        <StatCard
          title="Active Members"
          value={`${activeMemberCount} Members`}
          subtitle="100% Onboarded"
          icon={Users}
          variant="purple"
        />

        {/* 4. Season Duration: Clean Neutral Slate */}
        <StatCard
          title="Season Duration"
          value="22 Weeks"
          subtitle="August to December"
          icon={Calendar}
          variant="default"
        />

        {/* 5. Personal Milestone Goal Card */}
        <PersonalMilestoneCard
          userTotalSaved={userTotalSaved}
          seasonTarget={2000}
          members={members}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SavingsChart data={monthlyProgression} />
        </div>
        <div>
          <RecentActivity transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}