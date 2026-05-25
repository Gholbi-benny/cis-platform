import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjects, getTasks } from "../api";

export default function ProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, allTasks] = await Promise.all([
          getProjects(),
          getTasks(),
        ]);
        const found = projects.find((p: any) => p.id === parseInt(id!));
        const projectTasks = allTasks.filter((t: any) => t.project_id === parseInt(id!));
        setProject(found);
        setTasks(projectTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-800 px-6 py-5 text-white">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        Chargement...
      </div>
    </div>
  );

  if (!project) return (
    <div className="text-center text-white py-20">Projet introuvable.</div>
  );

  const total = tasks.length;
  const termines = tasks.filter(t => t.status === 'Terminé').length;
  const enCours = tasks.filter(t => t.status === 'En cours').length;
  const enRetard = tasks.filter(t => t.status === 'En retard').length;
  const taux = total > 0 ? Math.round((termines / total) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">

      {/* Bouton retour */}
      <button
        onClick={() => navigate('/projects')}
        className="text-blue-300 hover:text-white text-sm flex items-center gap-2"
      >
        ← Retour aux projets
      </button>

      {/* En-tête projet */}
      <div className="bg-blue-600 p-6 rounded-3xl shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white">{project.title ?? project.name}</h1>
            <p className="text-blue-200 mt-2">{project.description}</p>
            <div className="mt-4 text-sm text-blue-200 space-y-1">
              <p><span className="text-white font-semibold">Chef de projet:</span> {project.owner_name ?? 'Non défini'}</p>
              <p><span className="text-white font-semibold">Créé le:</span> {project.created_at?.slice(0, 10)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            project.status === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30'
            : 'bg-sky-600/15 text-sky-300 border border-sky-500/30'
          }`}>
            {project.status ?? 'En cours'}
          </span>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total tâches', value: total, color: 'text-white' },
          { label: 'Terminées', value: termines, color: 'text-emerald-300' },
          { label: 'En cours', value: enCours, color: 'text-sky-300' },
          { label: 'En retard', value: enRetard, color: 'text-rose-300' },
        ].map((m) => (
          <div key={m.label} className="bg-slate-800 p-5 rounded-3xl text-center">
            <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-slate-400 text-sm mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Taux de réussite */}
      <div className="bg-slate-800 p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white font-semibold">Taux de réussite</span>
          <span className="text-blue-300 font-bold">{taux}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${taux}%` }}
          />
        </div>
      </div>

      {/* Liste des tâches */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Tâches du projet</h2>
        {tasks.length === 0 ? (
          <div className="bg-blue-600 p-6 rounded-3xl text-blue-200">Aucune tâche pour ce projet.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="bg-blue-600 p-4 rounded-3xl flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold">{task.title}</h3>
                  <p className="text-blue-200 text-sm">{task.description}</p>
                  <p className="text-blue-300 text-xs mt-1">Échéance: {task.due_date ?? 'Non définie'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  task.status === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30'
                  : task.status === 'En cours' ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30'
                  : task.status === 'En retard' ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-700 text-slate-300'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}