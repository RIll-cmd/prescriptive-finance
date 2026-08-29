'use client';

import React, { useState, useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStore } from '@/stores/dashboard-store';
import { MonthlyActivityItem } from '@financial-os/shared-types';

export const ActivityChart: React.FC = () => {
  const { monthlyActivity, selectedYear, fetchMonthlyActivity, setSelectedYear } =
    useAnalyticsStore();
  const { user } = useAuthStore();
  const { toggleWidget } = useDashboardStore();

  const [hoveredMonth, setHoveredMonth] = useState<MonthlyActivityItem | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    fetchMonthlyActivity(selectedYear);
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, [selectedYear, fetchMonthlyActivity]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const months = monthlyActivity?.months || [];

  // Determine dynamic chart max from max income/expense across months
  const maxVal = months.reduce((acc, m) => {
    return Math.max(acc, Number(m.income), Number(m.expense));
  }, 1000);
  const chartMax = Math.ceil(maxVal / 1000) * 1000 || 5000;

  return (
    <section className="glass-card activity-card h-full flex flex-col">
      <div className="card-inner h-full flex-1 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
            Cash Flow Activity
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              aria-label="Previous year"
              className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/40 hover:text-white flex items-center justify-center transition-all"
            >
              <span className="material-symbols-rounded text-[14px]">chevron_left</span>
            </button>
            <span className="inline-flex items-center gap-1 bg-[#C57CF9]/[0.12] border border-[#C57CF9]/30 rounded-full px-3 py-1 text-white text-[0.72rem] font-semibold text-[#d9a4ff]">
              <span className="material-symbols-rounded text-[14px]">calendar_month</span>
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              aria-label="Next year"
              className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/40 hover:text-white flex items-center justify-center transition-all"
            >
              <span className="material-symbols-rounded text-[14px]">chevron_right</span>
            </button>
            <button
              type="button"
              onClick={() => toggleWidget('activity')}
              title="Hide Cash Flow Activity from Dashboard"
              aria-label="Hide Cash Flow Activity"
              className="w-6 h-6 rounded-[6px] text-white/20 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all border-none bg-transparent cursor-pointer ml-1"
            >
              <span className="material-symbols-rounded text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-[18px] mb-3">
          <span className="flex items-center gap-1.5 text-[0.72rem] font-medium text-white/50">
            <span className="w-2 h-2 rounded-full bg-[#C57CF9] shadow-[0_0_6px_rgba(197,124,249,0.4)]" />
            Income
          </span>
          <span className="flex items-center gap-1.5 text-[0.72rem] font-medium text-white/50">
            <span className="w-2 h-2 rounded-full bg-[#3869D2] shadow-[0_0_6px_rgba(56,105,210,0.4)]" />
            Expense
          </span>
        </div>

        {/* Chart Viewport with Mouse Leave handler - Expanded Height */}
        <div
          className="relative flex gap-2 flex-1 min-h-[235px]"
          onMouseLeave={() => setHoveredMonth(null)}
        >
          {/* Y Axis */}
          <div className="flex flex-col justify-between text-white/30 text-[0.62rem] font-medium tabular-nums pb-1 min-w-[32px] text-right">
            <span>{currencySymbol}{(chartMax / 1000).toFixed(0)}k</span>
            <span>{currencySymbol}{((chartMax * 0.75) / 1000).toFixed(0)}k</span>
            <span>{currencySymbol}{((chartMax * 0.5) / 1000).toFixed(0)}k</span>
            <span>{currencySymbol}{((chartMax * 0.25) / 1000).toFixed(0)}k</span>
            <span>{currencySymbol}0</span>
          </div>

          {/* Bars Container */}
          <div className="relative flex items-end gap-[5px] flex-1 pb-1">
            {/* Baseline */}
            <div className="absolute bottom-1 left-0 right-0 h-[1px] bg-white/[0.08]" />

            {months.map((m, i) => {
              const inc = Number(m.income);
              const exp = Number(m.expense);
              const incomeHeight = animated && chartMax > 0 ? (inc / chartMax) * 100 : 0;
              const expenseHeight = animated && chartMax > 0 ? (exp / chartMax) * 100 : 0;

              return (
                <div
                  key={m.month}
                  className="group/bar relative flex gap-[2px] items-end flex-1 h-full cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(m)}
                >
                  {/* Income bar */}
                  <div
                    style={{
                      height: `${Math.min(incomeHeight, 100)}%`,
                      transitionDelay: `${i * 25}ms`,
                    }}
                    className="flex-1 rounded-t-[4px] min-h-[3px] max-w-[13px] bg-[#C57CF9] group-hover/bar:brightness-125 group-hover/bar:shadow-[0_0_12px_rgba(197,124,249,0.4)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />

                  {/* Expense bar */}
                  <div
                    style={{
                      height: `${Math.min(expenseHeight, 100)}%`,
                      transitionDelay: `${i * 25 + 15}ms`,
                    }}
                    className="flex-1 rounded-t-[4px] min-h-[3px] max-w-[13px] bg-[#3869D2] opacity-75 group-hover/bar:opacity-100 group-hover/bar:brightness-125 group-hover/bar:shadow-[0_0_12px_rgba(56,105,210,0.4)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>
              );
            })}

            {/* Hover Tooltip - only visible when hovering over a month */}
            {hoveredMonth && (
              <div className="absolute -top-1.5 right-4 bg-[#0a0a1a]/95 backdrop-blur-[16px] border border-white/[0.08] rounded-[8px] p-[10px_14px] text-[0.72rem] text-white/70 leading-[1.7] z-10 shadow-[0_4px_16px_rgba(0,0,0,0.5)] pointer-events-none animate-[ttSlide_0.2s_cubic-bezier(0.16,1,0.3,1)]">
                <strong className="text-white text-[0.78rem] block mb-[3px]">
                  {hoveredMonth.label}
                </strong>
                <div>
                  Income:{' '}
                  <span className="text-[#d9a4ff] font-semibold tabular-nums">
                    {currencySymbol}
                    {Number(hoveredMonth.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  Expenses:{' '}
                  <span className="text-[#5a8aee] font-semibold tabular-nums">
                    {currencySymbol}
                    {Number(hoveredMonth.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-white/[0.06] pt-1 mt-1 text-white/50">
                  Net Flow:{' '}
                  <span
                    className={`font-semibold tabular-nums ${
                      Number(hoveredMonth.net) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {Number(hoveredMonth.net) >= 0 ? '+' : ''}
                    {currencySymbol}
                    {Number(hoveredMonth.net).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* X Axis */}
        <div className="flex gap-[5px] ml-10 mt-2">
          {months.map((m) => (
            <span
              key={m.month}
              className={`flex-1 text-center text-[0.62rem] font-semibold uppercase tracking-[0.03em] ${
                hoveredMonth?.month === m.month ? 'text-[#C57CF9]' : 'text-white/30'
              }`}
            >
              {m.key}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivityChart;
