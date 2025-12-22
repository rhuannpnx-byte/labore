import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api-client';
import { authService } from '../services/auth';
import { 
  ArrowLeft, 
  Eye, 
  FileText, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle2, 
  Calculator,
  Trash2,
  FileCheck
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  submittedBy?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    code?: string;
  };
  responses: any[];
  processingResults: any[];
}

interface Form {
  id: string;
  title: string;
  description?: string;
  status: string;
  project?: {
    id: string;
    name: string;
  };
}

export default function SubmissionsList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = authService.getUser();
  
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [formData, submissionsData] = await Promise.all([
        apiClient.getForm(id!),
        apiClient.getFormSubmissions(id!)
      ]);
      setForm(formData);
      setSubmissions(submissionsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) return;
    
    try {
      await apiClient.deleteSubmission(submissionId);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir resposta');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Carregando respostas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                icon={<ArrowLeft size={18} />}
                onClick={() => navigate(`/forms/${id}`)}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-5 h-5 text-purple-600" />
                  <h1 className="text-lg font-bold text-gray-900">
                    Respostas do Formulário
                  </h1>
                </div>
                {form && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">{form.title}</span>
                    {form.project && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{form.project.name}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {form?.status === 'ACTIVE' && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={18} />}
                onClick={() => navigate(`/forms/${id}/fill`)}
              >
                Nova Resposta
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="animate-fade-in-up">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total de Respostas
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {submissions.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Com Cálculos
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {submissions.filter(s => s.processingResults?.length > 0).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Última Resposta
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {submissions.length > 0 
                      ? format(new Date(submissions[0].submittedAt), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'
                    }
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Submissions List */}
        {submissions.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nenhuma resposta ainda
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                As respostas aparecerão aqui quando o formulário for preenchido
              </p>
              {form?.status === 'ACTIVE' && (
                <Button 
                  variant="primary" 
                  icon={<Plus size={20} />}
                  onClick={() => navigate(`/forms/${id}/fill`)}
                >
                  Preencher Formulário
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden animate-fade-in-up" padding="none">
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Resposta
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Projeto
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Campos
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Cálculos
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((submission, index) => (
                      <tr 
                        key={submission.id} 
                        className="hover:bg-purple-50/50 transition-colors animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                              <FileCheck className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="font-mono text-sm font-medium text-gray-900">
                              #{submission.id.slice(0, 8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-gray-900 font-medium">
                              {format(new Date(submission.submittedAt), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            <span className="text-gray-500">
                              {format(new Date(submission.submittedAt), 'HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {submission.submittedBy ? (
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {submission.submittedBy.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {submission.submittedBy.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {submission.project ? (
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {submission.project.name}
                              </p>
                              {submission.project.code && (
                                <p className="text-xs text-gray-500">
                                  {submission.project.code}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="secondary">
                            <CheckCircle2 size={14} className="mr-1" />
                            {submission.responses?.length || 0}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {submission.processingResults?.length > 0 ? (
                            <Badge variant="success">
                              <Calculator size={14} className="mr-1" />
                              {submission.processingResults.length}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/submissions/${submission.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(submission.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

