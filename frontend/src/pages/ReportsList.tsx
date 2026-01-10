import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { Report, ReportStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useProjectContext } from '../services/project-context';
import { authService } from '../services/auth';
import { MoreVertical, Copy, Share2 } from 'lucide-react';
import ShareReportModal from '../components/ShareReportModal';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const currentUser = authService.getUser();
  const canManageReports = currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'ADMIN';

  useEffect(() => {
    loadReports();
  }, [selectedProject]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedProject?.id) {
        setReports([]);
        setError('Selecione uma obra para visualizar os relatórios');
        return;
      }
      
      const response = await reportsApi.list({ projectId: selectedProject.id });
      setReports(response.data);
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err.response?.data?.error || 'Erro ao carregar relatórios');
      setReports([]);
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

  const handleDuplicate = async (report: Report) => {
    setOpenMenuId(null);
    
    if (!window.confirm(`Deseja duplicar o relatório "${report.title}"?`)) {
      return;
    }

    try {
      const response = await reportsApi.duplicate(report.id);
      setReports([response.data, ...reports]);
      alert('Relatório duplicado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao duplicar relatório');
    }
  };

  const handleOpenShareModal = (report: Report) => {
    setOpenMenuId(null);
    setSelectedReport(report);
    setShowShareModal(true);
  };

  const handleShare = async () => {
    // Modal callback - recarregar lista
    loadReports();
  };

  const toggleMenu = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === reportId ? null : reportId);
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
            {selectedProject 
              ? `Obra: ${selectedProject.name}` 
              : 'Selecione uma obra para visualizar'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/reports/new')}
          variant="primary"
          size="sm"
          fullWidth
          className="sm:w-auto"
          disabled={!selectedProject}
        >
          + Novo Relatório
        </Button>
      </div>

      {/* Alerta quando não há obra selecionada */}
      {!selectedProject ? (
        <Card className="p-8 text-center">
          <div className="inline-flex p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl mb-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Selecione uma obra
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Para visualizar e gerenciar relatórios, selecione uma obra no cabeçalho superior.
          </p>
        </Card>
      ) : (
        <>
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
              className="p-5 sm:p-6 hover:shadow-lg transition-all cursor-pointer relative"
              onClick={() => navigate(`/reports/${report.id}/edit`)}
            >
              {/* Cabeçalho com título, badge e menu */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                  {report.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      report.status === 'PUBLISHED' ? 'success' : 
                      report.status === 'DRAFT' ? 'warning' : 'secondary'
                    }
                  >
                    {statusLabels[report.status]}
                  </Badge>
                  
                  {/* Menu de 3 pontos */}
                  {canManageReports && (
                    <div className="relative" ref={(el) => (menuRefs.current[report.id] = el)}>
                      <button
                        onClick={(e) => toggleMenu(report.id, e)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Mais opções"
                      >
                        <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuId === report.id && (
                        <div className="absolute right-0 top-8 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(report);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Copy size={16} />
                              Duplicar relatório
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenShareModal(report);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Share2 size={16} />
                              Compartilhar relatório
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
        </>
      )}

      {/* Modal de Compartilhamento */}
      {showShareModal && selectedReport && (
        <ShareReportModal
          isOpen={showShareModal}
          report={selectedReport}
          onClose={() => {
            setShowShareModal(false);
            setSelectedReport(null);
          }}
          onSuccess={handleShare}
        />
      )}
    </div>
  );
};

