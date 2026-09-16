import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Phone,
  Mail,
  ArrowLeft,
  Receipt,
  ShieldCheck,
  Target,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface MemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberDetailPage({ params }: MemberPageProps) {
  const { id } = await params;

  // 1. Fetch Member Details
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (memberError || !member) {
    notFound();
  }

  // 2. Fetch Member Contributions
  const { data: transactions } = await supabase
    .from('contributions')
    .select('*')
    .eq('member_id', id)
    .order('created_at', { ascending: false });

  const contributions = transactions || [];
  const totalPaid = contributions.reduce(
    (sum, t) => sum + Number(t.amount_paid || 0),
    0
  );

  // 3. August to December Target Breakdown Calculation
  const MONTHLY_TARGET = 400; // Adjust monthly target amount as needed
  const targetMonths = [
    { name: 'August', monthIndex: 7, year: 2026 },
    { name: 'September', monthIndex: 8, year: 2026 },
    { name: 'October', monthIndex: 9, year: 2026 },
    { name: 'November', monthIndex: 10, year: 2026 },
    { name: 'December', monthIndex: 11, year: 2026 },
  ];

  const periodBreakdown = targetMonths.map((m) => {
    // Sum contributions matching this month and year
    const paidInMonth = contributions
      .filter((tx) => {
        const date = new Date(tx.created_at);
        return (
          date.getMonth() === m.monthIndex && date.getFullYear() === m.year
        );
      })
      .reduce((sum, tx) => sum + Number(tx.amount_paid || 0), 0);

    const deficit = Math.max(0, MONTHLY_TARGET - paidInMonth);
    const progressPercent = Math.min(
      100,
      Math.round((paidInMonth / MONTHLY_TARGET) * 100)
    );

    return {
      name: m.name,
      target: MONTHLY_TARGET,
      paid: paidInMonth,
      deficit,
      progressPercent,
    };
  });

  const periodTotalTarget = MONTHLY_TARGET * targetMonths.length;
  const periodTotalPaid = periodBreakdown.reduce((sum, m) => sum + m.paid, 0);
  const periodTotalDeficit = Math.max(0, periodTotalTarget - periodTotalPaid);
  const periodOverallProgress = Math.min(
    100,
    Math.round((periodTotalPaid / periodTotalTarget) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div>
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Link>
      </div>

      {/* Member Profile Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl uppercase ring-4 ring-slate-100">
            {member.full_name?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {member.full_name}
              </h1>
              {member.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              {member.phone_number && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />{' '}
                  {member.phone_number}
                </span>
              )}
              {member.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {member.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-xl text-left md:text-right w-full md:w-auto">
          <p className="text-xs text-emerald-700 font-medium">
            Lifetime Saved
          </p>
          <p className="text-xl font-bold text-emerald-900">
            KSh {totalPaid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Target Progress Overview Banner (Aug - Dec) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Target (Aug – Dec)
            </p>
            <p className="text-lg font-bold text-slate-900">
              KSh {periodTotalTarget.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Paid (Aug – Dec)
            </p>
            <p className="text-lg font-bold text-emerald-600">
              KSh {periodTotalPaid.toLocaleString()} ({periodOverallProgress}%)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg ${
              periodTotalDeficit > 0
                ? 'bg-rose-50 text-rose-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Deficit
            </p>
            <p
              className={`text-lg font-bold ${
                periodTotalDeficit > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              KSh {periodTotalDeficit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Target & Deficit Cards Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" /> August – December Target
            Breakdown
          </h2>
          <span className="text-xs text-slate-500">
            Target: KSh {MONTHLY_TARGET.toLocaleString()} / Month
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {periodBreakdown.map((item) => (
            <div
              key={item.name}
              className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{item.name}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Paid:</span>
                    <span className="font-semibold text-slate-900">
                      KSh {item.paid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Deficit:</span>
                    <span
                      className={`font-semibold ${
                        item.deficit > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      KSh {item.deficit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.progressPercent >= 100
                        ? 'bg-emerald-500'
                        : item.progressPercent > 0
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-right text-slate-500 font-medium">
                  {item.progressPercent}% Target Met
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" /> Contribution History
          </h2>
        </div>

        {contributions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No contributions recorded yet for this member.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {contributions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {tx.mpesa_code ? `M-Pesa: ${tx.mpesa_code}` : 'Direct Contribution'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(tx.created_at).toLocaleDateString('en-KE', {
                      dateStyle: 'medium',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600">
                    KSh {Number(tx.amount_paid).toLocaleString()}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">
                    {tx.status || 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}