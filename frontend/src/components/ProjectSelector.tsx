import { useState, useEffect } from 'react';
import { useProjectContext } from '../services/project-context';
import { apiClient } from '../services/api-client';
import { authService } from '../services/auth';
import { FolderKanban, Check, ChevronDown, X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  code?: string;
  client?: string;
  logo?: string;
  status: string;
  company?: {
    name: string;
  };
}

export default function ProjectSelector() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { selectedProject, setSelectedProject, clearSelectedProject } = useProjectContext();
  const user = authService.getUser();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await apiClient.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    setIsOpen(false);
  };

  const handleClearProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSelectedProject();
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
        <FolderKanban className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">Carregando obras...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <FolderKanban className="w-5 h-5 text-yellow-600" />
        <span className="text-sm text-yellow-700">Nenhuma obra disponível</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
          selectedProject
            ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
        }`}
      >
        <FolderKanban className={`w-4 h-4 ${selectedProject ? 'text-blue-600' : 'text-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium truncate block ${selectedProject ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedProject ? selectedProject.name : 'Selecione uma obra'}
          </span>
        </div>
        {selectedProject && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleClearProject}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClearProject(e as any);
              }
            }}
            className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0 cursor-pointer"
            title="Limpar seleção"
            aria-label="Limpar seleção da obra"
          >
            <X className="w-3.5 h-3.5 text-blue-600" />
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-[70] max-h-64 overflow-y-auto">
            <div className="py-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{project.name}</span>
                      {project.code && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded flex-shrink-0">
                          {project.code}
                        </span>
                      )}
                    </div>
                    {project.company && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{project.company.name}</p>
                    )}
                  </div>
                  {selectedProject?.id === project.id && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


