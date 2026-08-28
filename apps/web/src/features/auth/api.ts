import { apiClient } from '@/lib/api';
import { User, AuthResponse } from '@financial-os/shared-types';

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  currency?: string;
}

export interface LoginPayload {
  username_or_email: string;
  password: string;
  email?: string;
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
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
      body: JSON.stringify({
        username_or_email: payload.username_or_email || payload.email,
        password: payload.password,
      }),
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
