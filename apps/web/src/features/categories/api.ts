import { apiClient } from '@/lib/api';
import {
  Category,
  CategoryListResponse,
} from '@financial-os/shared-types';

export interface CreateCategoryPayload {
  name: string;
  type?: 'EXPENSE' | 'INCOME';
  icon?: string;
  color_hex?: string;
  is_discretionary?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  type?: 'EXPENSE' | 'INCOME';
  icon?: string;
  color_hex?: string;
  is_discretionary?: boolean;
}

export const categoriesApi = {
  async list(): Promise<CategoryListResponse> {
    return apiClient<CategoryListResponse>('/categories/', {
      method: 'GET',
    });
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    return apiClient<Category>('/categories/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    return apiClient<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string, reassignToId?: string): Promise<void> {
    const qStr = reassignToId ? `?reassign_to_id=${encodeURIComponent(reassignToId)}` : '';
    return apiClient<void>(`/categories/${id}${qStr}`, {
      method: 'DELETE',
    });
  },
};
