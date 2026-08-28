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

export interface CategoryListResponse {
  items: Category[];
  total_count: number;
}

export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  user_id: string;
  money_source_id: string;
  destination_money_source_id?: string | null;
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  merchant?: string | null;
  description?: string | null;
  transaction_date: string;
  source: string;
  transfer_id?: string | null;
  created_at: string;
  updated_at: string;

  // Joined display attributes
  money_source_name?: string | null;
  destination_money_source_name?: string | null;
  category_name?: string | null;
  category_icon?: string | null;
  category_color_hex?: string | null;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  money_source_id: string;
  destination_money_source_id?: string | null;
  category_id?: string | null;
  merchant?: string | null;
  description?: string | null;
  transaction_date?: string;
  source?: string;
}

export interface UpdateTransactionPayload {
  type?: TransactionType;
  amount?: number;
  money_source_id?: string;
  destination_money_source_id?: string | null;
  category_id?: string | null;
  merchant?: string | null;
  description?: string | null;
  transaction_date?: string;
}

export interface BalanceAdjustmentPayload {
  money_source_id: string;
  target_balance: number;
  reason?: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface CashFlowSummary {
  total_money: number;
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  savings_rate_pct: number;
  period_start?: string | null;
  period_end?: string | null;
}

export interface CategorySpendingItem {
  category_id?: string | null;
  category_name: string;
  icon: string;
  color_hex: string;
  amount: number;
  percentage: number;
}

export interface CategorySpendingResponse {
  period_start?: string | null;
  period_end?: string | null;
  total_expenses: number;
  categories: CategorySpendingItem[];
}

export interface MonthlyActivityItem {
  key: string;
  label: string;
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyActivityResponse {
  year: number;
  months: MonthlyActivityItem[];
}

export interface DailySpendingItem {
  date: string;
  amount: number;
  count: number;
}

export interface DailySpendingResponse {
  period_start: string;
  period_end: string;
  days: DailySpendingItem[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
