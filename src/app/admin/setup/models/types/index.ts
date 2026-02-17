export type Provider = 'openai' | 'anthropic' | 'ollama' | 'groq' | 'together' | 'custom';
export type ModelStatus = 'active' | 'inactive' | 'error';
export type TestStatus = 'success' | 'failed' | 'pending' | 'never';
export type ViewMode = 'grid' | 'table';

export interface LLMModel {
  _id: string;
  name: string;
  provider: Provider;
  model_id: string;
  api_key: string;
  base_url?: string;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  max_tokens: number;
  status: ModelStatus;
  test_status: TestStatus;
  last_test?: string;
  test_error?: string;
}

export interface ModelFormData {
  name: string;
  provider: Provider;
  model_id: string;
  api_key: string;
  base_url: string;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  max_tokens: number;
}

export interface ProviderConfig {
  id: Provider;
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
