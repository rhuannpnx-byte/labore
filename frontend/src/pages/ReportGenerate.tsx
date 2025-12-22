import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi, submissionsApi } from '../services/api';
import { Report, FormSubmission } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useProjectContext } from '../services/project-context';

export const ReportGenerate: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject } = useProjectContext();

  const [report, setReport] = useState<Report | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      console.error('Error details:', err.response);
      setError(err.response?.data?.error || err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
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
    if (selectedSubmissions.size === submissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(submissions.map(s => s.id)));
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
            <h3 className="text-lg font-semibold text-gray-900">
              Respostas Disponíveis
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedSubmissions.size} de {submissions.length} selecionadas
            </p>
          </div>
          
          {submissions.length > 0 && (
            <Button onClick={toggleAll} size="sm" variant="outline">
              {selectedSubmissions.size === submissions.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
            </Button>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma resposta encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Não há respostas para o formulário "{report.form?.title}" neste projeto
            </p>
            <Button onClick={() => navigate(`/forms/${report.formId}/fill`)}>
              Preencher Formulário
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.size === submissions.length && submissions.length > 0}
                      onChange={toggleAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preenchido por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campos Preenchidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedSubmissions.has(submission.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleSubmission(submission.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.has(submission.id)}
                        onChange={() => toggleSubmission(submission.id)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(submission.submittedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {submission.submittedBy?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.submittedBy?.name || 'Desconhecido'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.responses?.length || 0} campos
                      </div>
                      {submission.processingResults && submission.processingResults.length > 0 && (
                        <div className="text-xs text-gray-500">
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
      {submissions.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como Funciona
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>✓ Selecione uma ou mais respostas acima</p>
            <p>✓ Clique em "Gerar Relatório(s)"</p>
            <p>✓ Será gerado um relatório para cada resposta selecionada</p>
            <p>✓ Os dados dinâmicos (@{'{}'} e #{'{}'}) serão preenchidos automaticamente</p>
          </div>
        </Card>
      )}

      {/* Botão de gerar */}
      {submissions.length > 0 && (
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
    </div>
  );
};
