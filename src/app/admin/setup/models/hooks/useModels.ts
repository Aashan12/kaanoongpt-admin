import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { LLMModel, ModelFormData } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';

interface UseModelsReturn {
  models: LLMModel[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createModel: (data: ModelFormData) => Promise<void>;
  updateModel: (id: string, data: Partial<ModelFormData>) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  testModel: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useModels(): UseModelsReturn {
  const router = useRouter();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      if (err.message === 'AUTH_EXPIRED') {
        router.push('/admin/login');
        return;
      }
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  }, [router]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/models`, {
        headers: getHeaders(),
      });
      if (res.status === 401) throw new Error('AUTH_EXPIRED');
      if (!res.ok) throw new Error(`Failed to fetch models: ${res.statusText}`);
      const data = await res.json();
      setModels(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, handleError]);

  const createModel = useCallback(async (data: ModelFormData) => {
    try {
      const res = await fetch(`${API_BASE}/models`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to create model: ${res.statusText}`);
      await refresh();
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [getHeaders, handleError, refresh]);

  const updateModel = useCallback(async (id: string, data: Partial<ModelFormData>) => {
    try {
      const res = await fetch(`${API_BASE}/models/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to update model: ${res.statusText}`);
      await refresh();
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [getHeaders, handleError, refresh]);

  const deleteModel = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/models/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to delete model: ${res.statusText}`);
      setModels(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [getHeaders, handleError]);

  const testModel = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/models/${id}/test`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ test_prompt: 'Connection test' }),
      });
      if (!res.ok) throw new Error(`Failed to test model: ${res.statusText}`);
      await refresh();
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [getHeaders, handleError, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    models,
    isLoading,
    error,
    refresh,
    createModel,
    updateModel,
    deleteModel,
    testModel,
    clearError: () => setError(null),
  };
}
