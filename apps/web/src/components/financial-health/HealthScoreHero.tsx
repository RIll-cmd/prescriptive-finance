'use client';

import React, { useEffect, useState } from 'react';
import { useFinancialHealthStore } from '@/stores/financial-health-store';
import { useAuthStore } from '@/stores/auth-store';

export const HealthScoreHero: React.FC = () => {
  const { health, isLoading } = useFinancialHealthStore();
  const { user } = useAuthStore();
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  const targetScore = health?.score ?? 75;

  useEffect(() => {
    const dur = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setAnimatedScore(Math.round(targetScore * e));
      if (t < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetScore]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const getLabelColor = (label?: string) => {
    switch (label) {
      case 'EXCELLENT':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'GOOD':
        return 'text-[#d9a4ff] bg-[#C57CF9]/10 border-[#C57CF9]/30';
      case 'FAIR':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'NEEDS_ATTENTION':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'CRITICAL':
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH':
        return {
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          text: 'High Confidence',
          badge: 'bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/20'
        };
      case 'MEDIUM':
        return {
          dot: 'bg-[#C57CF9] shadow-[0_0_8px_rgba(197,124,249,0.6)]',
          text: 'Medium Confidence',
          badge: 'bg-purple-500/[0.08] text-[#d9a4ff] border-purple-500/20'
        };
      case 'LOW':
      default:
        return {
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          text: 'Limited History',
          badge: 'bg-amber-500/[0.08] text-amber-300 border-amber-500/20'
        };
    }
  };

  const conf = getConfidenceBadge(health?.confidence);
  const netFlow = health ? Number(health.metrics.net_cash_flow) : 0;
  const savingsRate = health ? Number(health.metrics.savings_rate_pct) : 0;
  const runway = health ? Number(health.metrics.liquidity_coverage_months) : 0;

  // SVG Circular Gauge parameters
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <section className="glass-card p-6 md:p-8 relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-gradient-to-br from-[#3869D2]/20 to-[#C57CF9]/20 rounded-full blur-[70px] pointer-events-none -z-10" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Score Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            {/* SVG Radial Meter */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-white/[0.06]"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[url(#healthGradient)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3869D2" />
                  <stop offset="100%" stopColor="#C57CF9" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Score Number */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[2.6rem] font-black tracking-[-0.04em] bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent tabular-nums leading-none">
                {animatedScore}
              </span>
              <span className="text-[0.72rem] font-bold text-white/30 tracking-widest uppercase mt-1">
                Score / 100
              </span>
            </div>
          </div>

          {/* Score Header & Label Badge */}
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[0.75rem] font-bold tracking-[0.05em] uppercase border ${getLabelColor(
                  health?.label
                )}`}
              >
                {health?.label?.replace('_', ' ') || 'CALCULATING'}
              </span>

              {/* Confidence Badge */}
              <div
                title={health?.confidence_reason || 'Evaluating data completeness'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-medium border cursor-help ${conf.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                <span>{conf.text}</span>
              </div>
            </div>

            <h1 className="text-[1.6rem] sm:text-[1.8rem] font-extrabold tracking-[-0.02em] text-white">
              Financial Health Score
            </h1>

            <p className="text-[0.85rem] text-white/70 max-w-xl leading-relaxed">
              {health?.explanation?.summary ||
                'Aggregating transaction cash flows, discretionary spending, and tracked liquidity buffers.'}
            </p>
          </div>
        </div>

        {/* Right: Quick Key Metrics */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-8">
          {/* Net Flow */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-[12px] p-3.5 flex flex-col justify-between">
            <span className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider">
              Net Surplus
            </span>
            <div className="mt-2">
              <span
                className={`text-[1.15rem] font-black tabular-nums ${
                  netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {netFlow >= 0 ? '+' : ''}
                {currencySymbol}
                {netFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-[12px] p-3.5 flex flex-col justify-between">
            <span className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="mt-2">
              <span className="text-[1.15rem] font-black text-[#d9a4ff] tabular-nums">
                {savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Tracked Buffer */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-[12px] p-3.5 flex flex-col justify-between">
            <span className="text-[0.68rem] font-bold text-white/40 uppercase tracking-wider">
              Runway
            </span>
            <div className="mt-2">
              <span className="text-[1.15rem] font-black text-[#5a8aee] tabular-nums">
                {runway.toFixed(1)} mo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthScoreHero;
