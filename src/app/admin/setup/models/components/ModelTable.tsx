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
            const provider = PROVIDERS.find(p => p.id === model.provider);
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
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between w-32">
                      <span className="text-slate-400">In:</span>
                      <span className="font-bold">${model.cost_per_1k_input.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between w-32">
                      <span className="text-slate-400">Out:</span>
                      <span className="font-bold">${model.cost_per_1k_output.toFixed(4)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 space-y-2">
                  <StatusBadge status={model.status} />
                  <TestStatusIndicator status={model.test_status} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onTest(model)} disabled={testingId === model._id} className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-all shadow-sm disabled:opacity-50" title="Test">
                      <PlayCircle size={16} className={testingId === model._id ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => onEdit(model)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-100 rounded-lg hover:border-indigo-200 transition-all shadow-sm" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(model)} className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-lg hover:border-rose-200 transition-all shadow-sm" title="Delete">
                      <Trash2 size={16} />
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
