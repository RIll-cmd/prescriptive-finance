'use client';

import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '@/stores/transaction-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCategoryStore } from '@/stores/category-store';
import { TransactionType } from '@financial-os/shared-types';

export const AddTransactionModal: React.FC = () => {
  const { isAddModalOpen, prefilledType, closeModals, createTransaction } = useTransactionStore();
  const { moneySources, user, openAddSourceModal } = useAuthStore();
  const { categories, fetchCategories, openAddModal: openAddCategoryModal } = useCategoryStore();

  const [type, setType] = useState<TransactionType>(prefilledType || 'EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [destSourceId, setDestSourceId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAddModalOpen) {
      setType(prefilledType || 'EXPENSE');
      setAmount('');
      setMerchant('');
      setDescription('');
      setErrorMsg(null);
      setTransactionDate(new Date().toISOString().split('T')[0]);

      if (moneySources.length > 0) {
        setSourceId(moneySources[0].id);
        if (moneySources.length > 1) {
          setDestSourceId(moneySources[1].id);
        } else {
          setDestSourceId('');
        }
      }

      fetchCategories();
    }
  }, [isAddModalOpen, prefilledType, moneySources, fetchCategories]);

  useEffect(() => {
    // Select default category matching the type
    if (categories.length > 0 && !categoryId) {
      const match = categories.find((c) => c.type === (type === 'INCOME' ? 'INCOME' : 'EXPENSE'));
      if (match) setCategoryId(match.id);
    }
  }, [categories, type, categoryId]);

  if (!isAddModalOpen) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const filteredCategories = categories.filter((c) =>
    type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!sourceId) {
      setErrorMsg('Please select or create a money source.');
      return;
    }

    if (type === 'TRANSFER') {
      if (!destSourceId) {
        setErrorMsg('Please select a destination money source for transfer.');
        return;
      }
      if (sourceId === destSourceId) {
        setErrorMsg('Origin and destination sources must be different.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        type,
        amount: numAmount,
        money_source_id: sourceId,
        destination_money_source_id: type === 'TRANSFER' ? destSourceId : undefined,
        category_id: type === 'TRANSFER' ? undefined : categoryId || undefined,
        merchant: merchant.trim() || undefined,
        description: description.trim() || undefined,
        transaction_date: transactionDate,
        source: 'MANUAL',
      });
      closeModals();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[500px] rounded-[24px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#3869D2]/10 blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[#C57CF9]/10 blur-[60px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_2px_12px_rgba(56,105,210,0.3)]">
              <span className="material-symbols-rounded text-[18px] text-white">add_circle</span>
            </div>
            <h2 className="text-[1.15rem] font-bold tracking-tight">New Transaction</h2>
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

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.04] border border-white/[0.06] rounded-[12px] mb-5">
          {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((t) => {
            const isActive = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-[9px] text-[0.78rem] font-semibold tracking-wide transition-all duration-200 capitalize flex items-center justify-center gap-1.5 ${
                  isActive
                    ? t === 'EXPENSE'
                      ? 'bg-[#3869D2] text-white shadow-[0_2px_12px_rgba(56,105,210,0.4)]'
                      : t === 'INCOME'
                      ? 'bg-[#34d399] text-black shadow-[0_2px_12px_rgba(52,211,153,0.4)]'
                      : 'bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white shadow-[0_2px_12px_rgba(197,124,249,0.3)]'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
                }`}
              >
                <span className="material-symbols-rounded text-[16px]">
                  {t === 'EXPENSE' ? 'shopping_bag' : t === 'INCOME' ? 'payments' : 'sync_alt'}
                </span>
                {t.toLowerCase()}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Amount
            </label>
            <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[12px] px-4 py-3 focus-within:border-[#3869D2] focus-within:bg-[#3869D2]/[0.04] transition-all">
              <span className="text-[1.3rem] font-medium text-white/50 mr-2">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="bg-transparent border-none text-[1.4rem] font-bold text-white outline-none w-full tabular-nums placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Money Source Dropdown & Custom Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                  {type === 'TRANSFER' ? 'From Source' : 'Money Source'}
                </label>
                <button
                  type="button"
                  onClick={openAddSourceModal}
                  className="text-[0.7rem] text-[#3869D2] hover:text-[#5a8aee] font-semibold flex items-center gap-0.5"
                >
                  <span className="material-symbols-rounded text-[13px]">add</span>
                  <span>New</span>
                </button>
              </div>

              {moneySources.length === 0 ? (
                <div className="p-2 rounded-[8px] bg-white/[0.02] border border-dashed border-white/10 text-center">
                  <button
                    type="button"
                    onClick={openAddSourceModal}
                    className="text-[0.75rem] text-[#3869D2] font-bold hover:underline"
                  >
                    + Add Account
                  </button>
                </div>
              ) : (
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  required
                  className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
                >
                  {moneySources.map((src) => (
                    <option key={src.id} value={src.id} className="bg-[#0f0f24] text-white">
                      {src.name} ({currencySymbol}
                      {Number(src.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Destination Source (Transfer only) */}
            {type === 'TRANSFER' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                    To Destination
                  </label>
                  <button
                    type="button"
                    onClick={openAddSourceModal}
                    className="text-[0.7rem] text-[#C57CF9] hover:text-white font-semibold flex items-center gap-0.5"
                  >
                    <span className="material-symbols-rounded text-[13px]">add</span>
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={destSourceId}
                  onChange={(e) => setDestSourceId(e.target.value)}
                  required
                  className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all"
                >
                  {moneySources
                    .filter((s) => s.id !== sourceId)
                    .map((src) => (
                      <option key={src.id} value={src.id} className="bg-[#0f0f24] text-white">
                        {src.name} ({currencySymbol}
                        {Number(src.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              /* Category (Expense / Income) */
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={openAddCategoryModal}
                    className="text-[0.7rem] text-[#d9a4ff] hover:text-white font-semibold flex items-center gap-0.5"
                  >
                    <span className="material-symbols-rounded text-[13px]">add</span>
                    <span>New</span>
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      openAddCategoryModal();
                    } else {
                      setCategoryId(e.target.value);
                    }
                  }}
                  className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
                >
                  <option value="" className="bg-[#0f0f24] text-white/40">
                    -- Select Category --
                  </option>
                  <option value="__NEW__" className="text-[#3869D2] font-bold bg-[#0f1a2e]">
                    ➕ + Create New Category...
                  </option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#0f0f24] text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Merchant / Payee (For Expense & Income) */}
          {type !== 'TRANSFER' && (
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                {type === 'INCOME' ? 'Source / Payer' : 'Merchant / Payee'}
              </label>
              <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#3869D2] transition-all">
                <span className="material-symbols-rounded text-white/30 text-[18px] mr-2">
                  {type === 'INCOME' ? 'domain' : 'storefront'}
                </span>
                <input
                  type="text"
                  placeholder={type === 'INCOME' ? 'e.g. Employer, Client, Gift' : 'e.g. Jollibee, Grab, Shell, Meralco'}
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="bg-transparent border-none text-[0.82rem] text-white outline-none w-full placeholder:text-white/30"
                />
              </div>
            </div>
          )}

          {/* Date & Notes Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Date
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
              />
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Note / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch with team"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] mt-6">
            <button
              type="button"
              onClick={closeModals}
              className="px-4 py-2.5 rounded-[10px] text-[0.82rem] font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[10px] px-6 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_20px_rgba(56,105,210,0.3)] hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(197,124,249,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 overflow-hidden"
            >
              <span>{isSubmitting ? 'Saving...' : 'Add Transaction'}</span>
              <span className="material-symbols-rounded text-[18px]">check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
