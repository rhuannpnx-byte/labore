import { useState, useEffect } from 'react';
import { apiClient } from '../services/api-client';
import { authService } from '../services/auth';
import { FolderKanban, Plus, Edit2, Trash2, Users as UsersIcon, MapPin, Building2, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

interface Project {
  id: string;
  name: string;
  code?: string;
  client?: string;
  address?: string;
  description?: string;
  status: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
  _count?: {
    userProjects: number;
    submissions: number;
  };
}

interface Company {
  id: string;
  name: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    client: '',
    address: '',
    description: '',
    status: 'ACTIVE',
    companyId: ''
  });

  const user = authService.getUser();
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, companiesData] = await Promise.all([
        apiClient.getProjects(),
        isSuperAdmin ? apiClient.getCompanies() : Promise.resolve([])
      ]);
      setProjects(projectsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        const { companyId, ...updateData } = formData;
        await apiClient.updateProject(editingProject.id, updateData);
      } else {
        await apiClient.createProject(formData);
      }
      setShowModal(false);
      setEditingProject(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar projeto');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      code: project.code || '',
      client: project.client || '',
      address: project.address || '',
      description: project.description || '',
      status: project.status,
      companyId: project.companyId
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      await apiClient.deleteProject(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir projeto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      client: '',
      address: '',
      description: '',
      status: 'ACTIVE',
      companyId: user?.companyId || ''
    });
  };

  const openCreateModal = () => {
    setEditingProject(null);
    resetForm();
    setShowModal(true);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Ativa',
      PAUSED: 'Pausada',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada'
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'primary' | 'danger' => {
    const variants: Record<string, 'success' | 'warning' | 'primary' | 'danger'> = {
      ACTIVE: 'success',
      PAUSED: 'warning',
      COMPLETED: 'primary',
      CANCELLED: 'danger'
    };
    return variants[status] || 'secondary' as any;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-600 dark:border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando obras...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Obras & Projetos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Gerencie as obras e projetos cadastrados
          </p>
        </div>
        
        <Button
          onClick={openCreateModal}
          variant="primary"
          size="sm"
          icon={<Plus size={18} />}
          fullWidth
          className="sm:w-auto"
        >
          Nova Obra
        </Button>
      </div>

      {/* Main Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id}
              className="hover:border-gray-300 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <FolderKanban className="w-5 h-5 text-green-600 dark:text-green-400" />
                      {project.name}
                    </CardTitle>
                    {project.code && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        Código: {project.code}
                      </p>
                    )}
                    {project.client && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Cliente: {project.client}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <Badge variant={getStatusVariant(project.status)} dot>
                  {getStatusLabel(project.status)}
                </Badge>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 text-sm">
                  {project.company && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{project.company.name}</span>
                    </div>
                  )}
                  {project.address && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{project.address}</span>
                    </div>
                  )}
                  {project.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </CardContent>

              {project._count && (
                <CardFooter>
                  <div className="flex gap-6 text-sm w-full">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <UsersIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold">
                        {project._count.userProjects}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold">
                        {project._count.submissions} {project._count.submissions === 1 ? 'resposta' : 'respostas'}
                      </span>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <Card className="text-center py-12 sm:py-16">
            <CardContent>
              <div className="inline-flex p-4 sm:p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl mb-4 sm:mb-6">
                <FolderKanban className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nenhuma obra cadastrada</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
                Comece criando sua primeira obra
              </p>
              <Button onClick={openCreateModal} variant="primary" icon={<Plus size={18} />}>
                Criar Primeira Obra
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Editar Obra' : 'Nova Obra'}
        description="Preencha os dados da obra"
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setEditingProject(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="success" onClick={handleSubmit}>
              {editingProject ? 'Atualizar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSuperAdmin && !editingProject && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Empresa <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none hover:border-gray-400 dark:hover:border-gray-500"
                required
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Input
            label="Nome da Obra"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            icon={<FolderKanban size={20} />}
          />
          <Input
            label="Código"
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <Input
            label="Cliente"
            type="text"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            icon={<Building2 size={20} />}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none hover:border-gray-400 dark:hover:border-gray-500"
            >
              <option value="ACTIVE">Ativa</option>
              <option value="PAUSED">Pausada</option>
              <option value="COMPLETED">Concluída</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
          <Input
            label="Endereço"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            icon={<MapPin size={20} />}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none hover:border-gray-400 dark:hover:border-gray-500"
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
