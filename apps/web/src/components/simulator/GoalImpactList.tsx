'use client';

import React from 'react';
import { GoalImpactItem } from '@financial-os/shared-types';
import { useAuthStore } from '@/stores/auth-store';

interface GoalImpactListProps {
  goalsImpact: GoalImpactItem[];
}

export const GoalImpactList: React.FC<GoalImpactListProps> = ({ goalsImpact }) => {
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  if (!goalsImpact || goalsImpact.length === 0) {
    return (
      <div className="glass-card p-6 rounded-[20px] text-center border border-white/10">
        <span className="material-symbols-rounded text-[28px] text-white/20 mb-2">flag</span>
        <h4 className="text-[0.88rem] font-bold text-white/70">No Active Goals Impacted</h4>
        <p className="text-[0.72rem] text-white/40 max-w-sm mx-auto mt-1">
          You currently have no active goals registered. Add financial goals in the Goals tab to track delay impacts.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-[20px] space-y-4 border border-white/10">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1rem] font-bold text-white tracking-tight">
            Active Financial Goals Impact
          </h3>
          <p className="text-[0.72rem] text-white/40">
            Downstream delay or acceleration on your target completion dates
          </p>
        </div>

        <span className="text-[0.72rem] font-bold text-white/40">
          {goalsImpact.length} Goal{goalsImpact.length > 1 ? 's' : ''} Analyzed
        </span>
      </div>

      <div className="space-y-3">
        {goalsImpact.map((g) => {
          const isDelayed = g.delay_months > 0;
          const isAccelerated = g.delay_months < 0;

          return (
            <div
              key={g.goal_id}
              className="p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${
                    isDelayed
                      ? 'bg-rose-500/20 text-rose-400'
                      : isAccelerated
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  <span className="material-symbols-rounded text-[20px]">
                    {isDelayed ? 'schedule' : isAccelerated ? 'speed' : 'flag'}
                  </span>
                </div>

                <div>
                  <h4 className="text-[0.88rem] font-bold text-white">{g.goal_name}</h4>
                  <div className="flex items-center gap-2 text-[0.72rem] text-white/40 mt-0.5">
                    <span>Target: {currencySymbol}{g.target_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span>•</span>
                    <span>
                      Required Pace: {currencySymbol}{g.required_monthly_scenario.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right text-[0.75rem]">
                  <span className="text-white/40 block text-[0.68rem]">Projected Completion</span>
                  <span className="font-bold text-white">
                    {g.scenario_finish_date
                      ? new Date(g.scenario_finish_date).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Timeline unaffected'}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-[8px] text-[0.72rem] font-bold border ${
                    isDelayed
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : isAccelerated
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {isDelayed
                    ? `+${g.delay_months} mo delay`
                    : isAccelerated
                    ? `${Math.abs(g.delay_months)} mo faster`
                    : 'On Track'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
