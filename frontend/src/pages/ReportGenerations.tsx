import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { ReportGeneration } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const ReportGenerations: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<ReportGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportId) {
      loadGenerations();
    }
  }, [reportId]);

  const loadGenerations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading generations for report:', reportId);
      const response = await reportsApi.listGenerations(reportId!);
      console.log('Generations loaded:', response.data);
      setGenerations(response.data);
    } catch (err: any) {
      console.error('Error loading generations:', err);
      setError(err.response?.data?.error || 'Erro ao carregar relatórios gerados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/reports')}>
              Voltar para Relatórios
            </Button>
            <Button onClick={loadGenerations}>
              Tentar Novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Gerados</h1>
          <p className="mt-1 text-sm text-gray-500">
            {generations.length} relatório(s) gerado(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/reports/${reportId}/generate`)}>
            ← Gerar Mais
          </Button>
          <Button onClick={() => navigate('/reports')}>
            Voltar para Relatórios
          </Button>
        </div>
      </div>

      {generations.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum relatório gerado ainda
          </h3>
          <p className="text-gray-500 mb-6">
            Clique no botão abaixo para gerar relatórios
          </p>
          <Button onClick={() => navigate(`/reports/${reportId}/generate`)}>
            Gerar Relatórios
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generations.map((generation) => (
          <Card
            key={generation.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/reports/view/${generation.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Relatório #{generations.indexOf(generation) + 1}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(generation.generatedAt).toLocaleString('pt-BR')}
              </div>

              {generation.generatedBy && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {generation.generatedBy.name}
                </div>
              )}

              {generation.project && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {generation.project.name}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/reports/view/${generation.id}`);
                }}
              >
                Visualizar
              </Button>
            </div>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
};

