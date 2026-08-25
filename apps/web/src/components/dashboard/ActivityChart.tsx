'use client';

import React, { useState, useEffect } from 'react';

interface MonthData {
  key: string;
  label: string;
  income: number;
  expense: number;
}

const MONTHS: MonthData[] = [
  { key: 'J', label: 'January 2024', income: 2200, expense: 1800 },
  { key: 'F', label: 'February 2024', income: 2600, expense: 2100 },
  { key: 'M', label: 'March 2024', income: 3100, expense: 2500 },
  { key: 'A', label: 'April 2024', income: 2800, expense: 2200 },
  { key: 'M', label: 'May 2024', income: 3400, expense: 2800 },
  { key: 'J', label: 'June 2024', income: 3800, expense: 3200 },
  { key: 'J', label: 'July 2024', income: 3200, expense: 2600 },
  { key: 'A', label: 'August 2024', income: 2750, expense: 2100 },
  { key: 'S', label: 'September 2024', income: 3600, expense: 2900 },
  { key: 'O', label: 'October 2024', income: 4100, expense: 3400 },
  { key: 'N', label: 'November 2024', income: 4500, expense: 3800 },
  { key: 'D', label: 'December 2024', income: 4800, expense: 4200 },
];

const CHART_MAX = 5000;

export const ActivityChart: React.FC = () => {
  const [activeMonth, setActiveMonth] = useState<MonthData | null>(MONTHS[7]); // Default August
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="glass-card activity-card">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
            My activity
          </h2>
          <button className="inline-flex items-center gap-1.5 bg-[#C57CF9]/[0.12] border border-[#C57CF9]/30 rounded-full px-3.5 py-1.5 text-white text-[0.75rem] font-medium text-[#d9a4ff] hover:bg-[#C57CF9]/20 transition-all duration-200">
            <span className="material-symbols-rounded text-[16px]">calendar_month</span>
            2024
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-[18px] mb-4">
          <span className="flex items-center gap-1.5 text-[0.72rem] font-medium text-white/50">
            <span className="w-2 h-2 rounded-full bg-[#C57CF9] shadow-[0_0_6px_rgba(197,124,249,0.4)]" />
            Income
          </span>
          <span className="flex items-center gap-1.5 text-[0.72rem] font-medium text-white/50">
            <span className="w-2 h-2 rounded-full bg-[#3869D2] shadow-[0_0_6px_rgba(56,105,210,0.4)]" />
            Expense
          </span>
        </div>

        {/* Chart Viewport */}
        <div className="relative flex gap-2 h-[175px]">
          {/* Y Axis */}
          <div className="flex flex-col justify-between text-white/30 text-[0.62rem] font-medium tabular-nums pb-1 min-w-[28px] text-right">
            <span>$5k</span>
            <span>$4k</span>
            <span>$3k</span>
            <span>$2k</span>
            <span>$1k</span>
            <span>$0</span>
          </div>

          {/* Bars Container */}
          <div className="relative flex items-end gap-[5px] flex-1 pb-1">
            {/* Baseline */}
            <div className="absolute bottom-1 left-0 right-0 h-[1px] bg-white/[0.08]" />

            {MONTHS.map((m, i) => {
              const incomeHeight = animated ? (m.income / CHART_MAX) * 100 : 0;
              const expenseHeight = animated ? (m.expense / CHART_MAX) * 100 : 0;

              return (
                <div
                  key={i}
                  className="group/bar relative flex gap-[2px] items-end flex-1 h-full cursor-pointer"
                  onMouseEnter={() => setActiveMonth(m)}
                >
                  {/* Income bar */}
                  <div
                    style={{
                      height: `${incomeHeight}%`,
                      transitionDelay: `${i * 30}ms`,
                    }}
                    className="flex-1 rounded-t-[4px] min-h-[3px] max-w-[13px] bg-[#C57CF9] group-hover/bar:brightness-125 group-hover/bar:shadow-[0_0_12px_rgba(197,124,249,0.4)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />

                  {/* Expense bar */}
                  <div
                    style={{
                      height: `${expenseHeight}%`,
                      transitionDelay: `${i * 30 + 15}ms`,
                    }}
                    className="flex-1 rounded-t-[4px] min-h-[3px] max-w-[13px] bg-[#3869D2] opacity-70 group-hover/bar:opacity-100 group-hover/bar:brightness-125 group-hover/bar:shadow-[0_0_12px_rgba(56,105,210,0.4)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>
              );
            })}

            {/* Tooltip */}
            {activeMonth && (
              <div className="absolute -top-1.5 right-4 bg-[#0a0a1a]/95 backdrop-blur-[16px] border border-white/[0.08] rounded-[8px] p-[10px_14px] text-[0.72rem] text-white/70 leading-[1.7] z-10 shadow-[0_4px_16px_rgba(0,0,0,0.5)] pointer-events-none animate-[ttSlide_0.2s_cubic-bezier(0.16,1,0.3,1)]">
                <strong className="text-white text-[0.78rem] block mb-[3px]">
                  {activeMonth.label}
                </strong>
                <div>
                  Income: <span className="text-[#d9a4ff] font-semibold">${activeMonth.income.toLocaleString()}</span>
                </div>
                <div>
                  Expenses: <span className="text-[#5a8aee] font-semibold">${activeMonth.expense.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* X Axis */}
        <div className="flex gap-[5px] ml-9 mt-2">
          {MONTHS.map((m, idx) => (
            <span
              key={idx}
              className="flex-1 text-center text-[0.62rem] font-semibold text-white/30 uppercase tracking-[0.03em]"
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
