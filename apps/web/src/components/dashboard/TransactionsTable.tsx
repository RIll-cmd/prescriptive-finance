'use client';

import React, { useEffect, useState } from 'react';

interface TransactionItem {
  id: string;
  name: string;
  icon: string;
  iconClass: string;
  amount: string;
  card: string;
  status: 'Complete' | 'Cancelled';
  date: string;
}

const transactions: TransactionItem[] = [
  {
    id: '1',
    name: 'Netflix',
    icon: 'play_circle',
    iconClass: 'bg-[rgba(229,9,20,0.12)] text-[#e5555a]',
    amount: '$12.99',
    card: '**** 6152',
    status: 'Complete',
    date: '25 June, 2025',
  },
  {
    id: '2',
    name: 'Google Ads',
    icon: 'ads_click',
    iconClass: 'bg-[#3869D2]/[0.12] text-[#5a8aee]',
    amount: '$310.50',
    card: '**** 6152',
    status: 'Complete',
    date: '24 June, 2025',
  },
  {
    id: '3',
    name: 'Uber',
    icon: 'local_taxi',
    iconClass: 'bg-white/[0.08] text-white/70',
    amount: '$18.25',
    card: '**** 7014',
    status: 'Cancelled',
    date: '23 June, 2025',
  },
  {
    id: '4',
    name: 'Amazon',
    icon: 'shopping_cart',
    iconClass: 'bg-[#eda04a]/[0.12] text-[#eda04a]',
    amount: '$760.50',
    card: '**** 6152',
    status: 'Complete',
    date: '23 June, 2025',
  },
  {
    id: '5',
    name: 'eBay',
    icon: 'storefront',
    iconClass: 'bg-[rgba(248,113,113,0.1)] text-[#f87171]',
    amount: '$22.50',
    card: '**** 7014',
    status: 'Cancelled',
    date: '22 June, 2025',
  },
];

export const TransactionsTable: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="glass-card transactions-card col-span-1 lg:col-span-2">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
            Transactions
          </h2>
          <button className="inline-flex items-center gap-1 bg-[#C57CF9]/[0.12] border border-[#C57CF9]/30 rounded-full px-3.5 py-1.5 text-[#d9a4ff] text-[0.75rem] font-medium hover:bg-[#C57CF9]/20 transition-all duration-200">
            All cards
            <span className="material-symbols-rounded text-[16px]">expand_more</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                  Name
                </th>
                <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                  Amount
                </th>
                <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                  Card
                </th>
                <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                  Status
                </th>
                <th className="text-left text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.05em] px-3 pb-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, idx) => (
                <tr
                  key={txn.id}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                    transition: `all 0.4s cubic-bezier(0.16,1,0.3,1) ${0.4 + idx * 0.08}s`,
                  }}
                  className="group border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] transition-all duration-250"
                >
                  {/* Name */}
                  <td className="p-3 text-[0.82rem] text-white/50 group-hover:text-white/90 transition-colors">
                    <div className="flex items-center gap-2.5 font-medium text-white">
                      <div
                        className={`w-[30px] h-[30px] rounded-[6px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${txn.iconClass}`}
                      >
                        <span className="material-symbols-rounded text-[16px]">
                          {txn.icon}
                        </span>
                      </div>
                      {txn.name}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="p-3 text-[0.82rem] text-white/50 group-hover:text-white/90 tabular-nums">
                    {txn.amount}
                  </td>

                  {/* Card */}
                  <td className="p-3 text-[0.82rem] text-white/50 group-hover:text-white/90 tabular-nums">
                    {txn.card}
                  </td>

                  {/* Status */}
                  <td className="p-3 text-[0.82rem] text-white/50">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold ${
                        txn.status === 'Complete'
                          ? 'bg-[#C57CF9]/[0.12] text-[#d9a4ff]'
                          : 'bg-[rgba(248,113,113,0.1)] text-[#f87171]'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-3 text-[0.82rem] text-white/50 group-hover:text-white/90 tabular-nums">
                    {txn.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default TransactionsTable;
