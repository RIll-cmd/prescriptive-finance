import { apiClient } from '@/lib/api';
import {
  RunSimulationRequest,
  SimulationResultResponse,
  ScenarioComparisonRequest,
  ScenarioComparisonResponse,
  SaveScenarioRequest,
  SavedScenarioResponse,
} from '@financial-os/shared-types';

export const simulatorApi = {
  async runSimulation(payload: RunSimulationRequest): Promise<SimulationResultResponse> {
    return apiClient<SimulationResultResponse>('/simulations/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async compareScenarios(payload: ScenarioComparisonRequest): Promise<ScenarioComparisonResponse> {
    return apiClient<ScenarioComparisonResponse>('/simulations/compare', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async listSavedScenarios(): Promise<SavedScenarioResponse[]> {
    return apiClient<SavedScenarioResponse[]>('/simulations/saved');
  },

  async saveScenario(payload: SaveScenarioRequest): Promise<SavedScenarioResponse> {
    return apiClient<SavedScenarioResponse>('/simulations/saved', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getSavedScenario(
    id: string
  ): Promise<{ scenario: SavedScenarioResponse; result: SimulationResultResponse }> {
    return apiClient<{ scenario: SavedScenarioResponse; result: SimulationResultResponse }>(
      `/simulations/saved/${id}`
    );
  },

  async deleteSavedScenario(id: string): Promise<{ message: string; success: boolean }> {
    return apiClient<{ message: string; success: boolean }>(`/simulations/saved/${id}`, {
      method: 'DELETE',
    });
  },
};
