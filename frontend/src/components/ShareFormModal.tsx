import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { apiClient } from '../services/api-client';
import { formsApi } from '../services/api';
import { Form, Project } from '../types';
import { CheckSquare, Square } from 'lucide-react';
import { authService } from '../services/auth';

interface ShareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Form;
  onSuccess: () => void;
}

export const ShareFormModal: React.FC<ShareFormModalProps> = ({
  isOpen,
  onClose,
  form,
  onSuccess,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentUser = authService.getUser();

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, form.projectId, currentUser?.companyId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await apiClient.getProjects();
      
      const currentFormProject = projectsData.find((p: Project) => p.id === form.projectId);
      const formCompanyId = currentFormProject?.companyId;

      const filteredProjects = projectsData.filter((p: Project) => {
        const sameCompany = p.companyId === formCompanyId;
        const notCurrentProject = p.id !== form.projectId;
        return sameCompany && notCurrentProject;
      });
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error loading projects for sharing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedProjectId) {
      alert('Selecione uma obra para compartilhar o formulário.');
      return;
    }
    try {
      setSaving(true);
      await formsApi.share(form.id, selectedProjectId);
      alert('Formulário compartilhado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao compartilhar formulário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartilhar Formulário"
      description={`Compartilhar "${form.title}" para outra obra`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleShare}
            disabled={saving || !selectedProjectId || loading}
            isLoading={saving}
          >
            Compartilhar
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
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Obra selecionada:</span>
              <span className="text-lg font-bold text-gray-900">
                {selectedProjectId ? projects.find(p => p.id === selectedProjectId)?.name : 'Nenhuma'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Obras Disponíveis na mesma empresa
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma outra obra disponível na mesma empresa.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {projects.map((project) => {
                    const isSelected = selectedProjectId === project.id;
                    return (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
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
                            {project.client && (
                              <p className="text-sm text-gray-600 mt-1">Cliente: {project.client}</p>
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
};

