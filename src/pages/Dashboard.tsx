import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProjectContext } from "../contexts/ProjectContext";
import Card from "../components/Card";
import { getTasks, getProjects } from "../api";
import type { Task } from "../data/mockData";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects: contextProjects } = useProjectContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeTask = (task: any): Task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status:
      task.status === 'Terminé' ? 'Terminé'
      : task.status === 'En cours' ? 'En cours'
      : task.status === 'En retard' ? 'En retard'
      : 'À faire',
    assignee: task.assignee_name || task.assignee || 'Non assigné',
    projectId: task.project_id ?? task.projectId ?? 0,
    priority:
      task.priority === 'Élevée' ? 'Élevée'
      : task.priority === 'Moyenne' ? 'Moyenne'
      : 'Faible',
    dueDate: task.due_date || task.dueDate || '',
    comments: task.comments ?? [],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedTasks, fetchedProjects] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);
        setTasks(fetchedTasks.map(normalizeTask));
        setProjects(fetchedProjects);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getProjectName = (project: any) => project.title ?? project.name ?? 'Sans titre';
  const getProjectStatus = (project: any) => project.status ?? 'En cours';

  const completedTasks = tasks.filter(task => task.status === 'Terminé').length;
  const inProgressTasks = tasks.filter(task => task.status === 'En cours').length;
  const delayedTasks = tasks.filter(task => task.status === 'En retard').length;
  const activeProjects = projects.filter(p => getProjectStatus(p) === 'En cours').length;
  const openItems = tasks.filter(task => task.status !== 'Terminé').length;
  const technicalTasks = tasks.filter(task => task.assignee === user?.name);
  const projectByManager = projects.filter(p => (p.owner_name ?? p.manager) === user?.name);
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Terminé').length;
  const performance = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="text-5xl font-bold text-white text-center md:text-left">Tableau de bord</h1>
          <div className="text-sm text-blue-200">
            Bienvenue, {user?.name} ({user?.role})
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Projets actifs" value={activeProjects} />
          <Card title="Tâches terminées" value={completedTasks} />
          <Card title="Tâches en cours" value={inProgressTasks} />
          <Card title="Tâches en retard" value={delayedTasks} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
            <h3 className="text-lg font-semibold mb-4 text-white">État des projets</h3>
            <div className="space-y-2">
              {loading ? (
                <p className="text-blue-200">Chargement...</p>
              ) : projects.length === 0 ? (
                <p className="text-blue-200">Aucun projet disponible.</p>
              ) : (
                projects.map(project => (
                  <div key={project.id} className="flex justify-between items-center">
                    <span className="text-sm text-blue-200">{getProjectName(project)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      getProjectStatus(project) === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30' :
                      getProjectStatus(project) === 'En cours' ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30' :
                      'bg-rose-600/15 text-rose-300 border border-rose-500/30'
                    }`}>
                      {getProjectStatus(project)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-xl shadow-slate-950/50 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Performance globale</h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">{performance}%</div>
              <div className="text-sm text-slate-400 uppercase tracking-wide font-semibold mb-4">Taux de réussite</div>
              <div className="mt-4 flex gap-2 items-center">
                <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${performance}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-slate-300">{performance}%</span>
              </div>
            </div>
          </div>
        </div>

        {user?.role === 'Directeur' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-xl shadow-slate-950/50 border border-slate-700">
            <h3 className="text-lg font-semibold mb-2 text-white">Vue Directeur</h3>
            <p className="text-sm text-slate-400 mb-4">Accès complet à toutes les informations de la plateforme.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Projets en cours</div>
                <p className="text-3xl font-bold text-white">{activeProjects}</p>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Tâches ouvertes</div>
                <p className="text-3xl font-bold text-white">{openItems}</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'Chef de projet' && (
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-950/20">
            <h3 className="text-lg font-semibold mb-4 text-white">Vue Chef de projet</h3>
            <p className="text-blue-200 mb-4">Suivi de l'évolution des projets et de la performance de l'équipe technique.</p>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white">Projets supervisés</h4>
                {projectByManager.length === 0 ? (
                  <p className="text-blue-300">Aucun projet attribué pour le moment.</p>
                ) : (
                  <ul className="list-disc ml-5 text-blue-200">
                    {projectByManager.map(project => (
                      <li key={project.id}>{getProjectName(project)} - {getProjectStatus(project)}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-white">Statut de l'équipe technique</h4>
                <p className="text-blue-200">{inProgressTasks} tâches en cours, {delayedTasks} tâches en retard.</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'Équipe technique' && (
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
            <h3 className="text-lg font-semibold mb-4 text-white">Vue Équipe technique</h3>
            <p className="text-blue-200 mb-4">Rapport de vos tâches en cours et statut projet.</p>
            {technicalTasks.length === 0 ? (
              <p className="text-blue-300">Aucune tâche assignée pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {technicalTasks.map(task => (
                  <div key={task.id} className="p-4 bg-blue-950 rounded-3xl border border-blue-800">
                    <div className="font-semibold text-white">{task.title}</div>
                    <div className="text-sm text-blue-200">Projet: {task.projectId} • Statut: {task.status}</div>
                    <div className="text-sm text-blue-200">Échéance: {task.dueDate}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user?.role === 'Commercial' && (
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
            <h3 className="text-lg font-semibold mb-4 text-white">Vue Commercial</h3>
            <p className="text-blue-200 mb-4">Suivi des demandes clients et préparation des rendez-vous.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-950 p-4 rounded-3xl border border-blue-800">
                <h4 className="font-semibold text-white">Tâches ouvertes</h4>
                <p className="text-3xl font-bold text-white">{openItems}</p>
              </div>
              <div className="bg-blue-900 p-4 rounded-3xl border border-blue-700">
                <h4 className="font-semibold text-white">Projets actifs</h4>
                <p className="text-3xl font-bold text-white">{activeProjects}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Tâches récentes</h3>
          {tasks.length === 0 ? (
            <p className="text-blue-200">Aucune tâche disponible.</p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-blue-900 rounded-3xl border border-blue-700">
                  <div>
                    <div className="font-medium text-white">{task.title}</div>
                    <div className="text-sm text-blue-200">Assigné à: {task.assignee}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30' :
                      task.status === 'En cours' ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30' :
                      task.status === 'En retard' ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30' :
                      'bg-blue-800 text-blue-200'
                    }`}>
                      {task.status}
                    </span>
                    <div className="text-xs text-blue-300 mt-1">{task.dueDate}</div>
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