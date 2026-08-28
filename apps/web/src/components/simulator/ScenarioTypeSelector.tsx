'use client';

import React from 'react';
import { ScenarioType } from '@financial-os/shared-types';

interface ScenarioTypeSelectorProps {
  activeType: ScenarioType;
  onSelect: (type: ScenarioType) => void;
}

interface TypeOption {
  type: ScenarioType;
  label: string;
  desc: string;
  icon: string;
  color: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: 'PURCHASE',
    label: 'Major Purchase',
    desc: 'Simulate buying a laptop, phone, or gadget',
    icon: 'shopping_bag',
    color: '#3869D2',
  },
  {
    type: 'INCOME_CHANGE',
    label: 'Income Change',
    desc: 'Simulate a salary raise, bonus, or income reduction',
    icon: 'payments',
    color: '#34d399',
  },
  {
    type: 'EXPENSE_CHANGE',
    label: 'Expense Shift',
    desc: 'Simulate rent increase, subscription, or inflation',
    icon: 'receipt_long',
    color: '#f59e0b',
  },
  {
    type: 'SAVINGS_CHANGE',
    label: 'Savings Boost',
    desc: 'Simulate adjusting your monthly goal contributions',
    icon: 'savings',
    color: '#C57CF9',
  },
  {
    type: 'DEBT',
    label: 'Take a Loan',
    desc: 'Simulate a loan with APR interest and monthly amortization',
    icon: 'credit_card',
    color: '#f43f5e',
  },
  {
    type: 'CUSTOM',
    label: 'Custom Multi-Var',
    desc: 'Combine multiple cash, income, and expense changes',
    icon: 'tune',
    color: '#60a5fa',
  },
];

export const ScenarioTypeSelector: React.FC<ScenarioTypeSelectorProps> = ({
  activeType,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {TYPE_OPTIONS.map((opt) => {
        const isSelected = activeType === opt.type;
        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => onSelect(opt.type)}
            className={`p-3.5 rounded-[14px] text-left transition-all relative flex flex-col justify-between group border ${
              isSelected
                ? 'bg-white/[0.08] border-white/30 shadow-[0_0_20px_rgba(56,105,210,0.25)]'
                : 'glass-card hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all group-hover:scale-110"
                style={{ backgroundColor: `${opt.color}26`, color: opt.color }}
              >
                <span className="material-symbols-rounded text-[18px]">{opt.icon}</span>
              </div>

              {isSelected && (
                <span className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
              )}
            </div>

            <div>
              <h4 className="text-[0.82rem] font-bold text-white tracking-tight">{opt.label}</h4>
              <p className="text-[0.68rem] text-white/40 line-clamp-2 mt-0.5">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
