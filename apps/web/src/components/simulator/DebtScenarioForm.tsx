'use client';

import React, { useState } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useAuthStore } from '@/stores/auth-store';

export const DebtScenarioForm: React.FC = () => {
  const { runSimulation, isSimulating } = useSimulatorStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('Personal Loan Simulation');
  const [principal, setPrincipal] = useState('50000');
  const [interestRate, setInterestRate] = useState('10.0');
  const [termMonths, setTermMonths] = useState('12');

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrincipal = parseFloat(principal);
    const numRate = parseFloat(interestRate);
    const numTerm = parseInt(termMonths, 10);

    if (isNaN(numPrincipal) || numPrincipal <= 0 || isNaN(numTerm) || numTerm <= 0) return;

    await runSimulation({
      name: name.trim() || 'Debt Financing Scenario',
      type: 'DEBT',
      description: `Simulate taking a ${currencySymbol}${numPrincipal.toLocaleString('en-US')} loan at ${numRate}% APR for ${numTerm} months`,
      changes: [
        {
          change_type: 'LOAN',
          amount: numPrincipal,
          interest_rate: numRate,
          term_months: numTerm,
          start_date: new Date().toISOString().split('T')[0],
        },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-[18px] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
            Loan & Debt Financing Simulation
          </h3>
          <p className="text-[0.75rem] text-white/40">
            Calculates exact monthly amortization, total interest cost, debt-to-income impact, and financial health shifts
          </p>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
          Loan Amortization
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Loan Description
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bank Personal Loan, Auto Loan"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Principal Amount ({currencySymbol})
          </label>
          <input
            type="number"
            step="1000"
            required
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="50000.00"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] font-bold focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Annual Interest Rate (APR %)
          </label>
          <input
            type="number"
            step="0.1"
            required
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="10.0"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] font-bold focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Loan Term (Months)
          </label>
          <input
            type="number"
            step="1"
            min="1"
            max="360"
            required
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value)}
            placeholder="12"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] font-bold focus:outline-none focus:border-[#3869D2]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(244,63,94,0.3)] hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-rounded text-[18px]">science</span>
          <span>{isSimulating ? 'Simulating Debt...' : 'Simulate Loan Impact'}</span>
        </button>
      </div>
    </form>
  );
};
