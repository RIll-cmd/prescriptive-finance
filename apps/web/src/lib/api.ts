const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Read stored fallback token if any
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('financial_os_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include', // Automatically passes HttpOnly cookies
      headers,
    });

    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      let errorData = null;
      try {
        errorData = await res.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // Response was not JSON
      }
      throw new ApiError(errorMessage, res.status, errorData);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err?.message || 'Network connection error. Please ensure the backend server is running.', 0);
  }
}
