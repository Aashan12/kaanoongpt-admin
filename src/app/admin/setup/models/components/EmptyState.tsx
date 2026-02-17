import React from 'react';
import { Zap } from 'lucide-react';

interface EmptyStateProps {
  onAddModel: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddModel }) => {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
      <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100">
        <Zap size={40} className="text-slate-200" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Initialize Model Sync</h2>
      <p className="text-slate-500 font-medium leading-relaxed mb-8">
        No model configurations found matching your current context. Start by linking a provider like OpenAI or Anthropic.
      </p>
      <button
        onClick={onAddModel}
        className="px-8 py-3 bg-slate-900 shadow-xl shadow-slate-900/10 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95"
        aria-label="Setup new integration"
      >
        Setup New Integration
      </button>
    </div>
  );
};
