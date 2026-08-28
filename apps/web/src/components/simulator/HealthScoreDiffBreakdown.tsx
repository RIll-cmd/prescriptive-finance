'use client';

import React from 'react';
import { HealthScoreDiff } from '@financial-os/shared-types';

interface HealthScoreDiffBreakdownProps {
  healthDiff: HealthScoreDiff;
}

const COMPONENT_LABELS: Record<string, { label: string; icon: string }> = {
  cash_flow: { label: 'Cash Flow Ratio', icon: 'account_balance' },
  savings_rate: { label: 'Savings Rate', icon: 'savings' },
  spending_control: { label: 'Spending Control', icon: 'speed' },
  liquidity: { label: 'Emergency Runway', icon: 'shield' },
  debt_burden: { label: 'Debt Service Ratio', icon: 'credit_card' },
};

export const HealthScoreDiffBreakdown: React.FC<HealthScoreDiffBreakdownProps> = ({ healthDiff }) => {
  const components = healthDiff.components || {};

  return (
    <div className="glass-card p-6 rounded-[20px] space-y-4 border border-white/10">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1rem] font-bold text-white tracking-tight">
            Financial Health Impact Breakdown
          </h3>
          <p className="text-[0.72rem] text-white/40">
            How this scenario shifts your 5 fundamental pillar scores
          </p>
        </div>

        <div className="flex items-center gap-3 text-[0.8rem] font-bold">
          <span className="text-white/40">Baseline: {healthDiff.current_score}</span>
          <span className="material-symbols-rounded text-[16px] text-white/20">arrow_forward</span>
          <span
            className={`px-2 py-0.5 rounded-[6px] ${
              healthDiff.score_delta >= 0
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            Simulated: {healthDiff.scenario_score} ({healthDiff.score_delta >= 0 ? '+' : ''}
            {healthDiff.score_delta} pts)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(components).map(([key, diff]) => {
          const meta = COMPONENT_LABELS[key] || { label: key, icon: 'analytics' };
          const delta = diff.delta;

          return (
            <div
              key={key}
              className="p-3.5 rounded-[12px] bg-white/[0.03] border border-white/[0.06] space-y-2"
            >
              <div className="flex items-center justify-between text-[0.78rem]">
                <div className="flex items-center gap-2 text-white/80 font-bold">
                  <span className="material-symbols-rounded text-[18px] text-white/40">
                    {meta.icon}
                  </span>
                  <span>{meta.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[0.72rem]">{diff.current} / 100</span>
                  <span className="text-white/20">→</span>
                  <span className="font-bold text-white text-[0.78rem]">{diff.scenario} / 100</span>
                  <span
                    className={`text-[0.72rem] font-bold px-1.5 py-0.5 rounded ${
                      delta > 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : delta < 0
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
              </div>

              {/* Progress bar comparison */}
              <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
                {/* Simulated bar */}
                <div
                  className={`absolute top-0 bottom-0 left-0 rounded-full transition-all ${
                    delta >= 0 ? 'bg-[#34d399]' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, diff.scenario))}%` }}
                />
                {/* Baseline marker */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_4px_white] z-10"
                  style={{ left: `${Math.max(0, Math.min(100, diff.current))}%` }}
                  title={`Baseline: ${diff.current}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
