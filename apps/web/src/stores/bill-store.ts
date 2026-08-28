import { create } from 'zustand';
import { Bill, BillListResponse, UpcomingBillsSummary, BillPayment, BillCalendarItem } from '@financial-os/shared-types';
import * as billApi from '@/features/bills/api';

interface BillState {
  bills: Bill[];
  summary: UpcomingBillsSummary | null;
  calendarItems: BillCalendarItem[];
  selectedBill: Bill | null;
  payments: BillPayment[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Modal states
  isAddModalOpen: boolean;
  isPayModalOpen: boolean;
  targetBillForPayment: Bill | null;

  // Actions
  fetchBills: () => Promise<void>;
  createBill: (payload: any) => Promise<Bill>;
  updateBill: (id: string, payload: any) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  payBill: (billId: string, payload: any) => Promise<void>;
  fetchPayments: (billId: string) => Promise<void>;
  fetchCalendar: (year: number, month: number) => Promise<void>;
  openAddModal: () => void;
  closeAddModal: () => void;
  openPayModal: (bill: Bill) => void;
  closePayModal: () => void;
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  summary: null,
  calendarItems: [],
  selectedBill: null,
  payments: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  isAddModalOpen: false,
  isPayModalOpen: false,
  targetBillForPayment: null,

  fetchBills: async () => {
    set({ isLoading: true, error: null });
    try {
      const data: BillListResponse = await billApi.fetchBills();
      set({
        bills: data.items,
        summary: data.summary,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createBill: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const created = await billApi.createBill(payload);
      await get().fetchBills();
      set({ isSubmitting: false, isAddModalOpen: false });
      return created;
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  updateBill: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      await billApi.updateBill(id, payload);
      await get().fetchBills();
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  deleteBill: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await billApi.deleteBill(id);
      await get().fetchBills();
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  payBill: async (billId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      await billApi.payBill(billId, payload);
      await get().fetchBills();
      if (get().selectedBill?.id === billId) {
        await get().fetchPayments(billId);
      }
      set({ isSubmitting: false, isPayModalOpen: false, targetBillForPayment: null });
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  fetchPayments: async (billId) => {
    try {
      const data = await billApi.fetchBillPayments(billId);
      set({ payments: data.items });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchCalendar: async (year, month) => {
    try {
      const data = await billApi.fetchBillCalendar(year, month);
      set({ calendarItems: data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  openPayModal: (bill) => set({ isPayModalOpen: true, targetBillForPayment: bill }),
  closePayModal: () => set({ isPayModalOpen: false, targetBillForPayment: null }),
}));
