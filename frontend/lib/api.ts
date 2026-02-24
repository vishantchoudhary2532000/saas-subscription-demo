const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<any> {
  const token = typeof window !== 'undefined' 
    ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const authApi = {
  register: (email: string, password: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const userApi = {
  getProfile: () => apiRequest('/users/me'),
  getProtectedData: () => apiRequest('/users/protected'),
};

export const stripeApi = {
  createCheckoutSession: () =>
    apiRequest('/stripe/create-checkout-session', {
      method: 'POST',
    }),
  verifySession: (sessionId: string) =>
    apiRequest('/stripe/verify-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),
};
