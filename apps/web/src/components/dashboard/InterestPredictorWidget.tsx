'use client';

import React from 'react';
import Link from 'next/link';
import { useInterestPredictorStore } from '@/stores/interest-predictor-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStore } from '@/stores/dashboard-store';

export const InterestPredictorWidget: React.FC = () => {
  const { user, totalBalance } = useAuthStore();
  const { toggleWidget } = useDashboardStore();
  const {
    balance,
    setBalance,
    selectedPresetId,
    setSelectedPreset,
    getAllPresets,
    getSelectedPreset,
    getSimulationResult,
  } = useInterestPredictorStore();

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const presets = getAllPresets();
  const selectedPreset = getSelectedPreset();
  const { summary } = getSimulationResult();

  return (
    <section className="glass-card p-6 rounded-[22px] border border-white/10 relative overflow-hidden flex flex-col justify-between group">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-rounded text-[18px]">calculate</span>
            </div>
            <div>
              <h2 className="text-[0.95rem] font-bold text-white tracking-tight">
                Interest & Tax Predictor
              </h2>
              <span className="text-[0.68rem] text-white/40 font-medium">
                End-of-day ledger prediction
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/simulator"
              title="Open full simulator"
              className="text-[0.72rem] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1"
            >
              <span>Full Engine</span>
              <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
            </Link>
            <button
              type="button"
              onClick={() => toggleWidget('interest_predictor')}
              title="Hide from dashboard"
              className="w-6 h-6 rounded-[6px] text-white/20 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-rounded text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Bank preset quick select */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[0.65rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
              Selected Bank
            </label>
            <span className="text-[0.68rem] font-bold text-emerald-400">
              {selectedPreset?.ratePct.toFixed(2)}% p.a. • Net of 20% Tax
            </span>
          </div>
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-xl px-3 py-1.5 text-[0.80rem] font-bold text-white outline-none focus:border-emerald-400 transition-all"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.ratePct.toFixed(2)}% • {p.creditingFrequency})
              </option>
            ))}
          </select>
        </div>

        {/* Hero Metrics Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block mb-0.5">
              Daily Net Cash
            </span>
            <div className="text-[1.25rem] font-black text-emerald-400 tabular-nums">
              {currencySymbol}{summary.dailyAverageNet.toFixed(2)}
            </div>
            <span className="text-[0.62rem] text-white/30">Credited {selectedPreset?.creditingFrequency}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block mb-0.5">
              Monthly Net Cash
            </span>
            <div className="text-[1.25rem] font-black text-emerald-400 tabular-nums">
              {currencySymbol}{summary.monthlyEquivalentNet.toFixed(2)}
            </div>
            <span className="text-[0.62rem] text-white/30">
              +{currencySymbol}{summary.yearlyEquivalentNet.toFixed(0)}/year
            </span>
          </div>
        </div>

        {/* Quick Amount Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[0.72rem]">
            <span className="text-white/40 font-semibold">Simulated Principal:</span>
            <span className="font-extrabold text-white tabular-nums">
              {currencySymbol}{balance.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={Math.min(1000000, balance)}
            onChange={(e) => setBalance(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
          />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-white/[0.06] mt-4 flex items-center justify-between">
        <span className="text-[0.68rem] text-white/40">
          vs Traditional Bank: <strong className="text-emerald-400">+{currencySymbol}{summary.netAdvantageOverTraditional.toFixed(0)}</strong>
        </span>
        <Link
          href="/simulator"
          className="text-[0.75rem] font-bold text-[#3869D2] hover:text-[#5a8aee] flex items-center gap-1 transition-colors"
        >
          <span>What-If Sandbox</span>
          <span className="material-symbols-rounded text-[14px]">chevron_right</span>
        </Link>
      </div>
    </section>
  );
};

export default InterestPredictorWidget;
