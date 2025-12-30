import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  code?: string;
  client?: string;
  logo?: string;
  status: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

interface ProjectContextState {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  clearSelectedProject: () => void;
  hasSelectedProject: () => boolean;
}

export const useProjectContext = create<ProjectContextState>()(
  persist(
    (set, get) => ({
      selectedProject: null,
      
      setSelectedProject: (project) => set({ selectedProject: project }),
      
      clearSelectedProject: () => set({ selectedProject: null }),
      
      hasSelectedProject: () => get().selectedProject !== null,
    }),
    {
      name: 'labore-selected-project', // nome da chave no localStorage
    }
  )
);





