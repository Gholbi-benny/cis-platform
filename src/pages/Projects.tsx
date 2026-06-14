import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createProject, getProjects, updateProject, getUsers } from "../api";
import type { User } from "../data/mockData";

type Project = {
  id: number;
  name: string;
  title?: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  manager: string;
  owner_id?: number;
  team: string[];
  documents: { id: number; name: string; size: string }[];
  comments: { id: number; author: string; date: string; content: string }[];
};

export default function Projects() {
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreateProject = hasPermission('manage_projects') || hasPermission('create_projects');
  const canValidate = hasPermission('validate_projects');
  const isCommercial = user?.role === 'Directeur commercial';
  const isTechnique = user?.role === 'Directeur technique';
  const isCoordinateur = user?.role === 'Coordinateur de projet';

  const normalizeProject = (p: any): Project => ({
    id: p.id,
    name: p.title ?? p.name ?? 'Sans titre',
    title: p.title,
    description: p.description ?? '',
    status: p.status ?? 'En cours',
    manager: p.owner_name ?? 'Inconnu',
    owner_id: p.owner_id,
    team: p.team ?? [],
    documents: p.documents ?? [],
    comments: p.comments ?? [],
    startDate: p.created_at?.slice(0, 10) ?? '',
    endDate: p.endDate ?? '',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProjects, fetchedUsers] = await Promise.all([
        getProjects(),
        getUsers(),
      ]);
      setProjects(fetchedProjects.map(normalizeProject));
      setUsersList(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async () => {
    setCreateError(null);
    if (!newProjectName.trim() || !newProjectDescription.trim()) {
      setCreateError('Le nom et la description sont requis.');
      return;
    }
    try {
      const status = isCommercial ? 'En attente de validation' : 'En cours';
      const createdProject = await createProject({
        title: newProjectName.trim(),
        description: newProjectDescription.trim(),
        status,
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

  const handleUpdateProject = async () => {
    if (!editProject) return;
    try {
      const updated = await updateProject({
        id: editProject.id,
        title: editProject.name,
        description: editProject.description,
        status: editProject.status,
        owner_id: editProject.owner_id,
      });
      setProjects(prev => prev.map(p => p.id === editProject.id ? normalizeProject(updated) : p));
      setEditProject(null);
    } catch (err) {
      console.error('Erreur modification projet:', err);
    }
  };

  const handleValidateAndAssign = async (project: Project, coordinatorId: number) => {
    try {
      const updated = await updateProject({
        id: project.id,
        title: project.name,
        description: project.description,
        status: 'En cours',
        owner_id: coordinatorId,
      });
      setProjects(prev => prev.map(p => p.id === project.id ? normalizeProject(updated) : p));
    } catch (err) {
      console.error('Erreur validation projet:', err);
    }
  };

  // Filtrer les projets selon le rôle
  const getFilteredProjects = () => {
    if (isCommercial) {
      return projects.filter(p => p.owner_id === user?.id);
    }
    return projects;
  };

  const filteredProjects = getFilteredProjects();
  const pendingProjects = projects.filter(p => p.status === 'En attente de validation');
  const coordinateurs = usersList.filter(u => u.role === 'Coordinateur de projet');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30';
      case 'En cours': return 'bg-sky-600/15 text-sky-300 border border-sky-500/30';
      case 'En attente de validation': return 'bg-yellow-600/15 text-yellow-300 border border-yellow-500/30';
      default: return 'bg-rose-600/15 text-rose-300 border border-rose-500/30';
    }
  };

  const inputClass = "w-full rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-slate-900 dark:text-white";

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

        {/* Projets en attente de validation — visible par Directeur technique */}
        {isTechnique && pendingProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-left text-yellow-600 dark:text-yellow-300">Projets en attente de validation</h2>
            <div className="space-y-4">
              {pendingProjects.map(project => (
                <div key={project.id} className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-3xl shadow-xl">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{project.name}</h3>
                      <p className="text-slate-600 dark:text-slate-300 mt-2">{project.description}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Soumis par: {project.manager} • Le: {project.startDate}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleValidateAndAssign(project, parseInt(e.target.value));
                        }}
                        className={inputClass}
                        defaultValue=""
                      >
                        <option value="">Affecter au coordinateur</option>
                        {coordinateurs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des projets */}
        {loading ? (
          <div className="py-20">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-200 dark:bg-slate-800 px-6 py-5 text-slate-900 dark:text-white shadow-lg">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent"></span>
              Chargement des projets...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-blue-500/50 bg-blue-500/10 p-6 text-sm text-blue-700 dark:text-blue-100">Aucun projet trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
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
                  {(hasPermission('manage_projects') && !isCommercial) && (
                    <button
                      onClick={() => setEditProject({ ...project })}
                      className="rounded-2xl bg-white/20 hover:bg-white/30 px-3 py-1 text-sm font-medium text-white transition"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal créer */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Nouveau projet</h2>
              {isCommercial && (
                <p className="text-sm text-yellow-600 dark:text-yellow-300 mb-4">Ce projet sera soumis au Directeur technique pour validation.</p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nom du projet</label>
                  <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Description</label>
                  <textarea value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} className={`${inputClass} h-24`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Date d'échéance</label>
                  <input type="date" value={newProjectEndDate} onChange={(e) => setNewProjectEndDate(e.target.value)} className={inputClass} />
                </div>
                {createError && <p className="text-sm text-red-500 dark:text-red-300">{createError}</p>}
              </div>
              <div className="mt-6 flex space-x-2">
                <button onClick={handleCreateProject} className="rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">
                  {isCommercial ? 'Soumettre' : 'Créer'}
                </button>
                <button onClick={() => { setShowForm(false); setCreateError(null); }} className="rounded-2xl bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 transition hover:bg-slate-300 dark:hover:bg-slate-600">Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal modifier */}
        {editProject && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Modifier le projet</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nom du projet</label>
                  <input type="text" value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Description</label>
                  <textarea value={editProject.description} onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} className={`${inputClass} h-24`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Statut</label>
                  <select value={editProject.status} onChange={(e) => setEditProject({ ...editProject, status: e.target.value })} className={inputClass}>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="En retard">En retard</option>
                    <option value="En attente de validation">En attente de validation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Coordinateur du projet</label>
                  <select
                    value={editProject.owner_id ?? ''}
                    onChange={(e) => setEditProject({ ...editProject, owner_id: parseInt(e.target.value), manager: usersList.find(u => u.id === parseInt(e.target.value))?.name ?? editProject.manager })}
                    className={inputClass}
                  >
                    <option value="">Sélectionner un coordinateur</option>
                    {usersList.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex space-x-2">
                <button onClick={handleUpdateProject} className="rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition">Enregistrer</button>
                <button onClick={() => setEditProject(null)} className="rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-800 dark:text-white transition">Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}