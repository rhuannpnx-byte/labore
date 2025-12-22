import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';
  
  const variants = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  };

  const dotColors = {
    primary: 'bg-blue-600 dark:bg-blue-400',
    secondary: 'bg-gray-600 dark:bg-gray-400',
    success: 'bg-green-600 dark:bg-green-400',
    danger: 'bg-red-600 dark:bg-red-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
