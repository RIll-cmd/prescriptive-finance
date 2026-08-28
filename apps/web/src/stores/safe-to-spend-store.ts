import { create } from 'zustand';
import { SafeToSpendResponse, CashBalanceForecastResponse, FinancialSettings } from '@financial-os/shared-types';
import * as safeToSpendApi from '@/features/safe-to-spend/api';

export type HorizonMode = 'UNTIL_PAYDAY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';

interface SafeToSpendState {
  data: SafeToSpendResponse | null;
  forecast: CashBalanceForecastResponse | null;
  settings: FinancialSettings | null;
  activeMode: HorizonMode;
  forecastDays: number;
  isLoading: boolean;
  isForecastLoading: boolean;
  error: string | null;
  isBreakdownModalOpen: boolean;

  // Actions
  fetchSafeToSpend: (mode?: HorizonMode) => Promise<void>;
  fetchForecast: (days?: number) => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (payload: { emergency_reserve_amount?: number; safe_to_spend_mode?: string }) => Promise<void>;
  setActiveMode: (mode: HorizonMode) => void;
  setForecastDays: (days: number) => void;
  openBreakdownModal: () => void;
  closeBreakdownModal: () => void;
}

export const useSafeToSpendStore = create<SafeToSpendState>((set, get) => ({
  data: null,
  forecast: null,
  settings: null,
  activeMode: 'UNTIL_PAYDAY',
  forecastDays: 30,
  isLoading: false,
  isForecastLoading: false,
  error: null,
  isBreakdownModalOpen: false,

  fetchSafeToSpend: async (mode) => {
    const targetMode = mode || get().activeMode;
    set({ isLoading: true, error: null });
    try {
      const data = await safeToSpendApi.fetchSafeToSpend(targetMode);
      set({ data, activeMode: targetMode, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchForecast: async (days) => {
    const targetDays = days || get().forecastDays;
    set({ isForecastLoading: true });
    try {
      const forecast = await safeToSpendApi.fetchForecast(targetDays);
      set({ forecast, forecastDays: targetDays, isForecastLoading: false });
    } catch (err: any) {
      set({ error: err.message, isForecastLoading: false });
    }
  },

  fetchSettings: async () => {
    try {
      const settings = await safeToSpendApi.fetchSettings();
      set({ settings, activeMode: settings.safe_to_spend_mode as HorizonMode });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateSettings: async (payload) => {
    try {
      const updated = await safeToSpendApi.updateSettings(payload);
      set({ settings: updated });
      await get().fetchSafeToSpend();
      await get().fetchForecast();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  setActiveMode: (mode) => {
    set({ activeMode: mode });
    get().fetchSafeToSpend(mode);
  },

  setForecastDays: (days) => {
    set({ forecastDays: days });
    get().fetchForecast(days);
  },

  openBreakdownModal: () => set({ isBreakdownModalOpen: true }),
  closeBreakdownModal: () => set({ isBreakdownModalOpen: false }),
}));
