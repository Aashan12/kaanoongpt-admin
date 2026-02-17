import { API_ENDPOINTS } from '@/app/lib/constants/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

export const countriesService = {
  async getCountries(skip = 0, limit = 10, search = '') {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (search) params.append('search', search);
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.COUNTRIES}?${params}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch countries');
    return response.json();
  },

  async createCountry(data: any) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.COUNTRIES}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create country');
    return response.json();
  },

  async updateCountry(id: string, data: any) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.COUNTRIES}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update country');
    return response.json();
  },

  async deleteCountry(id: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.SETUP.COUNTRIES}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete country');
  },
};