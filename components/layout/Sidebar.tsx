'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'M-Pesa Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Audit & Reports', href: '/dashboard/reports', icon: TrendingUp },
];

const MONTHLY_FEE_PER_MEMBER = 400;
const NUMBER_OF_MONTHS = 5; // August through December

export default function Sidebar() {
  const pathname = usePathname();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [totalCollected, setTotalCollected] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSavingsData() {
      try {
        setLoadingData(true);

        // 1. Fetch total active member count
        const { count, error: countError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        if (!countError && count !== null) {
          setMemberCount(count);
        }

        // 2. Fetch total accumulated savings from payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount');

        if (!paymentsError && paymentsData) {
          const sum = paymentsData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          setTotalCollected(sum);
        }
      } catch (err) {
        console.error('Error fetching sidebar savings targets:', err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchSavingsData();
  }, []);

  // Target Total Savings = Total Members * KSh 400 * 5 Months
  const targetTotalSavings = (memberCount ?? 0) * MONTHLY_FEE_PER_MEMBER * NUMBER_OF_MONTHS;

  // Calculate actual completion percentage
  const progressPercentage = targetTotalSavings > 0
    ? Math.min(Math.round((totalCollected / targetTotalSavings) * 100), 100)
    : 0;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-4 hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
            MB
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Milimani Brothers</h1>
            <p className="text-xs text-slate-400">Savings Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Target Total Savings Card */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-slate-400">Total Savings Target (Aug–Dec)</p>
          {memberCount !== null && (
            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
              {memberCount} members
            </span>
          )}
        </div>

        <p className="text-lg font-bold text-emerald-400">
          {loadingData ? (
            <span className="inline-block h-5 w-24 bg-slate-700 animate-pulse rounded" />
          ) : (
            `KSh ${targetTotalSavings.toLocaleString()}`
          )}
        </p>

        {/* Dynamic Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
            <span>Raised: KSh {totalCollected.toLocaleString()}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}