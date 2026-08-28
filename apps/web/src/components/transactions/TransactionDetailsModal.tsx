'use client';

import React, { useState } from 'react';
import { useTransactionStore } from '@/stores/transaction-store';
import { useAuthStore } from '@/stores/auth-store';

export const TransactionDetailsModal: React.FC = () => {
  const { isDetailsModalOpen, selectedTransaction, closeModals, openEditModal, deleteTransaction } =
    useTransactionStore();
  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isDetailsModalOpen || !selectedTransaction) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const txn = selectedTransaction;
  const isExpense = txn.type === 'EXPENSE';
  const isIncome = txn.type === 'INCOME';
  const isTransfer = txn.type === 'TRANSFER';
  const isAdjustment = txn.type === 'ADJUSTMENT';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTransaction(txn.id);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[460px] rounded-[24px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wider uppercase ${
                isIncome
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isExpense
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : isTransfer
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {txn.type}
            </span>
          </div>

          <button
            type="button"
            onClick={closeModals}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {/* Main Amount & Title */}
        <div className="text-center my-4">
          <div
            className={`text-[2.2rem] font-black tracking-tight tabular-nums ${
              isIncome
                ? 'text-emerald-400'
                : isExpense
                ? 'text-white'
                : isTransfer
                ? 'text-[#d9a4ff]'
                : 'text-amber-400'
            }`}
          >
            {isIncome ? '+' : isExpense ? '-' : ''}
            {currencySymbol}
            {Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <h3 className="text-[1.1rem] font-bold text-white/90 mt-1">
            {txn.merchant || txn.category_name || (isTransfer ? 'Account Transfer' : 'Transaction')}
          </h3>
          {txn.description && (
            <p className="text-[0.82rem] text-white/50 mt-1 max-w-sm mx-auto">{txn.description}</p>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[16px] p-4 my-6 space-y-3">
          {/* Category */}
          {!isTransfer && (
            <div className="flex items-center justify-between text-[0.82rem]">
              <span className="text-white/40">Category</span>
              <span className="font-semibold text-white/90 flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: txn.category_color_hex || '#3869D2' }}
                />
                {txn.category_name || 'Uncategorized'}
              </span>
            </div>
          )}

          {/* Money Source / Origin */}
          <div className="flex items-center justify-between text-[0.82rem]">
            <span className="text-white/40">{isTransfer ? 'From Source' : 'Account'}</span>
            <span className="font-semibold text-white/90">{txn.money_source_name || 'Account'}</span>
          </div>

          {/* Destination Source (if transfer) */}
          {isTransfer && (
            <div className="flex items-center justify-between text-[0.82rem]">
              <span className="text-white/40">To Destination</span>
              <span className="font-semibold text-[#d9a4ff]">
                {txn.destination_money_source_name || 'Destination Account'}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center justify-between text-[0.82rem]">
            <span className="text-white/40">Transaction Date</span>
            <span className="font-semibold text-white/90 tabular-nums">
              {new Date(txn.transaction_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Logged Source */}
          <div className="flex items-center justify-between text-[0.82rem]">
            <span className="text-white/40">Ingestion Method</span>
            <span className="font-medium text-white/60 uppercase text-[0.72rem] tracking-wider">
              {txn.source}
            </span>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {confirmDelete && (
          <div className="mb-4 p-3.5 rounded-[12px] bg-red-500/10 border border-red-500/30 text-red-200 text-[0.8rem] animate-[cardReveal_0.2s_ease-out]">
            <p className="font-bold mb-1">Delete this transaction?</p>
            <p className="text-white/60 text-[0.75rem] mb-3">
              Your account balance will be automatically restored by reversing this transaction's amount.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 rounded-[6px] bg-white/10 text-white text-[0.75rem] font-semibold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 rounded-[6px] bg-red-500 text-white text-[0.75rem] font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!confirmDelete && (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-[8px] text-[0.8rem] font-semibold transition-all"
            >
              <span className="material-symbols-rounded text-[18px]">delete</span>
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={() => openEditModal(txn)}
              className="flex items-center gap-1.5 bg-[#3869D2]/20 border border-[#3869D2]/40 text-blue-300 hover:bg-[#3869D2]/30 px-4 py-2 rounded-[10px] text-[0.82rem] font-bold transition-all shadow-[0_2px_12px_rgba(56,105,210,0.2)]"
            >
              <span className="material-symbols-rounded text-[18px]">edit</span>
              <span>Edit Transaction</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
