'use client';

import React, { useEffect, useState } from 'react';
import { useTransactionStore } from '@/stores/transaction-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCategoryStore } from '@/stores/category-store';
import { TransactionType } from '@financial-os/shared-types';
import { getPeriodDateRange, TimePeriodPreset } from '@/stores/analytics-store';

export default function TransactionsPage() {
  const {
    transactions,
    totalCount,
    isLoading,
    hasMore,
    filters,
    fetchTransactions,
    loadMore,
    setFilter,
    setSearch,
    resetFilters,
    openAddModal,
    openDetailsModal,
  } = useTransactionStore();

  const { user, moneySources } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [searchInput, setSearchInput] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodPreset>('all');

  useEffect(() => {
    fetchCategories();
    fetchTransactions(true);
  }, [fetchCategories, fetchTransactions]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    setSearch(val);
  };

  const handlePeriodChange = (period: TimePeriodPreset) => {
    setSelectedPeriod(period);
    const range = getPeriodDateRange(period);
    setFilter({
      startDate: range.start_date,
      endDate: range.end_date,
    });
  };

  const TYPE_TABS: { label: string; value: TransactionType | 'ALL'; icon: string }[] = [
    { label: 'All', value: 'ALL', icon: 'list' },
    { label: 'Expenses', value: 'EXPENSE', icon: 'shopping_bag' },
    { label: 'Income', value: 'INCOME', icon: 'payments' },
    { label: 'Transfers', value: 'TRANSFER', icon: 'sync_alt' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Transactions Ledger
          </h1>
          <p className="text-[0.82rem] text-white/40 mt-0.5">
            Complete audit trail of all expenses, income, transfers, and reconciliations ({totalCount} entries)
          </p>
        </div>

        <button
          onClick={() => openAddModal('EXPENSE')}
          className="group relative flex items-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[12px] px-5 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_24px_rgba(56,105,210,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 overflow-hidden self-start sm:self-auto"
        >
          <span className="material-symbols-rounded text-[18px]">add_circle</span>
          <span>Add Transaction</span>
          <div className="absolute top-0 -left-full w-[60%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[130%] transition-[left] duration-700 pointer-events-none" />
        </button>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="glass-card p-5 space-y-4">
        {/* Row 1: Search & Type Filter Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 w-full md:w-[320px] focus-within:border-[#3869D2] focus-within:bg-[#3869D2]/[0.06] transition-all">
            <span className="material-symbols-rounded text-white/30 text-[18px] mr-2">search</span>
            <input
              type="text"
              placeholder="Search merchant, notes, account..."
              value={searchInput}
              onChange={handleSearchChange}
              className="bg-transparent border-none text-[0.85rem] text-white outline-none w-full placeholder:text-white/30"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                }}
                className="text-white/30 hover:text-white"
              >
                <span className="material-symbols-rounded text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[12px] w-full md:w-auto overflow-x-auto">
            {TYPE_TABS.map((tab) => {
              const isActive = filters.type === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter({ type: tab.value })}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-[0.78rem] font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white shadow-[0_2px_12px_rgba(56,105,210,0.3)]'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="material-symbols-rounded text-[15px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/[0.04]">
          {/* Category Filter */}
          <div>
            <label className="text-[0.62rem] font-semibold text-white/30 uppercase tracking-[0.05em] mb-1 block">
              Category
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => setFilter({ categoryId: e.target.value || undefined })}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[8px] px-2.5 py-1.5 text-[0.78rem] text-white/80 outline-none focus:border-[#3869D2]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="text-[0.62rem] font-semibold text-white/30 uppercase tracking-[0.05em] mb-1 block">
              Account
            </label>
            <select
              value={filters.moneySourceId || ''}
              onChange={(e) => setFilter({ moneySourceId: e.target.value || undefined })}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[8px] px-2.5 py-1.5 text-[0.78rem] text-white/80 outline-none focus:border-[#3869D2]"
            >
              <option value="">All Accounts</option>
              {moneySources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Period Filter */}
          <div>
            <label className="text-[0.62rem] font-semibold text-white/30 uppercase tracking-[0.05em] mb-1 block">
              Timeframe
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value as TimePeriodPreset)}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[8px] px-2.5 py-1.5 text-[0.78rem] text-white/80 outline-none focus:border-[#3869D2]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[0.62rem] font-semibold text-white/30 uppercase tracking-[0.05em] mb-1 block">
              Sort
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setFilter({
                  sortBy: sb as 'date' | 'amount' | 'created_at',
                  sortOrder: so as 'desc' | 'asc',
                });
              }}
              className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[8px] px-2.5 py-1.5 text-[0.78rem] text-white/80 outline-none focus:border-[#3869D2]"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="glass-card overflow-hidden">
        {isLoading && transactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-white/30 text-[0.85rem]">
            <span className="material-symbols-rounded animate-spin text-[28px] text-[#3869D2]">progress_activity</span>
            <span>Loading ledger...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30">
              <span className="material-symbols-rounded text-[28px]">search_off</span>
            </div>
            <div>
              <p className="text-[0.95rem] font-bold text-white/80">No transactions found</p>
              <p className="text-[0.78rem] text-white/40 mt-1 max-w-sm mx-auto">
                No records match your active filters or search terms. Try clearing your filters or record a new transaction.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-white text-[0.78rem] font-semibold transition-all"
              >
                Clear Filters
              </button>
              <button
                onClick={() => openAddModal('EXPENSE')}
                className="px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.78rem] font-bold shadow-md hover:scale-105 transition-all"
              >
                + Add Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01]">
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] p-4">
                    Details
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] p-4">
                    Category
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] p-4">
                    Account
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] p-4">
                    Amount
                  </th>
                  <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] p-4">
                    Date
                  </th>
                  <th className="text-right text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] p-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const isInc = txn.type === 'INCOME';
                  const isExp = txn.type === 'EXPENSE';
                  const isXfer = txn.type === 'TRANSFER';
                  const isAdj = txn.type === 'ADJUSTMENT';

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => openDetailsModal(txn)}
                      className="group border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] cursor-pointer transition-colors"
                    >
                      {/* Name & Merchant */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 shadow-sm"
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
                            <span className="material-symbols-rounded text-[18px]">
                              {txn.category_icon || (isInc ? 'payments' : isXfer ? 'sync_alt' : isAdj ? 'tune' : 'shopping_bag')}
                            </span>
                          </div>
                          <div>
                            <div className="text-[0.88rem] font-bold text-white group-hover:text-[#d9a4ff] transition-colors">
                              {txn.merchant || txn.category_name || (isXfer ? 'Account Transfer' : isAdj ? 'Balance Adjustment' : 'Transaction')}
                            </div>
                            {txn.description && (
                              <div className="text-[0.72rem] text-white/40 truncate max-w-xs">{txn.description}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-[0.82rem] text-white/60">
                        {isXfer ? (
                          <span className="text-purple-300 font-medium">Transfer</span>
                        ) : isAdj ? (
                          <span className="text-amber-300 font-medium">Audit Reconcile</span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: txn.category_color_hex || '#3869D2' }}
                            />
                            {txn.category_name || 'Uncategorized'}
                          </span>
                        )}
                      </td>

                      {/* Account */}
                      <td className="p-4 text-[0.82rem] text-white/60">
                        {isXfer ? (
                          <div className="flex items-center gap-1.5 text-[0.78rem]">
                            <span>{txn.money_source_name}</span>
                            <span className="material-symbols-rounded text-[14px] text-white/40">arrow_forward</span>
                            <span className="text-[#d9a4ff]">{txn.destination_money_source_name}</span>
                          </div>
                        ) : (
                          <span>{txn.money_source_name || 'Account'}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td
                        className={`p-4 text-[0.95rem] font-black tabular-nums ${
                          isInc ? 'text-emerald-400' : isExp ? 'text-white' : isXfer ? 'text-[#d9a4ff]' : 'text-amber-400'
                        }`}
                      >
                        {isInc ? '+' : isExp ? '-' : ''}
                        {currencySymbol}
                        {Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-[0.82rem] text-white/50 tabular-nums">
                        {new Date(txn.transaction_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailsModal(txn);
                          }}
                          className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/40 hover:text-white inline-flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-rounded text-[18px]">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="p-4 text-center border-t border-white/[0.06] bg-white/[0.01]">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-[12px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-semibold text-[0.82rem] transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-rounded animate-spin text-[16px]">progress_activity</span>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More Transactions</span>
                  <span className="material-symbols-rounded text-[16px]">expand_more</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
