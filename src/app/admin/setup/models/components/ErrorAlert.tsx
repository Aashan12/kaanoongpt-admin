import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 relative overflow-hidden"
          role="alert"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />
          <div className="text-sm font-medium text-rose-700 flex-1">{error}</div>
          <button
            onClick={onDismiss}
            className="ml-auto p-1 hover:bg-rose-100 rounded-full text-rose-400 transition-colors"
            aria-label="Dismiss error"
          >
            <XCircle size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
