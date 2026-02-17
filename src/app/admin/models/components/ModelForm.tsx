import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Shield, XCircle, Zap, DollarSign, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHAT_PROVIDERS, EMBEDDING_PROVIDERS, DEFAULT_FORM_DATA } from '../constants';
import type { LLMModel, ModelFormData, ModelType, Provider, EmbeddingProvider } from '../types';
import styles from './ModelForm.module.css';

interface ModelFormProps {
  isOpen: boolean;
  isLoading: boolean;
  editingModel: LLMModel | null;
  onClose: () => void;
  onSubmit: (data: ModelFormData) => Promise<void>;
}

export const ModelForm: React.FC<ModelFormProps> = ({
  isOpen,
  isLoading,
  editingModel,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ModelFormData>(DEFAULT_FORM_DATA);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when opening or editing
  useEffect(() => {
    if (editingModel) {
      setFormData({
        model_type: editingModel.model_type || 'chat',
        name: editingModel.name,
        provider: editingModel.provider,
        embedding_provider: editingModel.embedding_provider,
        model_id: editingModel.model_id,
        api_key: '',
        base_url: editingModel.base_url || '',

        // Chat
        cost_per_1k_input: editingModel.cost_per_1k_input || 0,
        cost_per_1k_output: editingModel.cost_per_1k_output || 0,
        max_tokens: editingModel.max_tokens || 4096,

        // Embedding
        embedding_dimensions: editingModel.embedding_dimensions,
        cost_per_million_tokens: editingModel.cost_per_million_tokens,
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [editingModel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name.trim()) {
      setSubmitError('Model name is required');
      return;
    }
    if (!formData.model_id.trim()) {
      setSubmitError('Model ID is required');
      return;
    }
    const currentProviderId = formData.model_type === 'chat' ? formData.provider : formData.embedding_provider;

    if (!editingModel && !formData.api_key.trim() && currentProviderId !== 'local') {
      setSubmitError('API key is required');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save model');
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  const currentProviders = formData.model_type === 'chat' ? CHAT_PROVIDERS : EMBEDDING_PROVIDERS;
  const currentProviderId = formData.model_type === 'chat' ? formData.provider : formData.embedding_provider;

  const setProvider = (id: string) => {
    if (formData.model_type === 'chat') {
      setFormData(v => ({ ...v, provider: id as Provider }));
    } else {
      setFormData(v => ({ ...v, embedding_provider: id as EmbeddingProvider }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.modalBackdrop}
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-50% + 30px)' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-50% + 30px)' }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.25 }}
            className={styles.modalContainer}
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <button
                onClick={handleClose}
                className={styles.closeButton}
                aria-label="Close"
              >
                <XCircle size={18} strokeWidth={2.5} />
              </button>

              <h2 className={styles.modalTitle}>
                {editingModel ? 'Edit Model Configuration' : 'Add New Model'}
              </h2>
              <p className={styles.modalSubtitle}>
                {editingModel ? 'Update your model settings' : 'Configure a new AI model provider'}
              </p>
            </div>

            {/* Form */}
            <form id="modelForm" onSubmit={handleSubmit} className={styles.formContent}>
              {/* Error Alert */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.3 }}
                  className={styles.errorAlert}
                >
                  <div className={styles.errorIcon}>!</div>
                  <p className={styles.errorText}>{submitError}</p>
                </motion.div>
              )}

              {/* Model Type Selection */}
              {!editingModel && (
                <div className={styles.formSection} style={{ marginBottom: '1.5rem' }}>
                  <div className={styles.formRow}>
                    <div className={styles.typeSelector}>
                      <button
                        type="button"
                        onClick={() => setFormData(v => ({ ...v, model_type: 'chat' }))}
                        className={`${styles.typeButton} ${formData.model_type === 'chat' ? styles.typeButtonActive : ''}`}
                      >
                        <Zap size={16} /> Chat Model
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(v => ({ ...v, model_type: 'embedding' }))}
                        className={`${styles.typeButton} ${formData.model_type === 'embedding' ? styles.typeButtonActive : ''}`}
                      >
                        <Layers size={16} /> Embedding Model
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Selection */}
              <div className={styles.providerSection}>
                <label className={styles.sectionTitle}>
                  Select {formData.model_type === 'chat' ? 'Chat' : 'Embedding'} Provider
                </label>

                <div className={styles.providerGrid}>
                  {currentProviders.map((p, index) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setProvider(p.id)}
                      className={`${styles.providerCard} ${currentProviderId === p.id ? styles.selected : ''}`}
                    >
                      <div className={styles.providerIcon}>
                        <Zap size={20} strokeWidth={2.5} />
                      </div>
                      <span className={styles.providerName}>{p.name}</span>

                      {currentProviderId === p.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={styles.selectedBadge}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Model Details */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>
                    <Cpu size={14} strokeWidth={2.5} />
                  </div>
                  <h3 className={styles.sectionLabel}>Model Details</h3>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Display Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(v => ({ ...v, name: e.target.value }))}
                      placeholder={formData.model_type === 'chat' ? "e.g., GPT-4 Turbo" : "e.g., OpenAI V3 Small"}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Model ID <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.model_id}
                      onChange={e => setFormData(v => ({ ...v, model_id: e.target.value }))}
                      placeholder={formData.model_type === 'chat' ? "e.g., gpt-4-turbo" : "e.g., text-embedding-3-small"}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* API Configuration */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>
                    <Key size={14} strokeWidth={2.5} />
                  </div>
                  <h3 className={styles.sectionLabel}>API Configuration</h3>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      API Key {(!editingModel && currentProviderId !== 'local') && <span className={styles.required}>*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.api_key}
                      onChange={e => setFormData(v => ({ ...v, api_key: e.target.value }))}
                      placeholder={editingModel ? '••••••••' : 'sk-...'}
                      className={styles.formInput}
                      required={!editingModel && currentProviderId !== 'local'}
                      disabled={currentProviderId === 'local'}
                    />
                  </div>

                  {(currentProviderId === 'openai' || currentProviderId === 'ollama' || currentProviderId === 'custom' || currentProviderId === 'local') && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={formData.base_url || ''}
                        onChange={e => setFormData(v => ({ ...v, base_url: e.target.value }))}
                        placeholder={currentProviderId === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
                        className={styles.formInput}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Limits */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>
                    <DollarSign size={14} strokeWidth={2.5} />
                  </div>
                  <h3 className={styles.sectionLabel}>
                    {formData.model_type === 'chat' ? 'Pricing & Limits' : 'Specs & Pricing'}
                  </h3>
                </div>

                <div className={styles.formRow}>
                  {formData.model_type === 'chat' ? (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Input Cost ($/1k)</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.cost_per_1k_input}
                          onChange={e => setFormData(v => ({ ...v, cost_per_1k_input: parseFloat(e.target.value) }))}
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Output Cost ($/1k)</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.cost_per_1k_output}
                          onChange={e => setFormData(v => ({ ...v, cost_per_1k_output: parseFloat(e.target.value) }))}
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Max Tokens</label>
                        <input
                          type="number"
                          value={formData.max_tokens}
                          onChange={e => setFormData(v => ({ ...v, max_tokens: parseInt(e.target.value) }))}
                          className={styles.formInput}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Dimensions</label>
                        <input
                          type="number"
                          value={formData.embedding_dimensions || 1536}
                          onChange={e => setFormData(v => ({ ...v, embedding_dimensions: parseInt(e.target.value) }))}
                          placeholder="1536"
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Cost ($/1M tokens)</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.cost_per_million_tokens || 0}
                          onChange={e => setFormData(v => ({ ...v, cost_per_million_tokens: parseFloat(e.target.value) }))}
                          placeholder="0.13"
                          className={styles.formInput}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="modelForm"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinning}>⟳</div>
                    {editingModel ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingModel ? 'Update Model' : 'Add Model'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
