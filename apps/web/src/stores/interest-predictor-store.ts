import { create } from 'zustand';
import {
  BankPreset,
  DEFAULT_BANK_PRESETS,
  SimulationSummary,
  DailyPredictionResult,
  simulateEarnings,
  compareBankPresets,
} from '@/utils/interest-engine';

const CUSTOM_PRESETS_KEY = 'financial_os_custom_bank_presets_v1';

const loadCustomPresets = (): BankPreset[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return [];
};

const saveCustomPresets = (presets: BankPreset[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // fallback
  }
};

interface InterestPredictorState {
  customPresets: BankPreset[];
  selectedPresetId: string;
  balance: number;
  annualRatePct: number;
  taxRatePct: number;
  creditingFrequency: 'daily' | 'monthly' | 'quarterly';
  compounding: boolean;
  monthlyContribution: number;
  daysToProject: number;

  isCustomModalOpen: boolean;
  editingPreset: BankPreset | null;

  // Actions
  setBalance: (balance: number) => void;
  setSelectedPreset: (presetId: string) => void;
  setAnnualRate: (rate: number) => void;
  setTaxRate: (tax: number) => void;
  setCreditingFrequency: (freq: 'daily' | 'monthly' | 'quarterly') => void;
  setCompounding: (compounding: boolean) => void;
  setMonthlyContribution: (amount: number) => void;
  setDaysToProject: (days: number) => void;

  addCustomPreset: (preset: Omit<BankPreset, 'id' | 'isCustom'>) => void;
  updateCustomPreset: (preset: BankPreset) => void;
  deleteCustomPreset: (id: string) => void;
  openCustomModal: (presetToEdit?: BankPreset) => void;
  closeCustomModal: () => void;

  // Computed / Helpers
  getAllPresets: () => BankPreset[];
  getSelectedPreset: () => BankPreset | undefined;
  getSimulationResult: () => { summary: SimulationSummary; schedule: DailyPredictionResult[] };
  getBankComparisons: () => ReturnType<typeof compareBankPresets>;
}

export const useInterestPredictorStore = create<InterestPredictorState>((set, get) => ({
  customPresets: loadCustomPresets(),
  selectedPresetId: 'uno_ready',
  balance: 100000, // ₱100,000 baseline
  annualRatePct: 3.50,
  taxRatePct: 20,
  creditingFrequency: 'daily',
  compounding: true,
  monthlyContribution: 0,
  daysToProject: 365,

  isCustomModalOpen: false,
  editingPreset: null,

  setBalance: (balance) => set({ balance: Math.max(0, balance) }),

  setSelectedPreset: (presetId) => {
    const all = get().getAllPresets();
    const found = all.find((p) => p.id === presetId);
    if (found) {
      set({
        selectedPresetId: presetId,
        annualRatePct: found.ratePct,
        taxRatePct: found.taxRatePct,
        creditingFrequency: found.creditingFrequency,
      });
    } else {
      set({ selectedPresetId: presetId });
    }
  },

  setAnnualRate: (annualRatePct) => set({ annualRatePct: Math.max(0, annualRatePct) }),
  setTaxRate: (taxRatePct) => set({ taxRatePct: Math.max(0, Math.min(100, taxRatePct)) }),
  setCreditingFrequency: (creditingFrequency) => set({ creditingFrequency }),
  setCompounding: (compounding) => set({ compounding }),
  setMonthlyContribution: (monthlyContribution) => set({ monthlyContribution: Math.max(0, monthlyContribution) }),
  setDaysToProject: (daysToProject) => set({ daysToProject }),

  addCustomPreset: (presetData) => {
    const newId = `custom_${Date.now()}`;
    const newPreset: BankPreset = {
      ...presetData,
      id: newId,
      isCustom: true,
    };
    const updated = [...get().customPresets, newPreset];
    saveCustomPresets(updated);
    set({
      customPresets: updated,
      selectedPresetId: newId,
      annualRatePct: newPreset.ratePct,
      taxRatePct: newPreset.taxRatePct,
      creditingFrequency: newPreset.creditingFrequency,
      isCustomModalOpen: false,
      editingPreset: null,
    });
  },

  updateCustomPreset: (updatedPreset) => {
    const updated = get().customPresets.map((p) =>
      p.id === updatedPreset.id ? updatedPreset : p
    );
    saveCustomPresets(updated);
    set({
      customPresets: updated,
      annualRatePct: updatedPreset.ratePct,
      taxRatePct: updatedPreset.taxRatePct,
      creditingFrequency: updatedPreset.creditingFrequency,
      isCustomModalOpen: false,
      editingPreset: null,
    });
  },

  deleteCustomPreset: (id) => {
    const updated = get().customPresets.filter((p) => p.id !== id);
    saveCustomPresets(updated);
    set({
      customPresets: updated,
      selectedPresetId: get().selectedPresetId === id ? 'uno_ready' : get().selectedPresetId,
    });
  },

  openCustomModal: (presetToEdit) =>
    set({ isCustomModalOpen: true, editingPreset: presetToEdit || null }),

  closeCustomModal: () => set({ isCustomModalOpen: false, editingPreset: null }),

  getAllPresets: () => {
    return [...DEFAULT_BANK_PRESETS, ...get().customPresets];
  },

  getSelectedPreset: () => {
    const all = get().getAllPresets();
    return all.find((p) => p.id === get().selectedPresetId) || all[0];
  },

  getSimulationResult: () => {
    const state = get();
    const selected = state.getSelectedPreset();

    return simulateEarnings({
      initialBalance: state.balance,
      annualRatePct: state.annualRatePct,
      daysToProject: state.daysToProject,
      taxRatePct: state.taxRatePct,
      creditingFrequency: state.creditingFrequency,
      compounding: state.compounding,
      monthlyContribution: state.monthlyContribution,
      tierThreshold: selected?.tierThreshold,
      tierRatePct: selected?.tierRatePct,
    });
  },

  getBankComparisons: () => {
    const state = get();
    return compareBankPresets(state.balance, state.getAllPresets(), state.daysToProject);
  },
}));
