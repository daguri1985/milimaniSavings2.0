'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Wallet, 
  Lock, 
  Smartphone, 
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col justify-between selection:bg-teal-600 selection:text-white">
      
      {/* 1. Public Top Navigation (Glassy Lemon Chiffon / Teal Header) */}
      <header className="border-b border-amber-200/60 bg-amber-50/40 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-700 flex items-center justify-center font-black text-[#FFFDE7] text-lg shadow-md shadow-teal-700/20">
              MB
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-teal-950 block leading-none">
                Milimani Brothers
              </span>
              <span className="text-[11px] text-teal-700 font-bold">Monthly Savings Group</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-teal-700 text-[#FFFDE7] hover:bg-teal-800 transition-all flex items-center gap-2 shadow-md shadow-teal-700/20 active:scale-95"
            >
              <span>Member Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFF9E6]/60 to-[#FFFDF7]">
          {/* Soft Teal Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9E6] border border-amber-200 text-xs font-semibold text-teal-800 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                <span>Transparent Group Financial Management</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Smart Savings for <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-teal-800 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  Milimani Brothers
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
                Automating weekly contributions, tracking WhatsApp payment ledgers, and providing real-time M-Pesa statements for our 20 active members.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-700 text-[#FFFDE7] font-bold text-base hover:bg-teal-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-teal-700/20 active:scale-95"
                >
                  <span>Access Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#schedule"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#FFF9E6] border border-amber-200 text-teal-900 font-semibold text-base hover:bg-[#FFF3CD] transition-all text-center shadow-sm"
                >
                  View Schedule
                </a>
              </div>

              {/* Quick Proof Badges */}
              <div className="pt-8 border-t border-amber-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Weekly Target</p>
                    <p className="text-sm font-bold text-teal-950">KSh 100 / week</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Group Size</p>
                    <p className="text-sm font-bold text-teal-950">20 Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Season Duration</p>
                    <p className="text-sm font-bold text-teal-950">Aug – Dec</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Season Savings Schedule (August to December) */}
        <section id="schedule" className="py-16 bg-[#FFF9E6]/60 border-y border-amber-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-teal-950">Season 1 Plan (Aug – Dec)</h2>
              <p className="text-slate-600 text-sm mt-2">
                Every member contributes KSh 100 weekly. Total target pool: KSh 40,000.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { month: 'August', weeks: 4, perMember: 400, groupTotal: 8000, status: 'Completed' },
                { month: 'September', weeks: 4, perMember: 400, groupTotal: 8000, status: 'Completed' },
                { month: 'October', weeks: 4, perMember: 400, groupTotal: 8000, status: 'Active' },
                { month: 'November', weeks: 4, perMember: 400, groupTotal: 8000, status: 'Upcoming' },
                { month: 'December', weeks: 6, perMember: 400, groupTotal: 8000, status: 'Upcoming' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border transition-all ${
                    item.status === 'Active' 
                      ? 'bg-white border-teal-600 ring-2 ring-teal-600/20 shadow-md' 
                      : 'bg-[#FFFDF7] border-amber-200/70'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.month}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Completed' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                      item.status === 'Active' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-slate-200/70 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xl font-black text-teal-950">KSh {item.groupTotal.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">KSh {item.perMember} per member ({item.weeks} weeks)</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Key Platform Features */}
        <section className="py-20 bg-[#FFFDF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-[#FFF9E6]/80 p-6 rounded-2xl border border-amber-200/80 hover:border-teal-600/50 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-teal-700 text-[#FFFDE7] flex items-center justify-center mb-4 shadow-sm">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-teal-950 mb-2">Direct M-Pesa STK Push</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Trigger payment prompts directly to member phones. Transactions auto-update without relying solely on manual WhatsApp posts.
                </p>
              </div>

              <div className="bg-[#FFF9E6]/80 p-6 rounded-2xl border border-amber-200/80 hover:border-teal-600/50 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-teal-700 text-[#FFFDE7] flex items-center justify-center mb-4 shadow-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-teal-950 mb-2">Automated Matrix Ledger</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Clear visual matrix mapping all 20 members across all 22 weeks. Spot overdue payments and compliance rates instantly.
                </p>
              </div>

              <div className="bg-[#FFF9E6]/80 p-6 rounded-2xl border border-amber-200/80 hover:border-teal-600/50 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-teal-700 text-[#FFFDE7] flex items-center justify-center mb-4 shadow-sm">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-teal-950 mb-2">Role-Based Treasurer Access</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Secure administration controls allowing the treasurer to confirm cash/M-Pesa receipts, issue reminders, and export reports.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* 5. Simple Footer */}
      <footer className="border-t border-amber-200/80 bg-[#FFF9E6] py-8 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} Milimani Brothers Monthly Savings Group. All rights reserved.</p>
      </footer>

    </div>
  );
}