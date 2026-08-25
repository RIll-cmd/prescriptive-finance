// Universal Shared Types for Financial OS

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'LOAN' | 'CASH';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institutionName?: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category: string;
  isPending: boolean;
}

export interface FinancialHealthScore {
  overallScore: number;
  liquidityScore: number;
  debtScore: number;
  savingsScore: number;
  spendingScore: number;
  lastCalculatedAt: string;
}
