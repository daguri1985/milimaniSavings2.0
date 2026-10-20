'use client';

import { useState } from 'react';
import { Target, CreditCard, Sparkles, CheckCircle2, Copy, Check, X, ShieldCheck, PhoneCall } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Member } from '@/lib/types';

interface PersonalMilestoneCardProps {
  userTotalSaved: number;
  seasonTarget?: number; // Defaults to KES 2,000
  memberName?: string;
  members?: Member[]; // Added to satisfy props passed from app/dashboard/page.tsx
}

export default function PersonalMilestoneCard({
  userTotalSaved,
  seasonTarget = 2000,
  memberName = 'Member',
  members = [],
}: PersonalMilestoneCardProps) {
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const progressPercentage = Math.min(
    100,
    Math.round((userTotalSaved / seasonTarget) * 100)
  );

  const remainingBalance = Math.max(0, seasonTarget - userTotalSaved);
  const isGoalReached = userTotalSaved >= seasonTarget;

  const treasurerName = 'Edgar Treasurer';
  const treasurerPhoneNumber = '0720851981';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background accent for high progress */}
        {isGoalReached && (
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full blur-xl pointer-events-none" />
        )}

        {/* Card Header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            Season Goal Pace
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isGoalReached
                ? 'bg-emerald-100 text-emerald-700'
                : progressPercentage >= 50
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isGoalReached ? 'Threshold Met 🎉' : `${progressPercentage}% Reached`}
          </span>
        </div>

        {/* Main Metric */}
        <div className="my-2">
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(userTotalSaved)}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              / {formatCurrency(seasonTarget)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isGoalReached
                  ? 'bg-emerald-500'
                  : progressPercentage >= 50
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-1.5">
            {isGoalReached ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Exceeded threshold by{' '}
                {formatCurrency(userTotalSaved - seasonTarget)}!
              </span>
            ) : (
              `KES ${remainingBalance.toLocaleString()} remaining to reach threshold`
            )}
          </p>
        </div>

        {/* Action Button */}
        {isGoalReached ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 p-1.5 rounded-lg justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            2,000 Target Complete
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsQuickPayOpen(true)}
            className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Make Payment
          </button>
        )}
      </div>

      {/* Member Payment Instructions Modal */}
      {isQuickPayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 p-5 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Send M-Pesa Contribution
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Remaining Deficit: <span className="font-bold text-emerald-600">{formatCurrency(remainingBalance)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickPayOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* M-Pesa Send Money Box */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                  Send Money To:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {treasurerName}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">M-Pesa Number:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white text-sm">
                  <span>{treasurerPhoneNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(treasurerPhoneNumber)}
                    className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-600 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Account Reference:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white uppercase">
                  {memberName}
                </span>
              </div>
            </div>

            {/* Helper Notice */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center px-1">
              Send via M-Pesa Send Money. Automated M-Pesa STK Push will be enabled shortly!
            </p>

            {/* Close Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsQuickPayOpen(false)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                I Have Sent the Money
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}