import { apiClient } from '@/lib/api';
import {
  Transaction,
  TransactionListResponse,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  BalanceAdjustmentPayload,
  TransactionType,
} from '@financial-os/shared-types';

export interface ListTransactionsParams {
  type?: TransactionType | 'ALL';
  category_id?: string;
  money_source_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  sort_by?: 'date' | 'amount' | 'created_at';
  sort_order?: 'desc' | 'asc';
  page?: number;
  limit?: number;
}

export const transactionsApi = {
  async list(params?: ListTransactionsParams): Promise<TransactionListResponse> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return apiClient<TransactionListResponse>(`/transactions/${qStr ? `?${qStr}` : ''}`, {
      method: 'GET',
    });
  },

  async get(id: string): Promise<Transaction> {
    return apiClient<Transaction>(`/transactions/${id}`, {
      method: 'GET',
    });
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    return apiClient<Transaction>('/transactions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpdateTransactionPayload): Promise<Transaction> {
    return apiClient<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  async adjustBalance(payload: BalanceAdjustmentPayload): Promise<Transaction> {
    return apiClient<Transaction>('/transactions/adjust-balance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
