import React from 'react';
import { Settings, PlayCircle, RefreshCw, XCircle } from 'lucide-react';
import { PROVIDERS } from '../constants';
import { StatusBadge } from './StatusBadge';
import { TestStatusIndicator } from './TestStatusIndicator';
import type { LLMModel } from '../types';

interface ModelGridProps {
  models: LLMModel[];
  testingId: string | null;
  onTest: (model: LLMModel) => void;
  onEdit: (model: LLMModel) => void;
  onDelete: (model: LLMModel) => void;
}

export const ModelGrid: React.FC<ModelGridProps> = ({
  models,
  testingId,
  onTest,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map(model => {
        const providerId = model.model_type === 'chat' ? model.provider : model.embedding_provider;
        const provider = PROVIDERS.find(p => p.id === providerId);
        return (
          <div
            key={model._id}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group relative flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl ${provider?.bgColor || 'bg-slate-50'}`}>
                <span className={`text-lg ${provider?.color || 'text-slate-600'}`}>
                  {model.model_type === 'chat' ? '⚡' : '🧬'}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={model.status} />
                <TestStatusIndicator status={model.test_status} />
              </div>
            </div>

            <div className="mb-6 flex-1">
              <h3 className="text-xl font-black text-slate-800 mb-1">{model.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {provider?.name || providerId}
              </p>
              <div className="mt-4 font-mono text-[10px] bg-slate-50 p-2 rounded-lg text-slate-400 flex items-center gap-2 overflow-hidden border border-slate-100">
                <span className="truncate">{model.model_id}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center text-xs font-bold">
                {model.model_type === 'chat' || !model.model_type ? (
                  <>
                    <span className="text-slate-400 uppercase tracking-tighter">Cost Index</span>
                    <div className="text-slate-700">
                      ${(((model.cost_per_1k_input || 0) + (model.cost_per_1k_output || 0)) / 2).toFixed(4)}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400 uppercase tracking-tighter">Cost / 1M</span>
                    <div className="text-slate-700">
                      ${(model.cost_per_million_tokens || 0).toFixed(4)}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onTest(model)}
                  disabled={testingId === model._id}
                  className="flex-1 py-2 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-100 disabled:opacity-50"
                  aria-label={`Test ${model.name}`}
                >
                  {testingId === model._id ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <PlayCircle size={12} />
                  )}
                  Test
                </button>
                <button
                  onClick={() => onEdit(model)}
                  className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 border border-slate-100 transition-all"
                  aria-label={`Edit ${model.name}`}
                >
                  <Settings size={14} />
                </button>
              </div>
            </div>

            <button
              onClick={() => onDelete(model)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all p-1 text-slate-300 hover:text-rose-500"
              aria-label={`Delete ${model.name}`}
            >
              <XCircle size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
