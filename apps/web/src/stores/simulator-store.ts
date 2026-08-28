import { create } from 'zustand';
import {
  RunSimulationRequest,
  SimulationResultResponse,
  ScenarioComparisonRequest,
  ScenarioComparisonResponse,
  SavedScenarioResponse,
  SaveScenarioRequest,
  ScenarioType,
} from '@financial-os/shared-types';
import { simulatorApi } from '@/features/simulator/api';

interface SimulatorState {
  activeTab: 'SIMULATE' | 'COMPARE' | 'FORECAST' | 'SAVED';
  activeScenarioType: ScenarioType;
  
  currentSimulation: SimulationResultResponse | null;
  comparisonResult: ScenarioComparisonResponse | null;
  savedScenarios: SavedScenarioResponse[];
  
  isSimulating: boolean;
  isComparing: boolean;
  isSaving: boolean;
  error: string | null;

  setActiveTab: (tab: 'SIMULATE' | 'COMPARE' | 'FORECAST' | 'SAVED') => void;
  setActiveScenarioType: (type: ScenarioType) => void;
  
  runSimulation: (payload: RunSimulationRequest) => Promise<SimulationResultResponse | null>;
  compareScenarios: (payload: ScenarioComparisonRequest) => Promise<ScenarioComparisonResponse | null>;
  fetchSavedScenarios: () => Promise<void>;
  saveScenario: (payload: SaveScenarioRequest) => Promise<SavedScenarioResponse | null>;
  deleteSavedScenario: (id: string) => Promise<boolean>;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  activeTab: 'SIMULATE',
  activeScenarioType: 'PURCHASE',
  
  currentSimulation: null,
  comparisonResult: null,
  savedScenarios: [],
  
  isSimulating: false,
  isComparing: false,
  isSaving: false,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveScenarioType: (type) => set({ activeScenarioType: type }),

  runSimulation: async (payload) => {
    set({ isSimulating: true, error: null });
    try {
      const res = await simulatorApi.runSimulation(payload);
      set({ currentSimulation: res, isSimulating: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || 'Simulation failed', isSimulating: false });
      return null;
    }
  },

  compareScenarios: async (payload) => {
    set({ isComparing: true, error: null });
    try {
      const res = await simulatorApi.compareScenarios(payload);
      set({ comparisonResult: res, isComparing: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || 'Scenario comparison failed', isComparing: false });
      return null;
    }
  },

  fetchSavedScenarios: async () => {
    try {
      const list = await simulatorApi.listSavedScenarios();
      set({ savedScenarios: list });
    } catch (err: any) {
      console.error('Failed to fetch saved scenarios:', err);
    }
  },

  saveScenario: async (payload) => {
    set({ isSaving: true });
    try {
      const saved = await simulatorApi.saveScenario(payload);
      await get().fetchSavedScenarios();
      set({ isSaving: false });
      return saved;
    } catch (err: any) {
      set({ isSaving: false, error: err.message || 'Failed to save scenario' });
      return null;
    }
  },

  deleteSavedScenario: async (id) => {
    try {
      await simulatorApi.deleteSavedScenario(id);
      await get().fetchSavedScenarios();
      return true;
    } catch (err: any) {
      console.error('Failed to delete saved scenario:', err);
      return false;
    }
  },
}));
