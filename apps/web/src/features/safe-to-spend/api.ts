import { apiClient } from '@/lib/api';
import {
  SafeToSpendResponse,
  CashBalanceForecastResponse,
  FinancialSettings,
} from '@financial-os/shared-types';

export async function fetchSafeToSpend(mode?: string): Promise<SafeToSpendResponse> {
  const url = mode ? `/safe-to-spend/?mode=${mode}` : '/safe-to-spend/';
  return apiClient<SafeToSpendResponse>(url);
}

export async function fetchForecast(days: number = 30): Promise<CashBalanceForecastResponse> {
  return apiClient<CashBalanceForecastResponse>(`/safe-to-spend/forecast?days=${days}`);
}

export async function fetchSettings(): Promise<FinancialSettings> {
  return apiClient<FinancialSettings>('/safe-to-spend/settings');
}

export async function updateSettings(payload: {
  emergency_reserve_amount?: number;
  safe_to_spend_mode?: string;
}): Promise<FinancialSettings> {
  return apiClient<FinancialSettings>('/safe-to-spend/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
