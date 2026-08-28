'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTransactionStore } from '@/stores/transaction-store';

export const FastTransfer: React.FC = () => {
  const { moneySources, user } = useAuthStore();
  const { createTransaction } = useTransactionStore();

  const [fromSourceId, setFromSourceId] = useState<string>('');
  const [toSourceId, setToSourceId] = useState<string>('');
  const [amount, setAmount] = useState<string>('500');
  const [isTransferring, setIsTransferring] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (moneySources.length > 0 && !fromSourceId) {
      setFromSourceId(moneySources[0].id);
      if (moneySources.length > 1) {
        setToSourceId(moneySources[1].id);
      }
    }
  }, [moneySources, fromSourceId]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const QUICK_AMOUNTS = [250, 500, 1000, 2000];

  const handleTransfer = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    if (!fromSourceId || !toSourceId) {
      setErrorMsg('Please select both origin and destination accounts.');
      return;
    }

    if (fromSourceId === toSourceId) {
      setErrorMsg('Cannot transfer to the same account.');
      return;
    }

    const origin = moneySources.find((s) => s.id === fromSourceId);
    if (origin && Number(origin.current_balance) < numAmount) {
      setErrorMsg(`Insufficient funds in ${origin.name}.`);
      return;
    }

    setIsTransferring(true);

    try {
      await createTransaction({
        type: 'TRANSFER',
        amount: numAmount,
        money_source_id: fromSourceId,
        destination_money_source_id: toSourceId,
        description: 'Fast Transfer',
        source: 'MANUAL',
      });
      setSuccessMsg(`Transferred ${currencySymbol}${numAmount.toLocaleString()} successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Transfer failed.');
    } finally {
      setIsTransferring(false);
    }
  };

  const fromSource = moneySources.find((s) => s.id === fromSourceId);
  const toSource = moneySources.find((s) => s.id === toSourceId);

  return (
    <section className="glass-card transfer-card">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[16px]">
          <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
            Quick Transfer
          </h2>
          <span className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
            Zero Fees
          </span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(String(amt))}
              className={`py-1.5 rounded-[8px] text-[0.75rem] font-semibold transition-all tabular-nums ${
                amount === String(amt)
                  ? 'bg-[#C57CF9]/20 text-[#d9a4ff] border border-[#C57CF9]/40 shadow-[0_0_8px_rgba(197,124,249,0.3)]'
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {currencySymbol}{amt}
            </button>
          ))}
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-3 p-2 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-300 text-[0.72rem] flex items-center gap-1.5 animate-[cardReveal_0.2s_ease-out]">
            <span className="material-symbols-rounded text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[0.72rem] flex items-center gap-1.5 animate-[cardReveal_0.2s_ease-out]">
            <span className="material-symbols-rounded text-[16px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Transfer Form */}
        <div className="flex flex-col gap-3">
          {/* From Source */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em]">
                From
              </label>
              {fromSource && (
                <span className="text-[0.68rem] text-white/40 tabular-nums">
                  Bal: {currencySymbol}{Number(fromSource.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <select
              value={fromSourceId}
              onChange={(e) => setFromSourceId(e.target.value)}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[8px] px-3 py-2 text-[0.82rem] font-medium text-white/90 outline-none focus:border-[#3869D2] hover:border-white/15 transition-all"
            >
              {moneySources.map((src) => (
                <option key={src.id} value={src.id} className="bg-[#0f0f24]">
                  {src.name}
                </option>
              ))}
            </select>
          </div>

          {/* To Source */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em]">
                To
              </label>
              {toSource && (
                <span className="text-[0.68rem] text-[#d9a4ff]/70 tabular-nums">
                  Bal: {currencySymbol}{Number(toSource.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <select
              value={toSourceId}
              onChange={(e) => setToSourceId(e.target.value)}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[8px] px-3 py-2 text-[0.82rem] font-medium text-white/90 outline-none focus:border-[#C57CF9] hover:border-white/15 transition-all"
            >
              {moneySources
                .filter((s) => s.id !== fromSourceId)
                .map((src) => (
                  <option key={src.id} value={src.id} className="bg-[#0f0f24]">
                    {src.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] mb-1 block">
              Amount
            </label>
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[8px] px-3 py-1.5 focus-within:border-[#3869D2] transition-all">
              <span className="text-[0.85rem] font-medium text-white/40 mr-1.5">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-none text-[0.85rem] font-bold text-white outline-none w-full tabular-nums"
              />
            </div>
          </div>

          {/* Transfer CTA */}
          <button
            onClick={handleTransfer}
            disabled={isTransferring || moneySources.length < 2}
            className="group relative flex items-center justify-center gap-2 bg-gradient-to-br from-[#C57CF9] to-[#3869D2] bg-[length:200%_200%] border-none rounded-[12px] px-6 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_24px_rgba(197,124,249,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(197,124,249,0.4),0_4px_16px_rgba(56,105,210,0.4)] active:translate-y-0 active:scale-95 transition-all duration-350 overflow-hidden mt-1 disabled:opacity-40"
          >
            <span>{isTransferring ? 'Transferring...' : 'Execute Transfer'}</span>
            <span className="material-symbols-rounded text-[18px]">send</span>
            <div className="absolute top-0 -left-full w-[60%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[130%] transition-[left] duration-700 pointer-events-none" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FastTransfer;
