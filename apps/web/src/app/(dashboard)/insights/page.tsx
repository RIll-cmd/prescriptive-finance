'use client';

import React, { useEffect, useState } from 'react';
import { useAnalyticsStore, TimePeriodPreset } from '@/stores/analytics-store';
import { useAuthStore } from '@/stores/auth-store';
import { ActivityChart } from '@/components/dashboard/ActivityChart';

export default function InsightsPage() {
  const {
    summary,
    categorySpending,
    period,
    isLoading,
    fetchDashboardAnalytics,
    setPeriod,
  } = useAnalyticsStore();

  const { user } = useAuthStore();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    fetchDashboardAnalytics();
    const timer = setTimeout(() => setAnimated(true), 250);
    return () => clearTimeout(timer);
  }, [fetchDashboardAnalytics]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const PERIOD_OPTIONS: { label: string; value: TimePeriodPreset }[] = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Week', value: 'this_week' },
    { label: 'Today', value: 'today' },
    { label: 'This Year', value: 'this_year' },
    { label: 'All Time', value: 'all' },
  ];

  const totalExp = categorySpending ? Number(categorySpending.total_expenses) : 0;
  const categories = categorySpending?.categories || [];

  const totalInc = summary ? Number(summary.total_income) : 0;
  const netFlow = summary ? Number(summary.net_cash_flow) : 0;
  const savingsRate = summary ? Number(summary.savings_rate_pct) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      {/* Page Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Financial Insights & Cash Flow
          </h1>
          <p className="text-[0.82rem] text-white/40 mt-0.5">
            Aggregated analytics on your income streams, spending velocity, and category allocations
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[12px] overflow-x-auto self-start sm:self-auto">
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = period === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-[9px] text-[0.75rem] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white shadow-[0_2px_12px_rgba(56,105,210,0.3)]'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.72rem] font-bold text-white/40 uppercase tracking-[0.06em]">
              Total Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-[1rem] font-medium text-white/40 mr-1">{currencySymbol}</span>
            <span className="text-[1.8rem] font-black text-emerald-400 tabular-nums">
              {totalInc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.72rem] font-bold text-white/40 uppercase tracking-[0.06em]">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#5a8aee] flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-[1rem] font-medium text-white/40 mr-1">{currencySymbol}</span>
            <span className="text-[1.8rem] font-black text-white tabular-nums">
              {totalExp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.72rem] font-bold text-white/40 uppercase tracking-[0.06em]">
              Net Cash Flow
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                netFlow >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              <span className="material-symbols-rounded text-[18px]">
                {netFlow >= 0 ? 'trending_up' : 'trending_down'}
              </span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-[1rem] font-medium text-white/40 mr-1">
              {netFlow >= 0 ? '+' : ''}{currencySymbol}
            </span>
            <span
              className={`text-[1.8rem] font-black tabular-nums ${
                netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {netFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.72rem] font-bold text-white/40 uppercase tracking-[0.06em]">
              Savings Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-[#d9a4ff] flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">savings</span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-[1.8rem] font-black text-[#d9a4ff] tabular-nums">
              {savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Monthly Activity Timeline */}
        <ActivityChart />

        {/* Right: Spending by Category Breakdown */}
        <section className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
                Spending by Category
              </h2>
              <span className="text-[0.72rem] font-semibold text-white/40 uppercase tracking-wider">
                {period.replace('_', ' ')}
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-white/30 text-[0.82rem]">
                <span className="material-symbols-rounded text-[28px]">donut_large</span>
                <span>No expense data for this timeframe</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {categories.map((cat, idx) => {
                  const amt = Number(cat.amount);
                  const pct = Number(cat.percentage);

                  return (
                    <div key={cat.category_id || idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[0.82rem]">
                        <div className="flex items-center gap-2 font-medium text-white/90">
                          <div
                            className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${cat.color_hex || '#3869D2'}26`,
                              color: cat.color_hex || '#3869D2',
                            }}
                          >
                            <span className="material-symbols-rounded text-[14px]">
                              {cat.icon || 'category'}
                            </span>
                          </div>
                          <span>{cat.category_name}</span>
                        </div>

                        <div className="flex items-center gap-2 font-bold tabular-nums">
                          <span className="text-white">
                            {currencySymbol}
                            {amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-white/40 text-[0.75rem] min-w-[38px] text-right">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          style={{
                            width: animated ? `${Math.min(pct, 100)}%` : '0%',
                            backgroundColor: cat.color_hex || '#3869D2',
                            transitionDelay: `${idx * 80}ms`,
                          }}
                          className="h-full rounded-full transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_rgba(56,105,210,0.3)]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Total Footer */}
          <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[0.85rem]">
            <span className="text-white/40 font-semibold">Total Filtered Spend</span>
            <span className="font-black text-white tabular-nums">
              {currencySymbol}
              {totalExp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
