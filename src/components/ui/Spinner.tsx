import React from 'react';

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex justify-center py-10 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>
  );
};
