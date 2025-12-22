import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, FileCheck, Eye, Calendar, Layers, BarChart3 } from 'lucide-react';
import { formsApi, submissionsApi } from '../services/api';
import type { Form } from '../types';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function FormView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<Form | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id) {
      loadForm();
      loadStats();
    }
  }, [id]);
  
  const loadForm = async () => {
    try {
      const response = await formsApi.getById(id!);
      setForm(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar formulário');
    } finally {
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const response = await submissionsApi.getStats(id!);
      setStats(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { variant: 'secondary' as const, label: 'Rascunho' },
      ACTIVE: { variant: 'success' as const, label: 'Ativo' },
      ARCHIVED: { variant: 'warning' as const, label: 'Arquivado' }
    };
    
    const badge = badges[status as keyof typeof badges];
    return <Badge variant={badge.variant} dot>{badge.label}</Badge>;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!form) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        Formulário não encontrado
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/forms">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} className="mb-4">
            Voltar
          </Button>
        </Link>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{form.title}</h1>
                {getStatusBadge(form.status)}
              </div>
              {form.description && (
                <p className="text-gray-600 mb-3">{form.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>Criado em {format(new Date(form.createdAt), 'dd/MM/yyyy')}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link to={`/forms/${id}/edit`}>
                <Button variant="secondary" size="sm" icon={<Edit size={16} />}>
                  Editar
                </Button>
              </Link>
              
              {form.status === 'ACTIVE' && (
                <Link to={`/forms/${id}/fill`}>
                  <Button variant="primary" size="sm" icon={<FileCheck size={16} />}>
                    Preencher
                  </Button>
                </Link>
              )}
              
              <Link to={`/forms/${id}/submissions`}>
                <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                  <span className="hidden sm:inline">Ver </span>Respostas
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                    <p className="text-xs text-gray-600">Total de Respostas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Layers className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{form.fields.length}</p>
                    <p className="text-xs text-gray-600">Campos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{form.rules.length}</p>
                    <p className="text-xs text-gray-600">Regras</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Campos do Formulário</CardTitle>
            </CardHeader>
            <CardContent>
              {form.fields.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Nenhum campo cadastrado
                </p>
              ) : (
                <div className="space-y-3">
                  {form.fields.map((field, index) => (
                    <div key={field.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-gray-900 text-sm">{field.label}</span>
                            <Badge variant="secondary" size="sm">{field.type}</Badge>
                            {field.required && (
                              <Badge variant="danger" size="sm">Obrigatório</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono">{field.key}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Regras de Processamento</CardTitle>
            </CardHeader>
            <CardContent>
              {form.rules.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Nenhuma regra configurada
                </p>
              ) : (
                <div className="space-y-3">
                  {form.rules.map((rule) => (
                    <div key={rule.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-gray-900 text-sm mb-1">{rule.name}</div>
                      <p className="text-xs text-gray-500 font-mono break-all">{rule.formula}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
