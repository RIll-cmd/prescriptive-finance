'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Cards', icon: 'credit_card', href: '/money' },
  { label: 'Analytics', icon: 'analytics', href: '/insights' },
  { label: 'Profile', icon: 'person', href: '/accounts' },
  { label: 'Wallet', icon: 'account_balance_wallet', href: '/transactions' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname || '/dashboard');

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-[100] w-[70px] bg-[rgba(5,5,16,0.8)] backdrop-blur-[24px] border-r border-white/[0.08] flex flex-col items-center py-6 select-none max-[860px]:hidden">
      {/* Top: Avatar */}
      <div className="mb-8">
        <div className="relative w-[42px] h-[42px] group">
          <img
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=Alya&backgroundColor=b6e3f4"
            alt="User avatar"
            className="w-[42px] h-[42px] rounded-full object-cover border-2 border-white/15 bg-[#0f0f24] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[#C57CF9] group-hover:scale-105 relative z-[2]"
          />
          <span className="absolute bottom-0 right-0 w-[11px] h-[11px] rounded-full bg-[#34d399] border-[2.5px] border-[#050510] z-[3] animate-[statusPulse_2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeItem === item.href || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setActiveItem(item.href)}
              className={`group relative w-[42px] h-[42px] rounded-[12px] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-visible ${
                isActive
                  ? 'text-white bg-gradient-to-br from-[#3869D2] to-[#C57CF9] shadow-[0_4px_30px_rgba(56,105,210,0.2),0_4px_30px_rgba(197,124,249,0.15)]'
                  : 'text-white/30 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-rounded text-[24px]">{item.icon}</span>

              {/* Glow filter */}
              <div
                className={`absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[#3869D2] to-[#C57CF9] blur-[12px] -z-10 transition-opacity duration-300 pointer-events-none ${
                  isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-15'
                }`}
              />

              {/* Tooltip */}
              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[#14142e] backdrop-blur-[16px] border border-white/[0.08] text-white/90 px-3 py-1.5 rounded-[6px] text-[0.75rem] font-medium whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.5)] pointer-events-none opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-[1000]">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings */}
      <div className="mt-auto">
        <Link
          href="/settings"
          className="group relative w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-300"
        >
          <span className="material-symbols-rounded text-[24px]">settings</span>
          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[#14142e] backdrop-blur-[16px] border border-white/[0.08] text-white/90 px-3 py-1.5 rounded-[6px] text-[0.75rem] font-medium whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.5)] pointer-events-none opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-[1000]">
            Settings
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
