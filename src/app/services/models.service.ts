import { API_ENDPOINTS } from '@/app/lib/constants/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

export const modelsService = {
  async getModels() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MODELS.LIST}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },

  async createModel(data: any) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MODELS.CREATE}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create model');
    return response.json();
  },

  async updateModel(id: string, data: any) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MODELS.UPDATE(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update model');
    return response.json();
  },

  async deleteModel(id: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MODELS.DELETE(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete model');
  },

  async testModel(id: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.MODELS.TEST(id)}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to test model');
    return response.json();
  },
};