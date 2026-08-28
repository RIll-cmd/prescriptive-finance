'use client';

import React, { useState } from 'react';
import { useGoalStore } from '@/stores/goal-store';
import { useAuthStore } from '@/stores/auth-store';

export const ContributeGoalModal: React.FC = () => {
  const { isContributeModalOpen, closeContributeModal, targetGoalForContribution, contribute, isSubmitting } = useGoalStore();
  const { moneySources } = useAuthStore();

  const [amount, setAmount] = useState('');
  const [moneySourceId, setMoneySourceId] = useState('');
  const [recordTransaction, setRecordTransaction] = useState(false);
  const [note, setNote] = useState('');

  if (!isContributeModalOpen || !targetGoalForContribution) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    await contribute(targetGoalForContribution.id, {
      amount: parseFloat(amount),
      money_source_id: moneySourceId || undefined,
      record_transaction: recordTransaction && !!moneySourceId,
      note: note || undefined,
    });

    setAmount('');
    setMoneySourceId('');
    setNote('');
  };

  const remaining = Math.max(0, targetGoalForContribution.target_amount - targetGoalForContribution.current_amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[12px] animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card w-full max-w-md p-6 border border-white/10 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[22px] text-[#34d399]">add_circle</span>
            <h2 className="text-[1.1rem] font-bold text-white tracking-tight">
              Contribute to {targetGoalForContribution.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeContributeModal}
            className="w-8 h-8 rounded-full bg-white/[0.04] text-white/40 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {/* Goal Summary banner */}
        <div className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-[12px] mb-4 flex items-center justify-between">
          <div>
            <span className="text-[0.7rem] text-white/40 font-bold uppercase tracking-wider block">Current Saved</span>
            <span className="text-[0.95rem] font-bold text-white tabular-nums">
              ₱{Number(targetGoalForContribution.current_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[0.7rem] text-white/40 font-bold uppercase tracking-wider block">Remaining</span>
            <span className="text-[0.95rem] font-bold text-[#C57CF9] tabular-nums">
              ₱{remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Contribution Amount (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 5,000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.95rem] font-bold focus:outline-none focus:border-[#34d399] transition-all"
            />
          </div>

          <div>
            <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Fund From Source (Optional)
            </label>
            <select
              value={moneySourceId}
              onChange={(e) => setMoneySourceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0c0c1e] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#34d399] transition-all"
            >
              <option value="">No source (Tracking only)</option>
              {moneySources.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.name} (Balance: ₱{Number(ms.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
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
              <span>Deduct amount from source and log expense ledger transaction</span>
            </label>
          )}

          <div>
            <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Mid-month savings transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.85rem] focus:outline-none focus:border-[#34d399] transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
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
