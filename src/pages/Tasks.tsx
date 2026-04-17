import { useState } from "react";
import { tasks, users, projects } from "../data/mockData";
import type { Task } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";

export default function Tasks() {
  const { hasPermission, user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'my' | 'pending' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canCreateTask = hasPermission('write');
  const canAssignTasks = hasPermission('assign_tasks');

  // Filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'my':
        return task.assignee === user?.name;
      case 'pending':
        return task.status !== 'Terminé';
      case 'completed':
        return task.status === 'Terminé';
      default:
        return true;
    }
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Terminé':
        return 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30';
      case 'En cours':
        return 'bg-sky-600/15 text-sky-300 border border-sky-500/30';
      case 'En retard':
        return 'bg-rose-600/15 text-rose-300 border border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Élevée':
        return 'text-red-600';
      case 'Moyenne':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-white">Gestion des tâches</h1>
            <p className="text-blue-200 mt-2">Suivi et priorisation des tâches opérationnelles.</p>
          </div>
        {canCreateTask && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Nouvelle tâche
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-2xl text-sm font-medium ${filter === 'all' ? 'bg-gray-600 text-white' : 'bg-blue-900 text-blue-200'}`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('my')}
          className={`px-4 py-2 rounded-2xl text-sm font-medium ${filter === 'my' ? 'bg-gray-600 text-white' : 'bg-blue-900 text-blue-200'}`}
        >
          Mes tâches
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-2xl text-sm font-medium ${filter === 'pending' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          En attente
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-2xl text-sm font-medium ${filter === 'completed' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          Terminées
        </button>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-white">{task.title}</h3>
                <p className="text-blue-200 text-sm mb-3">{task.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <strong className="text-white">Assigné à:</strong> {task.assignee}
                  </div>
                  <div>
                    <strong className="text-white">Priorité:</strong> <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                  </div>
                  <div>
                    <strong className="text-white">Échéance:</strong> {task.dueDate}
                  </div>
                  <div>
                    <strong className="text-white">Projet:</strong> {task.projectId}
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTask(task)}
                className="rounded-2xl bg-gray-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                Détails
              </button>
              {canAssignTasks && (
                <button className="rounded-2xl bg-gray-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-gray-700">
                  Modifier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détails de tâche */}
      {selectedTask && (
        <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-blue-600 border border-blue-500 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl shadow-blue-950/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-100">Description</h3>
                <p className="text-slate-400">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Détails</h3>
                  <p>Assigné à: {selectedTask.assignee}</p>
                  <p>Priorité: <span className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</span></p>
                  <p>Échéance: {selectedTask.dueDate}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Statut</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              {/* Commentaires */}
              <div>
                <h3 className="font-semibold mb-2">Commentaires ({selectedTask.comments.length})</h3>
                {selectedTask.comments.length === 0 ? (
                  <p className="text-slate-500">Aucun commentaire</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTask.comments.map(comment => (
                      <div key={comment.id} className="p-3 bg-slate-900 rounded-3xl border border-slate-800">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-100">{comment.author}</span>
                          <span className="text-slate-500">{comment.date}</span>
                        </div>
                        <p className="mt-1 text-slate-300">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajouter un commentaire */}
                <div className="mt-4">
                  <textarea
                    placeholder="Ajouter un commentaire..."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    rows={3}
                  />
                  <button className="mt-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
                    Commenter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de création (simulé) */}
      {showForm && (
        <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-blue-600 border border-blue-500 rounded-3xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Nouvelle tâche</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titre de la tâche"
                className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white"
              />
              <textarea
                placeholder="Description"
                className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white h-24"
              />
              <select className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white">
                <option value="">Sélectionner un projet</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white">
                <option value="">Assigner à</option>
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
              <select className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white">
                <option value="Faible">Priorité: Faible</option>
                <option value="Moyenne">Priorité: Moyenne</option>
                <option value="Élevée">Priorité: Élevée</option>
              </select>
              <input
                type="date"
                placeholder="Date d'échéance"
                className="w-full rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-white"
              />
            </div>
            <div className="mt-6 flex space-x-2">
              <button className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700">
                Créer
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
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