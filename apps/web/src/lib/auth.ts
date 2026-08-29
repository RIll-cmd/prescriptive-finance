export interface UserSession {
  userId: string;
  email: string;
  token?: string;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('financial_os_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('auth_token')
  );
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('financial_os_token', token);
    localStorage.setItem('auth_token', token);
  }
}
