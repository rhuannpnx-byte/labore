import React, { useRef, useEffect, useState } from 'react';

interface A4PreviewWithPageBreaksProps {
  children: React.ReactNode;
}

/**
 * Componente que mostra o preview A4 com indicadores visuais de quebra de página
 */
export const A4PreviewWithPageBreaks: React.FC<A4PreviewWithPageBreaksProps> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Altura útil de uma página A4 (297mm - 40mm de margem = 257mm ≈ 972px @ 96dpi)
    const pageHeight = 972;
    const contentHeight = containerRef.current.scrollHeight;
    const numPages = Math.ceil(contentHeight / pageHeight);
    
    // Calcular posições das quebras de página
    const breaks: number[] = [];
    for (let i = 1; i < numPages; i++) {
      breaks.push(i * pageHeight);
    }
    
    setPageBreaks(breaks);
  }, [children]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Conteúdo */}
      <div 
        ref={containerRef}
        className="a4-paged-content"
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
        {children}

        {/* Indicadores de quebra de página */}
        {pageBreaks.map((breakPosition, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${breakPosition}px`,
              height: '2px',
              background: 'repeating-linear-gradient(90deg, #ef4444 0, #ef4444 10px, transparent 10px, transparent 20px)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '-12px',
                transform: 'translateX(-50%)',
                background: '#ef4444',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              📄 Quebra de Página {index + 1}
            </div>
          </div>
        ))}

        {/* Número de páginas estimado */}
        {pageBreaks.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10mm',
              right: '10mm',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 20,
            }}
          >
            📄 {pageBreaks.length + 1} {pageBreaks.length === 0 ? 'página' : 'páginas'}
          </div>
        )}
      </div>
    </div>
  );
};





