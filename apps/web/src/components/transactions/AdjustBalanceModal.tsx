'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTransactionStore } from '@/stores/transaction-store';

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceId?: string;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  isOpen,
  onClose,
  sourceId,
}) => {
  const { moneySources } = useAuthStore();
  const { adjustBalance, isLoading } = useTransactionStore();

  const [selectedId, setSelectedId] = useState<string>(sourceId || '');
  const [targetBalance, setTargetBalance] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && moneySources.length > 0) {
      const active = sourceId ? moneySources.find((s) => s.id === sourceId) : moneySources[0];
      if (active) {
        setSelectedId(active.id);
        setTargetBalance(active.current_balance.toString());
      }
    }
  }, [isOpen, sourceId, moneySources]);

  if (!isOpen) return null;

  const currentSource = moneySources.find((s) => s.id === selectedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetBalance);
    if (isNaN(parsedTarget) || parsedTarget < 0) {
      setError('Please enter a valid target balance.');
      return;
    }

    if (!selectedId) {
      setError('Please select a money source.');
      return;
    }

    try {
      await adjustBalance({
        money_source_id: selectedId,
        target_balance: parsedTarget,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust balance.');
    }
  };

  const diff = currentSource ? parseFloat(targetBalance || '0') - Number(currentSource.current_balance) : 0;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[20px] animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-full max-w-[460px] rounded-[28px] p-[1px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.9)]">
        {/* Glowing border */}
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#3869D2_350deg,#C57CF9_360deg)] animate-[borderSpin_10s_linear_infinite] opacity-40 pointer-events-none" />

        <div className="relative rounded-[27px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white select-none">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[1.25rem] font-bold tracking-tight">Reconcile Balance</h2>
              <p className="text-[0.78rem] text-white/40 mt-0.5">Adjust recorded balance to match actual funds</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-rounded text-[18px]">close</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] flex items-center gap-2">
              <span className="material-symbols-rounded text-[16px] text-red-400">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Money Source Selector */}
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                Account / Source
              </label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  const s = moneySources.find((src) => src.id === e.target.value);
                  if (s) setTargetBalance(s.current_balance.toString());
                }}
                className="w-full bg-[rgba(15,15,30,0.9)] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#3869D2]"
              >
                {moneySources.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0f0f24] text-white">
                    {s.name} (Current: ₱{Number(s.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Balance */}
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                Actual Current Balance
              </label>
              <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] focus-within:border-[#3869D2] rounded-2xl px-4 py-3 transition-all">
                <span className="text-[1.2rem] font-bold text-white/50 mr-2">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={targetBalance}
                  onChange={(e) => setTargetBalance(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white text-[1.3rem] font-black placeholder:text-white/20 tabular-nums"
                  autoFocus
                />
              </div>

              {/* Difference badge */}
              {currentSource && diff !== 0 && (
                <div className="mt-2 text-[0.75rem] font-medium flex items-center gap-1.5">
                  <span className="text-white/40">Audit Adjustment:</span>
                  <span className={diff > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {diff > 0 ? `+₱${diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-₱${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                Adjustment Reason / Note
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Monthly bank reconciliation, counted envelope"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-[0.90rem] text-white bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_4px_24px_rgba(56,105,210,0.35)] flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Adjusting...</span>
                </>
              ) : (
                <>
                  <span>Confirm Reconciliation</span>
                  <span className="material-symbols-rounded text-[18px]">check</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdjustBalanceModal;
