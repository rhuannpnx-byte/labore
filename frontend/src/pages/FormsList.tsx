import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, FileText, Clock, Layers, CheckSquare, AlertCircle, ChevronRight, MoreVertical, Copy, Share2 } from 'lucide-react';
import { formsApi } from '../services/api';
import { useProjectContext } from '../services/project-context';
import { authService } from '../services/auth';
import type { Form } from '../types';
import { format } from 'date-fns';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ShareFormModal } from '../components/ShareFormModal';

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFormToShare, setSelectedFormToShare] = useState<Form | null>(null);
  const { selectedProject } = useProjectContext();
  const user = authService.getUser();
  
  useEffect(() => {
    loadForms();
  }, [selectedProject]);
  
  const loadForms = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!selectedProject?.id) {
        setForms([]);
        setError('Selecione uma obra para visualizar os formulários');
        return;
      }
      
      const response = await formsApi.list(selectedProject.id);
      setForms(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar formulários');
      setForms([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente excluir o formulário "${title}"?`)) {
      return;
    }
    
    try {
      await formsApi.delete(id);
      setForms(forms.filter(f => f.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir formulário');
    }
  };
  
  const handleDuplicate = async (formId: string) => {
    try {
      setOpenMenuId(null);
      await formsApi.duplicate(formId);
      alert('Formulário duplicado com sucesso!');
      loadForms();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao duplicar formulário');
    }
  };
  
  const handleShare = (form: Form) => {
    setSelectedFormToShare(form);
    setShowShareModal(true);
    setOpenMenuId(null);
  };
  
  const canManageForms = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'secondary' | 'success' | 'warning'> = {
      DRAFT: 'secondary',
      ACTIVE: 'success',
      ARCHIVED: 'warning'
    };
    
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      ACTIVE: 'Ativo',
      ARCHIVED: 'Arquivado'
    };
    
    return (
      <Badge variant={variants[status]} dot>
        {labels[status]}
      </Badge>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando formulários...</p>
        </div>
      </div>
    );
  }
  
  const shouldShowAlert = !selectedProject;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Formulários
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {selectedProject 
              ? `Obra: ${selectedProject.name}` 
              : 'Selecione uma obra para visualizar'}
          </p>
        </div>
        
        <Link to="/forms/new" className="w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={18} />} 
            fullWidth 
            className="sm:w-auto"
            disabled={!selectedProject}
          >
            Novo Formulário
          </Button>
        </Link>
      </div>

      {/* Alerta */}
      {shouldShowAlert && (
        <Card className="text-center py-12 sm:py-16">
          <CardContent>
            <div className="inline-flex p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl mb-4 sm:mb-6">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-600 dark:text-yellow-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Selecione uma obra
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
              Para visualizar e gerenciar formulários, selecione uma obra no cabeçalho superior.
            </p>
          </CardContent>
        </Card>
      )}
      
      {error && !shouldShowAlert && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      
      {!shouldShowAlert && forms.length === 0 && !loading ? (
        <Card className="text-center py-12 sm:py-16">
          <CardContent>
            <div className="inline-flex p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4 sm:mb-6">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum formulário criado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
              Comece criando seu primeiro formulário personalizado
            </p>
            <Link to="/forms/new">
              <Button variant="primary" icon={<Plus size={18} />}>
                Criar Primeiro Formulário
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {forms.map((form, index) => (
            <Card key={form.id} hover>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Icon - Hidden on mobile */}
                  <div className="hidden sm:flex p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex-1">
                        {form.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(form.status)}
                        
                        {/* Menu de três pontos - apenas para ADMIN e SUPERADMIN */}
                        {canManageForms && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<MoreVertical size={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === form.id ? null : form.id);
                              }}
                            />
                            {openMenuId === form.id && (
                              <div
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleDuplicate(form.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Copy size={16} />
                                  Duplicar formulário
                                </button>
                                <button
                                  onClick={() => handleShare(form)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Share2 size={16} />
                                  Compartilhar formulário
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {form.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {form.description}
                      </p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium">{form.fields.length}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium">{form.rules.length}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">{form._count?.submissions || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{format(new Date(form.createdAt), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="grid grid-cols-3 sm:flex gap-2">
                      <Link to={`/forms/${form.id}`} className="col-span-1">
                        <Button variant="outline" size="sm" icon={<Eye size={14} />} fullWidth className="sm:w-auto">
                          <span className="hidden sm:inline">Ver</span>
                        </Button>
                      </Link>
                      
                      <Link to={`/forms/${form.id}/edit`} className="col-span-1">
                        <Button variant="secondary" size="sm" icon={<Edit size={14} />} fullWidth className="sm:w-auto">
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                      </Link>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDelete(form.id, form.title)}
                        fullWidth
                        className="col-span-1 sm:w-auto"
                      >
                        <span className="hidden sm:inline">Excluir</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Arrow Button - Fill Form */}
                  <Link to={`/forms/${form.id}/fill`} className="flex-shrink-0">
                    <button 
                      className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 hover:bg-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-600 text-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                      title="Preencher Formulário"
                    >
                      <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Share Form Modal */}
      {showShareModal && selectedFormToShare && (
        <ShareFormModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFormToShare(null);
          }}
          form={selectedFormToShare}
          onSuccess={loadForms}
        />
      )}
    </div>
  );
}
