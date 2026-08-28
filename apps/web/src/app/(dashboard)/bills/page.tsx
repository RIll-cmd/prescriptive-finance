'use client';

import React, { useEffect, useState } from 'react';
import { useBillStore } from '@/stores/bill-store';
import { useAuthStore } from '@/stores/auth-store';

export default function BillsPage() {
  const {
    bills,
    summary,
    calendarItems,
    fetchBills,
    fetchCalendar,
    openAddModal,
    openPayModal,
    deleteBill,
    isLoading
  } = useBillStore();
  const { user } = useAuthStore();

  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useEffect(() => {
    if (viewMode === 'CALENDAR') {
      fetchCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);
    }
  }, [viewMode, currentDate, fetchCalendar]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Bills & Obligations Center
          </h1>
          <p className="text-[0.82rem] text-white/40 mt-0.5">
            Manage recurring liabilities, prevent overdue surprises, and track payment schedules
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[12px]">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-[9px] text-[0.75rem] font-semibold transition-all ${
                viewMode === 'LIST' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1.5 rounded-[9px] text-[0.75rem] font-semibold transition-all ${
                viewMode === 'CALENDAR' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              Calendar
            </button>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-[#3869D2] to-[#5a8aee] text-white text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(56,105,210,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-rounded text-[18px]">add</span>
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Due (Next 30 Days)</span>
          <span className="text-[1.3rem] font-black text-white tabular-nums">
            {currencySymbol}{Number(summary?.total_due_next_30d || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Active Bills</span>
          <span className="text-[1.3rem] font-black text-white/80 tabular-nums">
            {summary?.bills_count || 0}
          </span>
        </div>

        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Overdue Count</span>
          <span className={`text-[1.3rem] font-black tabular-nums ${summary && summary.overdue_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {summary?.overdue_count || 0}
          </span>
        </div>

        <div className="glass-card p-4 rounded-[14px]">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block mb-1">Overdue Amount</span>
          <span className={`text-[1.3rem] font-black tabular-nums ${summary && summary.overdue_count > 0 ? 'text-rose-400' : 'text-white/40'}`}>
            {currencySymbol}{Number(summary?.overdue_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'LIST' ? (
        <div className="space-y-4">
          {bills.length === 0 ? (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3 text-white/30 rounded-[18px]">
              <span className="material-symbols-rounded text-[48px] text-white/10">receipt_long</span>
              <p className="text-[0.95rem]">No bills registered yet.</p>
              <button
                type="button"
                onClick={openAddModal}
                className="px-4 py-2 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-white text-[0.8rem] font-semibold transition-all"
              >
                + Add your first bill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bills.map((bill) => {
                const isOverdue = bill.is_overdue;

                return (
                  <div
                    key={bill.id}
                    className={`glass-card p-5 rounded-[16px] flex flex-col justify-between transition-all hover:border-white/20 ${
                      isOverdue ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''
                    }`}
                  >
                    <div>
                      {/* Bill Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${bill.color_hex}26`, color: bill.color_hex }}
                          >
                            <span className="material-symbols-rounded text-[20px]">{bill.icon}</span>
                          </div>
                          <div>
                            <h3 className="text-[0.95rem] font-bold text-white tracking-tight">{bill.name}</h3>
                            {bill.category_name && (
                              <span className="text-[0.72rem] text-white/40">{bill.category_name}</span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${
                            isOverdue
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : bill.status === 'PAID'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : bill.status}
                        </span>
                      </div>

                      {/* Amount & Due Date */}
                      <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-[12px] mb-4 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[0.7rem] text-white/40 font-bold uppercase">Amount Due</span>
                          <span className="text-[1.2rem] font-black text-white tabular-nums">
                            {currencySymbol}{Number(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[0.75rem]">
                          <span className="text-white/40">Due Date:</span>
                          <span className={`font-semibold ${isOverdue ? 'text-rose-400' : 'text-white/90'}`}>
                            {new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' '}({isOverdue ? `${Math.abs(bill.days_until_due)}d overdue` : bill.days_until_due === 0 ? 'Today' : `in ${bill.days_until_due}d`})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[0.72rem] text-white/40 pt-1 border-t border-white/[0.04]">
                          <span>Schedule:</span>
                          <span className="text-white/70 font-medium">
                            {bill.is_recurring ? `Recurring (${bill.frequency.toLowerCase()})` : 'One-time'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => deleteBill(bill.id)}
                        className="w-8 h-8 rounded-[8px] bg-white/[0.04] text-white/30 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                        title="Delete bill"
                      >
                        <span className="material-symbols-rounded text-[18px]">delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openPayModal(bill)}
                        className="px-4 py-1.5 rounded-[8px] bg-gradient-to-r from-[#10b981] to-[#34d399] text-black text-[0.78rem] font-bold shadow-[0_2px_8px_rgba(52,211,153,0.3)] hover:opacity-95 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-[16px]">check</span>
                        <span>Pay Bill</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Calendar Matrix View */
        <div className="glass-card p-6 rounded-[18px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[1.1rem] font-bold text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="w-8 h-8 rounded-[8px] bg-white/[0.04] text-white/60 hover:text-white flex items-center justify-center transition-all"
              >
                <span className="material-symbols-rounded text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="w-8 h-8 rounded-[8px] bg-white/[0.04] text-white/60 hover:text-white flex items-center justify-center transition-all"
              >
                <span className="material-symbols-rounded text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[0.72rem] font-bold text-white/40 mb-2 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Render Calendar Day Items */}
          <div className="space-y-2">
            {calendarItems.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-[0.85rem]">
                No bills scheduled for this month.
              </div>
            ) : (
              <div className="space-y-2">
                {calendarItems.map((item) => (
                  <div
                    key={item.date}
                    className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-[10px] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[0.85rem] font-bold text-white/80 min-w-[70px]">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.bills.map((b) => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 rounded-[6px] text-[0.72rem] font-semibold bg-white/[0.06] text-white/90 border border-white/10"
                          >
                            {b.name} ({currencySymbol}{Number(b.amount).toLocaleString('en-US', { minimumFractionDigits: 0 })})
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="font-extrabold text-[#3869D2] text-[0.9rem] tabular-nums">
                      {currencySymbol}{Number(item.total_due).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
