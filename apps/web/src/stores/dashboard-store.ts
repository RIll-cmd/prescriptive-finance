import { create } from 'zustand';

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  category: 'Core' | 'Decision Engine' | 'Operations' | 'Planning' | 'Ledger';
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export const AVAILABLE_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'balance',
    name: 'Total Liquid Balance & 3D Card',
    category: 'Core',
    description: 'Active liquid balance across all connected sources with 3D interactive card.',
    icon: 'account_balance_wallet',
    color: '#3869D2',
    enabled: true,
  },
  {
    id: 'activity',
    name: 'Cash Flow Activity Chart',
    category: 'Decision Engine',
    description: 'Monthly income vs expense trends and historical cash flows.',
    icon: 'monitoring',
    color: '#C57CF9',
    enabled: true,
  },
  {
    id: 'safe_to_spend',
    name: 'Safe-to-Spend & Daily Limit',
    category: 'Decision Engine',
    description: 'Real-time safe daily allowance, goal reserve buffer, and health status.',
    icon: 'verified_user',
    color: '#34d399',
    enabled: true,
  },
  {
    id: 'quick_transaction',
    name: 'Quick Transaction',
    category: 'Operations',
    description: 'Log daily expenses in seconds with 1-click categories and default wallet.',
    icon: 'bolt',
    color: '#F59E0B',
    enabled: true,
  },
  {
    id: 'bills',
    name: 'Upcoming Bills & Subscriptions',
    category: 'Operations',
    description: 'Track due obligations, auto-advance recurring bills, and avoid late fees.',
    icon: 'receipt_long',
    color: '#06B6D4',
    enabled: true,
  },
  {
    id: 'transfer',
    name: 'Quick Transfer',
    category: 'Operations',
    description: 'Instantly move funds between cash, e-wallets, and bank accounts.',
    icon: 'swap_horiz',
    color: '#EC4899',
    enabled: true,
  },
  {
    id: 'goals',
    name: 'Financial Goals Tracker',
    category: 'Planning',
    description: 'Track progress toward active savings goals and major milestones.',
    icon: 'flag',
    color: '#F59E0B',
    enabled: true,
  },
  {
    id: 'forecast',
    name: 'Month-End & Forward Forecast',
    category: 'Planning',
    description: 'Deterministic 30-day projection, trajectory line, and shortage risk radar.',
    icon: 'trending_up',
    color: '#8B5CF6',
    enabled: true,
  },
  {
    id: 'transactions',
    name: 'Recent Transactions Ledger',
    category: 'Ledger',
    description: 'Searchable log of recent income, expense, and transfer movements.',
    icon: 'receipt',
    color: '#3869D2',
    enabled: true,
  },
  {
    id: 'interest_predictor',
    name: 'Interest & Tax Yield Predictor',
    category: 'Planning',
    description: 'Calculate daily/monthly net passive interest earnings after 20% withholding tax.',
    icon: 'calculate',
    color: '#10B981',
    enabled: true,
  },
];

const STORAGE_KEY = 'financial_os_dashboard_widgets_v1';

const getInitialWidgetState = (): Record<string, boolean> => {
  if (typeof window === 'undefined') {
    return AVAILABLE_WIDGETS.reduce((acc, w) => ({ ...acc, [w.id]: true }), {});
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all current widgets are represented
      const result: Record<string, boolean> = {};
      AVAILABLE_WIDGETS.forEach((w) => {
        result[w.id] = parsed[w.id] !== undefined ? parsed[w.id] : true;
      });
      return result;
    }
  } catch {
    // Fallback on parse error
  }

  return AVAILABLE_WIDGETS.reduce((acc, w) => ({ ...acc, [w.id]: true }), {});
};

interface DashboardStoreState {
  widgets: Record<string, boolean>;
  isCustomizeModalOpen: boolean;
  isCustomizingMode: boolean;

  toggleWidget: (id: string) => void;
  setWidget: (id: string, enabled: boolean) => void;
  showAllWidgets: () => void;
  resetDefaultWidgets: () => void;
  openCustomizeModal: () => void;
  closeCustomizeModal: () => void;
  toggleCustomizingMode: () => void;
}

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  widgets: getInitialWidgetState(),
  isCustomizeModalOpen: false,
  isCustomizingMode: false,

  toggleWidget: (id: string) => {
    const current = get().widgets;
    const updated = {
      ...current,
      [id]: !current[id],
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ widgets: updated });
  },

  setWidget: (id: string, enabled: boolean) => {
    const current = get().widgets;
    const updated = {
      ...current,
      [id]: enabled,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ widgets: updated });
  },

  showAllWidgets: () => {
    const updated = AVAILABLE_WIDGETS.reduce((acc, w) => ({ ...acc, [w.id]: true }), {});
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ widgets: updated });
  },

  resetDefaultWidgets: () => {
    const updated = AVAILABLE_WIDGETS.reduce((acc, w) => ({ ...acc, [w.id]: true }), {});
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ widgets: updated });
  },

  openCustomizeModal: () => set({ isCustomizeModalOpen: true }),
  closeCustomizeModal: () => set({ isCustomizeModalOpen: false }),
  toggleCustomizingMode: () => set((s) => ({ isCustomizingMode: !s.isCustomizingMode })),
}));
