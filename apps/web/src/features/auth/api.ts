import { apiClient } from '@/lib/api';
import { User, AuthResponse } from '@financial-os/shared-types';

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  currency?: string;
  timezone?: string;
  is_onboarded?: boolean;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ message: string; success: boolean }> {
    return apiClient<{ message: string; success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<User> {
    return apiClient<User>('/auth/me', {
      method: 'GET',
    });
  },

  async updateProfile(payload: UserUpdatePayload): Promise<User> {
    return apiClient<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
