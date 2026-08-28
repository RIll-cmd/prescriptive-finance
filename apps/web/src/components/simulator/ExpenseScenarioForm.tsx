'use client';

import React, { useState } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useAuthStore } from '@/stores/auth-store';

export const ExpenseScenarioForm: React.FC = () => {
  const { runSimulation, isSimulating } = useSimulatorStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('Rent Increase Scenario');
  const [operation, setOperation] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [amount, setAmount] = useState('3000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    await runSimulation({
      name: name.trim() || 'Expense Adjustment Scenario',
      type: 'EXPENSE_CHANGE',
      description: `Simulate ${operation === 'ADD' ? 'an expense increase' : 'an expense reduction'} of ${currencySymbol}${numAmt.toLocaleString('en-US')}/mo`,
      changes: [
        {
          change_type: 'EXPENSE_CHANGE',
          operation: operation,
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
            Recurring Expense Simulation
          </h3>
          <p className="text-[0.75rem] text-white/40">
            Simulate rent hikes, subscription cancellations, or new monthly commitments
          </p>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
          Recurring Expense
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Expense Name / Reason
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. New Apartment Rent, Gym Membership"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Adjustment Direction
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOperation('ADD')}
              className={`flex-1 py-2.5 rounded-[10px] text-[0.8rem] font-bold transition-all border ${
                operation === 'ADD'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-white/[0.03] text-white/40 border-white/10 hover:text-white'
              }`}
            >
              + Expense Increase
            </button>
            <button
              type="button"
              onClick={() => setOperation('SUBTRACT')}
              className={`flex-1 py-2.5 rounded-[10px] text-[0.8rem] font-bold transition-all border ${
                operation === 'SUBTRACT'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/[0.03] text-white/40 border-white/10 hover:text-white'
              }`}
            >
              – Expense Reduction
            </button>
          </div>
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Monthly Amount ({currencySymbol})
          </label>
          <input
            type="number"
            step="100"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="3000.00"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] font-bold focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Effective Date
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-black text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-rounded text-[18px]">science</span>
          <span>{isSimulating ? 'Simulating Expense...' : 'Simulate Expense Impact'}</span>
        </button>
      </div>
    </form>
  );
};
