import React from 'react';
import { motion } from 'framer-motion';
import type { StatCard as StatCardType } from '../types';

interface StatsCardProps extends StatCardType {
  index: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
  index,
}) => {
  // Map Tailwind classes to actual colors for inline styles
  const colorMap: Record<string, { icon: string; bg: string; gradient: string }> = {
    'text-blue-600': {
      icon: '#2563EB',
      bg: '#EFF6FF',
      gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
    },
    'text-emerald-600': {
      icon: '#059669',
      bg: '#ECFDF5',
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
    },
    'text-indigo-600': {
      icon: '#4F46E5',
      bg: '#EEF2FF',
      gradient: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
    },
    'text-amber-600': {
      icon: '#D97706',
      bg: '#FFFBEB',
      gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
    }
  };

  const colors = colorMap[color] || colorMap['text-blue-600'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      style={{
        background: 'white',
        padding: '1.25rem',
        borderRadius: '1rem',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      whileHover={{
        y: -2,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Background Decoration */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '90px',
        height: '90px',
        background: colors.gradient,
        borderRadius: '50%',
        opacity: 0.4,
        transition: 'all 0.3s ease'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {/* Icon Container */}
        <div style={{
          width: '44px',
          height: '44px',
          background: colors.gradient,
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 8px -2px ${colors.icon}20`,
          transition: 'transform 0.3s ease'
        }}>
          <Icon
            style={{
              width: '22px',
              height: '22px',
              color: colors.icon,
              strokeWidth: 2.5
            }}
          />
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0
          }}>
            {label}
          </p>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.025em',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {value}
          </h3>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: colors.gradient,
        opacity: 0,
        transition: 'opacity 0.3s ease'
      }} className="hover-glow" />

      <style jsx>{`
        div:hover .hover-glow {
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
};
