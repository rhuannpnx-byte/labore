import React from 'react';

interface A4PagedContentProps {
  children: React.ReactNode;
  showPageNumbers?: boolean;
  className?: string;
}

/**
 * Componente simplificado que renderiza o conteúdo permitindo 
 * quebra automática de páginas via CSS
 */
export const A4PagedContent: React.FC<A4PagedContentProps> = ({
  children,
  showPageNumbers = true,
  className = '',
}) => {
  return (
    <div 
      className={`a4-paged-content ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        margin: '0 auto',
        padding: '20mm',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Conteúdo com quebra de página automática */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Número da página (se habilitado) */}
      {showPageNumbers && (
        <div
          className="text-xs text-gray-400 text-center absolute bottom-2"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <span className="page-number"></span>
        </div>
      )}
    </div>
  );
};

