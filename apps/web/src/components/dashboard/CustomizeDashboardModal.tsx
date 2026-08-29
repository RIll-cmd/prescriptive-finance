'use client';

import React from 'react';
import { useDashboardStore, AVAILABLE_WIDGETS } from '@/stores/dashboard-store';

export const CustomizeDashboardModal: React.FC = () => {
  const {
    widgets,
    isCustomizeModalOpen,
    closeCustomizeModal,
    toggleWidget,
    showAllWidgets,
    resetDefaultWidgets,
  } = useDashboardStore();

  if (!isCustomizeModalOpen) return null;

  const activeCount = Object.values(widgets).filter(Boolean).length;
  const totalCount = AVAILABLE_WIDGETS.length;

  const categories = Array.from(new Set(AVAILABLE_WIDGETS.map((w) => w.category)));

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[24px] animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-[620px] max-h-[90vh] flex flex-col rounded-[26px] bg-[rgba(5,5,16,0.96)] backdrop-blur-[32px] border border-white/[0.08] p-6 sm:p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.85)] overflow-hidden animate-[cardReveal_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#3869D2]/15 blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[#C57CF9]/15 blur-[70px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_4px_16px_rgba(56,105,210,0.35)]">
              <span className="material-symbols-rounded text-[22px] text-white">dashboard_customize</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[1.25rem] font-black tracking-tight">Customize Dashboard</h2>
                <span className="text-[0.70rem] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70">
                  {activeCount}/{totalCount} Active
                </span>
              </div>
              <p className="text-[0.78rem] text-white/40">
                Show, hide, or arrange widgets to match your personal financial routine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCustomizeModal}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center justify-between mb-4 pb-2 text-[0.75rem] shrink-0">
          <span className="text-white/40 font-medium">Toggle switches to hide or display cards</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={showAllWidgets}
              className="text-[#3869D2] hover:text-[#5a8aee] font-bold transition-colors bg-[#3869D2]/10 hover:bg-[#3869D2]/20 px-2.5 py-1 rounded-lg border border-[#3869D2]/20 cursor-pointer"
            >
              Show All
            </button>
            <button
              type="button"
              onClick={resetDefaultWidgets}
              className="text-white/40 hover:text-white font-medium transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Widgets Categorized List */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1.5 custom-scrollbar">
          {categories.map((category) => {
            const categoryWidgets = AVAILABLE_WIDGETS.filter((w) => w.category === category);
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[0.70rem] font-bold text-white/40 uppercase tracking-[0.08em]">
                    {category}
                  </span>
                  <div className="flex-1 h-[1px] bg-white/[0.04]" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {categoryWidgets.map((widget) => {
                    const isEnabled = widgets[widget.id] ?? true;
                    return (
                      <div
                        key={widget.id}
                        onClick={() => toggleWidget(widget.id)}
                        className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isEnabled
                            ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]'
                            : 'bg-white/[0.01] border-white/[0.03] opacity-50 hover:opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              backgroundColor: `${widget.color}20`,
                              border: `1px solid ${widget.color}40`,
                            }}
                          >
                            <span className="material-symbols-rounded text-[20px]">{widget.icon}</span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[0.88rem] font-bold text-white tracking-tight truncate">
                                {widget.name}
                              </span>
                              {!isEnabled && (
                                <span className="text-[0.62rem] font-semibold px-1.5 py-0.2 rounded bg-white/10 text-white/40 uppercase">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-[0.72rem] text-white/40 truncate leading-snug">
                              {widget.description}
                            </p>
                          </div>
                        </div>

                        {/* Interactive iOS-style Toggle Switch */}
                        <div className="shrink-0">
                          <div
                            className={`relative w-11 h-6 rounded-full transition-colors duration-300 p-0.5 ${
                              isEnabled
                                ? 'bg-gradient-to-r from-[#3869D2] to-[#C57CF9]'
                                : 'bg-white/10'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 transform ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-4 shrink-0">
          <div className="text-[0.75rem] text-white/30">
            Changes save automatically
          </div>
          <button
            type="button"
            onClick={closeCustomizeModal}
            className="px-6 py-2.5 rounded-xl font-bold text-[0.85rem] text-white bg-gradient-to-r from-[#3869D2] to-[#C57CF9] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(56,105,210,0.3)] cursor-pointer border-none"
          >
            Done Customizing
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeDashboardModal;
