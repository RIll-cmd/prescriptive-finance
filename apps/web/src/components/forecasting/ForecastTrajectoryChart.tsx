'use client';

import React from 'react';
import { ForecastTrajectoryPoint } from '@financial-os/shared-types';
import { useAuthStore } from '@/stores/auth-store';

interface ForecastTrajectoryChartProps {
  trajectory: ForecastTrajectoryPoint[];
  emergencyReserveTarget: number;
}

export const ForecastTrajectoryChart: React.FC<ForecastTrajectoryChartProps> = ({
  trajectory,
  emergencyReserveTarget,
}) => {
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  if (!trajectory || trajectory.length === 0) {
    return null;
  }

  // Calculate scaling
  const balances = trajectory.map((p) => p.projected_balance);
  const minBal = Math.min(...balances, 0);
  const maxBal = Math.max(...balances, emergencyReserveTarget, 1000);
  const range = maxBal - minBal || 1;

  const points = trajectory.map((p, idx) => {
    const x = (idx / (trajectory.length - 1 || 1)) * 100;
    const y = 100 - ((p.projected_balance - minBal) / range) * 85 - 10;
    return { x, y, point: p };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  const reserveY = 100 - ((emergencyReserveTarget - minBal) / range) * 85 - 10;

  return (
    <div className="glass-card p-6 rounded-[20px] space-y-4 border border-white/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
            Projected Cash Trajectory
          </h3>
          <p className="text-[0.72rem] text-white/40">
            Day-by-day cash trajectory simulating income events, known bills, and baseline spending burn
          </p>
        </div>

        <div className="flex items-center gap-4 text-[0.72rem]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3869D2]" />
            <span className="text-white/60">Projected Balance</span>
          </div>

          {emergencyReserveTarget > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-400 border-dashed" />
              <span className="text-amber-300">
                Reserve Target ({currencySymbol}{emergencyReserveTarget.toLocaleString('en-US')})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative h-56 w-full pt-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="forecastAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3869D2" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3869D2" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Emergency Reserve Guide Line */}
          {emergencyReserveTarget > 0 && reserveY >= 0 && reserveY <= 100 && (
            <line
              x1="0"
              y1={reserveY}
              x2="100"
              y2={reserveY}
              stroke="#fbbf24"
              strokeDasharray="2 2"
              strokeWidth="0.6"
              opacity="0.7"
            />
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#forecastAreaGrad)" />

          {/* Trajectory Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3869D2"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Event Dots */}
          {points.map((pt, i) => {
            if (pt.point.known_income > 0 || pt.point.known_expenses > 0 || pt.point.is_below_reserve) {
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="1.8"
                  className={
                    pt.point.is_negative
                      ? 'fill-rose-500 stroke-black stroke-1'
                      : pt.point.known_income > 0
                      ? 'fill-emerald-400 stroke-black stroke-1'
                      : pt.point.is_below_reserve
                      ? 'fill-amber-400 stroke-black stroke-1'
                      : 'fill-[#C57CF9] stroke-black stroke-1'
                  }
                />
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Date markers footer */}
      <div className="flex justify-between text-[0.68rem] text-white/40 pt-2 border-t border-white/[0.04]">
        <span>{trajectory[0]?.day_label || 'Today'}</span>
        <span>{trajectory[Math.floor(trajectory.length / 2)]?.day_label}</span>
        <span>{trajectory[trajectory.length - 1]?.day_label}</span>
      </div>
    </div>
  );
};
