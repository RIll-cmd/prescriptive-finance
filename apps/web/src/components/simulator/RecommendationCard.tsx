'use client';

import React from 'react';

interface RecommendationCardProps {
  title: string;
  summary: string;
  tradeoffs: string[];
  riskLevel: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  summary,
  tradeoffs,
  riskLevel,
}) => {
  const isHighRisk = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  return (
    <div
      className={`glass-card p-6 rounded-[20px] space-y-4 border ${
        isHighRisk ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-[#3869D2]/30 bg-[#3869D2]/[0.02]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
            isHighRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-[#3869D2]/20 text-[#3869D2]'
          }`}
        >
          <span className="material-symbols-rounded text-[22px]">psychology</span>
        </div>

        <div>
          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-white/40 block">
            Simulator Decision Support
          </span>
          <h3 className="text-[1.05rem] font-bold text-white tracking-tight">{title}</h3>
        </div>
      </div>

      <p className="text-[0.82rem] text-white/80 leading-relaxed">{summary}</p>

      {tradeoffs && tradeoffs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <h4 className="text-[0.72rem] font-bold uppercase tracking-wider text-white/50">
            Key Strategic Trade-Offs
          </h4>
          <ul className="space-y-1.5">
            {tradeoffs.map((t, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[0.78rem] text-white/70">
                <span className="material-symbols-rounded text-[16px] text-[#C57CF9] mt-0.5">
                  check_circle
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
