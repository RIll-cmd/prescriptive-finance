'use client';

import React, { useEffect } from 'react';
import { useSimulatorStore } from '@/stores/simulator-store';
import { useForecastStore } from '@/stores/forecast-store';
import { ScenarioTypeSelector } from '@/components/simulator/ScenarioTypeSelector';
import { PurchaseScenarioForm } from '@/components/simulator/PurchaseScenarioForm';
import { IncomeScenarioForm } from '@/components/simulator/IncomeScenarioForm';
import { ExpenseScenarioForm } from '@/components/simulator/ExpenseScenarioForm';
import { SavingsScenarioForm } from '@/components/simulator/SavingsScenarioForm';
import { DebtScenarioForm } from '@/components/simulator/DebtScenarioForm';
import { CustomScenarioForm } from '@/components/simulator/CustomScenarioForm';
import { ScenarioImpactCard } from '@/components/simulator/ScenarioImpactCard';
import { HealthScoreDiffBreakdown } from '@/components/simulator/HealthScoreDiffBreakdown';
import { GoalImpactList } from '@/components/simulator/GoalImpactList';
import { RecommendationCard } from '@/components/simulator/RecommendationCard';
import { ScenarioComparisonTable } from '@/components/simulator/ScenarioComparisonTable';
import { SavedScenariosDrawer } from '@/components/simulator/SavedScenariosDrawer';
import { ForecastSummaryWidget } from '@/components/forecasting/ForecastSummaryWidget';
import { ForecastTrajectoryChart } from '@/components/forecasting/ForecastTrajectoryChart';
import { ShortageRiskBanner } from '@/components/forecasting/ShortageRiskBanner';
import { CategoryForecastBreakdown } from '@/components/forecasting/CategoryForecastBreakdown';

export default function SimulatorPage() {
  const {
    activeTab,
    setActiveTab,
    activeScenarioType,
    setActiveScenarioType,
    currentSimulation,
  } = useSimulatorStore();

  const { forecast, fetchForecast } = useForecastStore();

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const tabs = [
    { id: 'SIMULATE' as const, label: 'What-If Sandbox', icon: 'science' },
    { id: 'COMPARE' as const, label: 'Scenario Comparison', icon: 'compare_arrows' },
    { id: 'FORECAST' as const, label: 'Forecast Projections', icon: 'trending_up' },
    { id: 'SAVED' as const, label: 'Saved Scenarios', icon: 'bookmarks' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[1.8rem] font-bold text-white tracking-tight">
              Predictive Simulator & Forecasting
            </h1>
            <span className="px-3 py-1 rounded-full text-[0.7rem] font-bold bg-[#3869D2]/15 text-[#3869D2] border border-[#3869D2]/30 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-rounded text-[14px]">bolt</span>
              <span>Zero-Leakage Sandbox</span>
            </span>
          </div>
          <p className="text-[0.82rem] text-white/40 mt-1">
            Test major life decisions, purchases, loans, and cash-flow scenarios in a 100% deterministic risk-free sandbox
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-[14px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-md overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-[10px] text-[0.82rem] font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white shadow-[0_4px_16px_rgba(197,124,249,0.3)]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="material-symbols-rounded text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: WHAT-IF SANDBOX */}
      {activeTab === 'SIMULATE' && (
        <div className="space-y-6">
          {/* Preset Selector */}
          <ScenarioTypeSelector
            activeType={activeScenarioType}
            onSelect={setActiveScenarioType}
          />

          {/* Active Scenario Form */}
          {activeScenarioType === 'PURCHASE' && <PurchaseScenarioForm />}
          {activeScenarioType === 'INCOME_CHANGE' && <IncomeScenarioForm />}
          {activeScenarioType === 'EXPENSE_CHANGE' && <ExpenseScenarioForm />}
          {activeScenarioType === 'SAVINGS_CHANGE' && <SavingsScenarioForm />}
          {activeScenarioType === 'DEBT' && <DebtScenarioForm />}
          {activeScenarioType === 'CUSTOM' && <CustomScenarioForm />}

          {/* Simulation Output Area */}
          {currentSimulation && (
            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 pb-2">
                <span className="material-symbols-rounded text-[20px] text-[#C57CF9]">
                  auto_awesome
                </span>
                <h2 className="text-[1.2rem] font-bold text-white tracking-tight">
                  Simulation Impact Results
                </h2>
              </div>

              {/* Hero Impact Card */}
              <ScenarioImpactCard simulation={currentSimulation} />

              {/* Recommendation Card */}
              <RecommendationCard
                title={currentSimulation.recommendation_title}
                summary={currentSimulation.recommendation_summary}
                tradeoffs={currentSimulation.key_tradeoffs}
                riskLevel={currentSimulation.risk_level}
              />

              {/* Grid: Health Score Breakdown + Goal Impacts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthScoreDiffBreakdown healthDiff={currentSimulation.health_diff} />
                <GoalImpactList goalsImpact={currentSimulation.goals_impact} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCENARIO COMPARISON */}
      {activeTab === 'COMPARE' && <ScenarioComparisonTable />}

      {/* TAB 3: FORECAST PROJECTIONS */}
      {activeTab === 'FORECAST' && (
        <div className="space-y-6">
          {forecast?.shortage_alert && (
            <ShortageRiskBanner shortage={forecast.shortage_alert} />
          )}

          <ForecastSummaryWidget />

          {forecast && (
            <>
              <ForecastTrajectoryChart
                trajectory={forecast.trajectory}
                emergencyReserveTarget={forecast.emergency_reserve_target}
              />

              <CategoryForecastBreakdown
                categories={forecast.categories}
                totalProjectedExpenses={forecast.projected_total_expenses}
              />
            </>
          )}
        </div>
      )}

      {/* TAB 4: SAVED SCENARIOS */}
      {activeTab === 'SAVED' && <SavedScenariosDrawer />}
    </div>
  );
}
