import { useState, useEffect } from 'react';
import { apiClient } from '../services/api-client';
import { authService } from '../services/auth';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Square, CheckSquare } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  code?: string;
  client?: string;
  status: string;
  companyId: string;
  company?: {
    name: string;
  };
}

interface Report {
  id: string;
  title: string;
  projectId?: string;
}

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onSuccess: () => void;
}

export default function ShareReportModal({ 
  isOpen, 
  onClose, 
  report,
  onSuccess 
}: ShareReportModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentUser = authService.getUser();

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await apiClient.getProjects();
      
      console.log('All projects:', projectsData);
      console.log('Current user:', currentUser);
      console.log('Report projectId:', report.projectId);
      
      // Buscar o projeto atual do relatório para obter o companyId
      const currentReportProject = projectsData.find((p: Project) => p.id === report.projectId);
      const reportCompanyId = currentReportProject?.companyId;
      
      console.log('Report company ID:', reportCompanyId);
      
      // Filtrar apenas projetos da mesma empresa, excluindo a obra atual
      const filteredProjects = projectsData.filter((p: Project) => {
        const sameCompany = p.companyId === reportCompanyId;
        const notCurrentProject = p.id !== report.projectId;
        
        console.log(`Project ${p.name}: companyId=${p.companyId}, sameCompany=${sameCompany}, notCurrent=${notCurrentProject}`);
        
        return sameCompany && notCurrentProject;
      });
      
      console.log('Filtered projects:', filteredProjects);
      
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjectId(selectedProjectId === projectId ? '' : projectId);
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      alert('Selecione uma obra de destino');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `${(import.meta as any).env?.VITE_API_URL || 'https://labore-api.onrender.com/api'}/reports/${report.id}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({ targetProjectId: selectedProjectId })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao compartilhar relatório');
      }

      alert('Relatório compartilhado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Erro ao compartilhar relatório');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartilhar Relatório"
      description={`Compartilhar "${report.title}" para outra obra`}
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || loading || !selectedProjectId}
            isLoading={saving}
          >
            Compartilhar
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Obra selecionada:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {selectedProjectId ? '1' : '0'}
              </span>
            </div>
          </div>

          {/* Projects List */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Obras Disponíveis
            </label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="mb-2">Não há outras obras disponíveis na empresa para compartilhar.</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Apenas obras da mesma empresa e diferentes da obra atual são exibidas.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {projects.map((project) => {
                    const isSelected = selectedProjectId === project.id;
                    
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleToggleProject(project.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
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
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {project.name}
                              </h3>
                              {project.code && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-mono">
                                  {project.code}
                                </span>
                              )}
                              {project.client && (
                                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                  {project.client}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                project.status === 'ACTIVE'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {project.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                              </span>
                            </div>
                            {project.company && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {project.company.name}
                              </p>
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

