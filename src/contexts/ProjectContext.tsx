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

const checkProjectStatus = (project: Project): string => {
  const today = new Date();
  const endDate = new Date(project.endDate);
  const isOverdue = today > endDate;
  const isCompleted = project.status === 'Terminé';

  if (isCompleted) {
    return 'Terminé';
  } else if (isOverdue) {
    return 'En retard';
  } else {
    return 'En cours';
  }
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = async () => {
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects.map(project => ({
        ...project,
        status: checkProjectStatus(project),
      })));
    } catch (error) {
      console.error('Impossible de charger les projets:', error);
    }
  };

  // Vérifier les statuts au montage et périodiquement
  useEffect(() => {
    loadProjects();

    const interval = setInterval(() => {
      setProjects(prevProjects =>
        prevProjects.map(project => ({
          ...project,
          status: checkProjectStatus(project),
        }))
      );
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const updateProjectStatus = (projectId: number, status: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, status } : project
      )
    );
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const updateProjectDeadline = (projectId: number, endDate: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, endDate, status: checkProjectStatus({ ...project, endDate }) }
          : project
      )
    );
  };

  const markProjectAsCompleted = (projectId: number) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, status: 'Terminé' } : project
      )
    );
  };

  return (
    <ProjectContext.Provider value={{ projects, updateProject, updateProjectStatus, updateProjectDeadline, markProjectAsCompleted }}>
      {children}
    </ProjectContext.Provider>
  );
};