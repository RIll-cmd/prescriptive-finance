import { Goal, GoalListResponse, GoalContribution, GoalContributionListResponse } from '@financial-os/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchGoals(): Promise<GoalListResponse> {
  const res = await fetch(`${API_BASE}/goals/`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch financial goals');
  return res.json();
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
}): Promise<Goal> {
  const res = await fetch(`${API_BASE}/goals/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
}

export async function updateGoal(
  goalId: string,
  payload: Partial<Goal>
): Promise<Goal> {
  const res = await fetch(`${API_BASE}/goals/${goalId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
}

export async function deleteGoal(goalId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/goals/${goalId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete goal');
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
  const res = await fetch(`${API_BASE}/goals/${goalId}/contribute`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to contribute to goal');
  return res.json();
}

export async function fetchGoalContributions(
  goalId: string
): Promise<GoalContributionListResponse> {
  const res = await fetch(`${API_BASE}/goals/${goalId}/contributions`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch contributions');
  return res.json();
}
