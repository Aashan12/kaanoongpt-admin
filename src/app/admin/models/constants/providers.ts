import { ProviderConfig, Provider, EmbeddingProvider } from '../types';
import {
  Zap, Brain, Cpu, Layers, Sparkles, Rocket, Code2, Settings
} from 'lucide-react';

export const CHAT_PROVIDERS: Record<Provider, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    color: '#10a37f',
    bgColor: '#f0fdf4',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    color: '#d97706',
    bgColor: '#fef3c7',
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    color: '#7c3aed',
    bgColor: '#f3e8ff',
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama',
    color: '#0891b2',
    bgColor: '#ecfdf5',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    color: '#dc2626',
    bgColor: '#fee2e2',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    color: '#2563eb',
    bgColor: '#eff6ff',
  },
  together: {
    id: 'together',
    name: 'Together AI',
    color: '#059669',
    bgColor: '#f0fdf4',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    color: '#6b7280',
    bgColor: '#f3f4f6',
  },
};

export const EMBEDDING_PROVIDERS: Record<EmbeddingProvider, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    color: '#10a37f',
    bgColor: '#f0fdf4',
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    color: '#7c3aed',
    bgColor: '#f3e8ff',
  },
  huggingface: {
    id: 'huggingface',
    name: 'Hugging Face',
    color: '#fbbf24',
    bgColor: '#fffbeb',
  },
  local: {
    id: 'local',
    name: 'Local',
    color: '#0891b2',
    bgColor: '#ecfdf5',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    color: '#6b7280',
    bgColor: '#f3f4f6',
  },
};

export const PROVIDERS = {
  ...CHAT_PROVIDERS,
  ...EMBEDDING_PROVIDERS,
};
