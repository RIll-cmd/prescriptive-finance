'use client';

import React, { useEffect } from 'react';
import { useFinancialHealthStore, FinancialPreset } from '@/stores/financial-health-store';
import { HealthScoreHero } from '@/components/financial-health/HealthScoreHero';
import { ScoreBreakdownCard } from '@/components/financial-health/ScoreBreakdownCard';
import { HealthHistoryChart } from '@/components/financial-health/HealthHistoryChart';
import { FactorsCard } from '@/components/financial-health/FactorsCard';
import { CashFlowIntelligenceCard } from '@/components/financial-health/CashFlowIntelligenceCard';
import { SpendingIntelligenceCard } from '@/components/financial-health/SpendingIntelligenceCard';
import { InsightsFeed } from '@/components/financial-health/InsightsFeed';

export default function FinancialInsightsPage() {
  const { preset, setPreset, fetchFullIntelligence, isLoading } = useFinancialHealthStore();

  useEffect(() => {
    fetchFullIntelligence();
  }, [fetchFullIntelligence]);

  const PRESET_OPTIONS: { label: string; value: FinancialPreset }[] = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Year', value: 'this_year' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Top Header & Period Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Financial Health & Intelligence
          </h1>
          <p className="text-[0.82rem] text-white/40 mt-0.5">
            Deterministic diagnostic analysis of your cash flows, savings rates, spending discipline, and liquidity coverage
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[12px] overflow-x-auto self-start sm:self-auto shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
          {PRESET_OPTIONS.map((opt) => {
            const isActive = preset === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPreset(opt.value)}
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

      {/* 1. Hero: Financial Health Score */}
      <HealthScoreHero />

      {/* 2. Score Breakdown & Historical Progression Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreBreakdownCard />
        <HealthHistoryChart />
      </div>

      {/* 3. Factors: What's Going Well & Needs Attention */}
      <FactorsCard />

      {/* 4. Deep Engines: Cash Flow & Spending Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowIntelligenceCard />
        <SpendingIntelligenceCard />
      </div>

      {/* 5. Actionable Intelligence Feed */}
      <InsightsFeed />
    </div>
  );
}
