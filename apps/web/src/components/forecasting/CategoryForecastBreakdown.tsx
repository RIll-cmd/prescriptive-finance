'use client';

import React from 'react';
import { ExpenseForecastCategory } from '@financial-os/shared-types';
import { useAuthStore } from '@/stores/auth-store';

interface CategoryForecastBreakdownProps {
  categories: ExpenseForecastCategory[];
  totalProjectedExpenses: number;
}

export const CategoryForecastBreakdown: React.FC<CategoryForecastBreakdownProps> = ({
  categories,
  totalProjectedExpenses,
}) => {
  const { user } = useAuthStore();
  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6 rounded-[20px] space-y-4 border border-white/10">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1rem] font-bold text-white tracking-tight">
            Projected Spending by Category
          </h3>
          <p className="text-[0.72rem] text-white/40">
            Combined total of upcoming fixed obligations and variable estimated burn
          </p>
        </div>

        <span className="text-[0.8rem] font-bold text-white/80">
          Total: {currencySymbol}{totalProjectedExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="space-y-3">
        {categories.slice(0, 6).map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-[0.78rem]">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color_hex || '#3869D2' }}
                />
                <span className="font-bold text-white">{cat.category_name}</span>
                {cat.known_bills_amount > 0 && (
                  <span className="text-[0.68rem] text-white/40">
                    ({currencySymbol}{cat.known_bills_amount.toLocaleString('en-US')} bills)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {currencySymbol}{cat.total_projected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[0.7rem] text-white/40 w-10 text-right">
                  {cat.percentage_of_total.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(2, cat.percentage_of_total))}%`,
                  backgroundColor: cat.color_hex || '#3869D2',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
