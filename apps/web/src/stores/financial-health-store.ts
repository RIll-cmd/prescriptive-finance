import { create } from 'zustand';
import {
  HealthScoreResponse,
  HealthHistoryResponse,
  CashFlowIntelligenceResponse,
  SpendingIntelligenceResponse,
  FinancialInsightsResponse,
  FinancialInsightItem
} from '@financial-os/shared-types';
import { financialApi, FinancialPeriodParams } from '@/features/financial-health/api';

export type FinancialPreset = 'this_month' | 'last_month' | 'this_week' | 'this_year' | 'custom';

interface FinancialHealthState {
  health: HealthScoreResponse | null;
  history: HealthHistoryResponse | null;
  cashFlow: CashFlowIntelligenceResponse | null;
  spending: SpendingIntelligenceResponse | null;
  insights: FinancialInsightsResponse | null;
  preset: FinancialPreset;
  customStartDate?: string;
  customEndDate?: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFullIntelligence: () => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  setPreset: (preset: FinancialPreset, customStart?: string, customEnd?: string) => void;
  dismissInsight: (insightId: string) => Promise<void>;
}

export const useFinancialHealthStore = create<FinancialHealthState>((set, get) => ({
  health: null,
  history: null,
  cashFlow: null,
  spending: null,
  insights: null,
  preset: 'this_month',
  isLoading: false,
  error: null,

  fetchFullIntelligence: async () => {
    set({ isLoading: true, error: null });
    const { preset, customStartDate, customEndDate } = get();
    const params: FinancialPeriodParams = {
      preset,
      start_date: customStartDate,
      end_date: customEndDate
    };

    try {
      const [hRes, histRes, cfRes, spRes, insRes] = await Promise.all([
        financialApi.getHealth(params),
        financialApi.getHealthHistory(12),
        financialApi.getCashFlow(params),
        financialApi.getSpending(params),
        financialApi.getInsights(params),
      ]);

      set({
        health: hRes,
        history: histRes,
        cashFlow: cfRes,
        spending: spRes,
        insights: insRes,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch financial intelligence',
        isLoading: false,
      });
    }
  },

  fetchHealth: async () => {
    const { preset, customStartDate, customEndDate } = get();
    try {
      const hRes = await financialApi.getHealth({
        preset,
        start_date: customStartDate,
        end_date: customEndDate
      });
      set({ health: hRes });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchInsights: async () => {
    const { preset, customStartDate, customEndDate } = get();
    try {
      const insRes = await financialApi.getInsights({
        preset,
        start_date: customStartDate,
        end_date: customEndDate
      });
      set({ insights: insRes });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  setPreset: (preset: FinancialPreset, customStart?: string, customEnd?: string) => {
    set({
      preset,
      customStartDate: customStart,
      customEndDate: customEnd
    });
    get().fetchFullIntelligence();
  },

  dismissInsight: async (insightId: string) => {
    const prev = get().insights;
    if (prev) {
      // Optimistic update
      const filtered = prev.insights.filter((i) => i.id !== insightId);
      set({
        insights: {
          ...prev,
          insights: filtered,
          total_active: filtered.length,
          critical_count: filtered.filter((i) => i.priority === 'CRITICAL').length,
          high_count: filtered.filter((i) => i.priority === 'HIGH').length,
        }
      });
    }

    try {
      await financialApi.dismissInsight(insightId);
    } catch (err: any) {
      // Rollback if failed
      if (prev) set({ insights: prev });
      set({ error: err.message || 'Failed to dismiss insight' });
    }
  }
}));
