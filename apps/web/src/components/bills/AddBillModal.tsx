'use client';

import React, { useState, useEffect } from 'react';
import { useBillStore } from '@/stores/bill-store';
import { useCategoryStore } from '@/stores/category-store';
import { useAuthStore } from '@/stores/auth-store';

const COLOR_OPTIONS = ['#3869D2', '#C57CF9', '#34d399', '#f59e0b', '#ef4444', '#06b6d4'];
const ICON_OPTIONS = ['receipt_long', 'wifi', 'bolt', 'water_drop', 'home', 'subscriptions', 'credit_card', 'school'];

export const AddBillModal: React.FC = () => {
  const { isAddModalOpen, closeAddModal, createBill, isSubmitting } = useBillStore();
  const { categories, fetchCategories, openAddModal: openAddCategoryModal } = useCategoryStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [frequency, setFrequency] = useState('MONTHLY');
  const [categoryId, setCategoryId] = useState('');
  const [colorHex, setColorHex] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAddModalOpen) {
      setName('');
      setAmount('');
      setDueDate('');
      setNotes('');
      setErrorMsg(null);
      fetchCategories();
    }
  }, [isAddModalOpen, fetchCategories]);

  if (!isAddModalOpen) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid bill amount.');
      return;
    }

    if (!name.trim() || !dueDate) {
      setErrorMsg('Please provide a bill name and due date.');
      return;
    }

    try {
      await createBill({
        name: name.trim(),
        amount: numAmount,
        due_date: dueDate,
        is_recurring: isRecurring,
        frequency,
        category_id: categoryId || undefined,
        color_hex: colorHex,
        icon,
        notes: notes.trim() || undefined,
      });

      closeAddModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save bill.');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-[24px] bg-[rgba(5,5,16,0.96)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3869D2] to-[#5a8aee] flex items-center justify-center shadow-[0_2px_12px_rgba(56,105,210,0.3)]">
              <span className="material-symbols-rounded text-[18px] text-white">receipt_long</span>
            </div>
            <h2 className="text-[1.15rem] font-bold text-white tracking-tight">Add Upcoming Bill</h2>
          </div>
          <button
            type="button"
            onClick={closeAddModal}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Bill / Obligation Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Internet, Electricity, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all placeholder:text-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Amount ({currencySymbol}) *
              </label>
              <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2 focus-within:border-[#3869D2] transition-all">
                <span className="text-[0.85rem] font-medium text-white/40 mr-1.5">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="1,699.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none text-[0.95rem] font-bold text-white outline-none w-full tabular-nums placeholder:text-white/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Frequency
              </label>
              <select
                value={frequency}
                disabled={!isRecurring}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all disabled:opacity-40"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-[0.8rem] text-white/70 p-2.5 rounded-[10px] bg-white/[0.02] border border-white/[0.06]">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#3869D2] focus:ring-0 cursor-pointer"
            />
            <span>Recurring Bill (Advances upon payment)</span>
          </label>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Theme Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColorHex(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${colorHex === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Icon
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {ICON_OPTIONS.slice(0, 5).map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-7 h-7 rounded-[6px] flex items-center justify-center text-[16px] transition-all ${icon === ic ? 'bg-white/20 text-white' : 'text-white/40 hover:bg-white/[0.06]'}`}
                  >
                    <span className="material-symbols-rounded text-[16px]">{ic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={closeAddModal}
              className="flex-1 py-2.5 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[0.85rem] font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#5a8aee] text-white text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(56,105,210,0.3)] hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBillModal;
