import React from 'react';
import { Edit2, Trash2, PlayCircle } from 'lucide-react';
import { PROVIDERS } from '../constants';
import { StatusBadge } from './StatusBadge';
import { TestStatusIndicator } from './TestStatusIndicator';
import type { LLMModel } from '../types';

interface ModelTableProps {
  models: LLMModel[];
  testingId: string | null;
  onTest: (model: LLMModel) => void;
  onEdit: (model: LLMModel) => void;
  onDelete: (model: LLMModel) => void;
}

export const ModelTable: React.FC<ModelTableProps> = ({
  models,
  testingId,
  onTest,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Model Info</th>
            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Registry ID</th>
            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Cost</th>
            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {models.map(model => {
            const providerId = model.model_type === 'chat' ? model.provider : model.embedding_provider;
            const provider = PROVIDERS.find(p => p.id === providerId);
            return (
              <tr key={model._id} className="group hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${model.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <div>
                      <div className="font-bold text-slate-800 text-base">{model.name}</div>
                      <div className={`inline-block text-[10px] font-black uppercase tracking-widest mt-1 ${provider?.color}`}>
                        {provider?.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="font-mono text-[11px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-slate-500 w-fit">
                    {model.model_id}
                  </div>
                </td>
                <td className="px-6 py-5">
                  {model.model_type === 'chat' || !model.model_type ? (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between w-32">
                        <span className="text-slate-400">In:</span>
                        <span className="font-bold">${(model.cost_per_1k_input || 0).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between w-32">
                        <span className="text-slate-400">Out:</span>
                        <span className="font-bold">${(model.cost_per_1k_output || 0).toFixed(4)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between w-32">
                        <span className="text-slate-400">Dim:</span>
                        <span className="font-bold">{model.embedding_dimensions}</span>
                      </div>
                      <div className="flex justify-between w-32">
                        <span className="text-slate-400">/1M:</span>
                        <span className="font-bold">${(model.cost_per_million_tokens || 0).toFixed(4)}</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={model.status} />
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <TestStatusIndicator status={model.test_status} />
                      {model.test_error && (
                        <span className="text-rose-500 max-w-[120px] truncate" title={model.test_error}>
                          - {model.test_error}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onTest(model)}
                      disabled={testingId === model._id}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                      title="Test Connection"
                    >
                      <PlayCircle size={18} className={testingId === model._id ? 'animate-spin text-blue-600' : ''} />
                    </button>
                    <button
                      onClick={() => onEdit(model)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                      title="Edit Model"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(model)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                      title="Delete Model"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
