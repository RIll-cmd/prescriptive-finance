'use client';

import React, { useState } from 'react';
import { useCategoryStore } from '@/stores/category-store';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ICONS = [
  'restaurant',
  'directions_car',
  'home',
  'shopping_cart',
  'sports_esports',
  'medical_services',
  'school',
  'credit_card_off',
  'payments',
  'work',
  'trending_up',
  'card_giftcard',
  'pets',
  'local_cafe',
  'flight',
  'local_gas_station',
  'fitness_center',
  'savings',
];

const PRESET_COLORS = [
  '#F59E0B',
  '#3B82F6',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#06B6D4',
  '#F97316',
  '#6366F1',
  '#14B8A6',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
  const { createCategory } = useCategoryStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [colorHex, setColorHex] = useState(PRESET_COLORS[0]);
  const [isDiscretionary, setIsDiscretionary] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a category name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createCategory({
        name: name.trim(),
        type,
        icon,
        color_hex: colorHex,
        is_discretionary: isDiscretionary,
      });
      setName('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[480px] rounded-[24px] bg-[rgba(5,5,16,0.95)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_2px_12px_rgba(56,105,210,0.3)]">
              <span className="material-symbols-rounded text-[18px] text-white">category</span>
            </div>
            <h2 className="text-[1.15rem] font-bold tracking-tight">New Category</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Type */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/[0.04] border border-white/[0.06] rounded-[12px]">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 rounded-[9px] text-[0.78rem] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                type === 'EXPENSE'
                  ? 'bg-[#3869D2] text-white shadow-[0_2px_12px_rgba(56,105,210,0.4)]'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <span className="material-symbols-rounded text-[16px]">shopping_bag</span>
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 rounded-[9px] text-[0.78rem] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                type === 'INCOME'
                  ? 'bg-[#34d399] text-black shadow-[0_2px_12px_rgba(52,211,153,0.4)]'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <span className="material-symbols-rounded text-[16px]">payments</span>
              Income
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Coffee & Boba, Gym Membership, Subscriptions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-2 block">
              Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorHex(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    colorHex === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-2 block">
              Category Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-[140px] overflow-y-auto p-1 bg-white/[0.02] border border-white/[0.04] rounded-[12px]">
              {PRESET_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`h-10 rounded-[8px] flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-white/20 text-white border border-white/30 scale-105 shadow-md'
                      : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-rounded text-[20px]">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[10px] text-[0.82rem] font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[10px] px-6 py-2.5 text-white font-bold text-[0.85rem] cursor-pointer shadow-[0_4px_20px_rgba(56,105,210,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Category'}</span>
              <span className="material-symbols-rounded text-[18px]">check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
