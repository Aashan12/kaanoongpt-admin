import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVIDERS, DEFAULT_FORM_DATA } from '../constants';
import type { LLMModel, ModelFormData } from '../types';
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
  const [formData, setFormData] = useState<ModelFormData>(
    editingModel
      ? {
        name: editingModel.name,
        provider: editingModel.provider,
        model_id: editingModel.model_id,
        api_key: '',
        base_url: editingModel.base_url || '',
        cost_per_1k_input: editingModel.cost_per_1k_input,
        cost_per_1k_output: editingModel.cost_per_1k_output,
        max_tokens: editingModel.max_tokens,
      }
      : DEFAULT_FORM_DATA
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    if (!editingModel && !formData.api_key.trim()) {
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
    setFormData(DEFAULT_FORM_DATA);
    setSubmitError(null);
    onClose();
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
            className={styles.modalBackdrop}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={styles.modalContainer}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2>
                  {editingModel ? 'Edit Model' : 'Add New Model'}
                </h2>
                <p>
                  {editingModel ? 'Update model configuration and pricing' : 'Configure a new LLM model'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className={styles.closeButton}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              <div className={styles.formContent}>
                {/* Error Message */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.errorMessage}
                  >
                    <div className={styles.errorIcon}>!</div>
                    <span>{submitError}</span>
                  </motion.div>
                )}

                {/* Provider Selection */}
                <div className={styles.section}>
                  <div>
                    <label className={styles.sectionLabel}>
                      Provider
                    </label>
                    <p className={styles.sectionDescription}>Select the LLM provider</p>
                  </div>
                  <div className={styles.providerGrid}>
                    {PROVIDERS.map((provider) => (
                      <motion.button
                        key={provider.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(v => ({ ...v, provider: provider.id }))}
                        className={`${styles.providerButton} ${formData.provider === provider.id ? styles.active : ''}`}
                      >
                        {provider.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Model Name */}
                <div className={styles.formField}>
                  <label className={styles.label}>
                    Model Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., GPT-4 Turbo"
                    value={formData.name}
                    onChange={e => setFormData(v => ({ ...v, name: e.target.value }))}
                    className={styles.input}
                  />
                </div>

                {/* Model ID */}
                <div className={styles.formField}>
                  <label className={styles.label}>
                    Model ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., gpt-4-turbo-preview"
                    value={formData.model_id}
                    onChange={e => setFormData(v => ({ ...v, model_id: e.target.value.toLowerCase() }))}
                    className={`${styles.input} ${styles.inputMono}`}
                  />
                </div>

                {/* API Key */}
                <div className={styles.formField}>
                  <label className={styles.label}>
                    API Key
                  </label>
                  <input
                    type="password"
                    placeholder={editingModel ? '••••••••••••••••' : 'sk-...'}
                    value={formData.api_key}
                    onChange={e => setFormData(v => ({ ...v, api_key: e.target.value }))}
                    required={!editingModel}
                    className={`${styles.input} ${styles.inputMono}`}
                  />
                </div>

                {/* Base URL (conditional) */}
                {(formData.provider === 'ollama' || formData.provider === 'custom') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={styles.formField}
                  >
                    <label className={styles.label}>
                      Base URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://api.example.com"
                      value={formData.base_url}
                      onChange={e => setFormData(v => ({ ...v, base_url: e.target.value }))}
                      className={`${styles.input} ${styles.inputMono}`}
                    />
                  </motion.div>
                )}

                {/* Pricing & Limits */}
                <div className={styles.pricingSection}>
                  <div className={styles.pricingSectionHeader}>
                    <DollarSign size={18} className={styles.pricingSectionIcon} />
                    <h3 className={styles.pricingSectionTitle}>Pricing & Limits</h3>
                  </div>

                  <div className={styles.pricingGrid}>
                    <div className={styles.pricingField}>
                      <label className={styles.pricingLabel}>
                        Input Cost (per 1K)
                      </label>
                      <div className={styles.inputWithPrefix}>
                        <span className={styles.inputPrefix}>$</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={formData.cost_per_1k_input}
                          onChange={e => setFormData(v => ({ ...v, cost_per_1k_input: parseFloat(e.target.value) || 0 }))}
                          className={`${styles.input} ${styles.inputMono}`}
                        />
                      </div>
                    </div>

                    <div className={styles.pricingField}>
                      <label className={styles.pricingLabel}>
                        Output Cost (per 1K)
                      </label>
                      <div className={styles.inputWithPrefix}>
                        <span className={styles.inputPrefix}>$</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={formData.cost_per_1k_output}
                          onChange={e => setFormData(v => ({ ...v, cost_per_1k_output: parseFloat(e.target.value) || 0 }))}
                          className={`${styles.input} ${styles.inputMono}`}
                        />
                      </div>
                    </div>

                    <div className={styles.pricingField}>
                      <label className={styles.pricingLabel}>
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        placeholder="4096"
                        value={formData.max_tokens}
                        onChange={e => setFormData(v => ({ ...v, max_tokens: parseInt(e.target.value) || 4096 }))}
                        className={`${styles.input} ${styles.inputMono}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={styles.submitButton}
                >
                  {isLoading ? 'Saving...' : editingModel ? 'Update Model' : 'Add Model'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
