export interface TutorialStep {
  targetSelector: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export interface TutorialDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: TutorialStep[];
}

export const TUTORIAL_DEFINITIONS: Record<string, TutorialDefinition> = {
  dashboard: {
    id: 'dashboard',
    title: 'Financial OS Overview',
    description: 'A 4-step walkthrough of your real-time command center and cash flow intelligence.',
    icon: 'dashboard',
    steps: [
      {
        targetSelector: '[data-tour="safe-to-spend"]',
        title: 'Safe-to-Spend Intelligence',
        description: 'Your real-time daily spending buffer calculated after accounting for all upcoming bills, emergency reserve buffers, and goal allocations. Spend guilt-free knowing exactly what remains safe.',
        icon: 'verified_user',
        badge: 'Core Engine',
        preferredPosition: 'bottom',
      },
      {
        targetSelector: '[data-tour="quick-transaction"]',
        title: 'Instant Frictionless Logging',
        description: 'Log income, expenses, or transfers in seconds with automatic smart categorization, currency conversions, and immediate balance updates across all your money sources.',
        icon: 'bolt',
        badge: 'Fast Capture',
        preferredPosition: 'top',
      },
      {
        targetSelector: '[data-tour="balance-card"]',
        title: 'Multi-Source Liquid Net Worth',
        description: 'Aggregates physical cash, digital e-wallets (GCash, Maya), and bank accounts into a unified real-time liquid balance with daily yield interest tracking.',
        icon: 'account_balance_wallet',
        badge: 'Overview',
        preferredPosition: 'bottom',
      },
      {
        targetSelector: '[data-tour="activity-chart"]',
        title: 'Cash Flow & Burn Rate Radar',
        description: 'Visualize income vs expense velocity, category breakdown trends, and monitor cash flow trajectory over time.',
        icon: 'insights',
        badge: 'Analytics',
        preferredPosition: 'bottom',
      },
    ],
  },
  goals: {
    id: 'goals',
    title: 'Financial Goals Center',
    description: 'Set milestones, track required monthly pace, and forecast exact completion dates.',
    icon: 'flag',
    steps: [
      {
        targetSelector: '[data-tour="goals-kpi"]',
        title: 'Goal Milestones & Pace KPIs',
        description: 'Real-time aggregated view of your total saved savings against target milestones, alongside the calculated monthly contribution needed to finish on schedule.',
        icon: 'analytics',
        badge: 'Pace Analytics',
        preferredPosition: 'bottom',
      },
      {
        targetSelector: '[data-tour="goals-grid"]',
        title: 'Milestone Progress & Ledger',
        description: 'Track percentage progress, projected finish dates, and view a complete ledger history of every logged contribution.',
        icon: 'savings',
        badge: 'Milestone Cards',
        preferredPosition: 'top',
      },
      {
        targetSelector: '[data-tour="goals-new"]',
        title: 'Create Target Milestones',
        description: 'Establish goals for emergency funds, major purchases, vacations, or debt freedom with custom target dates and categories.',
        icon: 'add_circle',
        badge: 'Action',
        preferredPosition: 'bottom',
      },
    ],
  },
  simulator: {
    id: 'simulator',
    title: 'What-If Sandbox & Simulator',
    description: 'Test major financial events and purchases in a 100% risk-free deterministic sandbox.',
    icon: 'science',
    steps: [
      {
        targetSelector: '[data-tour="simulator-tabs"]',
        title: 'Zero-Leakage Sandbox Modes',
        description: 'Switch between What-If simulations, Interest & Withholding Tax predictors, scenario comparisons, and runway forecasting.',
        icon: 'science',
        badge: 'Sandbox Engine',
        preferredPosition: 'bottom',
      },
      {
        targetSelector: '[data-tour="simulator-forms"]',
        title: 'Event & Parameter Modeling',
        description: 'Model real-world scenarios: large discretionary purchases, salary changes, recurring expense shifts, or aggressive loan paydowns.',
        icon: 'tune',
        badge: 'Scenario Builder',
        preferredPosition: 'bottom',
      },
      {
        targetSelector: '[data-tour="simulator-impact"]',
        title: 'Predictive Health & Runway Diff',
        description: 'Inspect exact score deltas, goal completion delays, and algorithmic recommendations before committing real capital.',
        icon: 'auto_awesome',
        badge: 'Intelligence',
        preferredPosition: 'top',
      },
    ],
  },
  'safe-to-spend': {
    id: 'safe-to-spend',
    title: 'Safe-to-Spend Calibration',
    description: 'Configure reserve thresholds and payday horizons to safeguard your daily runway.',
    icon: 'verified_user',
    steps: [
      {
        targetSelector: '[data-tour="safe-spend-hero"]',
        title: 'Daily Spending Guardrail',
        description: 'The maximum you can spend today without compromising scheduled bills, subscriptions, or your baseline emergency fund.',
        icon: 'shield',
        badge: 'Deterministic',
        preferredPosition: 'bottom',
      },
      {
        targetSelector: '[data-tour="safe-spend-controls"]',
        title: 'Payday Cycle & Emergency Reserves',
        description: 'Calibrate your spending horizon (Until Payday, Monthly, Weekly) and customize your untouchable emergency reserve cushion.',
        icon: 'tune',
        badge: 'Calibration',
        preferredPosition: 'top',
      },
    ],
  },
};
