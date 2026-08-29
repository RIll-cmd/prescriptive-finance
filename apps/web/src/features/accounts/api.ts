import { apiClient } from '@/lib/api';
import { MoneySource, MoneySourceListResponse, MoneySourceType } from '@financial-os/shared-types';

export interface CreateMoneySourcePayload {
  name: string;
  type?: MoneySourceType;
  currency?: string;
  initial_balance?: number;
  color_hex?: string;
  icon?: string;
  is_default?: boolean;
  auto_credit_interest?: boolean;
  interest_rate_pct?: number;
  interest_frequency?: 'DAILY' | 'MONTHLY';
  withholding_tax_pct?: number;
}

export interface UpdateMoneySourcePayload {
  name?: string;
  type?: MoneySourceType;
  current_balance?: number;
  color_hex?: string;
  icon?: string;
  is_active?: boolean;
  is_default?: boolean;
  auto_credit_interest?: boolean;
  interest_rate_pct?: number;
  interest_frequency?: 'DAILY' | 'MONTHLY';
  withholding_tax_pct?: number;
}

export interface CreditInterestPayload {
  gross_amount?: number;
  tax_amount?: number;
  net_amount?: number;
  description?: string;
}

export const moneySourcesApi = {
  async list(): Promise<MoneySourceListResponse> {
    return apiClient<MoneySourceListResponse>('/money-sources', {
      method: 'GET',
    });
  },

  async create(payload: CreateMoneySourcePayload): Promise<MoneySource> {
    return apiClient<MoneySource>('/money-sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async get(id: string): Promise<MoneySource> {
    return apiClient<MoneySource>(`/money-sources/${id}`, {
      method: 'GET',
    });
  },

  async update(id: string, payload: UpdateMoneySourcePayload): Promise<MoneySource> {
    return apiClient<MoneySource>(`/money-sources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async setDefault(id: string): Promise<MoneySource> {
    return apiClient<MoneySource>(`/money-sources/${id}/set-default`, {
      method: 'POST',
    });
  },

  async creditInterest(id: string, payload?: CreditInterestPayload): Promise<MoneySource> {
    return apiClient<MoneySource>(`/money-sources/${id}/credit-interest`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  async delete(id: string): Promise<{ message: string; success: boolean }> {
    return apiClient<{ message: string; success: boolean }>(`/money-sources/${id}`, {
      method: 'DELETE',
    });
  },
};
