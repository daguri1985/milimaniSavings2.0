// components/dashboard/StatCard.tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple';
  trend?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}: StatCardProps) {
  // World-class fintech color distribution tints & borders
  const variantStyles = {
    default: 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white',
    success: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100',
    warning: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40 text-amber-950 dark:text-amber-100',
    info: 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/40 text-blue-950 dark:text-blue-100',
    purple: 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-800/40 text-purple-950 dark:text-purple-100',
  };

  const iconStyles = {
    default: 'bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  };

  const trendStyles = {
    default: 'text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800',
    success: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40',
    warning: 'text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40',
    info: 'text-blue-700 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/40',
    purple: 'text-purple-700 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-900/40',
  };

  return (
    <div className={cn('p-4 rounded-2xl border shadow-xs transition-all flex flex-col justify-between', variantStyles[variant])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wide opacity-75 uppercase">
          {title}
        </span>
        <div className={cn('p-2 rounded-xl', iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-0.5">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs opacity-85 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
          <span className={cn('px-2 py-0.5 rounded-full font-semibold', trendStyles[variant])}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}