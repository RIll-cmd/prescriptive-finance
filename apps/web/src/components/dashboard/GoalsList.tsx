'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useGoalStore } from '@/stores/goal-store';
import { useAuthStore } from '@/stores/auth-store';

export const GoalsList: React.FC = () => {
  const { goals, fetchGoals, openAddModal, openContributeModal, isLoading } = useGoalStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const getPaceBadge = (status?: string) => {
    switch (status) {
      case 'ON_TRACK':
        return { label: 'On Track', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'AT_RISK':
        return { label: 'At Risk', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'BEHIND':
        return { label: 'Behind', class: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'COMPLETED':
        return { label: 'Completed', class: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      default:
        return { label: 'Active', class: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
  };

  return (
    <section className="glass-card goals-card">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-2">
            <h2 className="text-[0.95rem] font-semibold text-white/80 tracking-[-0.01em]">
              Financial Goals
            </h2>
            <span className="text-[0.72rem] text-white/30 font-medium">
              ({goals.length})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openAddModal}
              title="Add New Goal"
              aria-label="Add goal"
              className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/40 hover:text-[#C57CF9] hover:bg-[#C57CF9]/[0.06] hover:scale-110 flex items-center justify-center transition-all duration-200"
            >
              <span className="material-symbols-rounded text-[20px]">add_circle</span>
            </button>
            <Link
              href="/goals"
              title="View all goals"
              aria-label="View all goals"
              className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/40 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all duration-200"
            >
              <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-white/30 text-[0.8rem]">
            <span className="material-symbols-rounded text-[28px] text-white/20">flag</span>
            <span>No goals created yet.</span>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-1 text-[0.75rem] font-semibold text-[#C57CF9] hover:underline"
            >
              + Create your first goal
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {goals.slice(0, 4).map((goal) => {
              const progress = goal.analytics?.progress_pct || 0;
              const pace = getPaceBadge(goal.analytics?.pace_status);

              return (
                <div
                  key={goal.id}
                  className="group flex gap-3.5 items-start p-2.5 rounded-[10px] bg-white/[0.01] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200"
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: `${goal.color_hex}26`,
                      color: goal.color_hex,
                    }}
                  >
                    <span className="material-symbols-rounded text-[18px]">{goal.icon}</span>
                  </div>

                  {/* Goal Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-[0.85rem] font-semibold text-white truncate max-w-[140px]">
                        {goal.name}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[0.62rem] font-bold uppercase tracking-wider border ${pace.class}`}>
                        {pace.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[0.72rem] text-white/40 mb-1.5 tabular-nums">
                      <span>
                        <strong className="text-white/80 font-bold">
                          {currencySymbol}{Number(goal.current_amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </strong>
                        /{currencySymbol}{Number(goal.target_amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                      <span className="font-semibold text-white/50">{progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden flex items-center">
                      <div
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: goal.color_hex,
                        }}
                        className="h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(197,124,249,0.3)]"
                      />
                    </div>
                  </div>

                  {/* Quick Allocate Action */}
                  <button
                    type="button"
                    onClick={() => openContributeModal(goal)}
                    title="Contribute to goal"
                    className="w-6 h-6 rounded-full bg-white/[0.04] text-white/30 hover:text-[#34d399] hover:bg-white/[0.08] flex items-center justify-center transition-all shrink-0 self-center"
                  >
                    <span className="material-symbols-rounded text-[16px]">add</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default GoalsList;
