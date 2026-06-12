import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Project } from '../data/mockData';
import { getProjects } from '../api';

interface ProjectContextType {
  projects: Project[];
  updateProject: (updatedProject: Project) => void;
  updateProjectStatus: (projectId: number, status: string) => void;
  updateProjectDeadline: (projectId: number, endDate: string) => void;
  markProjectAsCompleted: (projectId: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const fetchedProjects = await getProjects();
      setProjects(
        fetchedProjects.map((p: any) => ({
          id: p.id,
          name: p.title ?? p.name ?? 'Sans titre',
          title: p.title,
          description: p.description ?? '',
          status: p.status ?? 'En cours',
          manager: p.owner_name ?? 'Inconnu',
          team: p.team ?? [],
          documents: p.documents ?? [],
          comments: p.comments ?? [],
          startDate: p.created_at?.slice(0, 10) ?? '',
          endDate: p.endDate ?? '',
        }))
      );
    } catch (error) {
      console.error('Impossible de charger les projets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const updateProjectStatus = (projectId: number, status: string) => {
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, status } : p))
    );
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev =>
      prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const updateProjectDeadline = (projectId: number, endDate: string) => {
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, endDate } : p))
    );
  };

  const markProjectAsCompleted = (projectId: number) => {
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, status: 'Terminé' } : p))
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        updateProject,
        updateProjectStatus,
        updateProjectDeadline,
        markProjectAsCompleted,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};