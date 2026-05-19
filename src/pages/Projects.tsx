import { useEffect, useState } from "react";
import type { Project } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { createProject, getProjects } from "../api";

export default function Projects() {
  const { hasPermission, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreateProject = hasPermission('manage_projects');
  const canManageProjects = hasPermission('manage_projects');

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openProject = (project: Project, edit = false) => {
    setSelectedProject(project);
    setEditedProject({ ...project });
    setIsEditing(edit);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setEditedProject(null);
    setIsEditing(false);
  };

  const handleEditChange = (field: keyof Project, value: string) => {
    if (!editedProject) return;
    setEditedProject({ ...editedProject, [field]: value } as Project);
  };

  const saveProject = () => {
    if (editedProject) {
      setProjects((current) =>
        current.map((project) => (project.id === editedProject.id ? editedProject : project))
      );
      setSelectedProject(editedProject);
      setEditedProject(editedProject);
      setIsEditing(false);
    }
  };

  const handleCreateProject = async () => {
    setCreateError(null);

    if (!newProjectName.trim() || !newProjectDescription.trim() || !newProjectEndDate) {
      setCreateError('Tous les champs sont requis.');
      return;
    }

    const payload: Omit<Project, 'id'> = {
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      status: 'En cours',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: newProjectEndDate,
      manager: user?.name ?? 'Inconnu',
      team: [],
      documents: [],
      comments: [],
    };

    try {
      const createdProject = await createProject(payload);
      setProjects((current) => [createdProject, ...current]);
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
            <h1 className="text-5xl font-bold text-white">Gestion des projets</h1>
            <p className="text-blue-200 mt-2">Vision synthétique des projets et détails métiers.</p>
          </div>
          {canCreateProject && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Nouveau projet
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-800 px-6 py-5 text-white shadow-lg">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Chargement des projets...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'Terminé'
                        ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30'
                        : project.status === 'En cours'
                        ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30'
                        : 'bg-rose-600/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-blue-200 text-sm mb-4">{project.description}</p>

                <div className="space-y-2 text-sm text-blue-200">
                  <div>
                    <span className="font-semibold text-white">Chef de projet:</span> {project.manager}
                  </div>
                  <div>
                    <span className="font-semibold text-white">Équipe:</span> {project.team.join(', ')}
                  </div>
                  <div>
                    <span className="font-semibold text-white">Échéance:</span> {project.endDate}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => openProject(project, false)}
                    className="rounded-2xl bg-gray-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-gray-700"
                  >
                    Détails
                  </button>
                  {canManageProjects && (
                    <button
                      onClick={() => openProject(project, true)}
                      className="rounded-2xl bg-gray-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProject && (
          <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-blue-600 border border-blue-500 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl shadow-blue-950/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                <button onClick={closeModal} className="text-blue-200 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editedProject?.description ?? ''}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      className="w-full border rounded p-2 text-sm"
                      rows={4}
                    />
                  ) : (
                    <p className="text-slate-400">{selectedProject.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Dates</h3>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedProject?.endDate ?? ''}
                        onChange={(e) => handleEditChange('endDate', e.target.value)}
                        className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-sm text-white"
                      />
                    ) : (
                      <>
                        <p>Début: {selectedProject.startDate}</p>
                        <p>Fin: {selectedProject.endDate}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Équipe</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProject?.manager ?? ''}
                        onChange={(e) => handleEditChange('manager', e.target.value)}
                        className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-sm text-white"
                      />
                    ) : (
                      <>
                        <p>Chef: {selectedProject.manager}</p>
                        <p>Membres: {selectedProject.team.join(', ')}</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Documents ({selectedProject.documents.length})</h3>
                  {selectedProject.documents.length === 0 ? (
                    <p className="text-slate-500">Aucun document</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex justify-between items-center p-2 rounded-3xl bg-slate-950 border border-slate-800"
                        >
                          <span className="text-slate-300">{doc.name}</span>
                          <span className="text-sm text-slate-500">{doc.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Commentaires ({selectedProject.comments.length})</h3>
                  {selectedProject.comments.length === 0 ? (
                    <p className="text-slate-500">Aucun commentaire</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 rounded-3xl bg-slate-950 border border-slate-800"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-100">{comment.author}</span>
                            <span className="text-slate-500">{comment.date}</span>
                          </div>
                          <p className="mt-1 text-slate-300">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={closeModal}
                      className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        saveProject();
                        closeModal();
                      }}
                      className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-blue-600 border border-blue-500 rounded-3xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Nouveau projet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Nom du projet</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Date d'échéance</label>
                <input
                  type="date"
                  value={newProjectEndDate}
                  onChange={(e) => setNewProjectEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white"
                />
              </div>
              {createError && (
                <p className="text-sm text-red-300">{createError}</p>
              )}
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                onClick={handleCreateProject}
                className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Créer
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setCreateError(null);
                }}
                className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
