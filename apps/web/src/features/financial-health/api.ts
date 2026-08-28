import { apiClient } from '@/lib/api';
import {
  CashFlowSummary,
  CashFlowIntelligenceResponse,
  SpendingIntelligenceResponse,
  FinancialMetricsResponse,
  HealthScoreResponse,
  HealthHistoryResponse,
  FinancialInsightsResponse
} from '@financial-os/shared-types';

export interface FinancialPeriodParams {
  preset?: string;
  start_date?: string;
  end_date?: string;
}

export const financialApi = {
  getSummary: async (params: FinancialPeriodParams = {}): Promise<CashFlowSummary> => {
    const q = new URLSearchParams();
    if (params.preset) q.append('preset', params.preset);
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient<CashFlowSummary>(`/financial/summary${query}`);
  },

  getCashFlow: async (params: FinancialPeriodParams = {}): Promise<CashFlowIntelligenceResponse> => {
    const q = new URLSearchParams();
    if (params.preset) q.append('preset', params.preset);
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient<CashFlowIntelligenceResponse>(`/financial/cash-flow${query}`);
  },

  getSpending: async (params: FinancialPeriodParams = {}): Promise<SpendingIntelligenceResponse> => {
    const q = new URLSearchParams();
    if (params.preset) q.append('preset', params.preset);
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient<SpendingIntelligenceResponse>(`/financial/spending${query}`);
  },

  getMetrics: async (params: FinancialPeriodParams = {}): Promise<FinancialMetricsResponse> => {
    const q = new URLSearchParams();
    if (params.preset) q.append('preset', params.preset);
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient<FinancialMetricsResponse>(`/financial/metrics${query}`);
  },

  getHealth: async (params: FinancialPeriodParams = {}): Promise<HealthScoreResponse> => {
    const q = new URLSearchParams();
    if (params.preset) q.append('preset', params.preset);
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient<HealthScoreResponse>(`/financial/health${query}`);
  },

  getHealthHistory: async (limit: number = 12): Promise<HealthHistoryResponse> => {
    return apiClient<HealthHistoryResponse>(`/financial/health/history?limit=${limit}`);
  },

  getInsights: async (params: FinancialPeriodParams = {}): Promise<FinancialInsightsResponse> => {
    const q = new URLSearchParams();
    if (params.preset) q.append('preset', params.preset);
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiClient<FinancialInsightsResponse>(`/financial/insights${query}`);
  },

  dismissInsight: async (insightId: string): Promise<{ status: string; message: string }> => {
    return apiClient<{ status: string; message: string }>(`/financial/insights/${insightId}/dismiss`, {
      method: 'POST'
    });
  }
};
