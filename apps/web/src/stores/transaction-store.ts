import { create } from 'zustand';
import {
  Transaction,
  TransactionType,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  BalanceAdjustmentPayload,
} from '@financial-os/shared-types';
import { transactionsApi, ListTransactionsParams } from '@/features/transactions/api';
import { useAuthStore } from './auth-store';

interface TransactionFilters {
  type: TransactionType | 'ALL';
  categoryId?: string;
  moneySourceId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy: 'date' | 'amount' | 'created_at';
  sortOrder: 'desc' | 'asc';
}

interface TransactionState {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;

  // Active filters
  filters: TransactionFilters;

  // Modals state
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDetailsModalOpen: boolean;
  selectedTransaction: Transaction | null;
  prefilledType: TransactionType;

  // Actions
  fetchTransactions: (resetPage?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (newFilters: Partial<TransactionFilters>) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;

  createTransaction: (payload: CreateTransactionPayload) => Promise<Transaction>;
  updateTransaction: (id: string, payload: UpdateTransactionPayload) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  adjustBalance: (payload: BalanceAdjustmentPayload) => Promise<Transaction>;

  // Modal controls
  openAddModal: (type?: TransactionType) => void;
  openEditModal: (txn: Transaction) => void;
  openDetailsModal: (txn: Transaction) => void;
  closeModals: () => void;
}

const DEFAULT_FILTERS: TransactionFilters = {
  type: 'ALL',
  categoryId: undefined,
  moneySourceId: undefined,
  startDate: undefined,
  endDate: undefined,
  search: undefined,
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  totalCount: 0,
  page: 1,
  limit: 25,
  hasMore: false,
  isLoading: false,
  error: null,

  filters: DEFAULT_FILTERS,

  isAddModalOpen: false,
  isEditModalOpen: false,
  isDetailsModalOpen: false,
  selectedTransaction: null,
  prefilledType: 'EXPENSE',

  fetchTransactions: async (resetPage = false) => {
    const { filters, page, limit } = get();
    const currentPage = resetPage ? 1 : page;

    set({ isLoading: true, error: null });

    try {
      const params: ListTransactionsParams = {
        type: filters.type === 'ALL' ? undefined : filters.type,
        category_id: filters.categoryId || undefined,
        money_source_id: filters.moneySourceId || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        search: filters.search || undefined,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        page: currentPage,
        limit,
      };

      const res = await transactionsApi.list(params);

      set({
        transactions: res.items || [],
        totalCount: res.total_count || 0,
        page: currentPage,
        hasMore: res.has_more,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  loadMore: async () => {
    const { hasMore, isLoading, page, limit, filters, transactions } = get();
    if (!hasMore || isLoading) return;

    const nextPage = page + 1;
    set({ isLoading: true });

    try {
      const params: ListTransactionsParams = {
        type: filters.type === 'ALL' ? undefined : filters.type,
        category_id: filters.categoryId || undefined,
        money_source_id: filters.moneySourceId || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        search: filters.search || undefined,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        page: nextPage,
        limit,
      };

      const res = await transactionsApi.list(params);

      set({
        transactions: [...transactions, ...(res.items || [])],
        totalCount: res.total_count || 0,
        page: nextPage,
        hasMore: res.has_more,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to load more transactions',
        isLoading: false,
      });
    }
  },

  setFilter: (newFilters: Partial<TransactionFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1,
    }));
    get().fetchTransactions(true);
  },

  setSearch: (search: string) => {
    set((state) => ({
      filters: { ...state.filters, search: search.trim() || undefined },
      page: 1,
    }));
    get().fetchTransactions(true);
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS, page: 1 });
    get().fetchTransactions(true);
  },

  createTransaction: async (payload: CreateTransactionPayload) => {
    try {
      const newTxn = await transactionsApi.create(payload);
      // Refresh transaction ledger and user balance in background
      await get().fetchTransactions(true);
      useAuthStore.getState().fetchMoneySources();
      return newTxn;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create transaction' });
      throw err;
    }
  },

  updateTransaction: async (id: string, payload: UpdateTransactionPayload) => {
    try {
      const updated = await transactionsApi.update(id, payload);
      await get().fetchTransactions();
      useAuthStore.getState().fetchMoneySources();
      if (get().selectedTransaction?.id === id) {
        set({ selectedTransaction: updated });
      }
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update transaction' });
      throw err;
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await transactionsApi.delete(id);
      await get().fetchTransactions();
      useAuthStore.getState().fetchMoneySources();
      get().closeModals();
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete transaction' });
      throw err;
    }
  },

  adjustBalance: async (payload: BalanceAdjustmentPayload) => {
    try {
      const auditTxn = await transactionsApi.adjustBalance(payload);
      await get().fetchTransactions(true);
      useAuthStore.getState().fetchMoneySources();
      return auditTxn;
    } catch (err: any) {
      set({ error: err.message || 'Failed to adjust balance' });
      throw err;
    }
  },

  openAddModal: (type: TransactionType = 'EXPENSE') => {
    set({
      isAddModalOpen: true,
      prefilledType: type,
      selectedTransaction: null,
    });
  },

  openEditModal: (txn: Transaction) => {
    set({
      isEditModalOpen: true,
      selectedTransaction: txn,
      isDetailsModalOpen: false,
    });
  },

  openDetailsModal: (txn: Transaction) => {
    set({
      isDetailsModalOpen: true,
      selectedTransaction: txn,
    });
  },

  closeModals: () => {
    set({
      isAddModalOpen: false,
      isEditModalOpen: false,
      isDetailsModalOpen: false,
      selectedTransaction: null,
    });
  },
}));
