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
      // Simulate API call or real one
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
      const res = await fetch(`${API_BASE}/models`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) throw new Error('AUTH_EXPIRED');
      if (!res.ok) throw new Error(`Failed to fetch models: ${res.statusText}`);

      const data = await res.json();
      const rawModels = Array.isArray(data) ? data : data.data || [];

      const transformedModels: LLMModel[] = rawModels.map((m: any) => ({
        _id: m.id,
        model_type: m.model_type || 'chat',
        name: m.name,
        provider: m.provider, // Chat provider
        embedding_provider: m.embedding_provider, // Embedding provider
        model_id: m.model_name,
        api_key: m.has_api_key ? '********' : '',
        base_url: m.base_url,

        // Chat
        cost_per_1k_input: m.cost_per_1k_tokens || 0,
        cost_per_1k_output: m.cost_per_1k_tokens || 0,
        max_tokens: m.max_tokens,

        // Embedding
        embedding_dimensions: m.embedding_dimensions,
        cost_per_million_tokens: m.cost_per_million_tokens,

        status: m.status,
        test_status: m.test_status,
        last_test: m.last_test,
        test_error: m.test_error
      }));

      setModels(transformedModels);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const createModel = useCallback(async (data: ModelFormData) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

      const payload: any = {
        model_type: data.model_type,
        name: data.name,
        model_name: data.model_id,
        api_key: data.api_key,
        base_url: data.base_url || undefined,
        status: 'active'
      };

      if (data.model_type === 'chat') {
        payload.provider = data.provider;
        payload.max_tokens = data.max_tokens;
        payload.cost_per_1k_tokens = data.cost_per_1k_input;
        payload.temperature = 0.7;
      } else {
        payload.embedding_provider = data.embedding_provider;
        payload.embedding_dimensions = data.embedding_dimensions;
        payload.cost_per_million_tokens = data.cost_per_million_tokens;
      }

      const res = await fetch(`${API_BASE}/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to create model: ${res.statusText}`);
      }

      await refresh();
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError, refresh]);

  const updateModel = useCallback(async (id: string, data: Partial<ModelFormData>) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
      const payload: any = {
        name: data.name,
      };

      if (data.model_id) payload.model_name = data.model_id;
      if (data.api_key) payload.api_key = data.api_key; // If API key is provided, update it
      if (data.base_url) payload.base_url = data.base_url;

      // Chat update
      if (data.max_tokens) payload.max_tokens = data.max_tokens;
      if (data.cost_per_1k_input !== undefined) payload.cost_per_1k_tokens = data.cost_per_1k_input;

      // Embedding update
      if (data.embedding_dimensions !== undefined) payload.embedding_dimensions = data.embedding_dimensions;
      if (data.cost_per_million_tokens !== undefined) payload.cost_per_million_tokens = data.cost_per_million_tokens;
      if (data.embedding_provider) payload.embedding_provider = data.embedding_provider;
      if (data.provider) payload.provider = data.provider;

      const res = await fetch(`${API_BASE}/models/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to update model: ${res.statusText}`);
      }

      await refresh();
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError, refresh]);

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
