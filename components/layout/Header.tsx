'use client';

import { useState } from 'react';
import { Bell, Search, Menu, User, CheckCircle2 } from 'lucide-react';
import MobileNav from './MobileNav';
import LogoutButton from '@/components/LogoutButton';
import { useUser } from '@/context/UserContext';

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, loading, mounted } = useUser();

  // Use values from global context or defaults
  const displayName = profile?.full_name || 'Member';
  const displayRole = profile?.role || 'Member';

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Open Mobile Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, receipt..."
              className="pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all border border-transparent focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* M-Pesa Sync Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>M-Pesa Live Sync</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm ring-2 ring-slate-100 uppercase">
              {!mounted || loading ? (
                <User className="h-5 w-5 text-slate-400" />
              ) : (
                displayName.charAt(0)
              )}
            </div>
            <div className="hidden sm:block text-left">
              {!mounted || loading ? (
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
                  <div className="h-2 w-12 bg-slate-100 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-900 leading-none">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 capitalize">
                    {displayRole}
                  </p>
                </>
              )}
            </div>
            <div className="pl-1">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
}