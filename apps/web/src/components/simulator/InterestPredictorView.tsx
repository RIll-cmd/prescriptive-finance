'use client';

import React, { useState } from 'react';
import { useInterestPredictorStore } from '@/stores/interest-predictor-store';
import { useAuthStore } from '@/stores/auth-store';
import { CustomBankPresetModal } from './CustomBankPresetModal';

export const InterestPredictorView: React.FC = () => {
  const { user, totalBalance, moneySources } = useAuthStore();
  const {
    balance,
    setBalance,
    annualRatePct,
    setAnnualRate,
    taxRatePct,
    setTaxRate,
    creditingFrequency,
    setCreditingFrequency,
    compounding,
    setCompounding,
    monthlyContribution,
    setMonthlyContribution,
    daysToProject,
    setDaysToProject,
    selectedPresetId,
    setSelectedPreset,
    getAllPresets,
    getSelectedPreset,
    getSimulationResult,
    getBankComparisons,
    openCustomModal,
  } = useInterestPredictorStore();

  const [scheduleView, setScheduleView] = useState<'MONTHLY' | 'DAILY'>('MONTHLY');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COMPARISON' | 'SCHEDULE'>('OVERVIEW');

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const presets = getAllPresets();
  const selectedPreset = getSelectedPreset();
  const { summary, schedule } = getSimulationResult();
  const bankComparisons = getBankComparisons();

  const QUICK_BALANCES = [
    { label: '₱10,000', value: 10000 },
    { label: '₱50,000', value: 50000 },
    { label: '₱100,000', value: 100000 },
    { label: '₱250,000', value: 250000 },
    { label: '₱500,000', value: 500000 },
    { label: '₱1,000,000', value: 1000000 },
  ];

  const TIME_HORIZONS = [
    { label: '1 Day', days: 1 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
    { label: '3 Years', days: 1095 },
    { label: '5 Years', days: 1825 },
  ];

  // Group schedule into monthly roll-up
  const monthlyRollup: {
    monthNumber: number;
    startDate: string;
    endDate: string;
    startBalance: number;
    endBalance: number;
    grossInterest: number;
    tax: number;
    netInterest: number;
  }[] = [];

  let curMonthGross = 0;
  let curMonthTax = 0;
  let curMonthNet = 0;
  let monthStartBal = balance;
  let monthStartDate = schedule[0]?.date || '';

  schedule.forEach((row, index) => {
    curMonthGross += row.grossInterest;
    curMonthTax += row.tax;
    curMonthNet += row.netInterest;

    const isMonthBoundary = (index + 1) % 30 === 0 || index === schedule.length - 1;
    if (isMonthBoundary) {
      const monthNum = Math.ceil((index + 1) / 30);
      monthlyRollup.push({
        monthNumber: monthNum,
        startDate: monthStartDate,
        endDate: row.date,
        startBalance: monthStartBal,
        endBalance: row.eodBalance,
        grossInterest: Number(curMonthGross.toFixed(2)),
        tax: Number(curMonthTax.toFixed(2)),
        netInterest: Number(curMonthNet.toFixed(2)),
      });
      curMonthGross = 0;
      curMonthTax = 0;
      curMonthNet = 0;
      monthStartBal = row.eodBalance;
      if (schedule[index + 1]) {
        monthStartDate = schedule[index + 1].date;
      }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── Control Header ─── */}
      <div className="glass-card p-6 rounded-[22px] border border-white/10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#3869D2] flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.35)]">
                <span className="material-symbols-rounded text-[20px] text-white">calculate</span>
              </div>
              <h2 className="text-[1.25rem] font-black text-white tracking-tight">
                Interest & Withholding Tax Predictor
              </h2>
              <span className="text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Ledger Simulation
              </span>
            </div>
            <p className="text-[0.78rem] text-white/40 mt-1">
              Deterministic End-of-Day (EOD) accrual engine with 20% withholding tax, compounding, and Philippine digital bank presets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openCustomModal()}
              className="text-[0.80rem] font-bold text-white bg-gradient-to-r from-[#C57CF9]/20 to-[#3869D2]/20 hover:from-[#C57CF9]/30 hover:to-[#3869D2]/30 border border-[#C57CF9]/40 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-rounded text-[18px] text-[#d9a4ff]">add_circle</span>
              <span>+ Custom Preset</span>
            </button>
          </div>
        </div>

        {/* ─── Grid Controls: Bank Presets & Baseline Balance ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Preset & Rates (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Bank Preset Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                  Bank / Yield Product
                </label>
                {selectedPreset?.isCustom && (
                  <button
                    type="button"
                    onClick={() => openCustomModal(selectedPreset)}
                    className="text-[0.72rem] text-[#C57CF9] hover:underline font-bold"
                  >
                    Edit Preset
                  </button>
                )}
              </div>
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[0.85rem] font-bold text-white outline-none focus:border-[#10B981] transition-all"
              >
                <optgroup label="✨ Custom User Presets" className="bg-[#0f0f24] text-[#C57CF9]">
                  {presets
                    .filter((p) => p.isCustom)
                    .map((p) => (
                      <option key={p.id} value={p.id} className="text-white">
                        ⭐ {p.name} ({p.ratePct.toFixed(2)}% p.a. • {p.creditingFrequency})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🏦 Philippine Digital Banks (Standard)" className="bg-[#0f0f24] text-white/60">
                  {presets
                    .filter((p) => !p.isCustom)
                    .map((p) => (
                      <option key={p.id} value={p.id} className="text-white">
                        {p.name} — {p.ratePct.toFixed(2)}% p.a. ({p.creditingFrequency})
                      </option>
                    ))}
                </optgroup>
              </select>
              {selectedPreset?.description && (
                <p className="text-[0.72rem] text-white/40 mt-1.5 italic">
                  💡 {selectedPreset.description}
                </p>
              )}
            </div>

            {/* Interest Rate & Tax Overrides */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                  Annual Rate (% p.a.)
                </label>
                <div className="flex items-center bg-[#0d0d21] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-[#10B981] transition-all">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={annualRatePct}
                    onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-[0.95rem] font-extrabold text-emerald-400 outline-none w-full tabular-nums"
                  />
                  <span className="text-[0.80rem] font-bold text-white/40">%</span>
                </div>
              </div>

              <div>
                <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                  Withholding Tax (%)
                </label>
                <div className="flex items-center bg-[#0d0d21] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-[#10B981] transition-all">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={taxRatePct}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-[0.95rem] font-extrabold text-rose-400 outline-none w-full tabular-nums"
                  />
                  <span className="text-[0.80rem] font-bold text-white/40">%</span>
                </div>
              </div>
            </div>

            {/* Crediting Frequency & Compounding Toggles */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex-1">
                <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                  Crediting
                </label>
                <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.08]">
                  {(['daily', 'monthly', 'quarterly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setCreditingFrequency(freq)}
                      className={`flex-1 py-1 rounded-md text-[0.72rem] font-bold capitalize transition-all ${
                        creditingFrequency === freq
                          ? 'bg-[#3869D2] text-white shadow-sm'
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1 block">
                  Compounding
                </label>
                <button
                  type="button"
                  onClick={() => setCompounding(!compounding)}
                  className={`px-3 py-1.5 rounded-lg text-[0.72rem] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    compounding
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/40'
                  }`}
                >
                  <span className="material-symbols-rounded text-[14px]">
                    {compounding ? 'check_circle' : 'cancel'}
                  </span>
                  <span>{compounding ? 'Enabled (Reinvest)' : 'Disabled'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Principal Amount & Slider (7 cols) */}
          <div className="lg:col-span-7 space-y-4 lg:pl-4 lg:border-l lg:border-white/[0.06]">
            {/* Principal Balance Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                  Simulated Deposit Principal (PHP)
                </label>
                {totalBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setBalance(totalBalance)}
                    className="text-[0.72rem] text-[#3869D2] hover:text-[#5a8aee] font-bold transition-colors"
                  >
                    Use Active Balance ({currencySymbol}{totalBalance.toLocaleString()})
                  </button>
                )}
              </div>

              <div className="flex items-center bg-[#0d0d21] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-[#10B981] shadow-inner transition-all">
                <span className="text-[1.3rem] font-black text-white/40 mr-2">{currencySymbol}</span>
                <input
                  type="number"
                  step="1000"
                  min="1"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none text-[1.4rem] font-black text-white outline-none w-full tabular-nums"
                />
              </div>
            </div>

            {/* Quick Balance Preset Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_BALANCES.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setBalance(chip.value)}
                  className={`px-3 py-1 rounded-lg text-[0.75rem] font-bold transition-all tabular-nums cursor-pointer ${
                    balance === chip.value
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Interactive Amount Range Slider */}
            <div className="pt-2">
              <input
                type="range"
                min="5000"
                max="2000000"
                step="5000"
                value={Math.min(2000000, balance)}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
              <div className="flex justify-between text-[0.65rem] text-white/30 font-semibold mt-1">
                <span>₱5,000</span>
                <span>₱500,000</span>
                <span>₱1,000,000</span>
                <span>₱2,000,000+</span>
              </div>
            </div>

            {/* Recurring Monthly Contribution Input */}
            <div className="pt-1 flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[18px] text-[#C57CF9]">savings</span>
                <div>
                  <div className="text-[0.78rem] font-bold text-white">Monthly Deposit Addition</div>
                  <div className="text-[0.68rem] text-white/40">Simulate regular monthly top-ups</div>
                </div>
              </div>
              <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 w-32">
                <span className="text-[0.75rem] text-white/40 mr-1">{currencySymbol}</span>
                <input
                  type="number"
                  step="500"
                  min="0"
                  placeholder="0"
                  value={monthlyContribution || ''}
                  onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none text-[0.80rem] font-bold text-white outline-none w-full tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Time Horizon Pills ─── */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06] flex-wrap">
          <span className="text-[0.72rem] font-bold text-white/40 uppercase tracking-[0.08em]">
            Time Horizon:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TIME_HORIZONS.map((h) => (
              <button
                key={h.days}
                type="button"
                onClick={() => setDaysToProject(h.days)}
                className={`px-3.5 py-1.5 rounded-xl text-[0.78rem] font-bold transition-all cursor-pointer ${
                  daysToProject === h.days
                    ? 'bg-gradient-to-r from-[#10B981] to-[#3869D2] text-white shadow-[0_2px_12px_rgba(16,185,129,0.35)]'
                    : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Hero Predictive Results 5-Card Metric Deck ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Daily Net */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider mb-1">
            Daily Net Interest
          </div>
          <div className="text-[1.4rem] font-black text-emerald-400 tabular-nums tracking-tight">
            {currencySymbol}{summary.dailyAverageNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[0.68rem] text-white/40 mt-1">
            Gross: {currencySymbol}{(summary.dailyAverageNet / 0.8).toFixed(2)}/day
          </div>
        </div>

        {/* Card 2: Monthly Net */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider mb-1">
            Monthly Net Interest
          </div>
          <div className="text-[1.4rem] font-black text-emerald-400 tabular-nums tracking-tight">
            {currencySymbol}{summary.monthlyEquivalentNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[0.68rem] text-white/40 mt-1">
            Credited {creditingFrequency}
          </div>
        </div>

        {/* Card 3: Yearly Net */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden group hover:border-[#3869D2]/30 transition-all">
          <div className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider mb-1">
            Yearly Net Interest
          </div>
          <div className="text-[1.4rem] font-black text-[#60a5fa] tabular-nums tracking-tight">
            {currencySymbol}{summary.yearlyEquivalentNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[0.68rem] text-white/40 mt-1">
            Over 365 Days
          </div>
        </div>

        {/* Card 4: 20% Tax Paid */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider mb-1">
            20% Tax Withheld
          </div>
          <div className="text-[1.4rem] font-black text-rose-400 tabular-nums tracking-tight">
            {currencySymbol}{summary.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[0.68rem] text-white/40 mt-1">
            Automatically deducted
          </div>
        </div>

        {/* Card 5: Final Projected Balance */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#10B981]/15 to-[#3869D2]/15 border border-[#10B981]/30 relative overflow-hidden col-span-2 md:col-span-1">
          <div className="text-[0.68rem] font-bold text-emerald-300 uppercase tracking-wider mb-1">
            Projected Ending Balance
          </div>
          <div className="text-[1.4rem] font-black text-white tabular-nums tracking-tight">
            {currencySymbol}{summary.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[0.68rem] text-emerald-400 font-semibold mt-1">
            +{currencySymbol}{summary.totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })} Net Yield
          </div>
        </div>
      </div>

      {/* ─── Advantage vs Traditional Bank Banner ─── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3869D2]/10 via-[#C57CF9]/10 to-emerald-500/10 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-yellow-400 shrink-0">
            <span className="material-symbols-rounded text-[22px]">trending_up</span>
          </div>
          <div>
            <div className="text-[0.88rem] font-bold text-white">
              Digital Bank Alpha vs Traditional Banks (0.125%)
            </div>
            <p className="text-[0.72rem] text-white/50">
              Traditional savings would earn only <strong className="text-white">{currencySymbol}{summary.traditionalBankNet.toFixed(2)}</strong>. You gain an extra <strong className="text-emerald-400">+{currencySymbol}{summary.netAdvantageOverTraditional.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> net passive cash!
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-[0.85rem] border border-emerald-500/30 whitespace-nowrap self-end sm:self-auto">
          +{(annualRatePct / 0.125).toFixed(0)}x Higher Yield
        </div>
      </div>

      {/* ─── View Tabs: Overview, All-Bank Comparison, Schedule ─── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        {[
          { id: 'OVERVIEW', label: 'Milestones & Strategy', icon: 'flag' },
          { id: 'COMPARISON', label: 'Compare All Digital Banks', icon: 'leaderboard' },
          { id: 'SCHEDULE', label: 'Detailed Ledger Schedule', icon: 'table_chart' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-[0.80rem] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: MILESTONES & STRATEGY ─── */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Milestone Reach Cards */}
          <div className="lg:col-span-2 glass-card p-6 rounded-[22px] border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-[20px] text-[#F59E0B]">emoji_events</span>
              <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
                Passive Income Milestones for {currencySymbol}{balance.toLocaleString()}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {summary.milestones.map((m) => {
                const reachedInHorizon = m.daysToReach !== null && m.daysToReach <= daysToProject;
                return (
                  <div
                    key={m.target}
                    className={`p-3.5 rounded-xl border transition-all ${
                      reachedInHorizon
                        ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                        : 'bg-white/[0.02] border-white/[0.04] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.82rem] font-extrabold text-white">
                        {currencySymbol}{m.target.toLocaleString()} Net Passive
                      </span>
                      {reachedInHorizon ? (
                        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          {m.daysToReach === 1 ? '1 Day' : `${m.daysToReach} Days`}
                        </span>
                      ) : (
                        <span className="text-[0.65rem] font-semibold text-white/30">
                          &gt; {daysToProject} Days
                        </span>
                      )}
                    </div>
                    {reachedInHorizon && m.dateReached && (
                      <div className="text-[0.70rem] text-emerald-300/70 mt-1 flex items-center gap-1">
                        <span className="material-symbols-rounded text-[13px]">event</span>
                        <span>Estimated Date: {new Date(m.dateReached).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Rules & Math Card */}
          <div className="glass-card p-6 rounded-[22px] border border-white/10 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-[20px] text-[#3869D2]">school</span>
              <h3 className="text-[1rem] font-bold text-white tracking-tight">
                How It Works
              </h3>
            </div>
            <div className="space-y-2.5 text-[0.75rem] text-white/60">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <strong className="text-white block mb-0.5">1. Daily Accrual</strong>
                <span>Interest computes on your End-of-Day balance: <code className="text-[#d9a4ff]">Balance × (Rate / 365)</code></span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <strong className="text-white block mb-0.5">2. 20% Withholding Tax</strong>
                <span>Deducted before payout: <code className="text-rose-300">Gross × 20%</code></span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <strong className="text-white block mb-0.5">3. Compounding</strong>
                <span>Net interest is added back to your active balance to accelerate future returns.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: COMPARE ALL DIGITAL BANKS ─── */}
      {activeTab === 'COMPARISON' && (
        <div className="glass-card p-6 rounded-[22px] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[1.1rem] font-bold text-white tracking-tight">
                Philippine Digital Bank Yield Ranking for {currencySymbol}{balance.toLocaleString()}
              </h3>
              <p className="text-[0.75rem] text-white/40">
                Sorted by highest net annual passive return (after 20% withholding tax)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.80rem]">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/40 uppercase tracking-[0.06em] text-[0.68rem]">
                  <th className="py-3 px-3">Bank / Product</th>
                  <th className="py-3 px-3">Base Rate</th>
                  <th className="py-3 px-3">Crediting</th>
                  <th className="py-3 px-3">Daily Net</th>
                  <th className="py-3 px-3">Monthly Net</th>
                  <th className="py-3 px-3">Yearly Net</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {bankComparisons.map((item, idx) => {
                  const isSelected = item.preset.id === selectedPresetId;
                  return (
                    <tr
                      key={item.preset.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isSelected ? 'bg-[#3869D2]/[0.08]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold ${
                            idx === 0 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-white/10 text-white/60'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white">{item.preset.name}</span>
                          {item.preset.isCustom && (
                            <span className="text-[0.62rem] px-1.5 py-0.2 rounded bg-[#C57CF9]/20 text-[#d9a4ff] font-bold">Custom</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-emerald-400 tabular-nums">
                        {item.preset.ratePct.toFixed(2)}%
                        {item.preset.boostedRatePct && (
                          <span className="text-[0.68rem] text-white/40 block font-normal">
                            up to {item.preset.boostedRatePct.toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 capitalize text-white/70">
                        {item.preset.creditingFrequency}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white tabular-nums">
                        {currencySymbol}{item.dailyNet.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white tabular-nums">
                        {currencySymbol}{item.monthlyNet.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-emerald-400 tabular-nums text-[0.88rem]">
                        {currencySymbol}{item.yearlyNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPreset(item.preset.id)}
                          className={`px-2.5 py-1 rounded-lg text-[0.72rem] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Simulate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: DETAILED LEDGER SCHEDULE ─── */}
      {activeTab === 'SCHEDULE' && (
        <div className="glass-card p-6 rounded-[22px] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-[1.1rem] font-bold text-white tracking-tight">
                Simulated Amortization & Crediting Schedule
              </h3>
              <p className="text-[0.75rem] text-white/40">
                End-of-day balances, gross interest, withholding tax, and credited amounts
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setScheduleView('MONTHLY')}
                className={`px-3 py-1 rounded-lg text-[0.75rem] font-bold transition-all ${
                  scheduleView === 'MONTHLY'
                    ? 'bg-[#3869D2] text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Monthly Summary
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('DAILY')}
                className={`px-3 py-1 rounded-lg text-[0.75rem] font-bold transition-all ${
                  scheduleView === 'DAILY'
                    ? 'bg-[#3869D2] text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Daily (EOD)
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-[0.80rem]">
              <thead className="sticky top-0 bg-[#0d0d21] border-b border-white/[0.08] text-white/40 uppercase tracking-[0.06em] text-[0.68rem] z-10">
                <tr>
                  <th className="py-2.5 px-3">Period / Date</th>
                  <th className="py-2.5 px-3">Starting Balance</th>
                  <th className="py-2.5 px-3">Gross Interest</th>
                  <th className="py-2.5 px-3">20% Tax</th>
                  <th className="py-2.5 px-3">Net Interest</th>
                  <th className="py-2.5 px-3">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {scheduleView === 'MONTHLY' ? (
                  monthlyRollup.map((row) => (
                    <tr key={row.monthNumber} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-bold text-white">
                        Month {row.monthNumber} ({new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
                      </td>
                      <td className="py-3 px-3 tabular-nums text-white/70">
                        {currencySymbol}{row.startBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-white/80">
                        {currencySymbol}{row.grossInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-rose-400">
                        -{currencySymbol}{row.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-bold text-emerald-400">
                        +{currencySymbol}{row.netInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-extrabold text-white">
                        {currencySymbol}{row.endBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  schedule.slice(0, 100).map((row) => (
                    <tr key={row.day} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 font-medium text-white/80">
                        Day {row.day} ({row.date})
                      </td>
                      <td className="py-2 px-3 tabular-nums text-white/70">
                        {currencySymbol}{row.eodBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 tabular-nums text-white/60">
                        {currencySymbol}{row.grossInterest.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 tabular-nums text-rose-400/80">
                        -{currencySymbol}{row.tax.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 tabular-nums font-bold text-emerald-400">
                        +{currencySymbol}{row.netInterest.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 tabular-nums font-bold text-white">
                        {currencySymbol}{row.eodBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {scheduleView === 'DAILY' && schedule.length > 100 && (
              <div className="py-3 text-center text-[0.72rem] text-white/40 italic">
                Showing first 100 days of {schedule.length} days. Switch to Monthly Summary for full horizon.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Bank Preset Modal */}
      <CustomBankPresetModal />
    </div>
  );
};

export default InterestPredictorView;
