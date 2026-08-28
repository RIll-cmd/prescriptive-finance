import { SafeToSpendResponse, CashBalanceForecastResponse, FinancialSettings } from '@financial-os/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchSafeToSpend(mode?: string): Promise<SafeToSpendResponse> {
  const url = mode ? `${API_BASE}/safe-to-spend/?mode=${mode}` : `${API_BASE}/safe-to-spend/`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to calculate safe-to-spend');
  return res.json();
}

export async function fetchForecast(days: number = 30): Promise<CashBalanceForecastResponse> {
  const res = await fetch(`${API_BASE}/safe-to-spend/forecast?days=${days}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to generate cash balance forecast');
  return res.json();
}

export async function fetchSettings(): Promise<FinancialSettings> {
  const res = await fetch(`${API_BASE}/safe-to-spend/settings`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch financial settings');
  return res.json();
}

export async function updateSettings(payload: {
  emergency_reserve_amount?: number;
  safe_to_spend_mode?: string;
}): Promise<FinancialSettings> {
  const res = await fetch(`${API_BASE}/safe-to-spend/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update financial settings');
  return res.json();
}
