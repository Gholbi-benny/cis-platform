import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createProject, getProjects } from "../api";

type Project = {
  id: number;
  name: string;
  title?: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  manager: string;
  team: string[];
  documents: { id: number; name: string; size: string }[];
  comments: { id: number; author: string; date: string; content: string }[];
};

export default function Projects() {
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreateProject = hasPermission('manage_projects');

  const normalizeProject = (p: any): Project => ({
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
  });

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects.map(normalizeProject));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    setCreateError(null);
    if (!newProjectName.trim() || !newProjectDescription.trim()) {
      setCreateError('Le nom et la description sont requis.');
      return;
    }
    try {
      const createdProject = await createProject({
        title: newProjectName.trim(),
        description: newProjectDescription.trim(),
      });
      setProjects((current) => [normalizeProject(createdProject), ...current]);
      setShowForm(false);
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectEndDate("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Impossible de créer le projet.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Gestion des projets</h1>
            <p className="text-slate-600 dark:text-blue-200 mt-2">Vision synthétique des projets et détails métiers.</p>
          </div>
          {canCreateProject && (
            <button onClick={() => setShowForm(true)} className="rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">
              Nouveau projet
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-200 dark:bg-slate-800 px-6 py-5 text-slate-900 dark:text-white shadow-lg">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent"></span>
              Chargement des projets...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">{error}</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-blue-500/50 bg-blue-500/10 p-6 text-sm text-blue-700 dark:text-blue-100">Aucun projet trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-blue-600 dark:bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30'
                    : project.status === 'En cours' ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30'
                    : 'bg-rose-600/15 text-rose-300 border border-rose-500/30'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-blue-100 text-sm mb-4">{project.description}</p>
                <div className="space-y-2 text-sm text-blue-100">
                  <div><span className="font-semibold text-white">Coordinateur:</span> {project.manager}</div>
                  <div><span className="font-semibold text-white">Équipe:</span> {project.team.length > 0 ? project.team.join(', ') : 'Aucun membre'}</div>
                  <div><span className="font-semibold text-white">Début:</span> {project.startDate}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="rounded-2xl bg-white/20 hover:bg-white/30 px-3 py-1 text-sm font-medium text-white transition"
                  >
                    Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Nouveau projet</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nom du projet</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Description</label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-slate-900 dark:text-white h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Date d'échéance</label>
                  <input
                    type="date"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                {createError && <p className="text-sm text-red-500 dark:text-red-300">{createError}</p>}
              </div>
              <div className="mt-6 flex space-x-2">
                <button onClick={handleCreateProject} className="rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">Créer</button>
                <button onClick={() => { setShowForm(false); setCreateError(null); }} className="rounded-2xl bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 transition hover:bg-slate-300 dark:hover:bg-slate-600">Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}