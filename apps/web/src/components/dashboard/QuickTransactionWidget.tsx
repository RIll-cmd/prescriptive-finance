'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { useCategoryStore } from '@/stores/category-store';
import { useDashboardStore } from '@/stores/dashboard-store';

interface CategoryPreset {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  colorHex: string;
  bgGradient: string;
  borderGlow: string;
  keywords: string[];
}

const QUICK_CATEGORIES: CategoryPreset[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    emoji: '🍔',
    icon: 'restaurant',
    colorHex: '#F59E0B',
    bgGradient: 'from-[#F59E0B]/15 via-[#F59E0B]/5 to-transparent',
    borderGlow: 'hover:border-[#F59E0B]/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    keywords: ['food', 'dining', 'restaurant', 'meal', 'groceries'],
  },
  {
    id: 'transport',
    name: 'Transportation',
    emoji: '🚌',
    icon: 'directions_bus',
    colorHex: '#3B82F6',
    bgGradient: 'from-[#3B82F6]/15 via-[#3B82F6]/5 to-transparent',
    borderGlow: 'hover:border-[#3B82F6]/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]',
    keywords: ['transport', 'transportation', 'commute', 'transit', 'car', 'gas'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    emoji: '🎮',
    icon: 'sports_esports',
    colorHex: '#EC4899',
    bgGradient: 'from-[#EC4899]/15 via-[#EC4899]/5 to-transparent',
    borderGlow: 'hover:border-[#EC4899]/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)]',
    keywords: ['entertainment', 'games', 'leisure', 'fun', 'movies'],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    emoji: '🛒',
    icon: 'shopping_bag',
    colorHex: '#8B5CF6',
    bgGradient: 'from-[#8B5CF6]/15 via-[#8B5CF6]/5 to-transparent',
    borderGlow: 'hover:border-[#8B5CF6]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    keywords: ['shopping', 'groceries', 'retail', 'clothes', 'supplies'],
  },
  {
    id: 'others',
    name: 'Others',
    emoji: '✨',
    icon: 'category',
    colorHex: '#06B6D4',
    bgGradient: 'from-[#06B6D4]/15 via-[#06B6D4]/5 to-transparent',
    borderGlow: 'hover:border-[#06B6D4]/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    keywords: ['other', 'others', 'other expenses', 'misc', 'general'],
  },
];

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export const QuickTransactionWidget: React.FC = () => {
  const { moneySources, user, setDefaultMoneySource } = useAuthStore();
  const { createTransaction } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { toggleWidget } = useDashboardStore();

  // Widget States: 1 = Category Pick, 2 = Amount & Note, 3 = Success Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPreset, setSelectedPreset] = useState<CategoryPreset | null>(null);
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [amount, setAmount] = useState<string>('100');
  const [note, setNote] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastLoggedTxn, setLastLoggedTxn] = useState<{
    amount: number;
    categoryName: string;
    walletName: string;
    note?: string;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on mount if empty
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Determine Default Wallet & Active Wallet
  const defaultWallet = useMemo(() => {
    if (!moneySources || moneySources.length === 0) return null;
    return moneySources.find((s) => s.is_default) || moneySources[0];
  }, [moneySources]);

  // Sync selected wallet ID when default wallet loads or changes
  useEffect(() => {
    if (!selectedWalletId && defaultWallet) {
      setSelectedWalletId(defaultWallet.id);
    } else if (selectedWalletId && !moneySources.some((s) => s.id === selectedWalletId) && defaultWallet) {
      setSelectedWalletId(defaultWallet.id);
    }
  }, [defaultWallet, selectedWalletId, moneySources]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    };
    if (isWalletDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWalletDropdownOpen]);

  // Auto-focus amount input when entering Step 2
  useEffect(() => {
    if (step === 2 && amountInputRef.current) {
      amountInputRef.current.focus();
      amountInputRef.current.select();
    }
  }, [step]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const activeWallet = moneySources.find((s) => s.id === selectedWalletId) || defaultWallet;

  // Find corresponding DB category ID
  const matchedCategoryId = useMemo(() => {
    if (!selectedPreset) return undefined;

    // First try matching preset keywords
    const directMatch = categories.find((c) =>
      selectedPreset.keywords.some((kw) => c.name.toLowerCase().includes(kw))
    );
    if (directMatch) return directMatch.id;

    // Fallback: any category containing "Other" or the first available expense category
    const otherMatch = categories.find((c) => c.name.toLowerCase().includes('other'));
    if (otherMatch) return otherMatch.id;

    return categories[0]?.id;
  }, [selectedPreset, categories]);

  // Category Selection Handler
  const handleSelectCategory = (preset: CategoryPreset) => {
    setSelectedPreset(preset);
    setErrorMessage(null);
    setStep(2);
  };

  // Set Main Wallet as Default
  const handleSetAsDefault = async (walletId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsSettingDefault(true);
      await setDefaultMoneySource(walletId);
      setSelectedWalletId(walletId);
    } catch {
      // Error handled by store
    } finally {
      setIsSettingDefault(false);
    }
  };

  // Submit Quick Transaction
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    if (!activeWallet) {
      setErrorMessage('Please select a payment wallet.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCategoryName =
        selectedPreset?.id === 'others' && customCategoryName.trim()
          ? customCategoryName.trim()
          : selectedPreset?.name || 'Quick Expense';

      const finalDescription = note.trim()
        ? note.trim()
        : `Quick Expense: ${finalCategoryName}`;

      await createTransaction({
        type: 'EXPENSE',
        amount: numAmount,
        money_source_id: activeWallet.id,
        category_id: matchedCategoryId,
        merchant: finalCategoryName,
        description: finalDescription,
        source: 'MANUAL',
      });

      setLastLoggedTxn({
        amount: numAmount,
        categoryName: finalCategoryName,
        walletName: activeWallet.name,
        note: note.trim() || undefined,
      });

      setStep(3);

      // Auto reset after 3 seconds back to step 1
      setTimeout(() => {
        handleReset();
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log quick expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedPreset(null);
    setCustomCategoryName('');
    setNote('');
    setErrorMessage(null);
  };

  return (
    <section className="glass-card relative overflow-hidden transition-all duration-300">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-[80px] pointer-events-none transition-all duration-500"
        style={{
          backgroundColor:
            step === 3
              ? 'rgba(52, 211, 153, 0.25)'
              : selectedPreset
              ? `${selectedPreset.colorHex}25`
              : 'rgba(245, 158, 11, 0.2)',
        }}
      />

      <div className="card-inner relative z-10">
        {/* ========================================================================= */}
        {/* HEADER & WALLET SELECTOR */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EC4899] flex items-center justify-center shadow-[0_2px_10px_rgba(245,158,11,0.35)]">
              <span className="material-symbols-rounded text-[18px] text-white">bolt</span>
            </div>
            <div>
              <h2 className="text-[0.95rem] font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Quick Expense</span>
              </h2>
              <p className="text-[0.68rem] text-white/40 font-medium">1-tap daily expense logger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Wallet Dropdown Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/20 transition-all text-left cursor-pointer group shadow-sm"
                title="Change active wallet or set default main wallet"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                  style={{
                    backgroundColor: activeWallet?.color_hex || '#34d399',
                    color: activeWallet?.color_hex || '#34d399',
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-[0.72rem] font-bold text-white/90 group-hover:text-white max-w-[90px] sm:max-w-[120px] truncate leading-tight">
                    {activeWallet?.name || 'Main Wallet'}
                  </span>
                  <span className="text-[0.62rem] text-white/50 tabular-nums font-semibold leading-none mt-0.5">
                    {currencySymbol}
                    {Number(activeWallet?.current_balance || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <span className="material-symbols-rounded text-[14px] text-white/40 group-hover:text-white transition-transform duration-200">
                  {isWalletDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Wallet Selector Dropdown Menu */}
              {isWalletDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-[rgba(10,10,26,0.97)] backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] z-50 animate-[fadeIn_0.15s_ease-out]">
                  <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-white/[0.06]">
                    <span className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider">
                      Select Wallet
                    </span>
                    <span className="text-[0.62rem] text-[#F59E0B] font-semibold">★ = Default</span>
                  </div>

                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {moneySources.map((source) => {
                      const isSelected = source.id === activeWallet?.id;
                      const isDefault = !!source.is_default;

                      return (
                        <div
                          key={source.id}
                          onClick={() => {
                            setSelectedWalletId(source.id);
                            setIsWalletDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl flex items-center justify-between gap-2 text-left transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-white/[0.1] border border-white/15 text-white'
                              : 'hover:bg-white/[0.04] text-white/70 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: source.color_hex }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[0.75rem] font-bold truncate">
                                  {source.name}
                                </span>
                                {isDefault && (
                                  <span className="text-[0.60rem] px-1.5 py-0.2 rounded-md bg-[#F59E0B]/20 text-[#F59E0B] font-black uppercase">
                                    Main
                                  </span>
                                )}
                              </div>
                              <span className="text-[0.68rem] text-white/40 tabular-nums">
                                {currencySymbol}
                                {Number(source.current_balance).toLocaleString('en-US', {
                                  minimumFractionDigits: 0,
                                })}
                              </span>
                            </div>
                          </div>

                          {!isDefault ? (
                            <button
                              type="button"
                              onClick={(e) => handleSetAsDefault(source.id, e)}
                              disabled={isSettingDefault}
                              title="Set as Default Main Wallet"
                              className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-[#F59E0B]/20 text-white/40 hover:text-[#F59E0B] text-[0.65rem] font-bold transition-all shrink-0 cursor-pointer border-none"
                            >
                              ★ Set Default
                            </button>
                          ) : (
                            <span
                              className="material-symbols-rounded text-[16px] text-[#F59E0B] shrink-0"
                              title="Current default wallet"
                            >
                              star
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Hide Widget Button */}
            <button
              type="button"
              onClick={() => toggleWidget('quick_transaction')}
              title="Hide Quick Expense from Dashboard"
              aria-label="Hide Quick Expense"
              className="w-7 h-7 rounded-xl text-white/30 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-rounded text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[0.75rem] flex items-center gap-2 animate-[cardReveal_0.2s_ease-out]">
            <span className="material-symbols-rounded text-[16px] text-red-400">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: QUICK CATEGORY SELECTION GRID */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-2.5 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between">
              <span className="text-[0.70rem] font-bold uppercase tracking-wider text-white/50">
                Choose Category
              </span>
              <span className="text-[0.68rem] text-white/40">1 click to log</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_CATEGORIES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectCategory(preset)}
                  className={`relative p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] ${preset.borderGlow} transition-all duration-200 text-left flex flex-col justify-between gap-3 group cursor-pointer active:scale-[0.98]`}
                >
                  {/* Category Top Row: Emoji & Action Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-[1.5rem] select-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-200">
                      {preset.emoji}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ backgroundColor: `${preset.colorHex}20` }}
                    >
                      <span
                        className="material-symbols-rounded text-[14px]"
                        style={{ color: preset.colorHex }}
                      >
                        arrow_forward
                      </span>
                    </div>
                  </div>

                  {/* Category Label */}
                  <div>
                    <span className="text-[0.80rem] font-bold text-white/90 group-hover:text-white block tracking-tight">
                      {preset.name}
                    </span>
                    <span className="text-[0.65rem] text-white/40 block">Tap to log</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: AMOUNT INPUT & OPTIONAL NOTE */}
        {/* ========================================================================= */}
        {step === 2 && selectedPreset && (
          <form onSubmit={handleSubmit} className="space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
            {/* Category Breadcrumb / Back Switcher */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[1.2rem]">{selectedPreset.emoji}</span>
                <div>
                  <span className="text-[0.78rem] font-bold text-white block">
                    {selectedPreset.id === 'others' && customCategoryName
                      ? customCategoryName
                      : selectedPreset.name}
                  </span>
                  <span className="text-[0.62rem] text-white/40">Category selected</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[0.70rem] font-bold text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-rounded text-[13px]">arrow_back</span>
                <span>Change</span>
              </button>
            </div>

            {/* Custom Category Input if "Others" selected */}
            {selectedPreset.id === 'others' && (
              <div>
                <label className="block text-[0.68rem] font-bold text-white/40 uppercase tracking-wider mb-1">
                  Custom Category Name (Optional)
                </label>
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="e.g., Gym, Pets, Subscriptions"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[0.82rem] text-white placeholder-white/30 focus:border-[#06B6D4] focus:outline-none transition-all"
                />
              </div>
            )}

            {/* Prominent Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider">
                  Amount
                </label>
                {activeWallet &&
                  parseFloat(amount || '0') > Number(activeWallet.current_balance) && (
                    <span className="text-[0.65rem] text-amber-400 font-semibold flex items-center gap-1">
                      <span className="material-symbols-rounded text-[13px]">warning</span>
                      Exceeds balance
                    </span>
                  )}
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[1.4rem] font-black text-white/40 pointer-events-none">
                  {currencySymbol}
                </span>
                <input
                  ref={amountInputRef}
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-[1.5rem] font-black text-white placeholder-white/20 focus:border-[#F59E0B] focus:shadow-[0_0_16px_rgba(245,158,11,0.25)] focus:outline-none transition-all tabular-nums"
                />
              </div>
            </div>

            {/* Quick Amount Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_AMOUNTS.map((presetAmt) => (
                <button
                  key={presetAmt}
                  type="button"
                  onClick={() => setAmount(String(presetAmt))}
                  className={`px-2.5 py-1 rounded-lg text-[0.72rem] font-bold tabular-nums transition-all cursor-pointer border ${
                    amount === String(presetAmt)
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-white/[0.04] text-white/50 hover:text-white border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                >
                  {currencySymbol}
                  {presetAmt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount(String(current + 50));
                }}
                className="px-2 py-1 rounded-lg text-[0.70rem] font-bold text-white/40 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all cursor-pointer"
              >
                +50
              </button>
            </div>

            {/* Optional Note Field */}
            <div>
              <label className="block text-[0.68rem] font-bold text-white/40 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Note / Merchant (Optional)</span>
                <span className="text-[0.62rem] text-white/30 font-normal">e.g. Starbucks</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={note}
                  maxLength={150}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What was this expense for?"
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-black/40 border border-white/10 text-[0.80rem] text-white placeholder-white/30 focus:border-white/30 focus:outline-none transition-all"
                />
                {note && (
                  <button
                    type="button"
                    onClick={() => setNote('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <span className="material-symbols-rounded text-[14px]">cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[0.78rem] font-bold transition-all border border-white/[0.06] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#EC4899] to-[#8B5CF6] hover:opacity-95 text-white text-[0.82rem] font-black shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Logging...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-rounded text-[16px]">check</span>
                    <span>
                      Log {currencySymbol}
                      {parseFloat(amount || '0').toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                      })}{' '}
                      Expense
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: INSTANT SUCCESS STATE */}
        {/* ========================================================================= */}
        {step === 3 && lastLoggedTxn && (
          <div className="py-4 px-2 text-center space-y-3 animate-[cardReveal_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_24px_rgba(52,211,153,0.35)]">
              <span className="material-symbols-rounded text-[28px] animate-[bounce_0.5s_ease]">
                check_circle
              </span>
            </div>

            <div>
              <span className="text-[0.70rem] font-bold text-emerald-400 uppercase tracking-widest block">
                Expense Recorded
              </span>
              <h3 className="text-[1.4rem] font-black text-white tabular-nums tracking-tight mt-0.5">
                -{currencySymbol}
                {lastLoggedTxn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[0.75rem] text-white/70 mt-1">
                Deducted from <strong className="text-white">{lastLoggedTxn.walletName}</strong> for{' '}
                <strong className="text-white">{lastLoggedTxn.categoryName}</strong>
              </p>
              {lastLoggedTxn.note && (
                <p className="text-[0.70rem] text-white/40 italic mt-0.5">
                  &ldquo;{lastLoggedTxn.note}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-[0.78rem] font-bold border border-white/10 transition-all cursor-pointer"
              >
                Log Another Expense
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickTransactionWidget;
