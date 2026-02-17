import { API_ENDPOINTS } from '@/app/lib/constants/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

export const statesService = {
  async getStates(skip = 0, limit = 10, search = '') {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (search) params.append('search', search);
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.STATES}?${params}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch states');
    return response.json();
  },

  async createState(data: any) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.STATES}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create state');
    return response.json();
  },

  async updateState(id: string, data: any) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.STATES}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update state');
    return response.json();
  },

  async deleteState(id: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.STATES}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete state');
  },
};