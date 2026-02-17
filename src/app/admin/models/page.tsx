'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus, Search, RefreshCw, LayoutGrid, List,
  Server, Activity, Cpu, DollarSign, ShieldCheck, Lock,
} from 'lucide-react';

import { useModels } from './hooks/useModels';
import { PROVIDERS } from './constants';
import { StatusBadge } from './components/StatusBadge';
import { TestStatusIndicator } from './components/TestStatusIndicator';
import { ErrorAlert } from './components/ErrorAlert';
import { LoadingSpinner } from './components/LoadingSpinner';
import { EmptyState } from './components/EmptyState';
import { ModelForm } from './components/ModelForm';
import { ModelTable } from './components/ModelTable';
import { StatsCard } from './components/StatsCard';
import { ModelGrid } from './components/ModelGrid';

import type { LLMModel, ModelFormData, ViewMode, Provider, EmbeddingProvider } from './types';
import './models.css';


export default function ModelsPage() {
  // State
  const { models, isLoading, error, refresh, createModel, updateModel, deleteModel, testModel, clearError } = useModels();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Provider | EmbeddingProvider | 'all'>('all');

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived state for auth error (though hook handles redirect, this catches any residual state)
  const isAuthError = error === 'AUTH_EXPIRED';

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingModel(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((model: LLMModel) => {
    setEditingModel(model);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingModel(null);
  }, []);

  const handleFormSubmit = async (data: ModelFormData) => {
    setIsSubmitting(true);
    try {
      if (editingModel) {
        await updateModel(editingModel._id, data);
      } else {
        await createModel(data);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save model:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (model: LLMModel) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      await deleteModel(model._id);
    }
  }, [deleteModel]);

  const handleTest = useCallback(async (model: LLMModel) => {
    setTestingId(model._id);
    try {
      await testModel(model._id);
    } finally {
      setTestingId(null);
    }
  }, [testModel]);

  // Derived state
  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.model_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || m.provider === activeTab || m.embedding_provider === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [models, searchQuery, activeTab]);

  const stats = useMemo(
    () => [
      // ...
      {
        label: 'Average Price Points',
        value: `$${(models.length ? models.reduce((s, m) => s + (m.cost_per_1k_input || 0), 0) / models.length : 0).toFixed(4)}`,
        icon: DollarSign,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
    ],
    [models]
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F9FAFB', scrollBehavior: 'smooth' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem', paddingBottom: '3rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.025em'
              }}>
                Model Management
              </h1>
              <p style={{
                color: '#64748b',
                fontWeight: 500,
                maxWidth: '42rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                margin: '0.5rem 0 0 0'
              }}>
                Global orchestrator for LLM deployment. Configure pricing tiers, monitor system health, and scale infrastructure across multiple providers.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={refresh}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#475569',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  opacity: isLoading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <RefreshCw size={13} strokeWidth={2.5} style={{
                  animation: isLoading ? 'spin 1s linear infinite' : 'none'
                }} />
                Refresh
              </button>
              <button
                onClick={handleOpenCreate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.5rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'white',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                <Plus size={15} strokeWidth={3} />
                Add Model
              </button>
            </div>
          </div>
        </div>

        {/* Auth Error Banner */}
        {isAuthError && (
          <div style={{
            backgroundColor: '#e11d48',
            color: 'white',
            padding: '1rem',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(225, 29, 72, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 700,
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>Session integrity compromised or expired.</p>
                <p style={{ fontSize: '0.625rem', opacity: 0.7, textTransform: 'uppercase', margin: '0.25rem 0 0 0' }}>Code: UNAUTHORIZED_ACCESS</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/admin/login'}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: 'white',
                color: '#e11d48',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.75rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Re-Authenticate
            </button>
          </div>
        )}

        {/* Real-time Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {stats.map((stat, i) => (
            <StatsCard key={stat.label} {...stat} index={i} />
          ))}
        </div>

        {/* Global Registry Management */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* Advanced Toolbar */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backdropFilter: 'blur(12px)',
            flexWrap: 'wrap'
          }}>

            {/* Intelligent Search */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
              <Search style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#cbd5e1',
                width: '1rem',
                height: '1rem'
              }} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '1.5rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid rgba(226, 232, 240, 0.6)',
                  borderRadius: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontWeight: 500
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.05)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.6)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Alert Channel */}
          {!isAuthError && <ErrorAlert error={error} onDismiss={clearError} />}

          {/* Deployment Matrix */}
          <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem' }}>
            {isLoading ? (
              <LoadingSpinner />
            ) : filteredModels.length === 0 ? (
              <EmptyState onAddModel={handleOpenCreate} />
            ) : viewMode === 'table' ? (
              <ModelTable
                models={filteredModels}
                testingId={testingId}
                onTest={handleTest}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ) : (
              <ModelGrid
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

      {/* Configuration Console */}
      <ModelForm
        isOpen={isModalOpen}
        isLoading={isSubmitting}
        editingModel={editingModel}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
