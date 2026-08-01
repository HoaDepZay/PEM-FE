import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  fullWidth, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "flex items-center justify-center gap-2 font-bold rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
  const sizeStyle = "py-4 px-6";
  const widthStyle = fullWidth ? "w-full" : "";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/25",
    secondary: "bg-slate-800 text-white hover:bg-slate-700",
    outline: "border-2 border-slate-200 text-slate-900 hover:border-slate-900 hover:bg-slate-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/25"
  };

  return (
    <button 
      className={`${baseStyle} ${sizeStyle} ${widthStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};
