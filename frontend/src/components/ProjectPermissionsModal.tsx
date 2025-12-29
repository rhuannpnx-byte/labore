import { useState, useEffect } from 'react';
import { apiClient } from '../services/api-client';
import { CheckSquare, Square } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  userProjects?: any[];
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

interface ProjectPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

export default function ProjectPermissionsModal({ 
  isOpen, 
  onClose, 
  user,
  onSuccess 
}: ProjectPermissionsModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, user.id]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await apiClient.getProjects();
      setProjects(projectsData);

      // Carregar projetos já vinculados
      if (user.userProjects) {
        const projectIds = user.userProjects.map((up: any) => up.project.id);
        setSelectedProjects(new Set(projectIds));
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects);

    // Se é LABORATORISTA, só pode ter 1 obra
    if (user.role === 'LABORATORISTA') {
      if (newSelected.has(projectId)) {
        newSelected.delete(projectId);
      } else {
        newSelected.clear();
        newSelected.add(projectId);
      }
    } else {
      // ENGENHEIRO pode ter múltiplas
      if (newSelected.has(projectId)) {
        newSelected.delete(projectId);
      } else {
        newSelected.add(projectId);
      }
    }

    setSelectedProjects(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.updateUser(user.id, {
        projectIds: Array.from(selectedProjects)
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const isLaboratorista = user.role === 'LABORATORISTA';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Obras"
      description={`${user.name} (${user.email})`}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || loading}
            isLoading={saving}
          >
            Salvar
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Obras selecionadas:</span>
              <span className="text-lg font-bold text-gray-900">
                {selectedProjects.size} {isLaboratorista && <span className="text-sm text-gray-500 font-normal">(máx: 1)</span>}
              </span>
            </div>
          </div>

          {/* Projects List */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Obras Disponíveis
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma obra disponível
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {projects.map((project) => {
                    const isSelected = selectedProjects.has(project.id);
                    
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleToggleProject(project.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-gray-900">{project.name}</h3>
                              {project.code && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
                                  {project.code}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                project.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {project.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                              </span>
                            </div>
                            {project.company && (
                              <p className="text-sm text-gray-600 mt-1">{project.company.name}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

