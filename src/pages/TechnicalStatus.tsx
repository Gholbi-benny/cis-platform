import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProjectContext } from "../contexts/ProjectContext";
import { getTasks, getProjects, updateTask, updateProject } from "../api";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: number;
  assignee: string;
  assignedToId: number | null;
  comments: any[];
};

export default function TechnicalStatus() {
  const { user } = useAuth();
  const { updateProjectDeadline } = useProjectContext();
  const [technicalTasks, setTechnicalTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [deadlineEdits, setDeadlineEdits] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedTasks, fetchedProjects] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);

        const normalized = fetchedTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description ?? '',
          status: t.status ?? 'À faire',
          priority: t.priority ?? 'Faible',
          dueDate: t.due_date ?? '',
          projectId: t.project_id ?? 0,
          assignee: t.assignee_name ?? t.assignee ?? '',
          assignedToId: t.assigned_to ?? null,
          comments: [],
        }));

        setAllTasks(normalized);
        setTechnicalTasks(normalized.filter((t: Task) => t.assignedToId === user?.id));
        setLocalProjects(fetchedProjects);
      } catch (err) {
        console.error('Erreur chargement:', err);
      }
    };
    loadData();
  }, [user]);

  const handleMarkCompleted = async (projectId: number) => {
    const project = localProjects.find((p: any) => p.id === projectId);
    if (!project) return;
    try {
      await updateProject({
        id: projectId,
        title: project.title ?? project.name,
        description: project.description,
        status: 'Terminé',
      });
      setLocalProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'Terminé' } : p));
    } catch (err) {
      console.error('Erreur marquage terminé:', err);
    }
  };

  const handleDeadlineChange = (projectId: number, date: string) => {
    setDeadlineEdits(prev => ({ ...prev, [projectId]: date }));
  };

  const handleTaskStatusUpdate = async (id: number, status: string) => {
    const task = technicalTasks.find(t => t.id === id);
    if (!task) return;
    try {
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        status,
        due_date: task.dueDate || null,
      });
      setTechnicalTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  const handleDeadlineSave = (projectId: number) => {
    const newDeadline = deadlineEdits[projectId];
    if (newDeadline) updateProjectDeadline(projectId, newDeadline);
  };

  const myProjectIds = new Set(technicalTasks.map(t => t.projectId));
  const assignedProjects = localProjects.filter((p: any) =>
    myProjectIds.has(p.id) || p.owner_id === user?.id
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
      case 'En cours': return 'bg-sky-600/15 text-sky-700 dark:text-sky-300 border border-sky-500/30';
      default: return 'bg-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-500/30';
    }
  };

  const inputClass = "rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white";

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Statut technique</h1>
            <p className="text-slate-600 dark:text-blue-200 mt-2">Suivi des étapes et projets qui vous sont attribués.</p>
          </div>
        </div>

        {/* Projets */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Projets assignés</h2>
          {assignedProjects.length === 0 ? (
            <div className="bg-slate-100 dark:bg-blue-600 border border-slate-200 dark:border-transparent p-6 rounded-3xl shadow-xl">
              <p className="text-slate-600 dark:text-blue-100">Aucun projet assigné pour l'instant.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedProjects.map((project: any) => (
                <div key={project.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{project.title ?? project.name}</h3>
                      <p className="text-blue-100 mt-2">{project.description}</p>
                      <div className="mt-3 text-sm text-blue-100">
                        Coordinateur: {project.owner_name ?? 'Non défini'} • Statut: {project.status ?? 'En cours'}
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status ?? 'En cours')}`}>
                      {project.status ?? 'En cours'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {user?.role === 'Coordinateur de projet' && project.owner_id === user.id && (
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <input
                          type="date"
                          value={deadlineEdits[project.id] ?? project.endDate ?? ''}
                          onChange={(e) => handleDeadlineChange(project.id, e.target.value)}
                          className={inputClass}
                        />
                        <button onClick={() => handleDeadlineSave(project.id)} className="rounded-2xl bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-semibold text-white transition">
                          Sauvegarder
                        </button>
                      </div>
                    )}
                    {project.status !== 'Terminé' && (
                      <button onClick={() => handleMarkCompleted(project.id)} className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition">
                        Marquer comme terminé
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Étapes */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Étapes assignées</h2>
          {technicalTasks.length === 0 ? (
            <div className="bg-slate-100 dark:bg-blue-600 border border-slate-200 dark:border-transparent p-6 rounded-3xl shadow-xl">
              <p className="text-slate-600 dark:text-blue-100">Aucune étape assignée pour l'instant.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {technicalTasks.map(task => (
                <div key={task.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{task.title}</h2>
                      <p className="text-blue-100 mt-2">{task.description}</p>
                      <div className="mt-3 text-sm text-blue-100">
                        Priorité: {task.priority} • Échéance: {task.dueDate}
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => handleTaskStatusUpdate(task.id, 'En cours')} className="rounded-2xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition">En cours</button>
                    <button onClick={() => handleTaskStatusUpdate(task.id, 'Terminé')} className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition">Terminé</button>
                    <button onClick={() => handleTaskStatusUpdate(task.id, 'En retard')} className="rounded-2xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition">En retard</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}