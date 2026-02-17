import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onAddModel: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddModel }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Icon Container */}
      <div style={{
        width: '90px',
        height: '90px',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        borderRadius: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 30px -8px rgba(59, 130, 246, 0.2)',
        border: '1px solid #BFDBFE',
        position: 'relative'
      }}>
        <Sparkles
          size={42}
          strokeWidth={1.5}
          style={{ color: '#3B82F6' }}
        />
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '26px',
          height: '26px',
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
        }}>
          <Plus size={14} strokeWidth={3} style={{ color: 'white' }} />
        </div>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#0F172A',
        marginBottom: '0.75rem',
        letterSpacing: '-0.025em',
        lineHeight: '1.2'
      }}>
        No Models Yet
      </h2>

      {/* Description */}
      <p style={{
        fontSize: '0.875rem',
        color: '#64748B',
        lineHeight: '1.6',
        marginBottom: '1.75rem',
        maxWidth: '420px',
        fontWeight: 500
      }}>
        Get started by adding your first AI model. Connect providers like OpenAI, Anthropic, or configure custom models to power your application.
      </p>

      {/* CTA Button */}
      <button
        onClick={onAddModel}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.75rem 2rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'white',
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          border: 'none',
          borderRadius: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.3), 0 0 0 1px rgba(37, 99, 235, 0.1)',
          letterSpacing: '0.025em'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(37, 99, 235, 0.4), 0 0 0 1px rgba(37, 99, 235, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(37, 99, 235, 0.3), 0 0 0 1px rgba(37, 99, 235, 0.1)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
        }}
        aria-label="Add your first model"
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Your First Model
      </button>

      {/* Helper Text */}
      <p style={{
        fontSize: '0.75rem',
        color: '#94A3B8',
        marginTop: '1.25rem',
        fontWeight: 500
      }}>
        Takes less than a minute to set up
      </p>
    </div>
  );
};
