'use client';

import React from 'react';
import { useFinancialHealthStore } from '@/stores/financial-health-store';
import { FinancialInsightItem } from '@financial-os/shared-types';

export const InsightsFeed: React.FC = () => {
  const { insights, dismissInsight } = useFinancialHealthStore();

  const items = insights?.insights || [];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          border: 'border-red-500/30 bg-red-500/[0.04]',
          badge: 'bg-red-500/10 text-red-400 border-red-500/30',
          icon: 'error'
        };
      case 'HIGH':
        return {
          border: 'border-amber-500/30 bg-amber-500/[0.04]',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: 'warning'
        };
      case 'MEDIUM':
        return {
          border: 'border-[#C57CF9]/30 bg-purple-500/[0.04]',
          badge: 'bg-purple-500/10 text-[#d9a4ff] border-purple-500/30',
          icon: 'info'
        };
      case 'INFO':
      default:
        return {
          border: 'border-blue-500/30 bg-blue-500/[0.04]',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: 'lightbulb'
        };
    }
  };

  return (
    <section className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[20px] text-[#C57CF9]">bolt</span>
          <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
            Actionable Intelligence Feed
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {insights?.critical_count ? (
            <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
              {insights.critical_count} Critical
            </span>
          ) : null}
          <span className="text-[0.72rem] text-white/40 font-semibold">
            {items.length} Active Insights
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-white/30 text-[0.82rem]">
          <span className="material-symbols-rounded text-[32px] text-emerald-400">check_circle</span>
          <span>All insights reviewed and cleared. Your finances are running smoothly!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const style = getPriorityStyle(item.priority);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-[12px] border ${style.border} flex items-start justify-between gap-4 transition-all duration-300 hover:border-white/20`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 border ${style.badge}`}>
                    <span className="material-symbols-rounded text-[18px]">{style.icon}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.85rem] font-bold text-white/95">
                        {item.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${style.badge}`}>
                        {item.priority}
                      </span>
                    </div>

                    <p className="text-[0.8rem] text-white/70 leading-relaxed">
                      {item.description}
                    </p>

                    {item.percentage_change !== null && item.percentage_change !== undefined && (
                      <div className="pt-1">
                        <span className="text-[0.72rem] font-semibold text-white/40 tabular-nums">
                          Magnitude:{' '}
                          <strong className="text-white/80">
                            {item.percentage_change > 0 ? '+' : ''}
                            {item.percentage_change.toFixed(1)}%
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => dismissInsight(item.id)}
                  title="Dismiss this insight"
                  aria-label="Dismiss insight"
                  className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/20 hover:text-white/70 hover:bg-white/[0.06] flex items-center justify-center cursor-pointer transition-all shrink-0"
                >
                  <span className="material-symbols-rounded text-[18px]">close</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default InsightsFeed;
