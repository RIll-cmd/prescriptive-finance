'use client';

import React, { useState } from 'react';
import { useGoalStore } from '@/stores/goal-store';
import { useAuthStore } from '@/stores/auth-store';

export const ContributeGoalModal: React.FC = () => {
  const { isContributeModalOpen, closeContributeModal, targetGoalForContribution, contribute, isSubmitting } = useGoalStore();
  const { moneySources, user, openAddSourceModal } = useAuthStore();

  const [amount, setAmount] = useState('');
  const [moneySourceId, setMoneySourceId] = useState('');
  const [recordTransaction, setRecordTransaction] = useState(false);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isContributeModalOpen || !targetGoalForContribution) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const remaining = Math.max(0, targetGoalForContribution.target_amount - targetGoalForContribution.current_amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      await contribute(targetGoalForContribution.id, {
        amount: numAmount,
        money_source_id: moneySourceId || undefined,
        record_transaction: recordTransaction && !!moneySourceId,
        note: note || undefined,
      });

      setAmount('');
      setMoneySourceId('');
      setNote('');
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save contribution.');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-md rounded-[24px] bg-[rgba(5,5,16,0.96)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-rounded text-[20px]">add_circle</span>
            </div>
            <h2 className="text-[1.1rem] font-bold text-white tracking-tight">
              Contribute to {targetGoalForContribution.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeContributeModal}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Goal Summary banner */}
        <div className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-[14px] mb-4 flex items-center justify-between">
          <div>
            <span className="text-[0.68rem] text-white/40 font-bold uppercase tracking-wider block">Current Saved</span>
            <span className="text-[1.05rem] font-black text-white tabular-nums">
              {currencySymbol}{Number(targetGoalForContribution.current_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[0.68rem] text-white/40 font-bold uppercase tracking-wider block">Remaining</span>
            <span className="text-[1.05rem] font-black text-[#C57CF9] tabular-nums">
              {currencySymbol}{remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Contribution Amount ({currencySymbol}) *
            </label>
            <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2.5 focus-within:border-emerald-500 transition-all">
              <span className="text-[0.95rem] font-bold text-white/40 mr-2">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                placeholder="5,000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-none text-[1.1rem] font-bold text-white outline-none w-full tabular-nums placeholder:text-white/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                Fund From Source (Optional)
              </label>
              <button
                type="button"
                onClick={openAddSourceModal}
                className="text-[0.72rem] text-[#3869D2] hover:text-[#5a8aee] font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-rounded text-[14px]">add_circle</span>
                <span>+ New Source</span>
              </button>
            </div>
            <select
              value={moneySourceId}
              onChange={(e) => setMoneySourceId(e.target.value)}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-emerald-500 transition-all"
            >
              <option value="">No source (Tracking only)</option>
              {moneySources.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.name} (Balance: {currencySymbol}{Number(ms.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          {moneySourceId && (
            <label className="flex items-center gap-2.5 cursor-pointer text-[0.78rem] text-white/80 p-2.5 rounded-[10px] bg-white/[0.02] border border-white/[0.06]">
              <input
                type="checkbox"
                checked={recordTransaction}
                onChange={(e) => setRecordTransaction(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-400 focus:ring-0 cursor-pointer"
              />
              <span>Deduct amount from source and log expense ledger transaction</span>
            </label>
          )}

          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Mid-month savings transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-emerald-500 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={closeContributeModal}
              className="flex-1 py-2.5 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[0.85rem] font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-[10px] bg-gradient-to-r from-[#10b981] to-[#34d399] text-black font-bold text-[0.85rem] shadow-[0_4px_16px_rgba(52,211,153,0.3)] hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeGoalModal;
