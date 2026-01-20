import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api-client';
import { 
  ArrowLeft, 
  FileText, 
  Calculator, 
  Calendar, 
  User, 
  Building2,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2
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
    role: string;
  };
  project?: {
    id: string;
    name: string;
    code?: string;
  };
  form?: {
    id: string;
    title: string;
    description?: string;
  };
  responses: Array<{
    id: string;
    fieldId: string;
    value: string;
    createdAt: string;
    field: {
      id: string;
      label: string;
      fieldKey: string;
      type: string;
      required: boolean;
      order: number;
    };
  }>;
  processingResults: Array<{
    id: string;
    ruleId: string;
    result: string;
    calculatedAt: string;
    rule: {
      id: string;
      name: string;
      ruleKey: string;
      formula: string;
      order: number;
    };
  }>;
}

export default function SubmissionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id) {
      loadSubmission();
    }
  }, [id]);
  
  const loadSubmission = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSubmission(id!);
      setSubmission(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar resposta');
      console.error('Erro ao carregar resposta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) return;
    
    try {
      await apiClient.deleteSubmission(id!);
      navigate(`/forms/${submission?.formId}/submissions`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir resposta');
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TEXT: 'Texto',
      NUMBER: 'Número',
      DATE: 'Data',
      SELECT: 'Seleção',
      MULTI_SELECT: 'Seleção Múltipla',
      CHECKBOX: 'Checkbox',
      TEXTAREA: 'Texto Longo',
      EMAIL: 'Email',
      PHONE: 'Telefone'
    };
    return labels[type] || type;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPERADMIN: 'Super Admin',
      ADMIN: 'Administrador',
      ENGENHEIRO: 'Engenheiro',
      LABORATORISTA: 'Laboratorista'
    };
    return labels[role] || role;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Carregando resposta...</p>
        </div>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Voltar
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error || 'Resposta não encontrada'}</p>
              </div>
            </CardContent>
          </Card>
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
                onClick={() => navigate(`/forms/${submission.formId}/submissions`)}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-5 h-5 text-purple-600" />
                  <h1 className="text-lg font-bold text-gray-900">
                    Detalhes da Resposta
                  </h1>
                  <span className="font-mono text-sm text-gray-500">
                    #{submission.id.slice(0, 8)}
                  </span>
                </div>
                {submission.form && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{submission.form.title}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={18} />}
                onClick={handleDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="animate-fade-in-up">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Data/Hora</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(submission.submittedAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(submission.submittedAt), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {submission.submittedBy && (
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Usuário</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {submission.submittedBy.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleLabel(submission.submittedBy.role)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {submission.project && (
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Projeto</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {submission.project.name}
                    </p>
                    {submission.project.code && (
                      <p className="text-xs text-gray-500">
                        {submission.project.code}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Campos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submission.responses.length}
                  </p>
                  <p className="text-xs text-gray-500">preenchidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Respostas dos Campos */}
        <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Respostas</h2>
                <p className="text-sm text-gray-600">Campos preenchidos no formulário</p>
              </div>
            </div>
            
            {submission.responses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma resposta registrada</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {submission.responses
                  .sort((a, b) => a.field.order - b.field.order)
                  .map((response, index) => (
                  <div 
                    key={response.id} 
                    className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-l-4 border-purple-500 hover:shadow-md transition-all animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-lg text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{response.field.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                              {response.field.fieldKey}
                            </code>
                            <Badge variant="secondary" size="sm">
                              {getFieldTypeLabel(response.field.type)}
                            </Badge>
                            {response.field.required && (
                              <Badge variant="danger" size="sm">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pl-11">
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-lg font-semibold text-gray-900">
                          {(() => {
                            // Se for checkbox com múltiplas opções (array JSON)
                            if (response.field.type === 'CHECKBOX' && response.value && response.value.startsWith('[')) {
                              try {
                                const values = JSON.parse(response.value);
                                if (Array.isArray(values) && values.length > 0) {
                                  return (
                                    <div className="flex flex-wrap gap-2">
                                      {values.map((v: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                          {v}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                }
                              } catch (e) {
                                // Se falhar ao parsear, exibe o valor original
                              }
                            }
                            // Valor padrão
                            return response.value || <span className="text-gray-400 italic">(vazio)</span>;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Resultados dos Processamentos */}
        {submission.processingResults.length > 0 && (
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Resultados Calculados</h2>
                  <p className="text-sm text-gray-600">Fórmulas processadas automaticamente</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                {submission.processingResults
                  .sort((a, b) => a.rule.order - b.rule.order)
                  .map((result, index) => (
                  <div 
                    key={result.id} 
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-all animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-lg text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{result.rule.name}</p>
                          <code className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono mt-1">
                            {result.rule.ruleKey}
                          </code>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    
                    <div className="pl-11 space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Fórmula:</p>
                        <code className="block p-3 bg-gray-900 text-green-400 rounded-lg text-sm font-mono overflow-x-auto">
                          {result.rule.formula}
                        </code>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border-2 border-green-500">
                        <p className="text-xs text-gray-600 mb-1">Resultado:</p>
                        <p className="text-3xl font-bold text-green-600">
                          {result.result}
                        </p>
                      </div>
                      
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar size={12} />
                        Calculado em {format(new Date(result.calculatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

