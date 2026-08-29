// Universal Shared Types for Financial OS

export interface User {
  id: string;
  username: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  currency: string;
  timezone: string;
  is_active: boolean;
  is_onboarded: boolean;
  tutorial_progress?: string;
  created_at: string;
  last_login_at?: string | null;
}

export interface TutorialProgressResponse {
  progress: Record<string, boolean>;
}

export interface TutorialCompletePayload {
  page: string;
}

export interface TutorialResetResponse {
  message: string;
  progress: Record<string, boolean>;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
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
  is_default?: boolean;
  auto_credit_interest?: boolean;
  interest_rate_pct?: number;
  interest_frequency?: 'DAILY' | 'MONTHLY';
  withholding_tax_pct?: number;
  last_interest_credited_at?: string | null;
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

export interface TransactionListResponse {
  items: Transaction[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more?: boolean;
}

export interface CreateTransactionPayload {
  money_source_id: string;
  destination_money_source_id?: string | null;
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  merchant?: string | null;
  description?: string | null;
  transaction_date?: string;
  source?: string;
}

export interface UpdateTransactionPayload {
  money_source_id?: string;
  destination_money_source_id?: string | null;
  category_id?: string | null;
  type?: TransactionType;
  amount?: number;
  merchant?: string | null;
  description?: string | null;
  transaction_date?: string;
}

export interface BalanceAdjustmentPayload {
  money_source_id?: string;
  target_balance?: number;
  new_balance?: number;
  reason?: string;
}

// -------------------------------------------------------------
// Phase 2: Analytics & Trends Types
// -------------------------------------------------------------

export interface CashFlowSummary {
  income: number;
  expenses: number;
  net_cash_flow: number;
  savings_rate: number;
}

export interface CategorySpendingItem {
  category_id?: string | null;
  category_name: string;
  icon: string;
  color_hex: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface CategorySpendingResponse {
  total_spending: number;
  categories: CategorySpendingItem[];
}

export interface MonthlyActivityItem {
  month: number;
  key?: string;
  label?: string;
  month_name?: string;
  income: number;
  expense: number;
  expenses?: number;
  net?: number;
}

export interface MonthlyActivityResponse {
  year: number;
  months: MonthlyActivityItem[];
  total_income: number;
  total_expenses: number;
  total_net: number;
}

export interface DailySpendingItem {
  date: string;
  amount: number;
  transaction_count: number;
}

export interface DailySpendingResponse {
  days: DailySpendingItem[];
  total_spending: number;
  average_daily_spending: number;
}

// -------------------------------------------------------------
// Phase 3: Financial Intelligence & Diagnostics Engine
// -------------------------------------------------------------

export interface TrendDelta {
  current: number;
  previous: number;
  absolute_change: number;
  percentage_change?: number | null;
  direction: 'UP' | 'DOWN' | 'FLAT';
  summary: string;
}

export interface WeeklyCashFlowItem {
  week_number: number;
  label: string;
  start_date: string;
  end_date: string;
  income: number;
  expenses: number;
  net_flow: number;
}

export interface DailyCashFlowItem {
  date: string;
  income: number;
  expenses: number;
  net_flow: number;
  transaction_count: number;
}

export interface CashFlowStabilityInfo {
  score: number;
  classification: 'VERY_STABLE' | 'STABLE' | 'VARIABLE' | 'UNSTABLE' | 'HIGHLY_UNSTABLE';
  coefficient_of_variation: number;
  description: string;
}

export interface CashFlowIntelligenceResponse {
  period_start: string;
  period_end: string;
  previous_start: string;
  previous_end: string;
  current_income: number;
  current_expenses: number;
  current_net_flow: number;
  income_trend: TrendDelta;
  expense_trend: TrendDelta;
  net_flow_trend: TrendDelta;
  stability: CashFlowStabilityInfo;
  weekly_breakdown: WeeklyCashFlowItem[];
  daily_breakdown: DailyCashFlowItem[];
  income_transaction_count: number;
  expense_transaction_count: number;
}

export interface CategorySpendingDetail {
  category_id?: string | null;
  category_name: string;
  icon: string;
  color_hex: string;
  is_discretionary: boolean;
  current_amount: number;
  previous_amount: number;
  percentage_of_total: number;
  absolute_change: number;
  percentage_change?: number | null;
  direction: string;
  is_significant_change: boolean;
  transaction_count: number;
}

export interface DiscretionarySplit {
  essential_amount: number;
  discretionary_amount: number;
  uncategorized_amount: number;
  total_expenses: number;
  discretionary_ratio_pct: number;
  essential_ratio_pct: number;
  summary: string;
}

export interface SpendingVelocity {
  calendar_day_average: number;
  active_day_average: number;
  active_days_count: number;
  total_days_count: number;
  weekly_average: number;
  historical_monthly_average: number;
  baseline_variance_pct?: number | null;
}

export interface SpendingIntelligenceResponse {
  period_start: string;
  period_end: string;
  total_expenses: number;
  categories: CategorySpendingDetail[];
  discretionary: DiscretionarySplit;
  velocity: SpendingVelocity;
  significant_changes: CategorySpendingDetail[];
}

export interface FinancialMetricsResponse {
  period_start: string;
  period_end: string;
  net_cash_flow: number;
  savings_rate_pct: number;
  expense_ratio_pct: number;
  discretionary_ratio_pct: number;
  liquidity_coverage_months: number;
  tracked_total_balance: number;
  average_monthly_expenses: number;
  cash_flow_stability_score: number;
}

export interface HealthScoreComponents {
  cash_flow: number;
  savings: number;
  spending: number;
  liquidity: number;
  debt?: number | null;
}

export interface HealthScoreWeights {
  cash_flow: number;
  savings: number;
  spending: number;
  liquidity: number;
  debt: number;
}

export interface HealthScoreExplanation {
  summary: string;
  positive_factors: string[];
  negative_factors: string[];
  changes: string[];
  suggestions: string[];
  component_rationales: Record<string, string>;
}

export interface HealthScoreResponse {
  score: number;
  label: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION' | 'CRITICAL';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence_reason: string;
  history_days: number;
  components: HealthScoreComponents;
  weights: HealthScoreWeights;
  metrics: FinancialMetricsResponse;
  explanation: HealthScoreExplanation;
  evaluated_at: string;
}

export interface HealthHistoryPoint {
  snapshot_date: string;
  score: number;
  label: string;
  cash_flow_score?: number | null;
  savings_score?: number | null;
  spending_score?: number | null;
  liquidity_score?: number | null;
  debt_score?: number | null;
}

export interface HealthHistoryResponse {
  items: HealthHistoryPoint[];
  current_score: number;
  average_score: number;
  score_change: number;
}

export interface FinancialInsightItem {
  id: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  metric?: string | null;
  current_value?: number | null;
  previous_value?: number | null;
  percentage_change?: number | null;
  is_dismissed: boolean;
  created_at: string;
}

export interface FinancialInsightsResponse {
  insights: FinancialInsightItem[];
  critical_count: number;
  high_count: number;
  total_active: number;
}

// -------------------------------------------------------------
// Phase 4: Goals + Bills + Safe-to-Spend Decision Engine
// -------------------------------------------------------------

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' | 'OVERDUE';
export type GoalPaceStatus = 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED' | 'OVERDUE';

export interface GoalAnalytics {
  progress_pct: number;
  remaining_amount: number;
  required_monthly_contribution: number;
  required_weekly_contribution: number;
  current_pace_monthly: number;
  pace_status: GoalPaceStatus;
  pace_ratio_pct: number;
  estimated_completion_date?: string | null;
  days_remaining?: number | null;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  category?: string | null;
  color_hex: string;
  icon: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  analytics?: GoalAnalytics | null;
}

export interface GoalListResponse {
  items: Goal[];
  total_target_amount: number;
  total_current_amount: number;
  total_required_monthly: number;
  total_count: number;
  active_count: number;
  completed_count: number;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  money_source_id?: string | null;
  transaction_id?: string | null;
  note?: string | null;
  created_at: string;
}

export interface GoalContributionListResponse {
  items: GoalContribution[];
  total_amount: number;
  total_count: number;
}

export type BillFrequency = 'ONE_TIME' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BillStatus = 'UPCOMING' | 'DUE' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Bill {
  id: string;
  user_id: string;
  category_id?: string | null;
  category_name?: string | null;
  name: string;
  amount: number;
  due_date: string;
  is_recurring: boolean;
  frequency: BillFrequency;
  status: BillStatus;
  auto_record_transaction: boolean;
  color_hex: string;
  icon: string;
  notes?: string | null;
  days_until_due: number;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpcomingBillsSummary {
  total_due_next_30d: number;
  total_due_until_payday: number;
  bills_count: number;
  overdue_count: number;
  overdue_amount: number;
  next_bill_due?: Bill | null;
}

export interface BillCalendarItem {
  date: string;
  bills: Bill[];
  total_due: number;
}

export interface BillListResponse {
  items: Bill[];
  summary: UpcomingBillsSummary;
  total_count: number;
}

export interface BillPayment {
  id: string;
  bill_id: string;
  user_id: string;
  amount: number;
  due_date: string;
  paid_date: string;
  money_source_id?: string | null;
  transaction_id?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
}

export interface BillPaymentListResponse {
  items: BillPayment[];
  total_paid_amount: number;
  total_count: number;
}

export type IncomeFrequency = 'MONTHLY' | 'SEMIMONTHLY' | 'BIWEEKLY' | 'WEEKLY' | 'ONE_TIME';

export interface IncomeExpectation {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  payday_day_of_month?: number | null;
  payday_day_of_week?: number | null;
  next_expected_date: string;
  money_source_id?: string | null;
  money_source_name?: string | null;
  is_active: boolean;
  days_until_next: number;
  created_at: string;
  updated_at: string;
}

export interface IncomeExpectationListResponse {
  items: IncomeExpectation[];
  total_monthly_expected: number;
  next_payday_date?: string | null;
  days_until_next_payday?: number | null;
  total_count: number;
}

export interface FinancialSettings {
  emergency_reserve_amount: number;
  safe_to_spend_mode: 'UNTIL_PAYDAY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  updated_at: string;
}

export type SafeToSpendStatus = 'HEALTHY' | 'CAUTION' | 'AT_RISK' | 'UNSAFE';
export type SpendingPaceStatus = 'UNDER_PACE' | 'ON_PACE' | 'NEAR_LIMIT' | 'OVER_PACE';

export interface SafeToSpendResponse {
  available_money: number;
  expected_income: number;
  upcoming_bills: number;
  goal_allocations: number;
  emergency_reserve: number;
  flexible_cash: number;
  safe_daily: number;
  safe_weekly: number;
  safe_until_payday: number;
  safe_monthly: number;
  planning_horizon_days: number;
  planning_horizon_label: string;
  next_payday_date?: string | null;
  days_until_payday?: number | null;
  status: SafeToSpendStatus;
  spending_pace: SpendingPaceStatus;
  current_daily_pace: number;
  is_shortfall: boolean;
  shortfall_amount: number;
  explanation_summary: string;
  evaluated_at: string;
}

export interface CashBalanceForecastPoint {
  date: string;
  day_label: string;
  projected_balance: number;
  event_type?: 'INCOME' | 'BILL' | 'GOAL' | 'DAILY_BURN' | null;
  event_description?: string | null;
  event_amount?: number | null;
  is_below_reserve: boolean;
  is_negative: boolean;
}

export interface CashBalanceForecastResponse {
  timeline: CashBalanceForecastPoint[];
  starting_balance: number;
  ending_balance: number;
  min_projected_balance: number;
  emergency_reserve: number;
  has_reserve_breach: boolean;
  has_overdraft_risk: boolean;
  reserve_breach_date?: string | null;
  overdraft_date?: string | null;
  forecast_days: number;
}

// -------------------------------------------------------------
// Phase 5: Forecasting & What-If Simulator
// -------------------------------------------------------------

export type ForecastPeriod = 'month_end' | '7_days' | '30_days' | '3_months' | '6_months' | '12_months' | 'custom';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ShortageRiskLevel = 'NONE' | 'LOW_TIMING_RISK' | 'RESERVE_BREACH' | 'CRITICAL_DEFICIT';

export interface IncomeForecastItem {
  source_name: string;
  amount: number;
  expected_date: string;
  is_guaranteed: boolean;
}

export interface ExpenseForecastCategory {
  category_id?: string | null;
  category_name: string;
  icon: string;
  color_hex: string;
  known_bills_amount: number;
  estimated_variable_amount: number;
  total_projected: number;
  percentage_of_total: number;
}

export interface ForecastTrajectoryPoint {
  date: string;
  day_label: string;
  projected_balance: number;
  known_income: number;
  known_expenses: number;
  estimated_variable_burn: number;
  is_below_reserve: boolean;
  is_negative: boolean;
  event_description?: string | null;
}

export interface GoalCompletionForecast {
  goal_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  current_pace_monthly: number;
  estimated_completion_date?: string | null;
  target_date?: string | null;
  delay_months: number;
  pace_status: string;
}

export interface ShortageAlert {
  has_shortage: boolean;
  risk_level: ShortageRiskLevel;
  shortfall_amount: number;
  deficit_date?: string | null;
  recovery_date?: string | null;
  title: string;
  description: string;
  mitigation_advice?: string | null;
}

export interface ConfidenceScore {
  level: ConfidenceLevel;
  score: number;
  rationale: string;
  history_days: number;
  variance_rating: string;
}

export interface FinancialForecastResponse {
  period: ForecastPeriod;
  period_start: string;
  period_end: string;
  total_days: number;
  current_liquid_balance: number;
  emergency_reserve_target: number;
  projected_income: number;
  projected_known_expenses: number;
  projected_variable_expenses: number;
  projected_total_expenses: number;
  projected_net_savings: number;
  projected_end_balance: number;
  confidence: ConfidenceScore;
  shortage_alert: ShortageAlert;
  categories: ExpenseForecastCategory[];
  goals_forecast: GoalCompletionForecast[];
  trajectory: ForecastTrajectoryPoint[];
}

export type ScenarioType = 'PURCHASE' | 'INCOME_CHANGE' | 'EXPENSE_CHANGE' | 'SAVINGS_CHANGE' | 'DEBT' | 'CUSTOM';
export type ScenarioRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SimulationChangeInput {
  change_type: string;
  field_name?: string | null;
  operation?: string;
  amount: number;
  interest_rate?: number | null;
  term_months?: number | null;
  start_date: string;
  end_date?: string | null;
  category_name?: string | null;
  metadata_json?: string | null;
}

export interface RunSimulationRequest {
  name: string;
  type: ScenarioType;
  description?: string | null;
  changes: SimulationChangeInput[];
}

export interface LoanAmortizationSummary {
  principal_amount: number;
  annual_interest_rate: number;
  term_months: number;
  monthly_payment: number;
  total_repayment: number;
  total_interest: number;
}

export interface HealthScoreComponentDiff {
  current: number;
  scenario: number;
  delta: number;
}

export interface HealthScoreDiff {
  current_score: number;
  scenario_score: number;
  score_delta: number;
  current_label: string;
  scenario_label: string;
  components: Record<string, HealthScoreComponentDiff>;
}

export interface GoalImpactItem {
  goal_id: string;
  goal_name: string;
  target_amount: number;
  current_finish_date?: string | null;
  scenario_finish_date?: string | null;
  delay_months: number;
  is_delayed: boolean;
  required_monthly_current: number;
  required_monthly_scenario: number;
}

export interface SimulationSnapshot {
  liquid_cash: number;
  emergency_reserve: number;
  emergency_coverage_months: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  safe_daily_spend: number;
  health_score: number;
  health_label: string;
}

export interface SimulationResultResponse {
  scenario_name: string;
  scenario_type: ScenarioType;
  description?: string | null;
  baseline: SimulationSnapshot;
  simulated: SimulationSnapshot;
  cash_delta: number;
  emergency_coverage_delta_months: number;
  safe_daily_spend_delta: number;
  health_diff: HealthScoreDiff;
  goals_impact: GoalImpactItem[];
  loan_summary?: LoanAmortizationSummary | null;
  risk_level: ScenarioRiskLevel;
  risk_factors: string[];
  recommendation_title: string;
  recommendation_summary: string;
  key_tradeoffs: string[];
}

export interface ScenarioComparisonRequest {
  scenarios: RunSimulationRequest[];
}

export interface ScenarioComparisonItem {
  id?: string | null;
  name: string;
  type: ScenarioType;
  cost_or_amount: number;
  remaining_cash: number;
  emergency_coverage_months: number;
  health_score: number;
  safe_daily_spend: number;
  goals_delayed_count: number;
  max_goal_delay_months: number;
  risk_level: ScenarioRiskLevel;
  is_recommended: boolean;
}

export interface ScenarioComparisonResponse {
  items: ScenarioComparisonItem[];
  best_for_cash: string;
  best_for_health: string;
  best_for_goals: string;
  overall_recommendation: string;
}

export interface SavedScenarioChangeResponse {
  id: string;
  change_type: string;
  field_name?: string | null;
  operation: string;
  amount: number;
  interest_rate?: number | null;
  term_months?: number | null;
  start_date: string;
  end_date?: string | null;
  category_name?: string | null;
  metadata_json?: string | null;
  created_at: string;
}

export interface SavedScenarioResponse {
  id: string;
  user_id: string;
  name: string;
  type: ScenarioType;
  description?: string | null;
  changes: SavedScenarioChangeResponse[];
  created_at: string;
  updated_at: string;
}

export interface SaveScenarioRequest {
  name: string;
  type: ScenarioType;
  description?: string | null;
  changes: SimulationChangeInput[];
}
