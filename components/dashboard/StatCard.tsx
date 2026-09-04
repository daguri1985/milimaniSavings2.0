import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          variant === 'default' && 'bg-slate-100 text-slate-700',
          variant === 'success' && 'bg-emerald-50 text-emerald-600',
          variant === 'warning' && 'bg-amber-50 text-amber-600'
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-100 pt-3">
        <span className="text-slate-500">{subtitle}</span>
        {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
      </div>
    </div>
  );
}