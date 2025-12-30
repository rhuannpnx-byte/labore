import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { ReportGeneration } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
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
import { A4Container } from '../components/report/A4Page';

export const ReportViewer: React.FC = () => {
  const { generationId } = useParams<{ generationId: string }>();
  const navigate = useNavigate();
  const [generation, setGeneration] = useState<ReportGeneration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGeneration();
  }, [generationId]);

  const loadGeneration = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getGeneration(generationId!);
      console.log('Generation loaded:', response.data);
      console.log('Elements:', response.data.data?.elements);
      setGeneration(response.data);
    } catch (err: any) {
      console.error('Error loading generation:', err);
      setError(err.response?.data?.error || 'Erro ao carregar relatório');
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
        <div className="text-lg text-gray-600">Carregando relatório...</div>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao Carregar Relatório
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Relatório não encontrado'}</p>
          <Button onClick={() => navigate('/reports')}>
            Voltar para Relatórios
          </Button>
        </Card>
      </div>
    );
  }

  const reportData = generation.report || generation.data.report;
  const elements = generation.data.elements || [];
  const metadata = generation.data.metadata || {};
  
  // Configurações de página (margens)
  const pageSettings = reportData?.pageSettings || {};
  const margins = pageSettings.margins || {};
  
  // Usar valores da margem ou padrão, mas permitindo 0
  const top = margins.top !== undefined ? margins.top : 20;
  const right = margins.right !== undefined ? margins.right : 20;
  const bottom = margins.bottom !== undefined ? margins.bottom : 20;
  const left = margins.left !== undefined ? margins.left : 20;
  
  // Logo do projeto (tentar pegar dos metadados ou do projeto da geração)
  const projectLogo = (metadata.project as any)?.logo || (generation.project as any)?.logo;
  const showLogo = pageSettings.showProjectLogo === true && projectLogo;

  return (
    <div className="print:p-0 print:m-0">
      {/* Header (não aparece na impressão) */}
      <div className="max-w-5xl mx-auto mb-6 px-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{reportData.title}</h1>
            {reportData.description && (
              <p className="text-gray-600 mt-1">{reportData.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              🖨️ Imprimir / PDF
            </Button>
          </div>
        </div>

        {/* Metadados */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {metadata.generatedAt && (
            <div className="text-sm">
              <span className="text-gray-500">Data:</span>
              <p className="font-medium text-gray-900">
                {new Date(metadata.generatedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
          {metadata.project && (
            <div className="text-sm">
              <span className="text-gray-500">Projeto:</span>
              <p className="font-medium text-gray-900">{metadata.project.name}</p>
            </div>
          )}
          {metadata.submission && (
            <div className="text-sm">
              <span className="text-gray-500">Formulário:</span>
              <p className="font-medium text-gray-900">{metadata.submission.formTitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo do relatório em formato A4 */}
      <A4Container className="print:bg-white print:p-0 print:shadow-none">
        <div 
          className="a4-paged-content print:m-0"
          style={{
            width: '210mm',
            minHeight: '297mm',
            background: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            margin: '0 auto',
            paddingTop: `${top}mm`,
            paddingRight: `${right}mm`,
            paddingBottom: `${bottom}mm`,
            paddingLeft: `${left}mm`,
            boxSizing: 'border-box',
            position: 'relative',
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
            padding-top: ${top}mm !important;
            padding-right: ${right}mm !important;
            padding-bottom: ${bottom}mm !important;
            padding-left: ${left}mm !important;
            page-break-inside: avoid;
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

