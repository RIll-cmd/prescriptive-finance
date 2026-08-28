'use client';

import React, { useState } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useAuthStore } from '@/stores/auth-store';

export const PurchaseScenarioForm: React.FC = () => {
  const { runSimulation, isSimulating } = useSimulatorStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('Gaming Laptop Purchase');
  const [amount, setAmount] = useState('50000');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryName, setCategoryName] = useState('Electronics & Gadgets');

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    await runSimulation({
      name: name.trim() || 'Major Purchase Scenario',
      type: 'PURCHASE',
      description: `Simulate purchasing ${name} for ${currencySymbol}${numAmt.toLocaleString('en-US')}`,
      changes: [
        {
          change_type: 'PURCHASE',
          amount: numAmt,
          start_date: purchaseDate,
          category_name: categoryName,
        },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-[18px] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
            Major Purchase Simulation
          </h3>
          <p className="text-[0.75rem] text-white/40">
            See the exact downstream impact on your emergency runway, health score, and goal timelines
          </p>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#3869D2]/10 text-[#3869D2] border border-[#3869D2]/30 uppercase tracking-wider">
          Single Outlay
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Item / Purchase Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. M3 MacBook Pro, Japan Flight Tickets"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Purchase Price ({currencySymbol})
          </label>
          <input
            type="number"
            step="100"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50000.00"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] font-bold focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Planned Purchase Date
          </label>
          <input
            type="date"
            required
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>

        <div>
          <label className="text-[0.72rem] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Category
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Electronics, Travel, Home"
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] focus:outline-none focus:border-[#3869D2]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.85rem] font-bold shadow-[0_4px_16px_rgba(197,124,249,0.3)] hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-rounded text-[18px]">science</span>
          <span>{isSimulating ? 'Simulating Impact...' : 'Simulate Purchase Impact'}</span>
        </button>
      </div>
    </form>
  );
};
