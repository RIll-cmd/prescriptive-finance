import { apiClient } from '@/lib/api';
import { FinancialForecastResponse, ForecastPeriod } from '@financial-os/shared-types';

export const forecastingApi = {
  async getForecast(
    period: ForecastPeriod = 'month_end',
    startDate?: string,
    endDate?: string
  ): Promise<FinancialForecastResponse> {
    const params = new URLSearchParams();
    params.set('period', period);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    return apiClient<FinancialForecastResponse>(`/forecast?${params.toString()}`);
  },
};
