'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { MoneySource } from '@financial-os/shared-types';

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSource?: MoneySource | null;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  isOpen,
  onClose,
  initialSource,
}) => {
  const { moneySources, user } = useAuthStore();
  const { adjustBalance } = useTransactionStore();

  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [targetBalance, setTargetBalance] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialSource) {
        setSelectedSourceId(initialSource.id);
        setTargetBalance(String(initialSource.current_balance));
      } else if (moneySources.length > 0) {
        setSelectedSourceId(moneySources[0].id);
        setTargetBalance(String(moneySources[0].current_balance));
      }
      setReason('');
      setErrorMsg(null);
    }
  }, [isOpen, initialSource, moneySources]);

  if (!isOpen) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const currentSource = moneySources.find((s) => s.id === selectedSourceId);
  const currentBal = currentSource ? Number(currentSource.current_balance) : 0;
  const targetBalNum = parseFloat(targetBalance) || 0;
  const diff = targetBalNum - currentBal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceId) {
      setErrorMsg('Please select a money source.');
      return;
    }

    if (diff === 0) {
      setErrorMsg('Target balance is identical to the current recorded balance.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await adjustBalance({
        money_source_id: selectedSourceId,
        target_balance: targetBalNum,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to adjust balance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[460px] rounded-[24px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px] text-amber-400">tune</span>
            </div>
            <div>
              <h2 className="text-[1.1rem] font-bold tracking-tight">Reconcile Balance</h2>
              <p className="text-[0.72rem] text-white/40">Creates an audit transaction for the difference</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Source */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Account to Adjust
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => {
                setSelectedSourceId(e.target.value);
                const s = moneySources.find((src) => src.id === e.target.value);
                if (s) setTargetBalance(String(s.current_balance));
              }}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-amber-400 transition-all"
            >
              {moneySources.map((src) => (
                <option key={src.id} value={src.id} className="bg-[#0f0f24]">
                  {src.name} (Recorded: {currencySymbol}
                  {Number(src.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          {/* Actual Counted Balance */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Actual / Current Real Balance
            </label>
            <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[12px] px-4 py-3 focus-within:border-amber-400 transition-all">
              <span className="text-[1.3rem] font-medium text-white/50 mr-2">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={targetBalance}
                onChange={(e) => setTargetBalance(e.target.value)}
                autoFocus
                required
                className="bg-transparent border-none text-[1.4rem] font-bold text-white outline-none w-full tabular-nums"
              />
            </div>
          </div>

          {/* Calculated Delta Pill */}
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[0.78rem] text-white/50">Adjustment Difference</span>
            <span
              className={`text-[0.88rem] font-bold tabular-nums flex items-center gap-1 ${
                diff > 0
                  ? 'text-emerald-400'
                  : diff < 0
                  ? 'text-red-400'
                  : 'text-white/40'
              }`}
            >
              <span className="material-symbols-rounded text-[16px]">
                {diff > 0 ? 'arrow_upward' : diff < 0 ? 'arrow_downward' : 'remove'}
              </span>
              {diff > 0 ? '+' : ''}
              {currencySymbol}
              {diff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Reason / Note */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Reason for Adjustment (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Counted physical cash, Bank statement reconciliation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/30"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[10px] text-[0.82rem] font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || diff === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 border-none rounded-[10px] px-6 py-2.5 text-black font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <span>{isSubmitting ? 'Adjusting...' : 'Save Adjustment'}</span>
              <span className="material-symbols-rounded text-[18px]">check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustBalanceModal;
