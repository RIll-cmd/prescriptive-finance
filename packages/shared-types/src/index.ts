// Universal Shared Types for Financial OS

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  avatar_url?: string | null;
  currency: string;
  timezone: string;
  is_active: boolean;
  is_onboarded: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export type MoneySourceType = 'CASH' | 'E_WALLET' | 'BANK' | 'CREDIT_CARD' | 'OTHER';

export interface MoneySource {
  id: string;
  user_id: string;
  name: string;
  type: MoneySourceType;
  currency: string;
  initial_balance: number;
  current_balance: number;
  color_hex: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MoneySourceListResponse {
  items: MoneySource[];
  total_liquid_balance: number;
  total_count: number;
}

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color_hex: string;
  is_default: boolean;
  is_discretionary: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
