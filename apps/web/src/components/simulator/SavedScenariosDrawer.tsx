'use client';

import React, { useEffect } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useAuthStore } from '@/stores/auth-store';
import { SavedScenarioResponse } from '@financial-os/shared-types';

export const SavedScenariosDrawer: React.FC = () => {
  const { user } = useAuthStore();
  const {
    savedScenarios,
    fetchSavedScenarios,
    runSimulation,
    deleteSavedScenario,
    setActiveTab,
  } = useSimulatorStore();

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  useEffect(() => {
    fetchSavedScenarios();
  }, [fetchSavedScenarios]);

  const handleReplay = async (scenario: SavedScenarioResponse) => {
    const changes = scenario.changes.map((c) => ({
      change_type: c.change_type,
      field_name: c.field_name,
      operation: c.operation,
      amount: c.amount,
      interest_rate: c.interest_rate,
      term_months: c.term_months,
      start_date: c.start_date,
      end_date: c.end_date,
      category_name: c.category_name,
    }));

    await runSimulation({
      name: scenario.name,
      type: scenario.type,
      description: scenario.description,
      changes: changes,
    });

    setActiveTab('SIMULATE');
  };

  if (!savedScenarios.length) {
    return (
      <div className="glass-card p-10 rounded-[20px] text-center border border-white/10 space-y-3">
        <div className="w-12 h-12 rounded-[14px] bg-white/[0.04] text-white/40 flex items-center justify-center mx-auto">
          <span className="material-symbols-rounded text-[26px]">bookmark_border</span>
        </div>
        <h4 className="text-[1rem] font-bold text-white tracking-tight">No Saved Scenarios Yet</h4>
        <p className="text-[0.78rem] text-white/40 max-w-sm mx-auto">
          Run any simulation and click &quot;Save Scenario&quot; to keep it in your library for future reference and instant replay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div>
          <h3 className="text-[1.05rem] font-bold text-white tracking-tight">
            Saved Scenarios Library
          </h3>
          <p className="text-[0.72rem] text-white/40">
            {savedScenarios.length} saved hypothetical sandbox models
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedScenarios.map((s) => (
          <div
            key={s.id}
            className="glass-card p-5 rounded-[16px] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-[#3869D2]/10 text-[#3869D2] border border-[#3869D2]/30">
                  {s.type}
                </span>

                <span className="text-[0.68rem] text-white/30">
                  {new Date(s.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <h4 className="text-[0.92rem] font-bold text-white tracking-tight">{s.name}</h4>
              {s.description && (
                <p className="text-[0.75rem] text-white/40 line-clamp-2 mt-1">{s.description}</p>
              )}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleReplay(s)}
                className="flex-1 py-2 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.12] text-white text-[0.75rem] font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-rounded text-[16px]">play_arrow</span>
                <span>Re-simulate</span>
              </button>

              <button
                type="button"
                onClick={() => deleteSavedScenario(s.id)}
                className="p-2 rounded-[8px] text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Delete Scenario"
              >
                <span className="material-symbols-rounded text-[16px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
