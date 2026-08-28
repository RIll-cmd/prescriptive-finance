'use client';

import React, { useState } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useAuthStore } from '@/stores/auth-store';

export const SavingsScenarioForm: React.FC = () => {
  const { runSimulation, isSimulating } = useSimulatorStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('Aggressive Savings Plan');
  const [amount, setAmount] = useState('5000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    await runSimulation({
      name: name.trim() || 'Savings Boost Scenario',
      type: 'SAVINGS_CHANGE',
      description: `Simulate saving an extra ${currencySymbol}${numAmt.toLocaleString('en-US')}/mo towards goals`,
      changes: [
        {
          change_type: 'SAVINGS_CHANGE',
          operation: 'ADD',
          amount: numAmt,
          start_date: startDate,
        },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-[18px] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
            Savings Acceleration Simulation
          </h3>
          <p className="text-[0.75rem] text-white/40">
            Simulate how dedicating an extra monthly amount accelerates your active goals and grows your net worth
          </p>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#C57CF9]/10 text-[#C57CF9] border border-[#C57CF9]/30 uppercase tracking-wider">
          Goal Booster
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Scenario Title
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Save ₱10,000/mo, FIRE Acceleration"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Additional Monthly Savings ({currencySymbol})
          </label>
          <input
            type="number"
            step="100"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5000.00"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] font-bold focus:outline-none focus:border-[#3869D2]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-[#C57CF9] to-[#d9a4ff] text-black text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(197,124,249,0.3)] hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-rounded text-[18px]">science</span>
          <span>{isSimulating ? 'Simulating Savings...' : 'Simulate Savings Impact'}</span>
        </button>
      </div>
    </form>
  );
};
