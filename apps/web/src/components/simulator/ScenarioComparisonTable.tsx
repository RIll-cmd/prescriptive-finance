'use client';

import React, { useState } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useAuthStore } from '@/stores/auth-store';
import { ScenarioComparisonResponse } from '@financial-os/shared-types';

export const ScenarioComparisonTable: React.FC = () => {
  const { user } = useAuthStore();
  const { compareScenarios, isComparing, comparisonResult } = useSimulatorStore();

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const [scenariosInput, setScenariosInput] = useState([
    {
      name: 'Option A: Buy Flagship Now',
      type: 'PURCHASE' as const,
      amount: '60000',
    },
    {
      name: 'Option B: Mid-Range Model',
      type: 'PURCHASE' as const,
      amount: '35000',
    },
    {
      name: 'Option C: Finance via 12m Loan',
      type: 'DEBT' as const,
      amount: '60000',
      apr: '8.5',
      term: '12',
    },
  ]);

  const handleRunComparison = async () => {
    const payload = {
      scenarios: scenariosInput.map((s) => ({
        name: s.name,
        type: s.type,
        changes: [
          s.type === 'DEBT'
            ? {
                change_type: 'LOAN',
                amount: parseFloat(s.amount) || 0,
                interest_rate: parseFloat(s.apr || '10.0'),
                term_months: parseInt(s.term || '12', 10),
                start_date: new Date().toISOString().split('T')[0],
              }
            : {
                change_type: 'PURCHASE',
                amount: parseFloat(s.amount) || 0,
                start_date: new Date().toISOString().split('T')[0],
              },
        ],
      })),
    };

    await compareScenarios(payload);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="glass-card p-6 rounded-[20px] space-y-4 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-[1.1rem] font-bold text-white tracking-tight">
              Side-by-Side Scenario Comparison
            </h3>
            <p className="text-[0.75rem] text-white/40">
              Pit 2 to 4 options against each other to identify the optimal financial trade-off
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunComparison}
            disabled={isComparing}
            className="px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.82rem] font-bold shadow-[0_4px_16px_rgba(197,124,249,0.3)] hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-rounded text-[18px]">compare_arrows</span>
            <span>{isComparing ? 'Comparing...' : 'Run Comparative Matrix'}</span>
          </button>
        </div>

        {/* Dynamic Scenario Options Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenariosInput.map((scen, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-white/40">
                  Scenario {idx + 1}
                </span>
                <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-white/5 text-white/60">
                  {scen.type}
                </span>
              </div>

              <div>
                <label className="text-[0.68rem] text-white/40 uppercase font-bold block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={scen.name}
                  onChange={(e) => {
                    const updated = [...scenariosInput];
                    updated[idx].name = e.target.value;
                    setScenariosInput(updated);
                  }}
                  className="w-full px-3 py-2 rounded-[8px] bg-white/[0.04] border border-white/10 text-white text-[0.8rem] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[0.68rem] text-white/40 uppercase font-bold block mb-1">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="500"
                  value={scen.amount}
                  onChange={(e) => {
                    const updated = [...scenariosInput];
                    updated[idx].amount = e.target.value;
                    setScenariosInput(updated);
                  }}
                  className="w-full px-3 py-2 rounded-[8px] bg-white/[0.04] border border-white/10 text-white font-bold text-[0.8rem] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Results Matrix */}
      {comparisonResult && (
        <div className="glass-card p-6 rounded-[20px] space-y-6 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
                Comparison Results & Rankings
              </h3>
              <p className="text-[0.75rem] text-white/40">{comparisonResult.overall_recommendation}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-[0.72rem]">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                Best Cash: {comparisonResult.best_for_cash}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#C57CF9]/10 text-[#C57CF9] border border-[#C57CF9]/30 font-bold">
                Best Health: {comparisonResult.best_for_health}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.82rem] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/40 text-[0.7rem] uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-bold">Scenario</th>
                  <th className="pb-3 px-4 font-bold">Outlay / Principal</th>
                  <th className="pb-3 px-4 font-bold">Remaining Cash</th>
                  <th className="pb-3 px-4 font-bold">Emergency Runway</th>
                  <th className="pb-3 px-4 font-bold">Health Score</th>
                  <th className="pb-3 px-4 font-bold">Safe Daily</th>
                  <th className="pb-3 px-4 font-bold">Goals Delayed</th>
                  <th className="pb-3 pl-4 font-bold text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {comparisonResult.items.map((item, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      item.is_recommended ? 'bg-[#34d399]/[0.03]' : ''
                    }`}
                  >
                    <td className="py-3.5 pr-4 font-bold text-white flex items-center gap-2">
                      {item.is_recommended && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-white/80">
                      {currencySymbol}{item.cost_or_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {currencySymbol}{item.remaining_cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-white/80">
                      {item.emergency_coverage_months.toFixed(1)} mos
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.health_score} / 100
                    </td>
                    <td className="py-3.5 px-4 text-white/80">
                      {currencySymbol}{item.safe_daily_spend.toLocaleString('en-US', { minimumFractionDigits: 2 })}/d
                    </td>
                    <td className="py-3.5 px-4 text-white/80">
                      {item.goals_delayed_count > 0 ? (
                        <span className="text-amber-400 font-bold">
                          {item.goals_delayed_count} (+{item.max_goal_delay_months}m)
                        </span>
                      ) : (
                        <span className="text-emerald-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-[6px] text-[0.72rem] font-bold ${
                          item.risk_level === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : item.risk_level === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : item.is_recommended
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-white/5 text-white/60'
                        }`}
                      >
                        {item.is_recommended ? 'Recommended' : item.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
