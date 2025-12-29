import { useState, useEffect } from 'react';
import { apiClient } from '../services/api-client';
import { authService } from '../services/auth';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, Mail, Phone, Building2, FolderKanban, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import ProjectPermissionsModal from '../components/ProjectPermissionsModal';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  isActive: boolean;
  companyId?: string;
  company?: {
    id: string;
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  code?: string;
  client?: string;
  status: string;
  company?: {
    name: string;
  };
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'LABORATORISTA',
    companyId: '',
    projectIds: [] as string[]
  });

  const currentUser = authService.getUser();
  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, projectsData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getProjects()
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      
      if (isSuperAdmin) {
        const companiesData = await apiClient.getCompanies();
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { password, email, ...updateData } = formData;
        await apiClient.updateUser(editingUser.id, updateData);
      } else {
        await apiClient.createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      companyId: user.companyId || '',
      projectIds: []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await apiClient.deleteUser(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'LABORATORISTA',
      companyId: currentUser?.companyId || '',
      projectIds: []
    });
  };

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
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

  const getRoleVariant = (role: string): 'danger' | 'primary' | 'secondary' | 'success' => {
    const variants: Record<string, 'danger' | 'primary' | 'secondary' | 'success'> = {
      SUPERADMIN: 'danger',
      ADMIN: 'primary',
      ENGENHEIRO: 'secondary',
      LABORATORISTA: 'success'
    };
    return variants[role] || 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando usuários...</p>
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
            Usuários
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Gerencie os usuários do sistema
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
          Novo Usuário
        </Button>
      </div>

      {/* Main Content */}
      <div>
        <Card className="overflow-hidden animate-fade-in-up" padding="none">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-b-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Phone size={12} />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getRoleVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {user.company ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Building2 size={16} className="text-gray-400 dark:text-gray-500" />
                            {user.company.name}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {(user.role === 'ENGENHEIRO' || user.role === 'LABORATORISTA') && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowProjectsModal(true);
                              }}
                              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Gerenciar Obras"
                            >
                              <FolderKanban className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

        {users.length === 0 && (
          <Card className="text-center py-12 sm:py-16">
            <CardContent>
              <div className="inline-flex p-4 sm:p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl mb-4 sm:mb-6">
                <UsersIcon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nenhum usuário cadastrado</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
                Comece criando o primeiro usuário
              </p>
              <Button onClick={openCreateModal} variant="primary" icon={<Plus size={18} />}>
                Criar Primeiro Usuário
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
          setEditingUser(null);
        }}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        description="Preencha os dados do usuário"
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setEditingUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingUser ? 'Atualizar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            icon={<Shield size={20} />}
          />
          
          {!editingUser && (
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              icon={<Mail size={20} />}
            />
          )}
          
          {!editingUser && (
            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              helperText="Mínimo 6 caracteres"
            />
          )}
          
          <Input
            label="Telefone"
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={<Phone size={20} />}
          />
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Função <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value;
                let newProjectIds = formData.projectIds;
                
                // Se mudou para Laboratorista e tem mais de 1 obra, mantém apenas a primeira
                if (newRole === 'LABORATORISTA' && formData.projectIds.length > 1) {
                  newProjectIds = [formData.projectIds[0]];
                }
                // Se mudou para um papel que não é Engenheiro nem Laboratorista, limpa as obras
                else if (newRole !== 'ENGENHEIRO' && newRole !== 'LABORATORISTA') {
                  newProjectIds = [];
                }
                
                setFormData({ ...formData, role: newRole, projectIds: newProjectIds });
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none hover:border-gray-400 dark:hover:border-gray-500"
              required
            >
              {isSuperAdmin && <option value="SUPERADMIN">Super Admin</option>}
              <option value="ADMIN">Administrador</option>
              <option value="ENGENHEIRO">Engenheiro</option>
              <option value="LABORATORISTA">Laboratorista</option>
            </select>
          </div>
          
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Empresa
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none hover:border-gray-400 dark:hover:border-gray-500"
              >
                <option value="">Sem empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {!editingUser && projects.length > 0 && (formData.role === 'ENGENHEIRO' || formData.role === 'LABORATORISTA') && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Obras (opcional)
              </label>
              
              {/* Contador */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Obras selecionadas:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formData.projectIds.length} {formData.role === 'LABORATORISTA' && <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">(máx: 1)</span>}
                  </span>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                {projects.map((project) => {
                  const isSelected = formData.projectIds.includes(project.id);
                  
                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        let newProjectIds: string[];
                        
                        if (formData.role === 'LABORATORISTA') {
                          // Laboratorista: apenas 1 obra
                          newProjectIds = isSelected ? [] : [project.id];
                        } else {
                          // Engenheiro: múltiplas obras
                          newProjectIds = isSelected
                            ? formData.projectIds.filter(id => id !== project.id)
                            : [...formData.projectIds, project.id];
                        }
                        
                        setFormData({ ...formData, projectIds: newProjectIds });
                      }}
                      className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{project.name}</p>
                            {project.code && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-mono">
                                {project.code}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              project.status === 'ACTIVE'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}>
                              {project.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                          {project.company && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{project.company.name}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal de Permissões de Obras */}
      {selectedUser && (
        <ProjectPermissionsModal
          isOpen={showProjectsModal}
          onClose={() => {
            setShowProjectsModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
