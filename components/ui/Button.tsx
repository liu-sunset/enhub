import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 h-10";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline: "border border-slate-200 hover:bg-slate-100 text-slate-900",
    ghost: "hover:bg-slate-100 text-slate-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      ) : null}
      {children}
    </button>
  );
};
