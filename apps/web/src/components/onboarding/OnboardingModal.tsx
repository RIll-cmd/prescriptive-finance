'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { CreateMoneySourcePayload } from '@/features/accounts/api';

const PRESET_SOURCES = [
  { name: 'GCash', type: 'E_WALLET' as const, icon: 'account_balance_wallet', color: '#007DFE', defaultBalance: 5000 },
  { name: 'Maya', type: 'E_WALLET' as const, icon: 'wallet', color: '#22C55E', defaultBalance: 3000 },
  { name: 'BPI Bank', type: 'BANK' as const, icon: 'account_balance', color: '#B91C1C', defaultBalance: 15000 },
  { name: 'Physical Cash', type: 'CASH' as const, icon: 'payments', color: '#10B981', defaultBalance: 2000 },
  { name: 'GoTyme', type: 'BANK' as const, icon: 'credit_card', color: '#06B6D4', defaultBalance: 5000 },
];

export const OnboardingModal: React.FC = () => {
  const { user, completeOnboarding, isLoading } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(user?.first_name || '');
  const [currency, setCurrency] = useState('PHP');
  const [selectedSources, setSelectedSources] = useState<Record<string, { enabled: boolean; balance: number }>>({
    GCash: { enabled: true, balance: 5000 },
    'Physical Cash': { enabled: true, balance: 2000 },
    Maya: { enabled: false, balance: 3000 },
    'BPI Bank': { enabled: false, balance: 15000 },
    GoTyme: { enabled: false, balance: 5000 },
  });

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

  const handleFinish = async () => {
    const sourcesToCreate: CreateMoneySourcePayload[] = [];
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

    try {
      await completeOnboarding(name || user?.first_name || 'Cyrill', currency, sourcesToCreate);
    } catch {
      // Handled by store
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.4s_ease-out]">
      <div className="relative w-full max-w-[540px] rounded-[28px] p-[1px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        {/* Animated perimeter border */}
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#3869D2_350deg,#C57CF9_360deg)] animate-[borderSpin_10s_linear_infinite] opacity-50 pointer-events-none" />

        <div className="relative rounded-[27px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-8 sm:p-10 text-white select-none">
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[1.5rem] font-black tracking-[-0.03em]">
                  Where is your money?
                </h2>
              </div>
              <p className="text-[0.82rem] text-white/40 mb-5 leading-relaxed">
                Select your starting money sources and approximate balances. <strong className="text-white/70 font-semibold">Zero bank login required.</strong>
              </p>

              <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1 mb-6">
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
                          <span className="text-[0.75rem] font-semibold text-white/40">₱</span>
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
