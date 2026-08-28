import { apiClient } from '@/lib/api';
import {
  CashFlowSummary,
  CategorySpendingResponse,
  MonthlyActivityResponse,
  DailySpendingResponse,
} from '@financial-os/shared-types';

export interface DatePeriodParams {
  start_date?: string;
  end_date?: string;
}

export const analyticsApi = {
  async getSummary(params?: DatePeriodParams): Promise<CashFlowSummary> {
    const query = new URLSearchParams();
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    const qStr = query.toString();
    return apiClient<CashFlowSummary>(`/analytics/summary${qStr ? `?${qStr}` : ''}`, {
      method: 'GET',
    });
  },

  async getSpendingByCategory(params?: DatePeriodParams): Promise<CategorySpendingResponse> {
    const query = new URLSearchParams();
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    const qStr = query.toString();
    return apiClient<CategorySpendingResponse>(`/analytics/spending-by-category${qStr ? `?${qStr}` : ''}`, {
      method: 'GET',
    });
  },

  async getActivityTimeline(year?: number): Promise<MonthlyActivityResponse> {
    const query = new URLSearchParams();
    if (year) query.append('year', String(year));
    const qStr = query.toString();
    return apiClient<MonthlyActivityResponse>(`/analytics/activity-timeline${qStr ? `?${qStr}` : ''}`, {
      method: 'GET',
    });
  },

  async getDailySpending(startDate: string, endDate: string): Promise<DailySpendingResponse> {
    return apiClient<DailySpendingResponse>(`/analytics/daily-spending?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
    });
  },
};
