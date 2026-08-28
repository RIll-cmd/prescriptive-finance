'use client';

import React, { useState, useEffect } from 'react';
import { useBillStore } from '@/stores/bill-store';
import { useCategoryStore } from '@/stores/category-store';

const COLOR_OPTIONS = ['#3869D2', '#C57CF9', '#34d399', '#f59e0b', '#ef4444', '#06b6d4'];
const ICON_OPTIONS = ['receipt_long', 'wifi', 'bolt', 'water_drop', 'home', 'subscriptions', 'credit_card', 'school'];

export const AddBillModal: React.FC = () => {
  const { isAddModalOpen, closeAddModal, createBill, isSubmitting } = useBillStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [frequency, setFrequency] = useState('MONTHLY');
  const [categoryId, setCategoryId] = useState('');
  const [colorHex, setColorHex] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories, fetchCategories]);

  if (!isAddModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;

    await createBill({
      name,
      amount: parseFloat(amount),
      due_date: dueDate,
      is_recurring: isRecurring,
      frequency,
      category_id: categoryId || undefined,
      color_hex: colorHex,
      icon,
      notes: notes || undefined,
    });

    setName('');
    setAmount('');
    setDueDate('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[12px] animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card w-full max-w-md p-6 border border-white/10 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[22px] text-[#3869D2]">receipt_long</span>
            <h2 className="text-[1.1rem] font-bold text-white tracking-tight">Add Upcoming Bill</h2>
          </div>
          <button
            type="button"
            onClick={closeAddModal}
            className="w-8 h-8 rounded-full bg-white/[0.04] text-white/40 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
              Bill / Obligation Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Internet, Electricity, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.85rem] focus:outline-none focus:border-[#3869D2] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Amount (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="1,699.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.85rem] focus:outline-none focus:border-[#3869D2] transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0c0c1e] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2] transition-all"
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
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                disabled={!isRecurring}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0c0c1e] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2] transition-all disabled:opacity-40"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-[0.8rem] text-white/70">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#3869D2] focus:ring-0 cursor-pointer"
            />
            <span>Recurring Bill (Automatically advances to next cycle upon payment)</span>
          </label>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[0.7rem] font-bold text-white/40 uppercase tracking-wider mb-1.5">
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
              <label className="block text-[0.7rem] font-bold text-white/40 uppercase tracking-wider mb-1.5">
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

          <div className="flex gap-3 pt-3">
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
