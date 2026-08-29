'use client';

import React from 'react';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { FastTransfer } from '@/components/dashboard/FastTransfer';
import { QuickTransactionWidget } from '@/components/dashboard/QuickTransactionWidget';
import { GoalsList } from '@/components/dashboard/GoalsList';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { SafeToSpendWidget } from '@/components/dashboard/SafeToSpendWidget';
import { UpcomingBillsWidget } from '@/components/dashboard/UpcomingBillsWidget';
import { InterestPredictorWidget } from '@/components/dashboard/InterestPredictorWidget';
import { ForecastSummaryWidget } from '@/components/forecasting/ForecastSummaryWidget';
import { useDashboardStore, AVAILABLE_WIDGETS } from '@/stores/dashboard-store';
import { useContextualTutorial } from '@/hooks/useContextualTutorial';

export default function DashboardPage() {
  const { widgets, openCustomizeModal } = useDashboardStore();

  // Contextual Onboarding for Dashboard (3-4 step tour)
  useContextualTutorial('dashboard', 700);

  const isBalanceVisible = widgets.balance ?? true;
  const isActivityVisible = widgets.activity ?? true;
  const isSafeToSpendVisible = widgets.safe_to_spend ?? true;

  const isQuickTransactionVisible = widgets.quick_transaction ?? true;
  const isBillsVisible = widgets.bills ?? true;
  const isTransferVisible = widgets.transfer ?? true;
  const isGoalsVisible = widgets.goals ?? true;

  const isForecastVisible = widgets.forecast ?? true;
  const isTransactionsVisible = widgets.transactions ?? true;
  const isInterestPredictorVisible = widgets.interest_predictor ?? true;

  const topWidgetsCount = [isBalanceVisible, isActivityVisible, isSafeToSpendVisible].filter(Boolean).length;
  const operationsWidgetsCount = [
    isQuickTransactionVisible,
    isBillsVisible,
    isTransferVisible,
    isGoalsVisible,
  ].filter(Boolean).length;
  const totalVisibleCount = Object.values(widgets).filter(Boolean).length;
  const hiddenCount = AVAILABLE_WIDGETS.length - totalVisibleCount;

  return (
    <div className="space-y-[18px]">
      {/* Top Toolbar / Customization Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[0.78rem] font-bold text-white/50 uppercase tracking-[0.08em] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Financial OS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={openCustomizeModal}
              className="text-[0.75rem] font-semibold text-[#C57CF9] hover:text-white bg-[#C57CF9]/10 hover:bg-[#C57CF9]/20 border border-[#C57CF9]/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-rounded text-[16px]">add_circle</span>
              <span>+ Add {hiddenCount} Hidden Widget{hiddenCount > 1 ? 's' : ''}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCustomizeModal}
            title="Customize dashboard cards"
            className="text-[0.78rem] font-bold text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-rounded text-[17px] text-[#3869D2]">tune</span>
            <span>Customize ({totalVisibleCount}/{AVAILABLE_WIDGETS.length})</span>
          </button>
        </div>
      </div>

      {/* Top Main Grid */}
      {topWidgetsCount > 0 && (
        <div
          className={`grid gap-[18px] ${
            topWidgetsCount === 3
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.9fr]'
              : topWidgetsCount === 2
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {isBalanceVisible && (
            <div data-tour="balance-card" className="h-full">
              <BalanceCard />
            </div>
          )}
          {isActivityVisible && (
            <div data-tour="activity-chart" className="h-full">
              <ActivityChart />
            </div>
          )}
          {isSafeToSpendVisible && (
            <div data-tour="safe-to-spend" className="h-full">
              <SafeToSpendWidget />
            </div>
          )}
        </div>
      )}

      {/* Operations & Intelligence Grid */}
      {operationsWidgetsCount > 0 && (
        <div
          className={`grid gap-[18px] ${
            operationsWidgetsCount === 4
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
              : operationsWidgetsCount === 3
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : operationsWidgetsCount === 2
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {isQuickTransactionVisible && (
            <div data-tour="quick-transaction" className="h-full">
              <QuickTransactionWidget />
            </div>
          )}
          {isBillsVisible && <UpcomingBillsWidget />}
          {isTransferVisible && <FastTransfer />}
          {isGoalsVisible && <GoalsList />}
        </div>
      )}

      {/* 7. Interest & Withholding Tax Yield Predictor */}
      {isInterestPredictorVisible && <InterestPredictorWidget />}

      {/* 8. Month-End & Forward Projections */}
      {isForecastVisible && <ForecastSummaryWidget />}

      {/* 9. Transactions Ledger */}
      {isTransactionsVisible && <TransactionsTable />}

      {/* All Hidden Empty State */}
      {totalVisibleCount === 0 && (
        <div className="py-16 text-center rounded-[24px] bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-white/40">
            <span className="material-symbols-rounded text-[28px]">dashboard_customize</span>
          </div>
          <h3 className="text-[1.1rem] font-bold text-white">All widgets are currently hidden</h3>
          <p className="text-[0.82rem] text-white/40 max-w-sm">
            You have hidden all dashboard cards. Click below to customize and restore your preferred financial widgets.
          </p>
          <button
            type="button"
            onClick={openCustomizeModal}
            className="mt-2 px-5 py-2.5 rounded-xl font-bold text-[0.85rem] text-white bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:opacity-95 shadow-md cursor-pointer border-none"
          >
            Customize & Restore Widgets
          </button>
        </div>
      )}
    </div>
  );
}

