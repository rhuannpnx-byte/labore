import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { Report, ReportStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useProjectContext } from '../services/project-context';

const statusColors: Record<ReportStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ReportStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

export const ReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProjectContext();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadReports();
  }, [selectedProject]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedProject ? { projectId: selectedProject.id } : {};
      const response = await reportsApi.list(params);
      setReports(response.data);
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err.response?.data?.error || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este relatório?')) {
      return;
    }

    try {
      await reportsApi.delete(id);
      setReports(reports.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao deletar relatório');
    }
  };

  const filteredReports = statusFilter === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Relatórios Personalizados</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Crie e gerencie relatórios dinâmicos com tabelas, gráficos e dados vinculados
          </p>
        </div>
        <Button
          onClick={() => navigate('/reports/new')}
          variant="primary"
          size="sm"
          fullWidth
          className="sm:w-auto"
        >
          + Novo Relatório
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
          onClick={() => setStatusFilter('ALL')}
          size="sm"
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === 'DRAFT' ? 'primary' : 'outline'}
          onClick={() => setStatusFilter('DRAFT')}
          size="sm"
        >
          Rascunhos
        </Button>
        <Button
          variant={statusFilter === 'PUBLISHED' ? 'primary' : 'outline'}
          onClick={() => setStatusFilter('PUBLISHED')}
          size="sm"
        >
          Ativos
        </Button>
        <Button
          variant={statusFilter === 'ARCHIVED' ? 'primary' : 'outline'}
          onClick={() => setStatusFilter('ARCHIVED')}
          size="sm"
        >
          Arquivados
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Lista de relatórios */}
      {filteredReports.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhum relatório encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece criando seu primeiro relatório personalizado
          </p>
          <Button
            onClick={() => navigate('/reports/new')}
            variant="primary"
          >
            Criar Relatório
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="p-5 sm:p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                  {report.title}
                </h3>
                <Badge 
                  variant={
                    report.status === 'PUBLISHED' ? 'success' : 
                    report.status === 'DRAFT' ? 'warning' : 'secondary'
                  }
                >
                  {statusLabels[report.status]}
                </Badge>
              </div>

              {report.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {report.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {report.form && (
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="truncate">{report.form.title}</span>
                  </div>
                )}

                {report.project && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="truncate">{report.project.name}</span>
                  </div>
                )}

                {report.createdBy && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{report.createdBy.name}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  {report._count?.elements || 0} elementos
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {report._count?.generations || 0} gerações
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/reports/${report.id}/edit`)}
                  fullWidth
                >
                  <span className="hidden sm:inline">Editar</span>
                  <span className="sm:hidden">✏️</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/reports/${report.id}/generate`)}
                  fullWidth
                >
                  <span className="hidden sm:inline">Gerar</span>
                  <span className="sm:hidden">📄</span>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(report.id)}
                  fullWidth
                >
                  <span className="hidden sm:inline">Excluir</span>
                  <span className="sm:hidden">🗑️</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

