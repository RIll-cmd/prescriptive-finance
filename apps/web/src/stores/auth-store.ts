import { create } from 'zustand';
import { User, MoneySource } from '@financial-os/shared-types';
import { authApi, RegisterPayload, LoginPayload, UserUpdatePayload } from '@/features/auth/api';
import { moneySourcesApi, CreateMoneySourcePayload } from '@/features/accounts/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  moneySources: MoneySource[];
  totalBalance: number;
  error: string | null;
  isAddSourceModalOpen: boolean;

  // Auth actions
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (payload: UserUpdatePayload) => Promise<void>;
  clearError: () => void;

  // Money sources actions
  fetchMoneySources: () => Promise<void>;
  addMoneySource: (payload: CreateMoneySourcePayload) => Promise<MoneySource>;
  deleteMoneySource: (id: string) => Promise<void>;
  completeOnboarding: (name: string, currency: string, initialSources: CreateMoneySourcePayload[]) => Promise<void>;
  openAddSourceModal: () => void;
  closeAddSourceModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  moneySources: [],
  totalBalance: 0,
  error: null,
  isAddSourceModalOpen: false,

  openAddSourceModal: () => set({ isAddSourceModalOpen: true }),
  closeAddSourceModal: () => set({ isAddSourceModalOpen: false }),

  clearError: () => set({ error: null }),

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(payload);
      if (typeof window !== 'undefined' && res.access_token) {
        localStorage.setItem('financial_os_token', res.access_token);
      }
      set({ user: res.user, isAuthenticated: true, isLoading: false, error: null });
      // Fetch money sources in background
      get().fetchMoneySources();
      return res.user;
    } catch (err: any) {
      const msg = err.message || 'Failed to sign in. Please check your credentials.';
      set({ error: msg, isLoading: false, isAuthenticated: false, user: null });
      throw err;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(payload);
      if (typeof window !== 'undefined' && res.access_token) {
        localStorage.setItem('financial_os_token', res.access_token);
      }
      set({ user: res.user, isAuthenticated: true, isLoading: false, error: null });
      return res.user;
    } catch (err: any) {
      const msg = err.message || 'Failed to create account.';
      set({ error: msg, isLoading: false, isAuthenticated: false, user: null });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('financial_os_token');
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        moneySources: [],
        totalBalance: 0,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
      await get().fetchMoneySources();
    } catch {
      // Not authenticated or session expired
      if (typeof window !== 'undefined') {
        localStorage.removeItem('financial_os_token');
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (payload: UserUpdatePayload) => {
    try {
      const updatedUser = await authApi.updateProfile(payload);
      set({ user: updatedUser });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update profile' });
      throw err;
    }
  },

  fetchMoneySources: async () => {
    try {
      const res = await moneySourcesApi.list();
      set({
        moneySources: res.items || [],
        totalBalance: Number(res.total_liquid_balance) || 0,
      });
    } catch {
      // Silent error on background money source fetch
    }
  },

  addMoneySource: async (payload: CreateMoneySourcePayload) => {
    try {
      const newSource = await moneySourcesApi.create(payload);
      await get().fetchMoneySources();
      return newSource;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add money source' });
      throw err;
    }
  },

  deleteMoneySource: async (id: string) => {
    try {
      await moneySourcesApi.delete(id);
      await get().fetchMoneySources();
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete money source' });
      throw err;
    }
  },

  completeOnboarding: async (name: string, currency: string, initialSources: CreateMoneySourcePayload[]) => {
    set({ isLoading: true });
    try {
      // 1. Create selected starting money sources
      for (const src of initialSources) {
        if (src.name && src.name.trim()) {
          try {
            await moneySourcesApi.create(src);
          } catch {
            // continue with next
          }
        }
      }
      // 2. Update user profile to mark onboarded
      const updatedUser = await authApi.updateProfile({
        first_name: name.trim() || undefined,
        currency,
        is_onboarded: true,
      });

      set({ user: updatedUser, isLoading: false });
      await get().fetchMoneySources();
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to complete setup' });
      throw err;
    }
  },
}));
