'use client';

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between mb-7 h-[50px] animate-[fadeDown_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
      <div className="flex items-center">
        <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] flex items-center gap-2">
          <span className="bg-gradient-to-br from-[#3869D2] to-[#C57CF9] bg-clip-text text-transparent">
            Dashboard
          </span>
          <span className="text-[1rem] bg-gradient-to-br from-[#3869D2] to-[#C57CF9] bg-clip-text text-transparent inline-block animate-[sparkleRotate_4s_ease-in-out_infinite]">
            ✦
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="group relative flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-[18px] py-[9px] w-[210px] focus-within:w-[270px] focus-within:border-[#3869D2] focus-within:bg-[#3869D2]/[0.06] transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden">
          <span className="material-symbols-rounded text-white/30 text-[18px] shrink-0">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none text-white text-[0.85rem] outline-none w-full placeholder:text-white/30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] opacity-0 group-focus-within:opacity-[0.06] blur-[20px] pointer-events-none transition-opacity duration-300" />
        </div>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-white/50 flex items-center justify-center cursor-pointer hover:bg-[rgba(56,105,210,0.12)] hover:border-[#3869D2]/30 hover:text-white hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <span className="material-symbols-rounded text-[20px]">notifications</span>
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#3869D2] to-[#C57CF9] text-white text-[0.6rem] font-extrabold flex items-center justify-center border-2 border-black animate-[badgePop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_1s_both]">
            3
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
