'use client';

import React, { useEffect, useState } from 'react';
import { useGoalStore } from '@/stores/goal-store';
import { useAuthStore } from '@/stores/auth-store';
import { Goal } from '@financial-os/shared-types';

export default function GoalsPage() {
  const {
    goals,
    summary,
    fetchGoals,
    openAddModal,
    openContributeModal,
    deleteGoal,
    fetchContributions,
    contributions,
    isLoading
  } = useGoalStore();
  const { user } = useAuthStore();

  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const filteredGoals = goals.filter((g) => {
    if (tab === 'ACTIVE') return g.status === 'ACTIVE' || g.status === 'OVERDUE' || g.status === 'PAUSED';
    if (tab === 'COMPLETED') return g.status === 'COMPLETED';
    return true;
  });

  const getPaceBadge = (status?: string) => {
    switch (status) {
      case 'ON_TRACK':
        return { label: 'On Track', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'AT_RISK':
        return { label: 'At Risk', class: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'BEHIND':
        return { label: 'Behind', class: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'OVERDUE':
        return { label: 'Overdue', class: 'text-red-400 bg-red-500/10 border-red-500/30' };
      case 'COMPLETED':
        return { label: 'Completed', class: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      default:
        return { label: 'Active', class: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
  };

  const handleToggleHistory = async (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
      await fetchContributions(goalId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Financial Goals Center
          </h1>
          <p className="text-[0.82rem] text-white/40 mt-0.5">
            Track your milestones, forecast arrival dates, and calculate required periodic contributions
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(197,124,249,0.3)] hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="material-symbols-rounded text-[18px]">add</span>
          <span>New Goal</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Total Saved</span>
          <span className="text-[1.3rem] font-black text-white tabular-nums">
            {currencySymbol}{Number(summary?.total_current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Total Target</span>
          <span className="text-[1.3rem] font-black text-white/80 tabular-nums">
            {currencySymbol}{Number(summary?.total_target_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Required Monthly</span>
          <span className="text-[1.3rem] font-black text-[#C57CF9] tabular-nums">
            {currencySymbol}{Number(summary?.total_required_monthly || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Milestones Met</span>
          <span className="text-[1.3rem] font-black text-emerald-400 tabular-nums">
            {summary?.completed_count || 0} / {summary?.total_count || 0}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[12px] w-fit">
        {(['ACTIVE', 'COMPLETED', 'ALL'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-[9px] text-[0.75rem] font-semibold transition-all ${
              tab === t
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {t === 'ACTIVE' ? `Active (${summary?.active_count || 0})` : t === 'COMPLETED' ? `Completed (${summary?.completed_count || 0})` : `All (${summary?.total_count || 0})`}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3 text-white/30 rounded-[18px]">
          <span className="material-symbols-rounded text-[48px] text-white/10">flag</span>
          <p className="text-[0.95rem]">No goals found in this view.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-white text-[0.8rem] font-semibold transition-all"
          >
            + Create a Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => {
            const pace = getPaceBadge(goal.analytics?.pace_status);
            const progress = goal.analytics?.progress_pct || 0;
            const isExpanded = expandedGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className="glass-card p-6 rounded-[18px] flex flex-col justify-between transition-all hover:border-white/20"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${goal.color_hex}26`, color: goal.color_hex }}
                      >
                        <span className="material-symbols-rounded text-[22px]">{goal.icon}</span>
                      </div>
                      <div>
                        <h2 className="text-[1.05rem] font-bold text-white tracking-tight">{goal.name}</h2>
                        {goal.description && (
                          <p className="text-[0.75rem] text-white/40 line-clamp-1">{goal.description}</p>
                        )}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider border ${pace.class}`}>
                      {pace.label}
                    </span>
                  </div>

                  {/* Amounts & Progress */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between text-[0.85rem] mb-1.5 tabular-nums">
                      <span className="text-[1.2rem] font-extrabold text-white">
                        {currencySymbol}{Number(goal.current_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-white/40 font-semibold">
                        Target: {currencySymbol}{Number(goal.target_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden flex items-center">
                      <div
                        style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color_hex }}
                        className="h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(197,124,249,0.4)]"
                      />
                    </div>
                  </div>

                  {/* Analytics Matrix */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-[0.75rem]">
                    <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-[10px]">
                      <span className="text-white/40 block text-[0.65rem] font-bold uppercase">Required Pace</span>
                      <span className="text-white font-bold tabular-nums">
                        {currencySymbol}{Number(goal.analytics?.required_monthly_contribution || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}/mo
                      </span>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-[10px]">
                      <span className="text-white/40 block text-[0.65rem] font-bold uppercase">Estimated Finish</span>
                      <span className="text-white font-bold">
                        {goal.analytics?.estimated_completion_date
                          ? new Date(goal.analytics.estimated_completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : goal.target_date
                          ? new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'Ongoing'}
                      </span>
                    </div>
                  </div>

                  {/* Contribution History Drawer */}
                  {isExpanded && (
                    <div className="mb-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-[12px] space-y-2">
                      <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block">
                        Contribution Ledger
                      </span>

                      {contributions.length === 0 ? (
                        <p className="text-[0.75rem] text-white/30 py-2 text-center">No contributions logged yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                          {contributions.map((c) => (
                            <div key={c.id} className="flex items-center justify-between text-[0.75rem]">
                              <span className="text-white/60">
                                {new Date(c.contribution_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="font-bold text-emerald-400 tabular-nums">
                                +{currencySymbol}{Number(c.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleToggleHistory(goal.id)}
                    className="text-[0.75rem] text-white/40 hover:text-white transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-rounded text-[16px]">
                      {isExpanded ? 'expand_less' : 'history'}
                    </span>
                    <span>{isExpanded ? 'Hide History' : 'History'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      title="Delete Goal"
                      className="w-8 h-8 rounded-[8px] bg-white/[0.04] text-white/30 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                    >
                      <span className="material-symbols-rounded text-[18px]">delete</span>
                    </button>

                    {goal.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => openContributeModal(goal)}
                        className="px-3.5 py-1.5 rounded-[8px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[0.78rem] font-bold transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-[16px]">add</span>
                        <span>Contribute</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
