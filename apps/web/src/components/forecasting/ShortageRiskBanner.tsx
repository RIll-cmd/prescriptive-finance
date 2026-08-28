'use client';

import React from 'react';
import { ShortageAlert } from '@financial-os/shared-types';
import { useAuthStore } from '@/stores/auth-store';

interface ShortageRiskBannerProps {
  shortage: ShortageAlert;
}

export const ShortageRiskBanner: React.FC<ShortageRiskBannerProps> = ({ shortage }) => {
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  if (!shortage || !shortage.has_shortage || shortage.risk_level === 'NONE') {
    return null;
  }

  const isCritical = shortage.risk_level === 'CRITICAL_DEFICIT';

  return (
    <div
      className={`p-5 rounded-[18px] border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isCritical
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${
            isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          <span className="material-symbols-rounded text-[22px]">
            {isCritical ? 'crisis_alert' : 'warning'}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-[0.95rem] font-bold text-white tracking-tight">{shortage.title}</h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${
                isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {shortage.risk_level.replace('_', ' ')}
            </span>
          </div>

          <p className="text-[0.78rem] text-white/80 leading-relaxed">{shortage.description}</p>

          {shortage.mitigation_advice && (
            <p className="text-[0.72rem] text-white/60 pt-0.5">
              <span className="font-bold text-white/80">Mitigation:</span> {shortage.mitigation_advice}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 self-end md:self-auto shrink-0 bg-white/[0.04] p-3 rounded-[12px] border border-white/[0.06]">
        {shortage.shortfall_amount > 0 && (
          <div className="text-right">
            <span className="text-[0.65rem] uppercase font-bold text-white/40 block">Max Deficit</span>
            <span className="text-[1.05rem] font-bold text-rose-400">
              –{currencySymbol}{shortage.shortfall_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {shortage.deficit_date && (
          <div className="text-right pl-3 border-l border-white/[0.08]">
            <span className="text-[0.65rem] uppercase font-bold text-white/40 block">Projected Date</span>
            <span className="text-[0.82rem] font-bold text-white">
              {new Date(shortage.deficit_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
