'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { MoneySourceType } from '@financial-os/shared-types';

interface AddMoneySourceModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AddMoneySourceModal: React.FC<AddMoneySourceModalProps> = ({ isOpen, onClose }) => {
  const { addMoneySource, user } = useAuthStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<MoneySourceType>('E_WALLET');
  const [initialBalance, setInitialBalance] = useState('');
  const [colorHex, setColorHex] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0].name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter an account name.');
      return;
    }

    const initBal = parseFloat(initialBalance) || 0;
    if (initBal < 0) {
      setErrorMsg('Initial balance cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await addMoneySource({
        name: name.trim(),
        type,
        currency: user?.currency || 'PHP',
        initial_balance: initBal,
        color_hex: colorHex,
        icon,
      });
      setName('');
      setInitialBalance('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add money source.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[480px] rounded-[24px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_2px_12px_rgba(56,105,210,0.3)]">
              <span className="material-symbols-rounded text-[18px] text-white">account_balance_wallet</span>
            </div>
            <h2 className="text-[1.15rem] font-bold tracking-tight">Add Money Source</h2>
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
          {/* Account Name */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Account / Source Name
            </label>
            <input
              type="text"
              placeholder="e.g. Maya, BDO Savings, Petty Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
            />
          </div>

          {/* Account Type & Initial Balance Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MoneySourceType)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
              >
                <option value="E_WALLET" className="bg-[#0f0f24]">E-Wallet (GCash/Maya)</option>
                <option value="BANK" className="bg-[#0f0f24]">Bank Account</option>
                <option value="CASH" className="bg-[#0f0f24]">Cash on Hand</option>
                <option value="CREDIT_CARD" className="bg-[#0f0f24]">Credit Card</option>
                <option value="OTHER" className="bg-[#0f0f24]">Other Asset</option>
              </select>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Starting Balance
              </label>
              <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2 focus-within:border-[#3869D2] transition-all">
                <span className="text-[0.85rem] font-medium text-white/40 mr-1.5">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="bg-transparent border-none text-[0.85rem] font-bold text-white outline-none w-full tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Color Accent Picker */}
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
              disabled={isSubmitting}
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[10px] px-6 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_20px_rgba(56,105,210,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Source'}</span>
              <span className="material-symbols-rounded text-[18px]">check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoneySourceModal;
