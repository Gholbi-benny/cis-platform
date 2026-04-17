import { useState } from "react";
import { useProjectContext } from "../contexts/ProjectContext";
import type { Project } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";

export default function Projects() {
  const { hasPermission } = useAuth();
  const { projects, updateProject } = useProjectContext();
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const canCreateProject = hasPermission('write');
  const canManageProjects = hasPermission('manage_projects');

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
      updateProject(editedProject);
      setSelectedProject(editedProject);
      setEditedProject(editedProject);
      setIsEditing(false);
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

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{project.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                project.status === 'Terminé' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30' :
                project.status === 'En cours' ? 'bg-sky-600/15 text-sky-300 border border-sky-500/30' :
                'bg-rose-600/15 text-rose-300 border border-rose-500/30'
              }`}>
                {project.status}
              </span>
            </div>

              <p className="text-blue-200 text-sm mb-4">{project.description}</p>

            <div className="space-y-2 text-sm text-blue-200">
              <div><span className="font-semibold text-white">Chef de projet:</span> {project.manager}</div>
              <div><span className="font-semibold text-white">Équipe:</span> {project.team.join(', ')}</div>
              <div><span className="font-semibold text-white">Échéance:</span> {project.endDate}</div>
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

      {/* Modal de détails du projet */}
      {selectedProject && (
        <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-blue-600 border border-blue-500 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl shadow-blue-950/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
              <button
                onClick={closeModal}
                className="text-blue-200 hover:text-white"
              >
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

              {/* Documents */}
              <div>
                <h3 className="font-semibold mb-2">Documents ({selectedProject.documents.length})</h3>
                {selectedProject.documents.length === 0 ? (
                  <p className="text-slate-500">Aucun document</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.documents.map(doc => (
                      <div key={doc.id} className="flex justify-between items-center p-2 rounded-3xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-300">{doc.name}</span>
                        <span className="text-sm text-slate-500">{doc.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Commentaires */}
              <div>
                <h3 className="font-semibold mb-2">Commentaires ({selectedProject.comments.length})</h3>
                {selectedProject.comments.length === 0 ? (
                  <p className="text-slate-500">Aucun commentaire</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.comments.map(comment => (
                      <div key={comment.id} className="p-3 rounded-3xl bg-slate-950 border border-slate-800">
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

      {/* Formulaire de création (simulé) */}
      {showForm && (
        <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-blue-600 border border-blue-500 rounded-3xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Nouveau projet</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom du projet"
                className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white"
              />
              <textarea
                placeholder="Description"
                className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white h-24"
              />
              <input
                type="date"
                placeholder="Date d'échéance"
                className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white"
              />
            </div>
            <div className="mt-6 flex space-x-2">
              <button className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
                Créer
              </button>
              <button
                onClick={() => setShowForm(false)}
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