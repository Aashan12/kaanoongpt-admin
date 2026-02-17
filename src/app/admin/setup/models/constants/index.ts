import { Zap } from 'lucide-react';
import type { ProviderConfig } from '../types';

export const PROVIDERS: ProviderConfig[] = [
  { id: 'openai', name: 'OpenAI', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'anthropic', name: 'Anthropic', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'ollama', name: 'Ollama', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { id: 'groq', name: 'Groq', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'together', name: 'Together AI', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'custom', name: 'Custom', color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

export const DEFAULT_FORM_DATA = {
  name: '',
  provider: 'openai' as const,
  model_id: '',
  api_key: '',
  base_url: '',
  cost_per_1k_input: 0,
  cost_per_1k_output: 0,
  max_tokens: 4096,
};

export const ANIMATION_CONFIG = {
  duration: 0.2,
  easing: 'easeInOut',
};

export const DEBOUNCE_DELAY = 300;
export const TOAST_DURATION = 3000;
