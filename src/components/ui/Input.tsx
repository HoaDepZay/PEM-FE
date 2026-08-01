import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={20} />
          </div>
        )}
        <input 
          className={`w-full bg-slate-50 border ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200'} rounded-2xl py-4 ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-rose-500 text-sm font-medium ml-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-rose-500 inline-block"></span>{error}</p>}
    </div>
  );
};
