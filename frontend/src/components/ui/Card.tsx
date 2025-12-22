import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  padding?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, style, padding, hover }) => {
  const paddingClass = padding ? padding : '';
  const hoverClass = hover ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : '';
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all ${onClick ? 'cursor-pointer' : ''} ${hoverClass} ${paddingClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
};
