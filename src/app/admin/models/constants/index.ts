import { Zap } from 'lucide-react';
import type { ProviderConfig } from '../types';

export const CHAT_PROVIDERS: ProviderConfig[] = [
  { id: 'openai', name: 'OpenAI', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'anthropic', name: 'Anthropic', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'ollama', name: 'Ollama', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { id: 'cohere', name: 'Cohere', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'groq', name: 'Groq', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'openrouter', name: 'OpenRouter', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  { id: 'together', name: 'Together AI', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'custom', name: 'Custom', color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

export const EMBEDDING_PROVIDERS: ProviderConfig[] = [
  { id: 'openai', name: 'OpenAI', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'cohere', name: 'Cohere', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'huggingface', name: 'HuggingFace', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'local', name: 'Local', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { id: 'custom', name: 'Custom', color: 'text-gray-600', bgColor: 'bg-gray-50' },
];

// Combine for backward compatibility if needed, but components should prefer specific lists
export const PROVIDERS = [...CHAT_PROVIDERS, ...EMBEDDING_PROVIDERS.filter(p => !CHAT_PROVIDERS.some(cp => cp.id === p.id))];

export const DEFAULT_FORM_DATA: any = {
  model_type: 'chat',
  name: '',
  provider: 'openai',
  embedding_provider: 'openai',
  model_id: '',
  api_key: '',
  base_url: '',

  // Chat defaults
  cost_per_1k_input: 0,
  cost_per_1k_output: 0,
  max_tokens: 4096,

  // Embedding defaults
  embedding_dimensions: 1536,
  cost_per_million_tokens: 0,
};

export const ANIMATION_CONFIG = {
  duration: 0.2,
  easing: 'easeInOut',
};

export const DEBOUNCE_DELAY = 300;
export const TOAST_DURATION = 3000;
