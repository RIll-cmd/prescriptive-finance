'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { MoneySource, MoneySourceType } from '@financial-os/shared-types';
import { DEFAULT_BANK_PRESETS } from '@/utils/interest-engine';

interface EditMoneySourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: MoneySource | null;
}

const PRESET_ICONS = [
  { name: 'account_balance_wallet', label: 'Wallet' },
  { name: 'account_balance', label: 'Bank' },
  { name: 'payments', label: 'Cash' },
  { name: 'credit_card', label: 'Card' },
  { name: 'savings', label: 'Savings' },
  { name: 'trending_up', label: 'Investments' },
];

const PRESET_COLORS = [
  '#007DFE', // Blue (GCash)
  '#22C55E', // Green (Maya)
  '#B91C1C', // Red (BPI)
  '#10B981', // Emerald (Cash)
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan (GoTyme)
];

export const EditMoneySourceModal: React.FC<EditMoneySourceModalProps> = ({
  isOpen,
  onClose,
  source,
}) => {
  const { updateMoneySource, deleteMoneySource } = useAuthStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<MoneySourceType>('BANK');
  const [colorHex, setColorHex] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[1].name);

  // Interest Settings
  const [autoCreditInterest, setAutoCreditInterest] = useState(false);
  const [interestRatePct, setInterestRatePct] = useState('3.50');
  const [interestFrequency, setInterestFrequency] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  const [withholdingTaxPct, setWithholdingTaxPct] = useState('20');
  const [selectedBankPresetId, setSelectedBankPresetId] = useState('uno_ready');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (source && isOpen) {
      setName(source.name);
      setType(source.type);
      setColorHex(source.color_hex || PRESET_COLORS[0]);
      setIcon(source.icon || PRESET_ICONS[1].name);
      setAutoCreditInterest(Boolean(source.auto_credit_interest));
      setInterestRatePct(String(source.interest_rate_pct || '3.50'));
      setInterestFrequency((source.interest_frequency as any) || 'DAILY');
      setWithholdingTaxPct(String(source.withholding_tax_pct || '20'));
      setErrorMsg(null);
    }
  }, [source, isOpen]);

  if (!isOpen || !source) return null;

  const handleBankPresetChange = (presetId: string) => {
    setSelectedBankPresetId(presetId);
    const found = DEFAULT_BANK_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setInterestRatePct(String(found.ratePct));
      setInterestFrequency(found.creditingFrequency.toUpperCase() as any);
      setWithholdingTaxPct(String(found.taxRatePct));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter an account name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await updateMoneySource(source.id, {
        name: name.trim(),
        type,
        color_hex: colorHex,
        icon,
        auto_credit_interest: autoCreditInterest,
        interest_rate_pct: autoCreditInterest ? parseFloat(interestRatePct) || 0 : 0,
        interest_frequency: interestFrequency,
        withholding_tax_pct: parseFloat(withholdingTaxPct) || 20,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update money source.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${source.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteMoneySource(source.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete money source.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-[rgba(5,5,16,0.96)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.85)] custom-scrollbar animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${colorHex}33`, color: colorHex }}
            >
              <span className="material-symbols-rounded text-[18px]">{icon}</span>
            </div>
            <div>
              <h2 className="text-[1.15rem] font-bold tracking-tight">Account Settings</h2>
              <p className="text-[0.72rem] text-white/40">Edit settings and interest rules for {source.name}</p>
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
          {/* Account Name */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Account Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MoneySourceType)}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
            >
              <option value="BANK" className="bg-[#0f0f24]">Bank Account</option>
              <option value="E_WALLET" className="bg-[#0f0f24]">E-Wallet (GCash/Maya)</option>
              <option value="CASH" className="bg-[#0f0f24]">Physical Cash</option>
              <option value="CREDIT_CARD" className="bg-[#0f0f24]">Credit Card</option>
              <option value="OTHER" className="bg-[#0f0f24]">Other Asset / Stash</option>
            </select>
          </div>

          {/* ─── Interest & Yield Settings Section ─── */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[18px] text-emerald-400">calculate</span>
                <div>
                  <div className="text-[0.82rem] font-bold text-white">Auto-Credit Earned Interest</div>
                  <div className="text-[0.68rem] text-white/40">
                    Automatically credit daily/monthly interest to this account
                  </div>
                </div>
              </div>

              {/* iOS style toggle */}
              <button
                type="button"
                onClick={() => setAutoCreditInterest(!autoCreditInterest)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 p-0.5 border-none cursor-pointer ${
                  autoCreditInterest
                    ? 'bg-gradient-to-r from-emerald-400 to-[#3869D2]'
                    : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 transform ${
                    autoCreditInterest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {autoCreditInterest ? (
              <div className="space-y-3 pt-2 border-t border-white/[0.04] animate-in fade-in duration-200">
                {/* Bank Presets Selector */}
                <div>
                  <label className="text-[0.65rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                    Preset Template
                  </label>
                  <select
                    value={selectedBankPresetId}
                    onChange={(e) => handleBankPresetChange(e.target.value)}
                    className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-xl px-3 py-1.5 text-[0.78rem] font-bold text-white outline-none focus:border-emerald-400 transition-all"
                  >
                    {DEFAULT_BANK_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.ratePct.toFixed(2)}% p.a. • {p.creditingFrequency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rate, Tax, Frequency Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[0.62rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                      Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={interestRatePct}
                      onChange={(e) => setInterestRatePct(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[0.80rem] font-bold text-emerald-400 outline-none tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                      20% Tax (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={withholdingTaxPct}
                      onChange={(e) => setWithholdingTaxPct(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[0.80rem] font-bold text-rose-400 outline-none tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                      Frequency
                    </label>
                    <select
                      value={interestFrequency}
                      onChange={(e) => setInterestFrequency(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[0.75rem] font-bold text-white outline-none"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[0.70rem] text-white/40 italic">
                Manual Mode: Auto-crediting is OFF. You can manually post earned interest to this account anytime using the &quot;Credit Interest&quot; button.
              </div>
            )}
          </div>

          {/* Color Theme */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-2 block">
              Color Theme
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorHex(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    colorHex === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-2 block">
              Icon
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_ICONS.map((i) => (
                <button
                  key={i.name}
                  type="button"
                  onClick={() => setIcon(i.name)}
                  className={`px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 text-[0.75rem] font-medium transition-all ${
                    icon === i.name
                      ? 'bg-white/20 text-white border border-white/30 shadow-md'
                      : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-rounded text-[16px]">{i.name}</span>
                  <span>{i.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-5">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="text-[0.78rem] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-all border-none bg-transparent cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-[16px]">delete</span>
              <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[10px] text-[0.82rem] font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex items-center justify-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[10px] px-5 py-2 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_20px_rgba(56,105,210,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                <span className="material-symbols-rounded text-[18px]">check</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMoneySourceModal;
