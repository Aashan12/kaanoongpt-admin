import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full" />
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0" />
      </div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
        Syncing with backend...
      </p>
    </div>
  );
};
