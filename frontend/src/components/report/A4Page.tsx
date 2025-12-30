import React from 'react';

interface PageMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface A4PageProps {
  children: React.ReactNode;
  pageNumber?: number;
  showPageNumber?: boolean;
  className?: string;
  margins?: PageMargins;
}

/**
 * Componente que representa uma página A4 com dimensões reais
 * A4 = 210mm x 297mm
 * Margem padrão: 20mm em todos os lados
 */
export const A4Page: React.FC<A4PageProps> = ({
  children,
  pageNumber,
  showPageNumber = true,
  className = '',
  margins = { top: 20, right: 20, bottom: 20, left: 20 },
}) => {
  const { top = 20, right = 20, bottom = 20, left = 20 } = margins;
  
  return (
    <div
      className={`a4-page bg-white shadow-lg mx-auto relative ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        paddingTop: `${top}mm`,
        paddingRight: `${right}mm`,
        paddingBottom: `${bottom}mm`,
        paddingLeft: `${left}mm`,
        boxSizing: 'border-box',
        pageBreakAfter: 'always',
        position: 'relative',
      }}
    >
      {/* Conteúdo da página */}
      <div className="a4-content">{children}</div>

      {/* Número da página (opcional) */}
      {showPageNumber && pageNumber && (
        <div
          className="text-xs text-gray-400 text-center absolute bottom-2"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          Página {pageNumber}
        </div>
      )}
    </div>
  );
};

interface A4ContainerProps {
  children: React.ReactNode;
  showGrid?: boolean;
  className?: string;
}

/**
 * Container para visualização de múltiplas páginas A4
 */
export const A4Container: React.FC<A4ContainerProps> = ({
  children,
  showGrid = false,
  className = '',
}) => {
  return (
    <div
      className={`a4-container py-8 ${className}`}
      style={{
        background: showGrid
          ? 'linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, 0.03) 25%, rgba(0, 0, 0, 0.03) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.03) 75%, rgba(0, 0, 0, 0.03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, 0.03) 25%, rgba(0, 0, 0, 0.03) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.03) 75%, rgba(0, 0, 0, 0.03) 76%, transparent 77%, transparent)'
          : '#f5f5f5',
        backgroundSize: showGrid ? '20mm 20mm' : 'auto',
        minHeight: '100vh',
      }}
    >
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

/**
 * Divisor visual entre páginas
 */
export const PageBreak: React.FC = () => {
  return (
    <div className="page-break flex items-center justify-center my-6">
      <div className="flex items-center gap-4">
        <div className="h-px bg-gray-300 flex-1 w-20"></div>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          Quebra de Página
        </span>
        <div className="h-px bg-gray-300 flex-1 w-20"></div>
      </div>
    </div>
  );
};






