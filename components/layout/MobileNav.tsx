'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, TrendingUp, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/LogoutButton';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'M-Pesa Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Audit & Reports', href: '/dashboard/reports', icon: TrendingUp },
];

const MONTHLY_FEE_PER_MEMBER = 400;
const NUMBER_OF_MONTHS = 5; // August through December

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { profile, loading, mounted } = useUser();
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
        console.error('Error fetching mobile nav savings targets:', err);
      } finally {
        setLoadingData(false);
      }
    }

    if (isOpen) {
      fetchSavingsData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = profile?.full_name || 'Member';
  const displayRole = profile?.role || 'Member';

  // Target Total Savings = Total Members * KSh 400 * 5 Months
  const targetTotalSavings = (memberCount ?? 0) * MONTHLY_FEE_PER_MEMBER * NUMBER_OF_MONTHS;

  // Calculate actual completion percentage
  const progressPercentage = targetTotalSavings > 0
    ? Math.min(Math.round((totalCollected / targetTotalSavings) * 100), 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 text-white min-h-full flex flex-col justify-between p-4 z-10 shadow-2xl">
        <div>
          <div className="flex items-center justify-between px-2 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                MB
              </div>
              <div>
                <h1 className="font-bold text-sm">Milimani Brothers</h1>
                <p className="text-[10px] text-slate-400">Savings Portal</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 text-slate-400 hover:text-white rounded-lg"
              aria-label="Close Mobile Menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
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

        <div className="space-y-4">
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

          {/* Dynamic User Profile Summary & Logout */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-semibold text-xs border border-slate-700 shrink-0 uppercase">
                {!mounted || loading ? (
                  <User className="h-4 w-4" />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              <div className="truncate">
                {!mounted || loading ? (
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-slate-800 animate-pulse rounded" />
                    <div className="h-2 w-10 bg-slate-800 animate-pulse rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate capitalize">
                      {displayRole}
                    </p>
                  </>
                )}
              </div>
            </div>

            <LogoutButton 
              variant="menuItem" 
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1.5 shrink-0" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}