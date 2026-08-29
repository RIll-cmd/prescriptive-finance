'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTransactionStore } from '@/stores/transaction-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Transaction } from '@financial-os/shared-types';
import { transactionsApi } from '@/features/transactions/api';

export const TransactionsTable: React.FC = () => {
  const { openDetailsModal, openAddModal } = useTransactionStore();
  const { user } = useAuthStore();
  const { toggleWidget } = useDashboardStore();
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const res = await transactionsApi.list({ limit: 5, sort_by: 'date', sort_order: 'desc' });
      setRecentTxns(res.items || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRecent();
  }, []);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  return (
    <section className="glass-card transactions-card col-span-1 lg:col-span-2">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-2">
            <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
              Recent Transactions
            </h2>
            <button
              onClick={() => openAddModal('EXPENSE')}
              title="Add Transaction"
              className="w-6 h-6 rounded-[6px] bg-white/[0.04] hover:bg-[#3869D2]/20 text-white/40 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
            >
              <span className="material-symbols-rounded text-[16px]">add</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 bg-[#C57CF9]/[0.12] border border-[#C57CF9]/30 rounded-full px-3.5 py-1.5 text-[#d9a4ff] text-[0.75rem] font-semibold hover:bg-[#C57CF9]/20 transition-all duration-200"
            >
              <span>View all ledger</span>
              <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
            </Link>
            <button
              type="button"
              onClick={() => toggleWidget('transactions')}
              title="Hide Transactions from Dashboard"
              aria-label="Hide Transactions"
              className="w-7 h-7 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-white/20 hover:text-white flex items-center justify-center transition-all border border-white/[0.06] cursor-pointer"
            >
              <span className="material-symbols-rounded text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-white/30 text-[0.82rem]">
            <span className="material-symbols-rounded animate-spin text-[24px]">progress_activity</span>
            <span>Loading transactions...</span>
          </div>
        ) : recentTxns.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30">
              <span className="material-symbols-rounded text-[24px]">receipt_long</span>
            </div>
            <div>
              <p className="text-[0.85rem] font-medium text-white/70">No transactions recorded yet</p>
              <p className="text-[0.75rem] text-white/30 mt-0.5">Start tracking your daily expenses and income</p>
            </div>
            <button
              onClick={() => openAddModal('EXPENSE')}
              className="mt-1 px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.78rem] font-bold shadow-[0_2px_12px_rgba(56,105,210,0.3)] hover:scale-105 transition-all"
            >
              + Record First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                    Merchant / Category
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                    Amount
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                    Account
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                    Type
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((txn, idx) => {
                  const isInc = txn.type === 'INCOME';
                  const isExp = txn.type === 'EXPENSE';
                  const isXfer = txn.type === 'TRANSFER';

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => openDetailsModal(txn)}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                        transition: `all 0.35s cubic-bezier(0.16,1,0.3,1) ${0.1 + idx * 0.05}s`,
                      }}
                      className="group border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] cursor-pointer transition-all duration-200"
                    >
                      {/* Name / Category */}
                      <td className="p-3 text-[0.82rem] text-white/50 group-hover:text-white/90 transition-colors">
                        <div className="flex items-center gap-2.5 font-medium text-white">
                          <div
                            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-sm"
                            style={{
                              backgroundColor: txn.category_color_hex
                                ? `${txn.category_color_hex}26`
                                : isInc
                                ? '#10B98126'
                                : isXfer
                                ? '#C57CF926'
                                : '#3869D226',
                              color: txn.category_color_hex || (isInc ? '#34d399' : isXfer ? '#d9a4ff' : '#5a8aee'),
                            }}
                          >
                            <span className="material-symbols-rounded text-[16px]">
                              {txn.category_icon || (isInc ? 'payments' : isXfer ? 'sync_alt' : 'shopping_bag')}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-[0.82rem] font-semibold truncate max-w-[140px]">
                              {txn.merchant || txn.category_name || (isXfer ? 'Transfer' : 'Transaction')}
                            </span>
                            {txn.description && (
                              <span className="text-[0.68rem] text-white/40 truncate max-w-[140px]">
                                {txn.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td
                        className={`p-3 text-[0.85rem] font-bold tabular-nums ${
                          isInc ? 'text-emerald-400' : isExp ? 'text-white' : 'text-[#d9a4ff]'
                        }`}
                      >
                        {isInc ? '+' : isExp ? '-' : ''}
                        {currencySymbol}
                        {Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Card / Account */}
                      <td className="p-3 text-[0.8rem] text-white/50 group-hover:text-white/80 tabular-nums">
                        {txn.money_source_name || 'Account'}
                      </td>

                      {/* Type Badge */}
                      <td className="p-3 text-[0.8rem]">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider ${
                            isInc
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isExp
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : isXfer
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-3 text-[0.78rem] text-white/40 group-hover:text-white/70 tabular-nums">
                        {new Date(txn.transaction_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionsTable;
