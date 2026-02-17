import { API_ENDPOINTS } from '@/app/lib/constants/api';

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async logout() {
    const token = localStorage.getItem('adminToken');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    localStorage.removeItem('adminToken');
  },

  async refreshToken() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Token refresh failed');
    return response.json();
  },
};