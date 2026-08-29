'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { CreateMoneySourcePayload } from '@/features/accounts/api';
import { MoneySourceType } from '@financial-os/shared-types';

interface CustomSourceItem {
  id: string;
  name: string;
  type: MoneySourceType;
  icon: string;
  color: string;
  balance: number;
  enabled: boolean;
}

const PRESET_SOURCES = [
  { name: 'Physical Cash', type: 'CASH' as const, icon: 'payments', color: '#10B981', defaultBalance: 0 },
  { name: 'GCash', type: 'E_WALLET' as const, icon: 'account_balance_wallet', color: '#007DFE', defaultBalance: 0 },
  { name: 'Maya', type: 'E_WALLET' as const, icon: 'wallet', color: '#22C55E', defaultBalance: 0 },
  { name: 'BPI Bank', type: 'BANK' as const, icon: 'account_balance', color: '#B91C1C', defaultBalance: 0 },
  { name: 'BDO Unibank', type: 'BANK' as const, icon: 'account_balance', color: '#1E40AF', defaultBalance: 0 },
  { name: 'GoTyme Bank', type: 'BANK' as const, icon: 'credit_card', color: '#06B6D4', defaultBalance: 0 },
  { name: 'UnionBank', type: 'BANK' as const, icon: 'account_balance', color: '#F97316', defaultBalance: 0 },
];

const PRESET_ICONS = [
  'payments',
  'account_balance_wallet',
  'account_balance',
  'credit_card',
  'savings',
  'trending_up',
  'attach_money',
  'vault',
];

const PRESET_COLORS = [
  '#10B981', // Emerald / Cash
  '#007DFE', // Blue / GCash
  '#22C55E', // Green / Maya
  '#B91C1C', // Red / BPI
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
];

export const OnboardingModal: React.FC = () => {
  const { user, completeOnboarding, isLoading } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(user?.first_name || '');
  const [currency, setCurrency] = useState('PHP');
  const [selectedSources, setSelectedSources] = useState<Record<string, { enabled: boolean; balance: number }>>({
    'Physical Cash': { enabled: true, balance: 0 },
    GCash: { enabled: false, balance: 0 },
    Maya: { enabled: false, balance: 0 },
    'BPI Bank': { enabled: false, balance: 0 },
    'BDO Unibank': { enabled: false, balance: 0 },
    'GoTyme Bank': { enabled: false, balance: 0 },
    UnionBank: { enabled: false, balance: 0 },
  });

  // Custom user-defined sources in onboarding
  const [customSources, setCustomSources] = useState<CustomSourceItem[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<MoneySourceType>('CASH');
  const [customBalance, setCustomBalance] = useState('');
  const [customIcon, setCustomIcon] = useState('payments');
  const [customColor, setCustomColor] = useState('#10B981');
  const [customError, setCustomError] = useState<string | null>(null);

  const currencySymbol = currency === 'PHP' ? '₱' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥';

  const toggleSource = (sourceName: string) => {
    setSelectedSources((prev) => ({
      ...prev,
      [sourceName]: {
        ...prev[sourceName],
        enabled: !prev[sourceName]?.enabled,
      },
    }));
  };

  const updateBalance = (sourceName: string, val: number) => {
    setSelectedSources((prev) => ({
      ...prev,
      [sourceName]: {
        ...prev[sourceName],
        balance: val,
      },
    }));
  };

  const toggleCustomSource = (id: string) => {
    setCustomSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateCustomBalance = (id: string, val: number) => {
    setCustomSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, balance: val } : s))
    );
  };

  const removeCustomSource = (id: string) => {
    setCustomSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddCustomSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setCustomError('Please enter an account or cash name.');
      return;
    }

    const bal = parseFloat(customBalance) || 0;
    const newCustom: CustomSourceItem = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      type: customType,
      icon: customIcon,
      color: customColor,
      balance: bal,
      enabled: true,
    };

    setCustomSources((prev) => [...prev, newCustom]);
    setCustomName('');
    setCustomBalance('');
    setIsAddingCustom(false);
    setCustomError(null);
  };

  const handleFinish = async () => {
    const sourcesToCreate: CreateMoneySourcePayload[] = [];

    // Presets
    PRESET_SOURCES.forEach((preset) => {
      const cfg = selectedSources[preset.name];
      if (cfg?.enabled) {
        sourcesToCreate.push({
          name: preset.name,
          type: preset.type,
          currency,
          initial_balance: Number(cfg.balance) || 0,
          color_hex: preset.color,
          icon: preset.icon,
        });
      }
    });

    // Custom Sources
    customSources.forEach((c) => {
      if (c.enabled) {
        sourcesToCreate.push({
          name: c.name,
          type: c.type,
          currency,
          initial_balance: Number(c.balance) || 0,
          color_hex: c.color,
          icon: c.icon,
        });
      }
    });

    try {
      await completeOnboarding(name || user?.first_name || 'Cyrill', currency, sourcesToCreate);
    } catch {
      // Handled by store
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.4s_ease-out]">
      <div className="relative w-full max-w-[560px] rounded-[28px] p-[1px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        {/* Animated perimeter border */}
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#3869D2_350deg,#C57CF9_360deg)] animate-[borderSpin_10s_linear_infinite] opacity-50 pointer-events-none" />

        <div className="relative rounded-[27px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-7 sm:p-9 text-white select-none max-h-[92vh] overflow-y-auto custom-scrollbar">
          {/* Header Step Counter */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_2px_12px_rgba(56,105,210,0.3)]">
                <span className="material-symbols-rounded text-[18px] text-white">tune</span>
              </div>
              <span className="text-[0.95rem] font-bold tracking-tight">Quick Setup</span>
            </div>
            <div className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-white/40">
              <span className={step === 1 ? 'text-[#C57CF9]' : ''}>1. Identity</span>
              <span>•</span>
              <span className={step === 2 ? 'text-[#C57CF9]' : ''}>2. Currency</span>
              <span>•</span>
              <span className={step === 3 ? 'text-[#C57CF9]' : ''}>3. Sources</span>
            </div>
          </div>

          {/* STEP 1: Identity */}
          {step === 1 && (
            <div className="animate-[cardReveal_0.3s_ease-out]">
              <h2 className="text-[1.5rem] font-black tracking-[-0.03em] mb-2 flex items-center gap-2">
                Welcome to Financial OS
                <span className="text-[#C57CF9]">✦</span>
              </h2>
              <p className="text-[0.86rem] text-white/40 mb-6 leading-relaxed">
                Let's set up your private financial portal. What should we call you?
              </p>

              <div className="mb-6">
                <label className="block text-[0.72rem] font-semibold tracking-wider text-white/50 uppercase mb-2">
                  Display Name
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] focus-within:border-[#3869D2] focus-within:bg-[#3869D2]/[0.06] transition-all">
                  <span className="material-symbols-rounded text-[20px] text-white/30">badge</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border-none outline-none text-white text-[0.92rem] font-semibold placeholder:text-white/20"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl font-bold text-[0.88rem] text-white bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(56,105,210,0.3)] flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span>Continue</span>
                <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

          {/* STEP 2: Currency */}
          {step === 2 && (
            <div className="animate-[cardReveal_0.3s_ease-out]">
              <h2 className="text-[1.5rem] font-black tracking-[-0.03em] mb-2">
                Primary Currency
              </h2>
              <p className="text-[0.86rem] text-white/40 mb-6 leading-relaxed">
                Choose the baseline currency for your safe-to-spend and cash flow balances.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
                  { code: 'USD', symbol: '$', label: 'US Dollar' },
                  { code: 'EUR', symbol: '€', label: 'Euro' },
                  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
                  { code: 'GBP', symbol: '£', label: 'British Pound' },
                  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      currency === c.code
                        ? 'bg-gradient-to-br from-[#3869D2]/20 to-[#C57CF9]/20 border-[#C57CF9]/50 shadow-[0_0_20px_rgba(197,124,249,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="text-[1.2rem] font-black text-white mb-0.5">{c.symbol} {c.code}</div>
                    <div className="text-[0.70rem] text-white/40 truncate">{c.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl font-semibold text-[0.85rem] text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[0.88rem] text-white bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(56,105,210,0.3)] flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <span>Select Money Sources</span>
                  <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Money Sources */}
          {step === 3 && (
            <div className="animate-[cardReveal_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[1.4rem] font-black tracking-[-0.03em]">
                  Where is your money?
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(!isAddingCustom)}
                  className="text-[0.75rem] font-bold text-[#C57CF9] hover:text-white flex items-center gap-1 transition-colors bg-[#C57CF9]/10 hover:bg-[#C57CF9]/20 px-2.5 py-1.5 rounded-lg border border-[#C57CF9]/30 cursor-pointer"
                >
                  <span className="material-symbols-rounded text-[15px]">
                    {isAddingCustom ? 'close' : 'add'}
                  </span>
                  <span>{isAddingCustom ? 'Cancel' : '+ Custom Source'}</span>
                </button>
              </div>

              <p className="text-[0.80rem] text-white/40 mb-4 leading-relaxed">
                Select your starting accounts, cash on hand, or add custom assets. <strong className="text-white/70 font-semibold">Zero bank login required.</strong>
              </p>

              {/* Inline Custom Source Form */}
              {isAddingCustom && (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-[#C57CF9]/40 shadow-[0_4px_24px_rgba(197,124,249,0.15)] animate-[cardReveal_0.25s_ease-out]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[0.75rem] font-bold text-[#C57CF9] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-rounded text-[16px]">add_circle</span>
                      New Custom Money Source
                    </span>
                  </div>

                  {customError && (
                    <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[0.75rem]">
                      {customError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1">
                          Source Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Petty Cash, Vault, Seabank"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full bg-[#0d0d21] border border-white/10 rounded-xl px-3 py-2 text-[0.82rem] font-medium text-white outline-none focus:border-[#C57CF9]"
                        />
                      </div>
                      <div>
                        <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1">
                          Starting Balance ({currencySymbol})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customBalance}
                          onChange={(e) => setCustomBalance(e.target.value)}
                          className="w-full bg-[#0d0d21] border border-white/10 rounded-xl px-3 py-2 text-[0.82rem] font-bold text-white outline-none focus:border-[#C57CF9] tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1">
                          Source Type
                        </label>
                        <select
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value as MoneySourceType)}
                          className="w-full bg-[#0d0d21] border border-white/10 rounded-xl px-3 py-2 text-[0.80rem] font-medium text-white outline-none focus:border-[#C57CF9]"
                        >
                          <option value="CASH">Cash / Physical Cash</option>
                          <option value="E_WALLET">E-Wallet (GCash/Maya)</option>
                          <option value="BANK">Bank Account</option>
                          <option value="CREDIT_CARD">Credit Card</option>
                          <option value="OTHER">Other / Investment</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1">
                          Color Theme
                        </label>
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          {PRESET_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCustomColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                                customColor === c ? 'ring-2 ring-white scale-125 shadow-md' : 'opacity-70 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider block mb-1">
                        Icon
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_ICONS.map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setCustomIcon(ic)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              customIcon === ic
                                ? 'bg-gradient-to-br from-[#3869D2] to-[#C57CF9] text-white shadow-sm'
                                : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white'
                            }`}
                          >
                            <span className="material-symbols-rounded text-[16px]">{ic}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingCustom(false)}
                        className="px-3 py-1.5 rounded-lg text-[0.75rem] font-medium text-white/50 hover:text-white bg-white/[0.04]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomSource}
                        className="px-4 py-1.5 rounded-lg text-[0.75rem] font-bold text-white bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:opacity-95 shadow-md cursor-pointer border-none"
                      >
                        Add Source to Setup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources List Container */}
              <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1 mb-5 custom-scrollbar">
                {/* Custom sources added by user */}
                {customSources.map((custom) => (
                  <div
                    key={custom.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      custom.enabled
                        ? 'bg-[#C57CF9]/[0.08] border-[#C57CF9]/40 shadow-[0_2px_12px_rgba(197,124,249,0.1)]'
                        : 'bg-white/[0.02] border-white/[0.06] opacity-60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCustomSource(custom.id)}
                      className="flex items-center gap-3 bg-transparent border-none text-left cursor-pointer flex-1"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: `${custom.color}30`, border: `1px solid ${custom.color}50` }}
                      >
                        <span className="material-symbols-rounded text-[18px]">{custom.icon}</span>
                      </div>
                      <div>
                        <div className="text-[0.86rem] font-bold text-white flex items-center gap-1.5">
                          <span>{custom.name}</span>
                          <span className="text-[0.62rem] px-1.5 py-0.2 rounded bg-[#C57CF9]/20 text-[#C57CF9] font-semibold uppercase">Custom</span>
                        </div>
                        <div className="text-[0.68rem] text-white/40">{custom.type}</div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      {custom.enabled ? (
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                          <span className="text-[0.75rem] font-semibold text-white/40">{currencySymbol}</span>
                          <input
                            type="number"
                            value={custom.balance}
                            onChange={(e) => updateCustomBalance(custom.id, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-transparent border-none outline-none text-white text-[0.84rem] font-bold text-right tabular-nums"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleCustomSource(custom.id)}
                          className="px-3 py-1 rounded-lg text-[0.75rem] font-bold bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all border border-white/[0.08] cursor-pointer"
                        >
                          + Add
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeCustomSource(custom.id)}
                        title="Remove custom source"
                        className="w-7 h-7 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <span className="material-symbols-rounded text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Preset Sources */}
                {PRESET_SOURCES.map((preset) => {
                  const current = selectedSources[preset.name] || { enabled: false, balance: preset.defaultBalance };
                  return (
                    <div
                      key={preset.name}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        current.enabled
                          ? 'bg-[#3869D2]/[0.08] border-[#3869D2]/40'
                          : 'bg-white/[0.02] border-white/[0.06] opacity-60'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSource(preset.name)}
                        className="flex items-center gap-3 bg-transparent border-none text-left cursor-pointer flex-1"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: `${preset.color}30`, border: `1px solid ${preset.color}50` }}
                        >
                          <span className="material-symbols-rounded text-[18px]">{preset.icon}</span>
                        </div>
                        <div>
                          <div className="text-[0.86rem] font-bold text-white">{preset.name}</div>
                          <div className="text-[0.68rem] text-white/40">{preset.type}</div>
                        </div>
                      </button>

                      {current.enabled ? (
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                          <span className="text-[0.75rem] font-semibold text-white/40">{currencySymbol}</span>
                          <input
                            type="number"
                            value={current.balance}
                            onChange={(e) => updateBalance(preset.name, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-transparent border-none outline-none text-white text-[0.84rem] font-bold text-right tabular-nums"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleSource(preset.name)}
                          className="px-3 py-1 rounded-lg text-[0.75rem] font-bold bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all border border-white/[0.08] cursor-pointer"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3.5 rounded-xl font-semibold text-[0.85rem] text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleFinish}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[0.90rem] text-white bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_30px_rgba(56,105,210,0.35)] flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Saving Setup...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Financial OS</span>
                      <span className="material-symbols-rounded text-[18px]">check_circle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;


