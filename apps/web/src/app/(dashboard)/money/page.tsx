'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTransactionStore } from '@/stores/transaction-store';
import { useCategoryStore } from '@/stores/category-store';
import { AdjustBalanceModal } from '@/components/money/AdjustBalanceModal';
import { MoneySource } from '@financial-os/shared-types';

export default function MoneyPage() {
  const { moneySources, totalBalance, user, openAddSourceModal } = useAuthStore();
  const { openManageModal } = useCategoryStore();
  const { openAddModal } = useTransactionStore();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedSourceForAdjust, setSelectedSourceForAdjust] = useState<MoneySource | null>(null);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleOpenAdjust = (source: MoneySource) => {
    setSelectedSourceForAdjust(source);
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      {/* Header & Total Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Money & Accounts
          </h1>
          <p className="text-[0.82rem] text-white/40 mt-0.5">
            Manage your liquid wallets, bank accounts, and custom spending categories
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openManageModal}
            className="px-4 py-2.5 rounded-[12px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-semibold text-[0.82rem] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-rounded text-[18px] text-[#d9a4ff]">tune</span>
            <span>Categories</span>
          </button>

          <button
            onClick={openAddSourceModal}
            className="group relative flex items-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[12px] px-5 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_24px_rgba(56,105,210,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 overflow-hidden"
          >
            <span className="material-symbols-rounded text-[18px]">add_card</span>
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Hero Liquid Balance Card */}
      <div className="glass-card relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-[#0a0a24] via-[#050514] to-[#120a26]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#3869D2]/15 to-[#C57CF9]/15 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-[1] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[0.72rem] font-bold text-white/40 uppercase tracking-[0.08em] block mb-1">
              Consolidated Net Liquid Wealth
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[1.8rem] font-bold text-white/40">{currencySymbol}</span>
              <span className="text-[2.8rem] font-black tracking-tight text-white tabular-nums balance-amount-glow">
                {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[0.78rem] text-white/50 mt-1">
              Across {moneySources.length} active money sources
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openAddModal('TRANSFER')}
              className="px-4 py-2.5 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-[0.82rem] transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-rounded text-[18px] text-[#C57CF9]">sync_alt</span>
              <span>Transfer Between Accounts</span>
            </button>
            <button
              onClick={() => {
                setSelectedSourceForAdjust(null);
                setIsAdjustModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-[0.82rem] transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-rounded text-[18px] text-amber-400">tune</span>
              <span>Reconcile Balance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Money Sources Grid */}
      <div className="space-y-4">
        <h2 className="text-[1.1rem] font-bold tracking-tight text-white/90">
          Active Accounts & Wallets
        </h2>

        {moneySources.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center text-white/30">
              <span className="material-symbols-rounded text-[24px]">wallet</span>
            </div>
            <p className="text-[0.9rem] font-semibold text-white/70">No money sources added</p>
            <button
              onClick={openAddSourceModal}
              className="px-4 py-2 rounded-[10px] bg-[#3869D2] text-white text-[0.8rem] font-bold"
            >
              + Create First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {moneySources.map((source) => {
              return (
                <div
                  key={source.id}
                  className="glass-card relative overflow-hidden p-5 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group"
                >
                  {/* Color Accent Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ backgroundColor: source.color_hex || '#3869D2' }}
                  />

                  {/* Card Top */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm"
                          style={{
                            backgroundColor: `${source.color_hex || '#3869D2'}26`,
                            color: source.color_hex || '#3869D2',
                          }}
                        >
                          <span className="material-symbols-rounded text-[20px]">
                            {source.icon || 'account_balance_wallet'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-[0.95rem] font-bold text-white group-hover:text-[#d9a4ff] transition-colors">
                            {source.name}
                          </h3>
                          <span className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-wider">
                            {source.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <span className="text-[0.68rem] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/50 border border-white/[0.06]">
                        {source.currency}
                      </span>
                    </div>

                    {/* Balance */}
                    <div className="my-3">
                      <span className="text-[0.72rem] font-semibold text-white/40 uppercase tracking-[0.06em] block mb-0.5">
                        Current Balance
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-[1.1rem] font-medium text-white/50 mr-1">{currencySymbol}</span>
                        <span className="text-[1.7rem] font-black text-white tabular-nums tracking-tight">
                          {Number(source.current_balance).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => handleOpenAdjust(source)}
                      className="text-[0.75rem] font-semibold text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-rounded text-[15px]">tune</span>
                      <span>Adjust</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAddModal('EXPENSE')}
                        title="Record Expense from this source"
                        className="w-7 h-7 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all"
                      >
                        <span className="material-symbols-rounded text-[16px]">remove</span>
                      </button>
                      <button
                        onClick={() => openAddModal('INCOME')}
                        title="Record Income to this source"
                        className="w-7 h-7 rounded-[6px] bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-emerald-400 flex items-center justify-center transition-all"
                      >
                        <span className="material-symbols-rounded text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AdjustBalanceModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedSourceForAdjust(null);
        }}
        initialSource={selectedSourceForAdjust}
      />
    </div>
  );
}
