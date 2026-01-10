import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi, submissionsApi } from '../services/api';
import { Report, FormSubmission } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useProjectContext } from '../services/project-context';
import { Filter } from 'lucide-react';

export const ReportGenerate: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject } = useProjectContext();

  const [report, setReport] = useState<Report | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros de data
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const hasActiveFilters = startDate || endDate;

  useEffect(() => {
    loadData();
  }, [reportId, selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading report:', reportId);
      
      if (!reportId) {
        setError('ID do relatório não fornecido');
        return;
      }
      
      // Carregar relatório
      const reportResponse = await reportsApi.get(reportId);
      console.log('Report loaded:', reportResponse.data);
      setReport(reportResponse.data);

      // Carregar submissões do formulário vinculado ao relatório
      if (reportResponse.data.formId) {
        console.log('Loading submissions for form:', reportResponse.data.formId);
        const submissionsResponse = await submissionsApi.listByForm(
          reportResponse.data.formId
        );
        console.log('Submissions loaded:', submissionsResponse.data.length);
        
        // Filtrar por projeto se houver um selecionado
        let filtered = submissionsResponse.data;
        if (selectedProject) {
          filtered = submissionsResponse.data.filter(
            s => s.projectId === selectedProject.id
          );
          console.log('Submissions filtered for project:', filtered.length);
        } else {
          console.log('No project selected - showing all submissions');
        }
        
        setSubmissions(filtered);
        setFilteredSubmissions(filtered);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      console.error('Error details:', err.response);
      setError(err.response?.data?.error || err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros de data
  useEffect(() => {
    let filtered = submissions;

    // Filtrar por data de início
    if (startDate) {
      const start = parseLocalDate(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => {
        const submissionDate = new Date(s.submittedAt);
        return submissionDate >= start;
      });
    }

    // Filtrar por data de fim
    if (endDate) {
      const end = parseLocalDate(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => {
        const submissionDate = new Date(s.submittedAt);
        return submissionDate <= end;
      });
    }

    setFilteredSubmissions(filtered);
    
    // Remover seleções que não estão mais na lista filtrada
    const filteredIds = new Set(filtered.map(s => s.id));
    const newSelected = new Set(
      Array.from(selectedSubmissions).filter(id => filteredIds.has(id))
    );
    setSelectedSubmissions(newSelected);
  }, [submissions, startDate, endDate]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  // Função para converter string de data (YYYY-MM-DD) para Date local
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const toggleSubmission = (submissionId: string) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
    } else {
      newSelected.add(submissionId);
    }
    setSelectedSubmissions(newSelected);
  };

  const toggleAll = () => {
    if (selectedSubmissions.size === filteredSubmissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(filteredSubmissions.map(s => s.id)));
    }
  };

  const handleGenerate = async () => {
    if (selectedSubmissions.size === 0) {
      alert('Selecione pelo menos uma resposta para gerar o relatório');
      return;
    }

    try {
      setGenerating(true);
      
      // Gerar relatório para cada submissão selecionada
      const generations = [];
      
      for (const submissionId of Array.from(selectedSubmissions)) {
        // Buscar a submissão para obter seu projeto
        const submission = submissions.find(s => s.id === submissionId);
        const projectId = submission?.projectId || selectedProject?.id;
        
        const response = await reportsApi.generate(reportId!, {
          submissionId,
          projectId,
        });
        generations.push(response.data);
      }

      // Redirecionar para visualização (única ou múltipla)
      if (generations.length === 1) {
        // Um único relatório
        navigate(`/reports/view/${generations[0].id}`);
      } else {
        // Múltiplos relatórios - mostrar todos em sequência no mesmo PDF
        const generationIds = generations.map(g => g.id).join(',');
        navigate(`/reports/view-batch/${generationIds}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error || 'Relatório não encontrado'}</p>
          <Button onClick={() => navigate('/reports')}>
            Voltar para Relatórios
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerar Relatório</h1>
          <p className="mt-1 text-sm text-gray-500">
            Selecione as respostas que deseja incluir no relatório
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/reports')}>
          Cancelar
        </Button>
      </div>

      {/* Informações do relatório */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">{report.title}</h2>
        {report.description && (
          <p className="text-gray-600 mb-4">{report.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {report.form && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-gray-900">{report.form.title}</span>
            </div>
          )}
          {selectedProject && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {selectedProject.name}
            </div>
          )}
        </div>
      </Card>

      {/* Tabela de Submissões */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Respostas Disponíveis
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedSubmissions.size} de {filteredSubmissions.length} selecionadas
              {filteredSubmissions.length !== submissions.length && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  ({submissions.length} total)
                </span>
              )}
            </p>
          </div>
          
          {filteredSubmissions.length > 0 && (
            <Button onClick={toggleAll} size="sm" variant="outline">
              {selectedSubmissions.size === filteredSubmissions.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
            </Button>
          )}
        </div>

        {filteredSubmissions.length === 0 && submissions.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma resposta encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Não há respostas no período selecionado
            </p>
            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma resposta encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Não há respostas para o formulário "{report.form?.title}" neste projeto
            </p>
            <Button onClick={() => navigate(`/forms/${report.formId}/fill`)}>
              Preencher Formulário
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                      onChange={toggleAll}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => setShowFilterModal(true)}
                      className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors -ml-0.5"
                    >
                      <span>DATA</span>
                      <Filter 
                        size={14} 
                        className={`transition-colors ${
                          hasActiveFilters 
                            ? 'text-blue-600 dark:text-blue-400 fill-current' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Preenchido por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Campos Preenchidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      selectedSubmissions.has(submission.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => toggleSubmission(submission.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.has(submission.id)}
                        onChange={() => toggleSubmission(submission.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(submission.submittedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                            {submission.submittedBy?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {submission.submittedBy?.name || 'Desconhecido'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {submission.responses?.length || 0} campos
                      </div>
                      {submission.processingResults && submission.processingResults.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {submission.processingResults.length} cálculos
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">
                        Completo
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Informações sobre geração */}
      {filteredSubmissions.length > 0 && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como Funciona
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>✓ Selecione uma ou mais respostas acima</p>
            <p>✓ Clique em "Gerar Relatório(s)"</p>
            <p>✓ Será gerado um relatório para cada resposta selecionada</p>
            <p>✓ Os dados dinâmicos (@{'{}'} e #{'{}'}) serão preenchidos automaticamente</p>
          </div>
        </Card>
      )}

      {/* Botão de gerar */}
      {filteredSubmissions.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating || selectedSubmissions.size === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {generating 
              ? 'Gerando...' 
              : `🚀 Gerar ${selectedSubmissions.size} Relatório${selectedSubmissions.size !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      )}

      {/* Modal de Filtro de Data */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtrar por Data"
        description="Selecione um período para filtrar as respostas"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              onClick={applyFilters}
            >
              Aplicar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {hasActiveFilters && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {startDate && endDate && (
                  <>Filtrando de <strong>{parseLocalDate(startDate).toLocaleDateString('pt-BR')}</strong> até <strong>{parseLocalDate(endDate).toLocaleDateString('pt-BR')}</strong></>
                )}
                {startDate && !endDate && (
                  <>Filtrando a partir de <strong>{parseLocalDate(startDate).toLocaleDateString('pt-BR')}</strong></>
                )}
                {!startDate && endDate && (
                  <>Filtrando até <strong>{parseLocalDate(endDate).toLocaleDateString('pt-BR')}</strong></>
                )}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
