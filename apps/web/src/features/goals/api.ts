import { apiClient } from '@/lib/api';
import { Goal, GoalListResponse, GoalContribution, GoalContributionListResponse } from '@financial-os/shared-types';

export async function fetchGoals(): Promise<GoalListResponse> {
  return apiClient<GoalListResponse>('/goals/');
}

export async function createGoal(payload: {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string | null;
  color_hex?: string;
  icon?: string;
  description?: string;
  money_source_id?: string | null;
  record_transaction?: boolean;
}): Promise<Goal> {
  return apiClient<Goal>('/goals/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateGoal(
  goalId: string,
  payload: Partial<Goal>
): Promise<Goal> {
  return apiClient<Goal>(`/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteGoal(goalId: string): Promise<void> {
  return apiClient<void>(`/goals/${goalId}`, {
    method: 'DELETE',
  });
}

export async function contributeToGoal(
  goalId: string,
  payload: {
    amount: number;
    contribution_date?: string;
    money_source_id?: string;
    record_transaction?: boolean;
    note?: string;
  }
): Promise<GoalContribution> {
  return apiClient<GoalContribution>(`/goals/${goalId}/contribute`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchGoalContributions(
  goalId: string
): Promise<GoalContributionListResponse> {
  return apiClient<GoalContributionListResponse>(`/goals/${goalId}/contributions`);
}
