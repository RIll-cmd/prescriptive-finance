import { Bill, BillListResponse, BillPayment, BillPaymentListResponse, BillCalendarItem } from '@financial-os/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchBills(): Promise<BillListResponse> {
  const res = await fetch(`${API_BASE}/bills/`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch bills');
  return res.json();
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
  const res = await fetch(`${API_BASE}/bills/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create bill');
  return res.json();
}

export async function updateBill(billId: string, payload: Partial<Bill>): Promise<Bill> {
  const res = await fetch(`${API_BASE}/bills/${billId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update bill');
  return res.json();
}

export async function deleteBill(billId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bills/${billId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete bill');
}

export async function payBill(
  billId: string,
  payload: {
    amount?: number;
    paid_date?: string;
    money_source_id?: string;
    record_transaction?: boolean;
    notes?: string;
  }
): Promise<BillPayment> {
  const res = await fetch(`${API_BASE}/bills/${billId}/pay`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to pay bill');
  return res.json();
}

export async function fetchBillPayments(billId: string): Promise<BillPaymentListResponse> {
  const res = await fetch(`${API_BASE}/bills/${billId}/payments`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch bill payments');
  return res.json();
}

export async function fetchBillCalendar(year: number, month: number): Promise<BillCalendarItem[]> {
  const res = await fetch(`${API_BASE}/bills/calendar?year=${year}&month=${month}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch bill calendar');
  return res.json();
}
