import { apiClient } from '@/lib/api';
import {
  Bill,
  BillListResponse,
  BillPayment,
  BillPaymentListResponse,
  BillCalendarItem,
  IncomeExpectation,
  IncomeExpectationListResponse,
} from '@financial-os/shared-types';

export async function fetchBills(): Promise<BillListResponse> {
  return apiClient<BillListResponse>('/bills/');
}

export async function createBill(payload: {
  name: string;
  amount: number;
  due_date: string;
  is_recurring?: boolean;
  frequency?: string;
  category_id?: string | null;
  auto_record_transaction?: boolean;
  color_hex?: string;
  icon?: string;
  notes?: string;
}): Promise<Bill> {
  return apiClient<Bill>('/bills/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBill(billId: string, payload: Partial<Bill>): Promise<Bill> {
  return apiClient<Bill>(`/bills/${billId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteBill(billId: string): Promise<void> {
  return apiClient<void>(`/bills/${billId}`, {
    method: 'DELETE',
  });
}

export async function recordBillPayment(
  billId: string,
  payload: {
    amount: number;
    payment_date?: string;
    money_source_id?: string;
    create_transaction?: boolean;
    notes?: string;
  }
): Promise<BillPayment> {
  return apiClient<BillPayment>(`/bills/${billId}/pay`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const payBill = recordBillPayment;

export async function fetchBillPayments(billId: string): Promise<BillPaymentListResponse> {
  return apiClient<BillPaymentListResponse>(`/bills/${billId}/payments`);
}

export async function fetchBillCalendar(month?: number, year?: number): Promise<BillCalendarItem[]> {
  const params = new URLSearchParams();
  if (month) params.set('month', month.toString());
  if (year) params.set('year', year.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient<BillCalendarItem[]>(`/bills/calendar${query}`);
}

export async function fetchIncomeExpectations(): Promise<IncomeExpectationListResponse> {
  return apiClient<IncomeExpectationListResponse>('/income-expectations/');
}

export async function createIncomeExpectation(payload: {
  name: string;
  amount: number;
  frequency?: string;
  payday_day_of_month?: number;
  payday_day_of_week?: number;
  next_expected_date: string;
  money_source_id?: string;
}): Promise<IncomeExpectation> {
  return apiClient<IncomeExpectation>('/income-expectations/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateIncomeExpectation(
  id: string,
  payload: Partial<IncomeExpectation>
): Promise<IncomeExpectation> {
  return apiClient<IncomeExpectation>(`/income-expectations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteIncomeExpectation(id: string): Promise<void> {
  return apiClient<void>(`/income-expectations/${id}`, {
    method: 'DELETE',
  });
}
