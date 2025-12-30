import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { ReportGeneration } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { A4Container } from '../components/report/A4Page';
import {
  TextElement,
  TitleElement,
  TableElement,
  ChartElement,
  ImageElement,
  DividerElement,
  SpacerElement,
  SignatureElement,
} from '../components/report';

export const ReportBatchViewer: React.FC = () => {
  const { ids } = useParams<{ ids: string }>();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<ReportGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGenerations();
  }, [ids]);

  const loadGenerations = async () => {
    try {
      setLoading(true);
      const generationIds = ids?.split(',') || [];
      
      if (generationIds.length === 0) {
        setError('Nenhum relatório especificado');
        return;
      }

      // Carregar todos os relatórios
      const promises = generationIds.map(id => reportsApi.getGeneration(id));
      const responses = await Promise.all(promises);
      
      setGenerations(responses.map(r => r.data));
    } catch (err: any) {
      console.error('Error loading generations:', err);
      setError(err.response?.data?.error || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderElement = (element: any) => {
    const config = element.processedConfig || element.config;
    const style = element.style || {};

    switch (element.type) {
      case 'TEXT':
        return <TextElement config={config} style={style} />;
      case 'TITLE':
        return <TitleElement config={config} style={style} />;
      case 'TABLE':
        return <TableElement config={config} style={style} />;
      case 'CHART':
        return <ChartElement config={config} style={style} />;
      case 'IMAGE':
        return <ImageElement config={config} style={style} />;
      case 'DIVIDER':
        return <DividerElement config={config} style={style} />;
      case 'SPACER':
        return <SpacerElement config={config} style={style} />;
      case 'SIGNATURE':
        return <SignatureElement config={config} style={style} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando relatórios...</div>
      </div>
    );
  }

  if (error || generations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao Carregar Relatórios
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Nenhum relatório encontrado'}</p>
          <Button onClick={() => navigate('/reports')}>
            Voltar para Relatórios
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header (não aparece na impressão) */}
      <div className="max-w-5xl mx-auto mb-6 px-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lote de Relatórios ({generations.length})
            </h1>
            <p className="text-gray-600 mt-1">
              Todos os relatórios serão impressos em sequência no mesmo PDF
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
              🖨️ Imprimir / Gerar PDF
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> Clique em "Imprimir / Gerar PDF" para gerar um único PDF contendo todos os {generations.length} relatórios em sequência.
          </p>
        </div>
      </div>

      {/* Relatórios em sequência */}
      <A4Container className="print:bg-white print:p-0">
        {generations.map((generation, genIndex) => {
          const reportData = generation.report || generation.data.report;
          const elements = generation.data.elements || [];
          const metadata = generation.data.metadata || {};
          
          // Configurações de página (margens)
          const pageSettings = reportData?.pageSettings || {};
          const margins = pageSettings.margins || {};
          const top = margins.top !== undefined ? margins.top : 20;
          const right = margins.right !== undefined ? margins.right : 20;
          const bottom = margins.bottom !== undefined ? margins.bottom : 20;
          const left = margins.left !== undefined ? margins.left : 20;
          
          // Logo do projeto (tentar pegar dos metadados ou do projeto da geração)
          const projectLogo = (metadata.project as any)?.logo || (generation.project as any)?.logo;
          const showLogo = pageSettings.showProjectLogo === true && projectLogo;

          return (
            <React.Fragment key={generation.id}>
              {/* Separador visual entre relatórios (não imprime) */}
              {genIndex > 0 && (
                <div className="print:hidden my-8 flex items-center justify-center">
                  <div className="flex items-center gap-4 bg-purple-100 border-2 border-purple-300 rounded-lg px-6 py-3">
                    <span className="text-purple-700 font-bold">
                      📄 Relatório {genIndex + 1} de {generations.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Página do relatório */}
              <div 
                className="a4-paged-content page-break-after"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  background: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  margin: '0 auto 2rem auto',
                  paddingTop: `${top}mm`,
                  paddingRight: `${right}mm`,
                  paddingBottom: `${bottom}mm`,
                  paddingLeft: `${left}mm`,
                  boxSizing: 'border-box',
                  position: 'relative',
                  // CSS Variables para uso na impressão
                  ['--margin-top' as any]: `${top}mm`,
                  ['--margin-right' as any]: `${right}mm`,
                  ['--margin-bottom' as any]: `${bottom}mm`,
                  ['--margin-left' as any]: `${left}mm`,
                }}
              >
                {/* Logo da obra (se habilitada) */}
                {showLogo && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: `${top}mm`,
                      left: `${left}mm`,
                      maxWidth: '120px',
                      maxHeight: '90px',
                      zIndex: 10,
                    }}
                  >
                    <img 
                      src={projectLogo} 
                      alt="Logo da obra"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                {/* Elementos do relatório */}
                <div>
                  {elements.map((element: any) => (
                    <div 
                      key={element.id} 
                      className="report-element"
                      style={{ 
                        marginBottom: element.style?.marginBottom || '24px',
                      }}
                    >
                      {renderElement(element)}
                    </div>
                  ))}

                  {elements.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>Este relatório não possui elementos</p>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </A4Container>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          /* Remover cabeçalhos e rodapés do navegador */
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .a4-container {
            padding: 0 !important;
            background: white !important;
            margin: 0 !important;
          }
          
          .a4-paged-content {
            box-shadow: none !important;
            margin: 0 !important;
            padding-top: var(--margin-top, 20mm) !important;
            padding-right: var(--margin-right, 20mm) !important;
            padding-bottom: var(--margin-bottom, 20mm) !important;
            padding-left: var(--margin-left, 20mm) !important;
            page-break-after: always;
            page-break-inside: avoid;
          }
          
          .page-break-after:last-child {
            page-break-after: auto;
          }
          
          /* Garantir que elementos não quebrem no meio */
          .report-element {
            page-break-inside: avoid;
          }
          
          table, img, canvas {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

