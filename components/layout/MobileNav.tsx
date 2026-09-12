'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, TrendingUp, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/LogoutButton';
import { supabase } from '@/lib/supabase';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  name: string;
  role: string;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'M-Pesa Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Audit & Reports', href: '/dashboard/reports', icon: TrendingUp },
];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    role: 'Member',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: memberData } = await supabase
            .from('members')
            .select('full_name, role')
            .eq('email', user.email)
            .maybeSingle();

          const name = memberData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
          const role = memberData?.role || user.user_metadata?.role || 'Admin Access';

          setProfile({ name, role });
        }
      } catch (error) {
        console.error('Error fetching mobile nav user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      getUserProfile();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Aug – Dec Target</p>
            <p className="text-lg font-bold text-emerald-400">KSh 26,000</p>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[45%]" />
            </div>
          </div>

          {/* Dynamic User Profile Summary & Logout */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-semibold text-xs border border-slate-700 shrink-0 uppercase">
                {profile.name ? profile.name.charAt(0) : <User className="h-4 w-4" />}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {loading ? 'Loading...' : profile.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate capitalize">
                  {loading ? '...' : profile.role}
                </p>
              </div>
            </div>

            {/* Logout Action */}
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