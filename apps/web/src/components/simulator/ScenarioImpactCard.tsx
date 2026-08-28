'use client';

import React, { useState } from 'react';
import { SimulationResultResponse } from '@financial-os/shared-types';
import { useAuthStore } from '@/stores/auth-store';
import { useSimulatorStore } from '@/stores/simulator-store';

interface ScenarioImpactCardProps {
  simulation: SimulationResultResponse;
}

export const ScenarioImpactCard: React.FC<ScenarioImpactCardProps> = ({ simulation }) => {
  const { user } = useAuthStore();
  const { saveScenario, isSaving } = useSimulatorStore();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const { baseline, simulated, cash_delta, health_diff, risk_level, risk_factors } = simulation;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          label: 'Critical Risk',
          icon: 'dangerous',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          label: 'High Risk',
          icon: 'warning',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
          label: 'Moderate Risk',
          icon: 'info',
        };
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          label: 'Low Risk',
          icon: 'check_circle',
        };
    }
  };

  const badge = getRiskBadge(risk_level);

  const handleSave = async () => {
    await saveScenario({
      name: simulation.scenario_name,
      type: simulation.scenario_type,
      description: simulation.description,
      changes: [
        {
          change_type: simulation.scenario_type,
          amount: Math.abs(cash_delta),
          start_date: new Date().toISOString().split('T')[0],
        },
      ],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="glass-card p-6 rounded-[20px] space-y-6 relative overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
      {/* Risk ambient accent top border */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] ${
          risk_level === 'CRITICAL' || risk_level === 'HIGH'
            ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500'
            : 'bg-gradient-to-r from-[#3869D2] via-[#C57CF9] to-[#34d399]'
        }`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[1.2rem] font-bold text-white tracking-tight">
              {simulation.scenario_name}
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold border flex items-center gap-1 uppercase tracking-wider ${badge.bg}`}
            >
              <span className="material-symbols-rounded text-[14px]">{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          </div>
          {simulation.description && (
            <p className="text-[0.78rem] text-white/40 mt-1">{simulation.description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || savedSuccess}
          className="px-3.5 py-1.5 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-[0.75rem] font-bold flex items-center gap-1.5 transition-all self-end sm:self-auto"
        >
          <span className="material-symbols-rounded text-[16px]">
            {savedSuccess ? 'bookmark_added' : 'bookmark'}
          </span>
          <span>{savedSuccess ? 'Saved to Library' : isSaving ? 'Saving...' : 'Save Scenario'}</span>
        </button>
      </div>

      {/* Core Comparative Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Liquid Cash */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Liquid Cash
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[1.15rem] font-bold text-white">
              {currencySymbol}{simulated.liquid_cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[0.72rem]">
            <span className="text-white/40">Was {currencySymbol}{baseline.liquid_cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span
              className={`font-bold ${cash_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              ({cash_delta >= 0 ? '+' : ''}{currencySymbol}{cash_delta.toLocaleString('en-US', { minimumFractionDigits: 2 })})
            </span>
          </div>
        </div>

        {/* Metric 2: Emergency Runway */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Emergency Runway
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[1.15rem] font-bold text-white">
              {simulated.emergency_coverage_months.toFixed(1)} mos
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[0.72rem]">
            <span className="text-white/40">Was {baseline.emergency_coverage_months.toFixed(1)} mos</span>
            <span
              className={`font-bold ${
                simulation.emergency_coverage_delta_months >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ({simulation.emergency_coverage_delta_months >= 0 ? '+' : ''}
              {simulation.emergency_coverage_delta_months.toFixed(1)} mo)
            </span>
          </div>
        </div>

        {/* Metric 3: Safe-to-Spend / Day */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Safe Daily Spend
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[1.15rem] font-bold text-white">
              {currencySymbol}{simulated.safe_daily_spend.toLocaleString('en-US', { minimumFractionDigits: 2 })}/d
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[0.72rem]">
            <span className="text-white/40">Was {currencySymbol}{baseline.safe_daily_spend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span
              className={`font-bold ${
                simulation.safe_daily_spend_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ({simulation.safe_daily_spend_delta >= 0 ? '+' : ''}{currencySymbol}
              {simulation.safe_daily_spend_delta.toLocaleString('en-US', { minimumFractionDigits: 2 })})
            </span>
          </div>
        </div>

        {/* Metric 4: Financial Health Score */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Health Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[1.15rem] font-bold text-white">
              {simulated.health_score} <span className="text-[0.75rem] text-white/40">/ 100</span>
            </span>
            <span className="text-[0.7rem] font-bold text-white/60">({simulated.health_label})</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[0.72rem]">
            <span className="text-white/40">Was {baseline.health_score}</span>
            <span
              className={`font-bold ${
                health_diff.score_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ({health_diff.score_delta >= 0 ? '+' : ''}{health_diff.score_delta} pts)
            </span>
          </div>
        </div>
      </div>

      {/* Loan Summary Banner (If Applicable) */}
      {simulation.loan_summary && (
        <div className="p-4 rounded-[14px] bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <span className="material-symbols-rounded text-[22px]">credit_card</span>
            </div>
            <div>
              <h4 className="text-[0.88rem] font-bold text-white">
                Loan Amortization Breakdown
              </h4>
              <p className="text-[0.72rem] text-white/50">
                {simulation.loan_summary.term_months} Months @ {simulation.loan_summary.annual_interest_rate}% APR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[0.82rem]">
            <div>
              <span className="text-white/40 text-[0.68rem] uppercase font-bold block">Monthly Payment</span>
              <span className="font-bold text-rose-400">
                {currencySymbol}{simulation.loan_summary.monthly_payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
              </span>
            </div>
            <div>
              <span className="text-white/40 text-[0.68rem] uppercase font-bold block">Total Interest</span>
              <span className="font-bold text-white/80">
                {currencySymbol}{simulation.loan_summary.total_interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-white/40 text-[0.68rem] uppercase font-bold block">Total Repayment</span>
              <span className="font-bold text-white">
                {currencySymbol}{simulation.loan_summary.total_repayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Risk Factors List */}
      {risk_factors && risk_factors.length > 0 && (
        <div className="space-y-2 pt-1">
          <h4 className="text-[0.75rem] font-bold uppercase tracking-wider text-white/50">
            Engine Risk Analysis
          </h4>
          <div className="space-y-1.5">
            {risk_factors.map((rf, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[0.78rem] text-white/75 bg-white/[0.02] p-2 rounded-[8px] border border-white/[0.04]"
              >
                <span className="material-symbols-rounded text-[16px] text-amber-400 mt-0.5">
                  info
                </span>
                <span>{rf}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
