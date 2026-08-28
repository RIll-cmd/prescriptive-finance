import { create } from 'zustand';
import { FinancialForecastResponse, ForecastPeriod } from '@financial-os/shared-types';
import { forecastingApi } from '@/features/forecasting/api';

interface ForecastState {
  forecast: FinancialForecastResponse | null;
  period: ForecastPeriod;
  isLoading: boolean;
  error: string | null;

  setPeriod: (period: ForecastPeriod) => void;
  fetchForecast: (periodOverride?: ForecastPeriod, startDate?: string, endDate?: string) => Promise<void>;
}

export const useForecastStore = create<ForecastState>((set, get) => ({
  forecast: null,
  period: 'month_end',
  isLoading: false,
  error: null,

  setPeriod: (period) => {
    set({ period });
    get().fetchForecast(period);
  },

  fetchForecast: async (periodOverride, startDate, endDate) => {
    const activePeriod = periodOverride || get().period;
    set({ isLoading: true, error: null });
    try {
      const data = await forecastingApi.getForecast(activePeriod, startDate, endDate);
      set({ forecast: data, period: activePeriod, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to generate forecast', isLoading: false });
    }
  },
}));
