'use client';

import { useState } from 'react';
import { X, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { Member } from '@/lib/types';
import { recordPayment } from '@/app/actions/payments';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

export default function RecordPaymentModal({ isOpen, onClose, members }: RecordPaymentModalProps) {
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [amount, setAmount] = useState('100');
  const [receipt, setReceipt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMember) {
      setErrorMsg('Please select a member.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Call RBAC-protected server action
    const res = await recordPayment({
      member_id: selectedMember,
      week_id: Number(selectedWeek),
      amount_paid: Number(amount),
      mpesa_receipt_number: receipt.toUpperCase().trim(),
      status: 'verified',
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReceipt('');
        setSelectedMember('');
        setAmount('100');
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Failed to save payment.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record M-Pesa Payment</h3>
              <p className="text-xs text-slate-500">Log a contribution for a group member</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Payment recorded successfully!</span>
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Member
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              required
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.phone_number})
                </option>
              ))}
            </select>
          </div>

          {/* Week & Amount Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Week Number
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {Array.from({ length: 22 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount (KSh)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* M-Pesa Code Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              M-Pesa Receipt Code
            </label>
            <input
              type="text"
              placeholder="e.g. QEJ892KL01"
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Payment</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}