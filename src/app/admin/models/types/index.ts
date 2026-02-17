export type ModelType = 'chat' | 'embedding';
export type Provider = 'openai' | 'anthropic' | 'cohere' | 'ollama' | 'groq' | 'openrouter' | 'together' | 'custom';
export type EmbeddingProvider = 'openai' | 'cohere' | 'huggingface' | 'local' | 'custom';
export type ModelStatus = 'active' | 'inactive' | 'error';
export type TestStatus = 'success' | 'failed' | 'pending' | 'never';
export type ViewMode = 'grid' | 'table';

export interface LLMModel {
  _id: string;
  model_type: ModelType;
  name: string;
  provider?: Provider;
  embedding_provider?: EmbeddingProvider;
  model_id: string; // This maps to model_name in backend
  api_key?: string;
  base_url?: string;

  // Chat specific
  temperature?: number;
  max_tokens?: number;
  cost_per_1k_input?: number; // Backend uses cost_per_1k_tokens. keeping this for compatibility or need refactor
  cost_per_1k_output?: number;

  // Embedding specific
  embedding_dimensions?: number;
  cost_per_million_tokens?: number;

  status: ModelStatus;
  test_status: TestStatus;
  last_test?: string;
  test_error?: string;
}

export interface ModelFormData {
  model_type: ModelType;
  name: string;
  provider?: Provider;
  embedding_provider?: EmbeddingProvider;
  model_id: string;
  api_key: string;
  base_url: string;

  // Chat
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  max_tokens: number;

  // Embedding
  embedding_dimensions?: number;
  cost_per_million_tokens?: number;
}

export interface ProviderConfig {
  id: Provider | EmbeddingProvider;
  name: string;
  color: string;
  bgColor: string;
  icon?: React.ReactNode;
}

export interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
}
