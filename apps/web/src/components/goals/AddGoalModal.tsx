'use client';

import React, { useState } from 'react';
import { useGoalStore } from '@/stores/goal-store';

const COLOR_OPTIONS = ['#C57CF9', '#3869D2', '#34d399', '#f59e0b', '#ec4899', '#06b6d4'];
const ICON_OPTIONS = ['savings', 'laptop_mac', 'flight', 'directions_car', 'home', 'school', 'favorite', 'sports_esports'];

export const AddGoalModal: React.FC = () => {
  const { isAddModalOpen, closeAddModal, createGoal, isSubmitting } = useGoalStore();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [colorHex, setColorHex] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [description, setDescription] = useState('');

  if (!isAddModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    await createGoal({
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: currentAmount ? parseFloat(currentAmount) : 0,
      target_date: targetDate || null,
      priority,
      color_hex: colorHex,
      icon,
      description: description || undefined,
    });

    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[12px] animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card w-full max-w-md p-6 border border-white/10 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[22px] text-[#C57CF9]">flag</span>
            <h2 className="text-[1.1rem] font-bold text-white tracking-tight">Create Financial Goal</h2>
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
              Goal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund, Gaming PC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.85rem] focus:outline-none focus:border-[#C57CF9] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Target Amount *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="50,000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.85rem] focus:outline-none focus:border-[#C57CF9] transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Initial Saved
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-[0.85rem] focus:outline-none focus:border-[#C57CF9] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#C57CF9] transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0c0c1e] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#C57CF9] transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

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

          {/* Actions */}
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
              className="flex-1 py-2.5 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(197,124,249,0.3)] hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;
