'use client';

import React, { useState } from 'react';

interface Contact {
  name: string;
  seed: string;
  bg: string;
}

const contacts: Contact[] = [
  { name: 'Felix', seed: 'Felix', bg: 'ffd5dc' },
  { name: 'Maria', seed: 'Maria', bg: 'c0aede' },
  { name: 'John', seed: 'John', bg: 'b6e3f4' },
  { name: 'Sara', seed: 'Sara', bg: 'ffd5dc' },
];

export const FastTransfer: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<number>(0);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => setIsTransferring(false), 200);
  };

  return (
    <section className="glass-card transfer-card">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
            Fast transfer
          </h2>
        </div>

        {/* Transfer Avatars */}
        <div className="flex gap-2.5 mb-5">
          {contacts.map((contact, idx) => {
            const isActive = selectedContact === idx;
            return (
              <button
                key={contact.name}
                onClick={() => setSelectedContact(idx)}
                className={`w-[42px] h-[42px] rounded-full overflow-hidden border-2 transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[#0f0f24] shrink-0 ${
                  isActive
                    ? 'border-[#C57CF9] shadow-[0_0_0_3px_rgba(197,124,249,0.12),0_4px_12px_rgba(197,124,249,0.4)]'
                    : 'border-transparent hover:-translate-y-1 hover:scale-105 hover:border-[#C57CF9] hover:shadow-[0_6px_16px_rgba(197,124,249,0.4)]'
                }`}
              >
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${contact.seed}&backgroundColor=${contact.bg}`}
                  alt={contact.name}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* Transfer Form */}
        <div className="flex flex-col gap-3.5">
          {/* From */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] mb-1.5 block">
              From
            </label>
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-[8px] px-3.5 py-2.5 hover:border-white/15 hover:bg-[#3869D2]/[0.04] transition-all duration-250 cursor-pointer">
              <span className="text-[0.82rem] font-medium text-white/90 tabular-nums">
                Visa **** 7609
              </span>
              <span className="material-symbols-rounded text-white/30 text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          {/* To */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] mb-1.5 block">
              To
            </label>
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-[8px] px-3.5 py-2.5 hover:border-white/15 hover:bg-[#3869D2]/[0.04] transition-all duration-250">
              <span className="text-[0.82rem] font-medium text-white/90 tabular-nums">
                2203 8760 1276 9856
              </span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.06em] mb-1.5 block">
              Amount
            </label>
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-[8px] px-3.5 py-2.5 hover:border-white/15 hover:bg-[#3869D2]/[0.04] transition-all duration-250">
              <span className="text-[0.82rem] font-medium text-white/90 tabular-nums">
                $1,500.00
              </span>
            </div>
          </div>

          {/* Transfer Button */}
          <button
            onClick={handleTransfer}
            style={{
              transform: isTransferring ? 'scale(0.96)' : undefined,
            }}
            className="group relative flex items-center justify-center gap-2 bg-gradient-to-br from-[#C57CF9] to-[#3869D2] bg-[length:200%_200%] border-none rounded-[12px] px-6 py-3 text-white font-bold text-[0.88rem] cursor-pointer shadow-[0_4px_24px_rgba(197,124,249,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(197,124,249,0.4),0_4px_16px_rgba(56,105,210,0.4)] active:translate-y-0 active:scale-95 transition-all duration-350 overflow-hidden mt-1 animate-[btnGradient_4s_ease-in-out_infinite]"
          >
            <span>Transfer</span>
            <span className="material-symbols-rounded text-[20px]">send</span>

            {/* Shimmer bar */}
            <div className="absolute top-0 -left-full w-[60%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[130%] transition-[left] duration-700 pointer-events-none" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FastTransfer;
