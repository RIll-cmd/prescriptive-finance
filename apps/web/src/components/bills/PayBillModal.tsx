'use client';

import React, { useState } from 'react';
import { useBillStore } from '@/stores/bill-store';
import { useAuthStore } from '@/stores/auth-store';

export const PayBillModal: React.FC = () => {
  const { isPayModalOpen, closePayModal, targetBillForPayment, payBill, isSubmitting } = useBillStore();
  const { moneySources } = useAuthStore();

  const [amount, setAmount] = useState('');
  const [moneySourceId, setMoneySourceId] = useState('');
  const [recordTransaction, setRecordTransaction] = useState(true);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isPayModalOpen || !targetBillForPayment) return null;

  const initialAmount = amount || targetBillForPayment.amount.toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await payBill(targetBillForPayment.id, {
      amount: parseFloat(initialAmount),
      paid_date: paidDate,
      money_source_id: moneySourceId || undefined,
      record_transaction: recordTransaction && !!moneySourceId,
      notes: notes || undefined,
    });

    setAmount('');
    setMoneySourceId('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[12px] animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card w-full max-w-md p-6 border border-white/10 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[22px] text-[#34d399]">check_circle</span>
            <h2 className="text-[1.1rem] font-bold text-white tracking-tight">
              Pay Bill: {targetBillForPayment.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={closePayModal}
            className="w-8 h-8 rounded-full bg-white/[0.04] text-white/40 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {/* Bill Summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-[12px] mb-4 flex items-center justify-between">
          <div>
            <span className="text-[0.7rem] text-white/40 font-bold uppercase tracking-wider block">Due Date</span>
            <span className="text-[0.9rem] font-semibold text-white">
              {new Date(targetBillForPayment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[0.7rem] text-white/40 font-bold uppercase tracking-wider block">Amount Due</span>
            <span className="text-[1.1rem] font-extrabold text-white tabular-nums">
              ₱{Number(targetBillForPayment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Paid Amount (₱)
              </label>
              <input
                type="number"
                step="0.01"
                required
                defaultValue={targetBillForPayment.amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.95rem] font-bold focus:outline-none focus:border-[#34d399] transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#34d399] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Pay From Account
            </label>
            <select
              value={moneySourceId}
              onChange={(e) => setMoneySourceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0c0c1e] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#34d399] transition-all"
            >
              <option value="">None (External payment)</option>
              {moneySources.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.name} (₱{Number(ms.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          {moneySourceId && (
            <label className="flex items-center gap-2.5 cursor-pointer text-[0.8rem] text-white/70">
              <input
                type="checkbox"
                checked={recordTransaction}
                onChange={(e) => setRecordTransaction(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#34d399] focus:ring-0 cursor-pointer"
              />
              <span>Deduct from account and log expense transaction</span>
            </label>
          )}

          <div>
            <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Payment Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Reference # 123456"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.85rem] focus:outline-none focus:border-[#34d399] transition-all"
            />
          </div>

          {targetBillForPayment.is_recurring && (
            <div className="p-3 bg-blue-500/[0.08] border border-blue-500/20 rounded-[10px] text-[0.75rem] text-blue-300">
              ℹ This is a recurring {targetBillForPayment.frequency.toLowerCase()} bill. Marking it paid will record this payment and advance the due date to the next cycle.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closePayModal}
              className="flex-1 py-2.5 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[0.85rem] font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-[10px] bg-gradient-to-r from-[#10b981] to-[#34d399] text-black font-bold text-[0.85rem] shadow-[0_4px_16px_rgba(52,211,153,0.3)] hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayBillModal;
