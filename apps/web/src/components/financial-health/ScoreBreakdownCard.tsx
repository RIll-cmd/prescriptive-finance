'use client';

import React, { useState } from 'react';
import { useFinancialHealthStore } from '@/stores/financial-health-store';

interface ComponentItem {
  key: string;
  name: string;
  score: number | null;
  weightPct: number;
  icon: string;
  colorHex: string;
  rationale: string;
}

export const ScoreBreakdownCard: React.FC = () => {
  const { health } = useFinancialHealthStore();
  const [selectedComp, setSelectedComp] = useState<ComponentItem | null>(null);

  const comps = health?.components;
  const weights = health?.weights;
  const rationales = health?.explanation?.component_rationales || {};

  const items: ComponentItem[] = [
    {
      key: 'cash_flow',
      name: 'Cash Flow',
      score: comps?.cash_flow ?? null,
      weightPct: weights ? Math.round(weights.cash_flow * 100) : 28,
      icon: 'sync_alt',
      colorHex: '#3869D2',
      rationale: rationales['cash_flow'] || 'Evaluates whether your income consistently exceeds expenses.'
    },
    {
      key: 'savings',
      name: 'Savings Margin',
      score: comps?.savings ?? null,
      weightPct: weights ? Math.round(weights.savings * 100) : 28,
      icon: 'savings',
      colorHex: '#C57CF9',
      rationale: rationales['savings'] || 'Measures what percentage of your total income is converted into positive net savings.'
    },
    {
      key: 'spending',
      name: 'Spending Discipline',
      score: comps?.spending ?? null,
      weightPct: weights ? Math.round(weights.spending * 100) : 22,
      icon: 'shopping_bag',
      colorHex: '#5a8aee',
      rationale: rationales['spending'] || 'Analyzes expense-to-income ratio and discretionary spending control.'
    },
    {
      key: 'liquidity',
      name: 'Tracked Liquidity',
      score: comps?.liquidity ?? null,
      weightPct: weights ? Math.round(weights.liquidity * 100) : 22,
      icon: 'account_balance_wallet',
      colorHex: '#34d399',
      rationale: rationales['liquidity'] || 'Calculates how many months of typical living expenses your tracked liquid money can cover.'
    },
    {
      key: 'debt',
      name: 'Debt & Leverage',
      score: comps?.debt ?? null,
      weightPct: 0,
      icon: 'credit_card_off',
      colorHex: '#94A3B8',
      rationale: rationales['debt'] || 'No debt accounts are linked yet. Weight is dynamically redistributed to active components.'
    }
  ];

  return (
    <section className="glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px] text-[#C57CF9]">tune</span>
            <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
              Score Component Breakdown
            </h2>
          </div>
          <span className="text-[0.72rem] text-white/40 font-medium">Click component to inspect</span>
        </div>

        {/* Breakdown List */}
        <div className="space-y-4">
          {items.map((item) => {
            const isNA = item.score === null;
            const isSelected = selectedComp?.key === item.key;

            return (
              <div
                key={item.key}
                onClick={() => setSelectedComp(isSelected ? null : item)}
                className={`p-3 rounded-[12px] border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white/[0.06] border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-[0.82rem] mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${item.colorHex}20`,
                        color: item.colorHex
                      }}
                    >
                      <span className="material-symbols-rounded text-[16px]">{item.icon}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-white/90 block">{item.name}</span>
                      <span className="text-[0.68rem] text-white/40 font-medium">
                        {isNA ? 'Weight: N/A (Redistributed)' : `Weight: ${item.weightPct}%`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isNA ? (
                      <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-white/[0.06] text-white/40 border border-white/[0.08]">
                        N/A
                      </span>
                    ) : (
                      <span className="text-[1.1rem] font-black text-white tabular-nums">
                        {item.score}
                        <span className="text-white/30 text-[0.72rem] font-medium ml-0.5">/100</span>
                      </span>
                    )}
                    <span className="material-symbols-rounded text-[16px] text-white/30">
                      {isSelected ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    style={{
                      width: isNA ? '0%' : `${Math.min(item.score || 0, 100)}%`,
                      backgroundColor: item.colorHex
                    }}
                    className="h-full rounded-full transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_rgba(56,105,210,0.3)]"
                  />
                </div>

                {/* Expandable Rationale Details */}
                {isSelected && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-[0.78rem] text-white/70 leading-relaxed animate-[fadeIn_0.2s_ease-out]">
                    <strong className="text-white block mb-1 font-semibold">
                      Why {item.score !== null ? `${item.score}/100` : 'N/A'}?
                    </strong>
                    <span>{item.rationale}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ScoreBreakdownCard;
