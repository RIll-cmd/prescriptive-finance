'use client';

import React, { useState, useEffect } from 'react';
import { useGoalStore } from '@/stores/goal-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCategoryStore } from '@/stores/category-store';

const COLOR_OPTIONS = ['#C57CF9', '#3869D2', '#34d399', '#f59e0b', '#ec4899', '#06b6d4', '#8B5CF6', '#10B981'];
const ICON_OPTIONS = ['flag', 'savings', 'laptop_mac', 'flight', 'directions_car', 'home', 'school', 'favorite', 'sports_esports', 'shield', 'trending_up', 'diamond'];

export const AddGoalModal: React.FC = () => {
  const { isAddModalOpen, closeAddModal, createGoal, isSubmitting } = useGoalStore();
  const { moneySources, user, openAddSourceModal } = useAuthStore();
  const { categories, fetchCategories, openAddModal: openAddCategoryModal } = useCategoryStore();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [colorHex, setColorHex] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [description, setDescription] = useState('');

  // Category selection & custom category input
  const [categoryMode, setCategoryMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');

  // Money source selection
  const [moneySourceId, setMoneySourceId] = useState<string>('');
  const [recordTransaction, setRecordTransaction] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAddModalOpen) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      setPriority('MEDIUM');
      setColorHex(COLOR_OPTIONS[0]);
      setIcon(ICON_OPTIONS[0]);
      setDescription('');
      setSelectedCategory('');
      setCustomCategory('');
      setCategoryMode('SELECT');
      setMoneySourceId('');
      setRecordTransaction(false);
      setErrorMsg(null);

      fetchCategories();
    }
  }, [isAddModalOpen, fetchCategories]);

  if (!isAddModalOpen) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedTarget = parseFloat(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMsg('Please enter a valid target amount greater than 0.');
      return;
    }

    const parsedCurrent = currentAmount ? parseFloat(currentAmount) : 0;
    if (parsedCurrent < 0) {
      setErrorMsg('Initial saved amount cannot be negative.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please provide a goal name.');
      return;
    }

    const finalCategory = categoryMode === 'CUSTOM'
      ? customCategory.trim()
      : selectedCategory.trim();

    try {
      await createGoal({
        name: name.trim(),
        target_amount: parsedTarget,
        current_amount: parsedCurrent,
        target_date: targetDate || null,
        priority,
        category: finalCategory || undefined,
        color_hex: colorHex,
        icon,
        description: description.trim() || undefined,
        money_source_id: moneySourceId || undefined,
        record_transaction: recordTransaction && !!moneySourceId && parsedCurrent > 0,
      });

      closeAddModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create goal. Please verify your inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-[24px] bg-[rgba(5,5,16,0.96)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-7 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#C57CF9]/10 blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[#3869D2]/10 blur-[60px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_2px_12px_rgba(197,124,249,0.3)]">
              <span className="material-symbols-rounded text-[18px] text-white">flag</span>
            </div>
            <div>
              <h2 className="text-[1.15rem] font-bold tracking-tight">Create Financial Goal</h2>
              <p className="text-[0.72rem] text-white/40">Define a target, milestone deadline, and funding strategy</p>
            </div>
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
          <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] flex items-center gap-2 shrink-0">
            <span className="material-symbols-rounded text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {/* Goal Name */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Goal Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Emergency Fund, New Laptop, Japan Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all placeholder:text-white/20"
            />
          </div>

          {/* Target Amount & Initial Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Target Amount ({currencySymbol}) *
              </label>
              <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2 focus-within:border-[#C57CF9] transition-all">
                <span className="text-[0.85rem] font-medium text-white/40 mr-1.5">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="50,000.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="bg-transparent border-none text-[0.95rem] font-bold text-white outline-none w-full tabular-nums placeholder:text-white/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Initial Saved ({currencySymbol})
              </label>
              <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2 focus-within:border-[#C57CF9] transition-all">
                <span className="text-[0.85rem] font-medium text-white/40 mr-1.5">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="bg-transparent border-none text-[0.95rem] font-bold text-white outline-none w-full tabular-nums placeholder:text-white/20"
                />
              </div>
            </div>
          </div>

          {/* Target Deadline & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Target Deadline (Optional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2 text-[0.82rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all"
              />
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
          </div>

          {/* Category Input / Selector with Custom Mode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                Category
              </label>
              <div className="flex items-center gap-1 text-[0.72rem]">
                <button
                  type="button"
                  onClick={() => setCategoryMode(categoryMode === 'SELECT' ? 'CUSTOM' : 'SELECT')}
                  className="text-[#d9a4ff] hover:text-white font-medium transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-rounded text-[14px]">
                    {categoryMode === 'SELECT' ? 'edit' : 'list'}
                  </span>
                  <span>{categoryMode === 'SELECT' ? 'Type Custom Category' : 'Choose Existing'}</span>
                </button>
                <span className="text-white/20">|</span>
                <button
                  type="button"
                  onClick={openAddCategoryModal}
                  className="text-white/40 hover:text-white font-medium transition-colors"
                >
                  + Add to Library
                </button>
              </div>
            </div>

            {categoryMode === 'SELECT' ? (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all"
              >
                <option value="">-- No Specific Category --</option>
                <option value="Savings & Emergency">Savings & Emergency</option>
                <option value="Investments">Investments</option>
                <option value="Travel & Vacation">Travel & Vacation</option>
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                <option value="Vehicle & Transport">Vehicle & Transport</option>
                <option value="Real Estate & Home">Real Estate & Home</option>
                <option value="Education & Learning">Education & Learning</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#C57CF9] transition-all">
                <span className="material-symbols-rounded text-[18px] text-[#C57CF9] mr-2">category</span>
                <input
                  type="text"
                  placeholder="e.g. Wedding Fund, Crypto Stash, Gaming Rig"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="bg-transparent border-none text-[0.85rem] text-white outline-none w-full placeholder:text-white/30"
                />
              </div>
            )}
          </div>

          {/* Money Source Input / Selector with Quick Add */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em]">
                Linked Money Source (Optional)
              </label>
              <button
                type="button"
                onClick={openAddSourceModal}
                className="text-[0.72rem] text-[#3869D2] hover:text-[#5a8aee] font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-rounded text-[14px]">add_circle</span>
                <span>+ New Source</span>
              </button>
            </div>

            {moneySources.length === 0 ? (
              <div className="p-3 rounded-[10px] bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-between">
                <span className="text-[0.75rem] text-white/40">No money sources added yet.</span>
                <button
                  type="button"
                  onClick={openAddSourceModal}
                  className="text-[0.75rem] text-[#3869D2] font-bold hover:underline"
                >
                  Create Money Source
                </button>
              </div>
            ) : (
              <select
                value={moneySourceId}
                onChange={(e) => setMoneySourceId(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all"
              >
                <option value="">None (Tracking Goal Only)</option>
                {moneySources.map((ms) => (
                  <option key={ms.id} value={ms.id}>
                    {ms.name} ({currencySymbol}{Number(ms.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Deduct initial amount checkbox */}
          {moneySourceId && parseFloat(currentAmount) > 0 && (
            <label className="flex items-center gap-2.5 cursor-pointer text-[0.78rem] text-white/80 p-2.5 rounded-[10px] bg-white/[0.02] border border-white/[0.06]">
              <input
                type="checkbox"
                checked={recordTransaction}
                onChange={(e) => setRecordTransaction(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#C57CF9] focus:ring-0 cursor-pointer"
              />
              <span>Deduct {currencySymbol}{parseFloat(currentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} initial amount from selected source now</span>
            </label>
          )}

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                    className={`w-6 h-6 rounded-full transition-transform ${colorHex === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Icon
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {ICON_OPTIONS.slice(0, 6).map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-7 h-7 rounded-[6px] flex items-center justify-center text-[16px] transition-all ${icon === ic ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:bg-white/[0.06]'}`}
                  >
                    <span className="material-symbols-rounded text-[16px]">{ic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Save 20% of monthly income towards this"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.82rem] font-medium text-white outline-none focus:border-[#C57CF9] transition-all placeholder:text-white/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06] mt-4">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 rounded-[10px] text-[0.82rem] font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[10px] px-6 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_20px_rgba(197,124,249,0.3)] hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(197,124,249,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 overflow-hidden"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Goal'}</span>
              <span className="material-symbols-rounded text-[18px]">check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;
