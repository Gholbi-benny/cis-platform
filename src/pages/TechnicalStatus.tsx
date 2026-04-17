import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProjectContext } from "../contexts/ProjectContext";
import { tasks } from "../data/mockData";
import type { Task } from "../data/mockData";

export default function TechnicalStatus() {
  const { user } = useAuth();
  const { projects, markProjectAsCompleted, updateProjectDeadline } = useProjectContext();
  const [technicalTasks, setTechnicalTasks] = useState<Task[]>(
    tasks.filter(task => task.assignee === user?.name)
  );
  const [deadlineEdits, setDeadlineEdits] = useState<Record<number, string>>({});

  const handleDeadlineChange = (projectId: number, date: string) => {
    setDeadlineEdits(prev => ({ ...prev, [projectId]: date }));
  };

  const handleTaskStatusUpdate = (id: number, status: Task['status']) => {
    setTechnicalTasks(prev => prev.map(task => task.id === id ? { ...task, status } : task));
  };

  const handleMarkProjectCompleted = (projectId: number) => {
    markProjectAsCompleted(projectId);
  };

  const handleDeadlineSave = (projectId: number) => {
    const newDeadline = deadlineEdits[projectId];
    if (newDeadline) {
      updateProjectDeadline(projectId, newDeadline);
    }
  };

  // Get projects assigned to the technical user
  const assignedProjects = projects.filter(project =>
    project.team.includes(user?.name || '')
  );

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-white">Statut technique</h1>
            <p className="text-blue-200 mt-2">Suivi des tâches et projets qui vous sont attribués.</p>
          </div>
        </div>

        {/* Section Projets */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Projets assignés</h2>
        {assignedProjects.length === 0 ? (
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
            <p className="text-blue-200">Aucun projet assigné pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedProjects.map(project => (
              <div key={project.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                    <p className="text-blue-200 mt-2">{project.description}</p>
                    <div className="mt-3 text-sm text-blue-200">
                      Chef de projet: {project.manager} • Échéance: {project.endDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      project.status === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30' :
                      project.status === 'En cours' ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30' :
                      project.status === 'En retard' ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30' :
                      'bg-blue-800 text-blue-200'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {user?.role === 'Chef de projet' && project.manager === user.name ? (
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                        <label className="text-sm font-medium">Période d'échéance :</label>
                        <input
                          type="date"
                          value={deadlineEdits[project.id] ?? project.endDate}
                          onChange={(e) => handleDeadlineChange(project.id, e.target.value)}
                          className="rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <button
                        onClick={() => handleDeadlineSave(project.id)}
                        className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                      >
                        Sauvegarder l'échéance
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-blue-200 bg-blue-800 px-3 py-1 rounded-full">
                      Échéance: {project.endDate}
                    </span>
                  )}
                  {project.status !== 'Terminé' && (
                    <button
                      onClick={() => handleMarkProjectCompleted(project.id)}
                      className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                    >
                      Marquer comme terminé
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Tâches */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Tâches assignées</h2>
        {technicalTasks.length === 0 ? (
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
            <p className="text-blue-200">Aucune tâche assignée pour l'instant. Vérifiez vos projets ou contactez votre chef de projet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {technicalTasks.map(task => (
              <div key={task.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{task.title}</h2>
                    <p className="text-blue-200 mt-2">{task.description}</p>
                    <div className="mt-3 text-sm text-blue-200">
                      Projet: {task.projectId} • Priorité: {task.priority} • Échéance: {task.dueDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      task.status === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30' :
                      task.status === 'En cours' ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30' :
                      task.status === 'En retard' ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30' :
                      'bg-blue-800 text-blue-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTaskStatusUpdate(task.id, 'En cours')}
                    className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => handleTaskStatusUpdate(task.id, 'Terminé')}
                    className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                  >
                    Terminé
                  </button>
                  <button
                    onClick={() => handleTaskStatusUpdate(task.id, 'En retard')}
                    className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                  >
                    En retard
                  </button>
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
