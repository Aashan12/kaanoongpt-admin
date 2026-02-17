import React from 'react';
import { Edit2, Trash2, PlayCircle, RefreshCw } from 'lucide-react';
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
    <div className="models-grid">
      {models.map(model => {
        const provider = PROVIDERS.find(p => p.id === model.provider);
        return (
          <div key={model._id} className="model-card">
            <div className="model-card-header">
              <div className={`model-card-icon ${provider?.bgColor || 'bg-slate-50'}`}>
                <span className={`text-lg ${provider?.color || 'text-slate-600'}`}>⚡</span>
              </div>
              <div className="flex flex-col gap-2">
                <StatusBadge status={model.status} />
                <TestStatusIndicator status={model.test_status} />
              </div>
            </div>

            <div>
              <h3 className="model-card-title">{model.name}</h3>
              <p className="model-card-provider">
                {provider?.name || model.provider}
              </p>
              <div className="model-card-id">{model.model_id}</div>
            </div>

            <div className="model-card-cost">
              <span className="model-card-cost-label">Avg Cost:</span>
              <span className="model-card-cost-value">
                ${((model.cost_per_1k_input + model.cost_per_1k_output) / 2).toFixed(4)}
              </span>
            </div>

            <div className="model-card-actions">
              <button
                onClick={() => onTest(model)}
                disabled={testingId === model._id}
                className="model-card-btn"
                title="Test Model"
              >
                {testingId === model._id ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <PlayCircle size={14} />
                )}
                Test
              </button>
              <button
                onClick={() => onEdit(model)}
                className="model-card-btn"
                title="Edit Model"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                onClick={() => onDelete(model)}
                className="model-card-btn delete"
                title="Delete Model"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
