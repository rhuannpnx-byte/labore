import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api-client';
import { useProjectContext } from '../services/project-context';
import { 
  ArrowLeft, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FormWithSubmissions {
  id: string;
  title: string;
  description?: string;
  submissionsCount: number;
  lastSubmission?: string;
}

interface Submission {
  id: string;
  formId: string;
  submittedAt: string;
  submittedBy?: {
    name: string;
    email: string;
  };
  form?: {
    title: string;
  };
  responses: any[];
  processingResults: any[];
}

export default function AllSubmissions() {
  const navigate = useNavigate();
  const { selectedProject } = useProjectContext();
  
  const [forms, setForms] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadData();
  }, [selectedProject]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar formulários do projeto selecionado
      const formsData = await apiClient.getForms(selectedProject?.id);
      setForms(formsData);
      
      // Buscar submissões recentes de todos os formulários
      const allSubmissions: Submission[] = [];
      for (const form of formsData) {
        try {
          const submissions = await apiClient.getFormSubmissions(form.id);
          allSubmissions.push(...submissions.map((s: any) => ({
            ...s,
            form: { title: form.title }
          })));
        } catch (err) {
          console.error(`Erro ao carregar submissões do formulário ${form.id}:`, err);
        }
      }
      
      // Ordenar por data mais recente
      allSubmissions.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      
      setRecentSubmissions(allSubmissions.slice(0, 20)); // Últimas 20
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando respostas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Todas as Respostas
            </h1>
          </div>
          {selectedProject && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {selectedProject.name}
            </p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/')}
        >
          Voltar
        </Button>
      </div>

      {/* Main Content */}
      <div>
        {!selectedProject && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Nenhuma obra selecionada</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Selecione uma obra no cabeçalho para ver as respostas.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="animate-fade-in-up">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Formulários Ativos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {forms.filter(f => f.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total de Respostas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {recentSubmissions.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                  <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Última Resposta
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {recentSubmissions.length > 0 
                      ? format(new Date(recentSubmissions[0].submittedAt), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'
                    }
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulários com Respostas */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Formulários com Respostas
          </h2>
          
          {forms.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum formulário encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {forms.map((form) => (
                <Card 
                  key={form.id} 
                  className="hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer"
                  onClick={() => navigate(`/forms/${form.id}/submissions`)}
                >
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{form.title}</h3>
                        {form.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{form.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant={form.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {form.status === 'ACTIVE' ? 'Ativo' : form.status}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {form.fields?.length || 0} campos
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" icon={<Eye size={16} />} fullWidth className="sm:w-auto">
                        <span className="hidden sm:inline">Ver Respostas</span>
                        <span className="sm:hidden">Ver</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Respostas Recentes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Respostas Recentes
          </h2>
          
          {recentSubmissions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma resposta ainda</p>
              </CardContent>
            </Card>
          ) : (
            <Card padding="none">
              <CardContent>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentSubmissions.map((submission, index) => (
                    <div 
                      key={submission.id}
                      className="p-4 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => navigate(`/submissions/${submission.id}`)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex-shrink-0">
                              <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {submission.form?.title || 'Formulário'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {format(new Date(submission.submittedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </span>
                                {submission.submittedBy && (
                                  <span className="flex items-center gap-1 truncate">
                                    <User size={14} />
                                    <span className="truncate">{submission.submittedBy.name}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-0 sm:ml-11">
                            <Badge variant="secondary" size="sm">
                              {submission.responses.length} campos
                            </Badge>
                            {submission.processingResults.length > 0 && (
                              <Badge variant="success" size="sm">
                                {submission.processingResults.length} cálculos
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

