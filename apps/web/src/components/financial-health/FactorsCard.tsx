'use client';

import React from 'react';
import { useFinancialHealthStore } from '@/stores/financial-health-store';

export const FactorsCard: React.FC = () => {
  const { health } = useFinancialHealthStore();

  const positives = health?.explanation?.positive_factors || [];
  const negatives = health?.explanation?.negative_factors || [];
  const suggestions = health?.explanation?.suggestions || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* What's Going Well */}
      <section className="glass-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">check_circle</span>
            </div>
            <div>
              <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
                What's Going Well
              </h2>
              <span className="text-[0.72rem] text-white/40">Positive financial drivers</span>
            </div>
          </div>

          {positives.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-[0.82rem]">
              Add more transaction entries to establish positive milestones.
            </div>
          ) : (
            <ul className="space-y-3">
              {positives.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-[0.82rem] text-white/80 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-[10px]"
                >
                  <span className="material-symbols-rounded text-[18px] text-emerald-400 shrink-0 mt-0.5">
                    check
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Needs Attention & Recommendations */}
      <section className="glass-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">warning</span>
            </div>
            <div>
              <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
                Needs Attention
              </h2>
              <span className="text-[0.72rem] text-white/40">Opportunities for improvement</span>
            </div>
          </div>

          {negatives.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-[0.82rem] flex flex-col items-center gap-1.5">
              <span className="material-symbols-rounded text-[24px] text-emerald-400">verified</span>
              <span>No critical flags detected for this period. Great job!</span>
            </div>
          ) : (
            <ul className="space-y-3">
              {negatives.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-[0.82rem] text-white/80 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-[10px]"
                >
                  <span className="material-symbols-rounded text-[18px] text-amber-400 shrink-0 mt-0.5">
                    priority_high
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actionable Suggestions Footer */}
        {suggestions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/[0.06] bg-gradient-to-r from-[#3869D2]/[0.08] to-[#C57CF9]/[0.08] p-3.5 rounded-[12px] border border-white/[0.08]">
            <div className="flex items-center gap-1.5 mb-1.5 text-[#d9a4ff] text-[0.75rem] font-bold uppercase tracking-wider">
              <span className="material-symbols-rounded text-[16px]">lightbulb</span>
              <span>Recommended Next Action</span>
            </div>
            <p className="text-[0.8rem] text-white/80 leading-relaxed">
              {suggestions[0]}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FactorsCard;
