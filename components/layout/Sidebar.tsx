'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, ShieldCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'M-Pesa Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Audit & Reports', href: '/reports', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();

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

      {/* Season Target Quick Badge */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <p className="text-xs text-slate-400 mb-1">Aug – Dec Goal</p>
        <p className="text-lg font-bold text-emerald-400">KSh 28,600</p>
        <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
          <div className="bg-emerald-500 h-full w-[45%]" />
        </div>
      </div>
    </aside>
  );
}