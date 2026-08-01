import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightContent }) => {
  return (
    <div className="mb-6 flex justify-between items-end">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-900/60 text-sm font-medium mt-1">{subtitle}</p>}
      </div>
      {rightContent && (
        <div>{rightContent}</div>
      )}
    </div>
  );
};
