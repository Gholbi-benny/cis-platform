import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProjectContext } from "../contexts/ProjectContext";

export default function Messages() {
  const { user } = useAuth();
  const { projects, updateProjectDeadline } = useProjectContext();
  const [entries] = useState<any[]>([]);
  const [deadlineEdits, setDeadlineEdits] = useState<Record<number, string>>({});

  const handleDeadlineChange = (projectId: number, endDate: string) => {
    setDeadlineEdits(prev => ({ ...prev, [projectId]: endDate }));
  };

  const handleDeadlineSave = (projectId: number) => {
    const endDate = deadlineEdits[projectId];
    if (endDate) updateProjectDeadline(projectId, endDate);
  };

  const relevantProjects = projects.filter(project =>
    (project.team ?? []).includes(user?.name || '') || project.manager === user?.name
  );

  const inputClass = "rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white";

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Messages clients</h1>
            <p className="text-slate-600 dark:text-blue-200 mt-2">Gestion des demandes commerciales et suivi des projets potentiel.</p>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Périodes d'échéance projet</h2>
          {relevantProjects.length === 0 ? (
            <p className="text-blue-100">Aucun projet lié à votre rôle actuellement.</p>
          ) : (
            <div className="space-y-4">
              {relevantProjects.map(project => (
                <div key={project.id} className="border border-slate-700 rounded-3xl bg-slate-900/80 p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div>
                      <div className="text-lg font-semibold text-white">{project.name}</div>
                      <div className="text-sm text-blue-200">Coordinateur: {project.manager}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {user?.role === 'Coordinateur de projet' && project.manager === user.name ? (
                        <>
                          <input
                            type="date"
                            value={deadlineEdits[project.id] ?? project.endDate ?? ''}
                            onChange={(e) => handleDeadlineChange(project.id, e.target.value)}
                            className={inputClass}
                          />
                          <button
                            onClick={() => handleDeadlineSave(project.id)}
                            className="rounded-2xl bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-semibold text-white transition"
                          >
                            Enregistrer
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-blue-200">Échéance: {project.endDate ?? 'Non définie'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="bg-white dark:bg-blue-600 border border-slate-200 dark:border-transparent p-6 rounded-3xl shadow-xl">
            <p className="text-slate-600 dark:text-blue-100">Aucun message client disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl">
                <p className="text-white">{entry.subject}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}