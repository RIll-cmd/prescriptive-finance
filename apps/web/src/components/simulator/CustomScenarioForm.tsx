'use client';

import React, { useState } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useAuthStore } from '@/stores/auth-store';
import { SimulationChangeInput } from '@financial-os/shared-types';

export const CustomScenarioForm: React.FC = () => {
  const { runSimulation, isSimulating } = useSimulatorStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('Career Move + Relocation');
  const [description, setDescription] = useState('New salary, higher rent, and move-in deposit');
  
  const [changes, setChanges] = useState<SimulationChangeInput[]>([
    {
      change_type: 'RECURRING_INCOME',
      operation: 'ADD',
      amount: 15000,
      start_date: new Date().toISOString().split('T')[0],
      category_name: 'Salary',
    },
    {
      change_type: 'RECURRING_EXPENSE',
      operation: 'ADD',
      amount: 5000,
      start_date: new Date().toISOString().split('T')[0],
      category_name: 'Rent',
    },
    {
      change_type: 'PURCHASE',
      amount: 20000,
      start_date: new Date().toISOString().split('T')[0],
      category_name: 'Relocation Deposit',
    },
  ]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleAddChange = () => {
    setChanges([
      ...changes,
      {
        change_type: 'PURCHASE',
        amount: 5000,
        start_date: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveChange = (idx: number) => {
    if (changes.length <= 1) return;
    setChanges(changes.filter((_, i) => i !== idx));
  };

  const handleUpdateChange = (idx: number, field: keyof SimulationChangeInput, val: any) => {
    const updated = [...changes];
    updated[idx] = { ...updated[idx], [field]: val };
    setChanges(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changes.length) return;

    await runSimulation({
      name: name.trim() || 'Custom Multi-Variable Scenario',
      type: 'CUSTOM',
      description: description.trim(),
      changes: changes.map((c) => ({
        ...c,
        amount: Number(c.amount) || 0,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-[18px] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
            Custom Multi-Variable Sandbox
          </h3>
          <p className="text-[0.75rem] text-white/40">
            Combine multiple income changes, recurring expenses, and one-off purchases into a single scenario
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddChange}
          className="px-3 py-1.5 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-[0.75rem] font-bold flex items-center gap-1.5 transition-all"
        >
          <span className="material-symbols-rounded text-[16px]">add</span>
          <span>Add Variable</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Scenario Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>
      </div>

      {/* Variables List */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[0.78rem] font-bold text-white/70 uppercase tracking-wider">
          Simulation Variables ({changes.length})
        </h4>

        {changes.map((c, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-[12px] bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
          >
            <div>
              <label className="text-[0.65rem] text-white/40 uppercase font-bold block mb-1">
                Type
              </label>
              <select
                value={c.change_type}
                onChange={(e) => handleUpdateChange(idx, 'change_type', e.target.value)}
                className="w-full px-2.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/10 text-white text-[0.78rem] focus:outline-none"
              >
                <option value="PURCHASE" className="bg-[#0b0c16] text-white">One-off Purchase</option>
                <option value="RECURRING_INCOME" className="bg-[#0b0c16] text-white">Monthly Income (+)</option>
                <option value="RECURRING_EXPENSE" className="bg-[#0b0c16] text-white">Monthly Expense (+)</option>
                <option value="SAVINGS_CHANGE" className="bg-[#0b0c16] text-white">Savings Goal (+)</option>
              </select>
            </div>

            <div>
              <label className="text-[0.65rem] text-white/40 uppercase font-bold block mb-1">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="100"
                required
                value={c.amount}
                onChange={(e) => handleUpdateChange(idx, 'amount', e.target.value)}
                className="w-full px-2.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/10 text-white font-bold text-[0.78rem] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[0.65rem] text-white/40 uppercase font-bold block mb-1">
                Label / Tag
              </label>
              <input
                type="text"
                value={c.category_name || ''}
                onChange={(e) => handleUpdateChange(idx, 'category_name', e.target.value)}
                placeholder="e.g. Bonus, Rent"
                className="w-full px-2.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/10 text-white text-[0.78rem] focus:outline-none"
              />
            </div>

            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => handleRemoveChange(idx)}
                disabled={changes.length <= 1}
                className="p-2 rounded-[8px] text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-20"
              >
                <span className="material-symbols-rounded text-[18px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-rounded text-[18px]">science</span>
          <span>{isSimulating ? 'Simulating Custom Sandbox...' : 'Run Multi-Var Simulation'}</span>
        </button>
      </div>
    </form>
  );
};
