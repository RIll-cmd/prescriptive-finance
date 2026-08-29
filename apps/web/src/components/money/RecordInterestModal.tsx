'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { MoneySource } from '@financial-os/shared-types';

interface RecordInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: MoneySource | null;
}

export const RecordInterestModal: React.FC<RecordInterestModalProps> = ({
  isOpen,
  onClose,
  source,
}) => {
  const { user, creditMoneySourceInterest } = useAuthStore();

  const [grossAmount, setGrossAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  // Compute default suggested amounts when opening modal
  useEffect(() => {
    if (source && isOpen) {
      const balance = Number(source.current_balance) || 0;
      const rate = Number(source.interest_rate_pct) || 3.5;
      const taxRate = Number(source.withholding_tax_pct) || 20;

      // Suggest 1 month or 1 day worth of interest
      const isDaily = (source.interest_frequency || 'DAILY').toUpperCase() === 'DAILY';
      const days = isDaily ? 1 : 30;

      const calcGross = (balance * (rate / 100) * days) / 365;
      const calcTax = calcGross * (taxRate / 100);
      const calcNet = calcGross - calcTax;

      setGrossAmount(calcGross > 0 ? calcGross.toFixed(2) : '0.00');
      setTaxAmount(calcTax > 0 ? calcTax.toFixed(2) : '0.00');
      setNetAmount(calcNet > 0 ? calcNet.toFixed(2) : '0.00');
      setDescription(
        `Manual Earned Interest (${rate}% p.a. • Net of ${taxRate}% tax${isDaily ? ' - 1 Day' : ' - 1 Month'})`
      );
      setErrorMsg(null);
    }
  }, [source, isOpen]);

  if (!isOpen || !source) return null;

  const handleGrossChange = (val: string) => {
    setGrossAmount(val);
    const g = parseFloat(val) || 0;
    const taxRate = Number(source.withholding_tax_pct) || 20;
    const t = g * (taxRate / 100);
    const n = g - t;
    setTaxAmount(t.toFixed(2));
    setNetAmount(n > 0 ? n.toFixed(2) : '0.00');
  };

  const handleNetChange = (val: string) => {
    setNetAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const net = parseFloat(netAmount);
    if (!net || net <= 0) {
      setErrorMsg('Net interest amount must be greater than 0.00.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await creditMoneySourceInterest(source.id, {
        gross_amount: parseFloat(grossAmount) || undefined,
        tax_amount: parseFloat(taxAmount) || undefined,
        net_amount: net,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to credit interest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[480px] rounded-[24px] bg-[rgba(5,5,16,0.96)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.85)] animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-rounded text-[18px]">payments</span>
            </div>
            <div>
              <h2 className="text-[1.15rem] font-bold tracking-tight">Record Earned Interest</h2>
              <p className="text-[0.72rem] text-white/40">
                Post passive earnings into <strong className="text-white">{source.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
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
          {/* Account Overview Bar */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[0.65rem] font-semibold text-white/40 uppercase tracking-wider block">
                Current Principal Balance
              </span>
              <span className="text-[1.1rem] font-bold text-white tabular-nums">
                {currencySymbol}
                {Number(source.current_balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[0.65rem] font-semibold text-white/40 uppercase tracking-wider block">
                Configured Yield
              </span>
              <span className="text-[0.88rem] font-bold text-emerald-400">
                {source.interest_rate_pct || 0}% p.a. • {source.interest_frequency || 'DAILY'}
              </span>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[0.62rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                Gross Interest
              </label>
              <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2">
                <span className="text-[0.75rem] text-white/40 mr-1">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={grossAmount}
                  onChange={(e) => handleGrossChange(e.target.value)}
                  className="bg-transparent border-none text-[0.85rem] font-bold text-white outline-none w-full tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.62rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                20% Withholding Tax
              </label>
              <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2">
                <span className="text-[0.75rem] text-rose-400/60 mr-1">-{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  className="bg-transparent border-none text-[0.85rem] font-bold text-rose-400 outline-none w-full tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.62rem] font-semibold text-emerald-400 uppercase tracking-[0.06em] mb-1 block">
                Net Cash Added *
              </label>
              <div className="relative flex items-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-2.5 py-2">
                <span className="text-[0.75rem] text-emerald-400 mr-1">+{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={netAmount}
                  onChange={(e) => handleNetChange(e.target.value)}
                  className="bg-transparent border-none text-[0.92rem] font-black text-emerald-400 outline-none w-full tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Transaction Note / Description */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Ledger Note / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[0.82rem] font-medium text-white outline-none focus:border-emerald-400 transition-all"
            />
          </div>

          {/* Balance Preview */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[0.82rem]">
            <span className="text-white/60">New Balance after Post:</span>
            <span className="font-extrabold text-emerald-400 tabular-nums">
              {currencySymbol}
              {(Number(source.current_balance) + (parseFloat(netAmount) || 0)).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[10px] text-[0.82rem] font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 border-none rounded-[10px] px-6 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Posting...' : 'Post to Account'}</span>
              <span className="material-symbols-rounded text-[18px]">done_all</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordInterestModal;
