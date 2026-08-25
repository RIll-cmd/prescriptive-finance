import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  return (
    <button className={`px-4 py-2 rounded font-medium transition-colors ${className}`} {...props}>
      {children}
    </button>
  );
};
