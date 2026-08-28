import { create } from 'zustand';
import { Goal, GoalListResponse, GoalContribution } from '@financial-os/shared-types';
import * as goalApi from '@/features/goals/api';

interface GoalState {
  goals: Goal[];
  summary: {
    total_target_amount: number;
    total_current_amount: number;
    total_required_monthly: number;
    total_count: number;
    active_count: number;
    completed_count: number;
  } | null;
  selectedGoal: Goal | null;
  contributions: GoalContribution[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Modal controls
  isAddModalOpen: boolean;
  isContributeModalOpen: boolean;
  targetGoalForContribution: Goal | null;

  // Actions
  fetchGoals: () => Promise<void>;
  createGoal: (payload: any) => Promise<Goal>;
  updateGoal: (id: string, payload: any) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contribute: (goalId: string, payload: any) => Promise<void>;
  fetchContributions: (goalId: string) => Promise<void>;
  openAddModal: () => void;
  closeAddModal: () => void;
  openContributeModal: (goal: Goal) => void;
  closeContributeModal: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  summary: null,
  selectedGoal: null,
  contributions: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  isAddModalOpen: false,
  isContributeModalOpen: false,
  targetGoalForContribution: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const data: GoalListResponse = await goalApi.fetchGoals();
      set({
        goals: data.items,
        summary: {
          total_target_amount: data.total_target_amount,
          total_current_amount: data.total_current_amount,
          total_required_monthly: data.total_required_monthly,
          total_count: data.total_count,
          active_count: data.active_count,
          completed_count: data.completed_count,
        },
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createGoal: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const created = await goalApi.createGoal(payload);
      await get().fetchGoals();
      set({ isSubmitting: false, isAddModalOpen: false });
      return created;
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  updateGoal: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      await goalApi.updateGoal(id, payload);
      await get().fetchGoals();
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  deleteGoal: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await goalApi.deleteGoal(id);
      await get().fetchGoals();
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  contribute: async (goalId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      await goalApi.contributeToGoal(goalId, payload);
      await get().fetchGoals();
      if (get().selectedGoal?.id === goalId) {
        await get().fetchContributions(goalId);
      }
      set({ isSubmitting: false, isContributeModalOpen: false, targetGoalForContribution: null });
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },

  fetchContributions: async (goalId) => {
    try {
      const data = await goalApi.fetchGoalContributions(goalId);
      set({ contributions: data.items });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  openContributeModal: (goal) => set({ isContributeModalOpen: true, targetGoalForContribution: goal }),
  closeContributeModal: () => set({ isContributeModalOpen: false, targetGoalForContribution: null }),
}));
