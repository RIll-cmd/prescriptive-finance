import { create } from 'zustand';
import {
  CashFlowSummary,
  CategorySpendingResponse,
  MonthlyActivityResponse,
  DailySpendingResponse,
} from '@financial-os/shared-types';
import { analyticsApi, DatePeriodParams } from '@/features/analytics/api';

export type TimePeriodPreset = 'this_month' | 'last_month' | 'this_week' | 'today' | 'this_year' | 'all' | 'custom';

export function getPeriodDateRange(period: TimePeriodPreset, customStart?: string, customEnd?: string): DatePeriodParams {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  switch (period) {
    case 'today':
      return { start_date: todayStr, end_date: todayStr };

    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(now.setDate(diff));
      return {
        start_date: monday.toISOString().split('T')[0],
        end_date: todayStr,
      };
    }

    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start_date: firstDay.toISOString().split('T')[0],
        end_date: todayStr,
      };
    }

    case 'last_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start_date: firstDay.toISOString().split('T')[0],
        end_date: lastDay.toISOString().split('T')[0],
      };
    }

    case 'this_year': {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      return {
        start_date: firstDay.toISOString().split('T')[0],
        end_date: todayStr,
      };
    }

    case 'custom':
      return {
        start_date: customStart || undefined,
        end_date: customEnd || undefined,
      };

    case 'all':
    default:
      return {};
  }
}

interface AnalyticsState {
  summary: CashFlowSummary | null;
  categorySpending: CategorySpendingResponse | null;
  monthlyActivity: MonthlyActivityResponse | null;
  dailySpending: DailySpendingResponse | null;
  period: TimePeriodPreset;
  customStartDate?: string;
  customEndDate?: string;
  selectedYear: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardAnalytics: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchCategorySpending: () => Promise<void>;
  fetchMonthlyActivity: (year?: number) => Promise<void>;
  fetchDailySpending: (startDate: string, endDate: string) => Promise<void>;
  setPeriod: (period: TimePeriodPreset, customStart?: string, customEnd?: string) => void;
  setSelectedYear: (year: number) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  summary: null,
  categorySpending: null,
  monthlyActivity: null,
  dailySpending: null,
  period: 'this_month',
  selectedYear: new Date().getFullYear(),
  isLoading: false,
  error: null,

  fetchDashboardAnalytics: async () => {
    set({ isLoading: true, error: null });
    const { period, customStartDate, customEndDate, selectedYear } = get();
    const dateRange = getPeriodDateRange(period, customStartDate, customEndDate);

    try {
      const [sumRes, catRes, actRes] = await Promise.all([
        analyticsApi.getSummary(dateRange),
        analyticsApi.getSpendingByCategory(dateRange),
        analyticsApi.getActivityTimeline(selectedYear),
      ]);

      set({
        summary: sumRes,
        categorySpending: catRes,
        monthlyActivity: actRes,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch analytics',
        isLoading: false,
      });
    }
  },

  fetchSummary: async () => {
    const { period, customStartDate, customEndDate } = get();
    const dateRange = getPeriodDateRange(period, customStartDate, customEndDate);
    try {
      const res = await analyticsApi.getSummary(dateRange);
      set({ summary: res });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch summary' });
    }
  },

  fetchCategorySpending: async () => {
    const { period, customStartDate, customEndDate } = get();
    const dateRange = getPeriodDateRange(period, customStartDate, customEndDate);
    try {
      const res = await analyticsApi.getSpendingByCategory(dateRange);
      set({ categorySpending: res });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch category spending' });
    }
  },

  fetchMonthlyActivity: async (year?: number) => {
    const targetYear = year || get().selectedYear;
    try {
      const res = await analyticsApi.getActivityTimeline(targetYear);
      set({ monthlyActivity: res, selectedYear: targetYear });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch monthly activity' });
    }
  },

  fetchDailySpending: async (startDate: string, endDate: string) => {
    try {
      const res = await analyticsApi.getDailySpending(startDate, endDate);
      set({ dailySpending: res });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch daily spending' });
    }
  },

  setPeriod: (period: TimePeriodPreset, customStart?: string, customEnd?: string) => {
    set({
      period,
      customStartDate: customStart,
      customEndDate: customEnd,
    });
    get().fetchDashboardAnalytics();
  },

  setSelectedYear: (year: number) => {
    set({ selectedYear: year });
    get().fetchMonthlyActivity(year);
  },
}));
