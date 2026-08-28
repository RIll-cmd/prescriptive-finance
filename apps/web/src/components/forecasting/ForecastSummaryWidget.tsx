'use client';

import React, { useEffect } from 'react';
import { useForecastStore } from '@/stores/forecast-store';
import { useAuthStore } from '@/stores/auth-store';
import { ForecastPeriod } from '@financial-os/shared-types';

export const ForecastSummaryWidget: React.FC = () => {
  const { user } = useAuthStore();
  const { forecast, period, setPeriod, fetchForecast, isLoading } = useForecastStore();

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  if (!forecast && isLoading) {
    return (
      <div className="glass-card p-6 rounded-[20px] border border-white/10 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded" />
        <div className="h-20 bg-white/5 rounded-[14px]" />
      </div>
    );
  }

  if (!forecast) return null;

  const periods: { key: ForecastPeriod; label: string }[] = [
    { key: 'month_end', label: 'Month-End' },
    { key: '30_days', label: '30 Days' },
    { key: '3_months', label: '3 Months' },
    { key: '6_months', label: '6 Months' },
    { key: '12_months', label: '1 Year' },
  ];

  const confBadge =
    forecast.confidence.level === 'HIGH'
      ? { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'High Confidence' }
      : forecast.confidence.level === 'MEDIUM'
      ? { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Medium Confidence' }
      : { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', label: 'Estimated' };

  return (
    <div className="glass-card p-6 rounded-[20px] space-y-6 border border-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[1.15rem] font-bold text-white tracking-tight">
              Cash & Balance Projections
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold border ${confBadge.bg}`}
              title={forecast.confidence.rationale}
            >
              {confBadge.label} ({forecast.confidence.score}%)
            </span>
          </div>
          <p className="text-[0.75rem] text-white/40 mt-0.5">
            Deterministic forward forecast for {forecast.total_days} days (ending{' '}
            {new Date(forecast.period_end).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
            )
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center gap-1 p-1 rounded-[10px] bg-white/[0.04] border border-white/[0.08] self-end sm:self-auto">
          {periods.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 rounded-[7px] text-[0.72rem] font-bold transition-all ${
                period === p.key
                  ? 'bg-[#3869D2] text-white shadow-[0_0_12px_rgba(56,105,210,0.5)]'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Key Projections */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Liquid Cash */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Current Liquid Cash
          </span>
          <span className="text-[1.2rem] font-bold text-white">
            {currencySymbol}{forecast.current_liquid_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[0.68rem] text-white/40 block mt-1">
            Available across bank & cash
          </span>
        </div>

        {/* Metric 2: Projected Income */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Expected Inflow
          </span>
          <span className="text-[1.2rem] font-bold text-emerald-400">
            +{currencySymbol}{forecast.projected_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[0.68rem] text-white/40 block mt-1">
            Scheduled & baseline income
          </span>
        </div>

        {/* Metric 3: Projected Expenses */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Total Outflow Burn
          </span>
          <span className="text-[1.2rem] font-bold text-rose-400">
            –{currencySymbol}{forecast.projected_total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[0.68rem] text-white/40 block mt-1">
            {currencySymbol}{forecast.projected_known_expenses.toLocaleString('en-US')} bills + variable
          </span>
        </div>

        {/* Metric 4: Projected Ending Cash */}
        <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[0.7rem] uppercase tracking-wider font-bold text-white/40 block mb-1">
            Projected Ending Cash
          </span>
          <span className="text-[1.2rem] font-bold text-white">
            {currencySymbol}{forecast.projected_end_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[0.68rem]">
            <span className="text-white/40">Net Savings:</span>
            <span
              className={`font-bold ${
                forecast.projected_net_savings >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {forecast.projected_net_savings >= 0 ? '+' : ''}
              {currencySymbol}{forecast.projected_net_savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
