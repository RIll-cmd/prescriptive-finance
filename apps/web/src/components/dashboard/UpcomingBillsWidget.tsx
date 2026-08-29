'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useBillStore } from '@/stores/bill-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStore } from '@/stores/dashboard-store';

export const UpcomingBillsWidget: React.FC = () => {
  const { bills, summary, fetchBills, openAddModal, openPayModal, isLoading } = useBillStore();
  const { user } = useAuthStore();
  const { toggleWidget } = useDashboardStore();

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const upcomingList = bills.filter(b => b.status === 'OVERDUE' || (b.status !== 'PAID' && b.days_until_due <= 30));

  return (
    <section className="glass-card p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px] text-[#3869D2]">receipt_long</span>
            <h2 className="text-[0.95rem] font-bold text-white/90 tracking-tight">Upcoming Bills</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openAddModal}
              title="Add New Bill"
              aria-label="Add bill"
              className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/40 hover:text-[#3869D2] hover:bg-[#3869D2]/[0.06] hover:scale-110 flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-rounded text-[20px]">add_circle</span>
            </button>
            <Link
              href="/bills"
              title="View all bills"
              aria-label="View all bills"
              className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/40 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all duration-200"
            >
              <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
            </Link>
            <button
              type="button"
              onClick={() => toggleWidget('bills')}
              title="Hide Upcoming Bills from Dashboard"
              aria-label="Hide Upcoming Bills"
              className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/20 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-rounded text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Overdue Banner */}
        {summary && summary.overdue_count > 0 && (
          <div className="mb-3 p-2.5 rounded-[8px] bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-[0.75rem]">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="material-symbols-rounded text-[16px]">error</span>
              <span>{summary.overdue_count} Overdue Bill{summary.overdue_count > 1 ? 's' : ''}</span>
            </div>
            <span className="font-bold text-rose-300 tabular-nums">
              {currencySymbol}{Number(summary.overdue_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Bills List */}
        {upcomingList.length === 0 ? (
          <div className="py-6 text-center flex flex-col items-center justify-center gap-1.5 text-white/30 text-[0.78rem]">
            <span className="material-symbols-rounded text-[24px] text-emerald-400">task_alt</span>
            <span>All upcoming bills paid and clear!</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {upcomingList.slice(0, 3).map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-2 rounded-[8px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${bill.color_hex}26`, color: bill.color_hex }}
                  >
                    <span className="material-symbols-rounded text-[15px]">{bill.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[0.8rem] font-semibold text-white truncate block">
                      {bill.name}
                    </span>
                    <span className={`text-[0.68rem] font-medium block ${bill.is_overdue ? 'text-rose-400' : 'text-white/40'}`}>
                      {bill.is_overdue
                        ? `Overdue (${Math.abs(bill.days_until_due)}d ago)`
                        : bill.days_until_due === 0
                        ? 'Due Today'
                        : `Due in ${bill.days_until_due}d`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[0.82rem] font-bold text-white tabular-nums">
                    {currencySymbol}{Number(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => openPayModal(bill)}
                    title="Pay bill"
                    className="px-2 py-1 rounded-[6px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[0.68rem] font-bold border border-emerald-500/30 transition-all shrink-0"
                  >
                    Pay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.72rem] text-white/40">
        <span>Total Due (30d):</span>
        <span className="font-bold text-white/80 tabular-nums">
          {currencySymbol}{Number(summary?.total_due_next_30d || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </section>
  );
};

export default UpcomingBillsWidget;
