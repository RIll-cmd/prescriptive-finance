'use client';

import React, { useState, useEffect } from 'react';
import { useInterestPredictorStore } from '@/stores/interest-predictor-store';

export const CustomBankPresetModal: React.FC = () => {
  const {
    isCustomModalOpen,
    editingPreset,
    closeCustomModal,
    addCustomPreset,
    updateCustomPreset,
    deleteCustomPreset,
  } = useInterestPredictorStore();

  const [name, setName] = useState('');
  const [ratePct, setRatePct] = useState('4.50');
  const [creditingFrequency, setCreditingFrequency] = useState<'daily' | 'monthly' | 'quarterly'>('daily');
  const [taxRatePct, setTaxRatePct] = useState('20');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPreset) {
      setName(editingPreset.name);
      setRatePct(String(editingPreset.ratePct));
      setCreditingFrequency(editingPreset.creditingFrequency);
      setTaxRatePct(String(editingPreset.taxRatePct));
      setDescription(editingPreset.description || '');
    } else {
      setName('');
      setRatePct('4.50');
      setCreditingFrequency('daily');
      setTaxRatePct('20');
      setDescription('');
    }
    setError(null);
  }, [editingPreset, isCustomModalOpen]);

  if (!isCustomModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a bank or product name.');
      return;
    }

    const numRate = parseFloat(ratePct);
    if (isNaN(numRate) || numRate <= 0) {
      setError('Please enter a valid interest rate greater than 0%.');
      return;
    }

    const numTax = parseFloat(taxRatePct);
    if (isNaN(numTax) || numTax < 0 || numTax > 100) {
      setError('Tax rate must be between 0% and 100%.');
      return;
    }

    if (editingPreset && editingPreset.isCustom) {
      updateCustomPreset({
        ...editingPreset,
        name: trimmedName,
        ratePct: numRate,
        creditingFrequency,
        taxRatePct: numTax,
        description: description.trim() || undefined,
      });
    } else {
      addCustomPreset({
        name: trimmedName,
        ratePct: numRate,
        creditingFrequency,
        taxRatePct: numTax,
        description: description.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[500px] rounded-[24px] bg-[rgba(10,10,24,0.96)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.85)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#C57CF9]/15 blur-[60px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C57CF9] to-[#3869D2] flex items-center justify-center shadow-[0_4px_16px_rgba(197,124,249,0.35)]">
              <span className="material-symbols-rounded text-[20px] text-white">account_balance</span>
            </div>
            <div>
              <h2 className="text-[1.15rem] font-extrabold tracking-tight">
                {editingPreset ? 'Edit Bank Preset' : 'Add Custom Bank / Yield Preset'}
              </h2>
              <p className="text-[0.75rem] text-white/40">
                Configure your own bank, promo boost, or special tax-exempt yield
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCustomModal}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] flex items-center gap-2">
            <span className="material-symbols-rounded text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bank / Product Name */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Bank / Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya with 10% Missions, Pag-IBIG MP2, USD Yield"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all placeholder:text-white/20"
            />
          </div>

          {/* Rate & Tax Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Annual Interest Rate (% p.a.) *
              </label>
              <div className="flex items-center bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3 py-2.5 focus-within:border-[#C57CF9] transition-all">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  required
                  placeholder="3.50"
                  value={ratePct}
                  onChange={(e) => setRatePct(e.target.value)}
                  className="bg-transparent border-none text-[0.90rem] font-bold text-white outline-none w-full tabular-nums"
                />
                <span className="text-[0.80rem] font-bold text-white/40">%</span>
              </div>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Withholding Tax (%)
              </label>
              <div className="flex items-center bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3 py-2.5 focus-within:border-[#C57CF9] transition-all">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  required
                  placeholder="20"
                  value={taxRatePct}
                  onChange={(e) => setTaxRatePct(e.target.value)}
                  className="bg-transparent border-none text-[0.90rem] font-bold text-white outline-none w-full tabular-nums"
                />
                <span className="text-[0.80rem] font-bold text-white/40">%</span>
              </div>
            </div>
          </div>

          {/* Crediting Frequency */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Crediting Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily', label: 'Daily (e.g. Seabank, UNO)', icon: 'today' },
                { id: 'monthly', label: 'Monthly (e.g. Tonik, BanKo)', icon: 'calendar_month' },
                { id: 'quarterly', label: 'Quarterly (Traditional)', icon: 'date_range' },
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setCreditingFrequency(freq.id as any)}
                  className={`p-2.5 rounded-[10px] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    creditingFrequency === freq.id
                      ? 'bg-[#C57CF9]/15 border-[#C57CF9]/50 text-white shadow-[0_0_12px_rgba(197,124,249,0.2)]'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="text-[0.78rem] font-bold capitalize">{freq.id}</span>
                  <span className="text-[0.62rem] text-white/40">{freq.label.split('(')[1]?.replace(')', '') || ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Notes / Conditions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Requires ₱30k monthly card spend to unlock boost"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2 text-[0.80rem] text-white outline-none focus:border-[#C57CF9] transition-all placeholder:text-white/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-5">
            {editingPreset && editingPreset.isCustom ? (
              <button
                type="button"
                onClick={() => deleteCustomPreset(editingPreset.id)}
                className="text-rose-400 hover:text-rose-300 text-[0.78rem] font-bold transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl border border-rose-500/20 cursor-pointer"
              >
                Delete Preset
              </button>
            ) : (
              <span className="text-[0.72rem] text-white/30">Saved locally to your browser</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeCustomModal}
                className="px-4 py-2.5 rounded-xl text-[0.82rem] font-semibold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-[0.85rem] text-white bg-gradient-to-r from-[#C57CF9] to-[#3869D2] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(197,124,249,0.35)] cursor-pointer border-none"
              >
                {editingPreset ? 'Update Preset' : 'Save Custom Preset'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomBankPresetModal;
