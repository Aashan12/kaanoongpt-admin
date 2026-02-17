'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Search, Brain } from 'lucide-react';
import { useModels } from './hooks/useModels';
import { ModelForm, ModelTable, ModelGrid } from './components';

import '../setup.css';
import './models.css';

import type { LLMModel, ModelFormData } from './types';

export default function ModelsPage() {
  const { models, isLoading, error, createModel, updateModel, deleteModel, testModel, clearError } = useModels();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = useCallback(async (model: LLMModel) => {
    if (!confirm(`Permanently delete "${model.name}"?`)) return;
    try {
      await deleteModel(model._id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [deleteModel]);

  const handleTest = useCallback(async (model: LLMModel) => {
    setTestingId(model._id);
    try {
      await testModel(model._id);
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      setTestingId(null);
    }
  }, [testModel]);

  const handleOpenEdit = useCallback((model: LLMModel) => {
    setEditingModel(model);
    setIsModalOpen(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingModel(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingModel(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: ModelFormData) => {
      setIsSubmitting(true);
      try {
        if (editingModel) {
          await updateModel(editingModel._id, data);
        } else {
          await createModel(data);
        }
        handleCloseModal();
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingModel, createModel, updateModel, handleCloseModal]
  );

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.model_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [models, searchQuery]);

  return (
    <div className="setup-container">
      {/* Premium Header */}
      <div className="setup-header premium-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <Brain size={40} strokeWidth={1.5} color="#000000" />
          </div>
          <div className="header-text">
            <h1>Model Management</h1>
            <p>Configure pricing tiers, monitor system health, and scale infrastructure across multiple providers</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Models</span>
            <span className="stat-value">{models.length}</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <div className="alert-content">{error}</div>
          <button className="alert-close" onClick={() => clearError()}>
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      <div className="setup-content premium-content">
        <div className="models-wrapper">
          {/* Toolbar */}
          <div className="models-toolbar premium-toolbar">
            <div className="premium-search">
              <Search size={18} color="#000000" />
              <input
                type="text"
                placeholder="Search by model name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="premium-btn-add" onClick={handleOpenCreate}>
              <Plus size={18} />
              <span>Add Model</span>
            </button>
          </div>

          {/* Table Section */}
          <div className="table-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading models...</p>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="premium-empty">
                <div className="empty-icon">
                  <Brain size={56} strokeWidth={1} color="#000000" />
                </div>
                <h3>No Models Found</h3>
                <p>Use the "Add Model" button above to create your first model configuration</p>
              </div>
            ) : (
              <ModelTable
                models={filteredModels}
                testingId={testingId}
                onTest={handleTest}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModelForm
        isOpen={isModalOpen}
        isLoading={isSubmitting}
        editingModel={editingModel}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
