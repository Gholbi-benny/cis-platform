import { useState, useEffect } from "react";
import type { Task, User } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { getTasks, getUsers, getProjects, createTask, updateTask } from "../api";

type ProjectItem = {
  id: number;
  title?: string;
  name?: string;
  owner_id?: number;
};

export default function Tasks() {
  const { hasPermission, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'my' | 'pending' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState('Faible');
  const [newDueDate, setNewDueDate] = useState('');

  const canCreateTask = hasPermission('write');
  const canAssignTasks = hasPermission('assign_tasks');

  const normalizeTask = (task: any): Task => {
    const status: Task['status'] =
      task.status === 'Terminé' ? 'Terminé'
      : task.status === 'En cours' ? 'En cours'
      : task.status === 'En retard' ? 'En retard'
      : 'À faire';

    const priority: Task['priority'] =
      task.priority === 'Élevée' ? 'Élevée'
      : task.priority === 'Moyenne' ? 'Moyenne'
      : 'Faible';

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      startDate: task.start_date || task.startDate || task.created_at?.slice(0, 10) || '',
      status,
      assignee: task.assignee_name || task.assignee || 'Non assigné',
      projectId: task.project_id ?? task.projectId ?? 0,
      priority,
      dueDate: task.due_date || task.dueDate || '',
      comments: task.comments ?? [],
    };
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedTasks, fetchedUsers, fetchedProjects] = await Promise.all([
        getTasks(),
        getUsers(),
        getProjects(),
      ]);
      setTasks(fetchedTasks.map(normalizeTask));
      setUsersList(fetchedUsers);
      setProjectsList(fetchedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isProjectCoordinator = (projectId?: number | string) => {
    if (!projectId) return false;
    const pid = typeof projectId === 'string' ? parseInt(projectId) : projectId;
    const p = projectsList.find(p => p.id === pid);
    return !!(p && user && p.owner_id === user.id);
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await createTask({
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: 'À faire',
        due_date: newDueDate || null,
        project_id: newProjectId ? parseInt(newProjectId) : null,
        assigned_to: newAssignee ? usersList.find(u => u.name === newAssignee)?.id ?? null : null,
      });
      setShowForm(false);
      setNewTitle('');
      setNewDescription('');
      setNewProjectId('');
      setNewAssignee('');
      setNewPriority('Faible');
      setNewDueDate('');
      loadData();
    } catch (err) {
      console.error('Erreur création étape:', err);
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;
    try {
      await updateTask({
        id: editTask.id,
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
        due_date: editTask.dueDate || null,
        assigned_to: usersList.find(u => u.name === editTask.assignee)?.id ?? null,
      });
      setEditTask(null);
      loadData();
    } catch (err) {
      console.error('Erreur modification étape:', err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'my': return task.assignee === user?.name;
      case 'pending': return task.status !== 'Terminé';
      case 'completed': return task.status === 'Terminé';
      default: return true;
    }
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
      case 'En cours': return 'bg-sky-600/15 text-sky-700 dark:text-sky-300 border border-sky-500/30';
      case 'En retard': return 'bg-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-500/30';
      default: return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Élevée': return 'text-red-500';
      case 'Moyenne': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getProjectName = (projectId: number) => {
    const p = projectsList.find(p => p.id === projectId);
    return p ? (p.title ?? p.name ?? projectId) : projectId;
  };

  const inputClass = "w-full rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-slate-900 dark:text-white";

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Gestion des étapes</h1>
            <p className="text-slate-600 dark:text-blue-200 mt-2">Suivi et priorisation des étapes opérationnelles.</p>
          </div>
          {canCreateTask && (
            <button onClick={() => setShowForm(true)} className="rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">
              Nouvelle étape
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Toutes</button>
          <button onClick={() => setFilter('my')} className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${filter === 'my' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Mes étapes</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${filter === 'pending' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>En attente</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${filter === 'completed' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Terminées</button>
        </div>

        {loading ? (
          <div className="py-20">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-200 dark:bg-slate-800 px-6 py-5 text-slate-900 dark:text-white shadow-lg">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent"></span>
              Chargement des étapes...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">{error}</div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-blue-500/50 bg-blue-500/10 p-6 text-sm text-blue-700 dark:text-blue-100">Aucune étape trouvée.</div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl transition hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-white">{task.title}</h3>
                    <p className="text-blue-100 text-sm mb-3">{task.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                      <div><strong className="text-white">Assigné à:</strong> {task.assignee}</div>
                      <div><strong className="text-white">Priorité:</strong> <span className={getPriorityColor(task.priority)}>{task.priority}</span></div>
                      <div><strong className="text-white">Échéance:</strong> {task.dueDate}</div>
                      <div><strong className="text-white">Projet:</strong> {getProjectName(task.projectId)}</div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedTask(task)} className="rounded-2xl bg-white/20 hover:bg-white/30 px-3 py-1 text-sm font-medium text-white transition">Détails</button>
                  {canAssignTasks && (
                    <button onClick={() => setEditTask({ ...task })} className="rounded-2xl bg-white/20 hover:bg-white/30 px-3 py-1 text-sm font-medium text-white transition">Modifier</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal détails */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTask.title}</h2>
                <button onClick={() => setSelectedTask(null)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Description</h3>
                  <p className="text-slate-600 dark:text-slate-300">{selectedTask.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-slate-700 dark:text-slate-200">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Détails</h3>
                    <p>Assigné à: {selectedTask.assignee}</p>
                    <p>Début: {selectedTask.startDate || 'Non définie'}</p>
                    <p>Priorité: <span className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</span></p>
                    <p>Échéance: {selectedTask.dueDate || 'Non définie'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Statut</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTask.status)}`}>{selectedTask.status}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Commentaires ({selectedTask.comments?.length ?? 0})</h3>
                  {(selectedTask.comments?.length ?? 0) === 0 ? (
                    <p className="text-slate-500">Aucun commentaire</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTask.comments.map(comment => (
                        <div key={comment.id} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{comment.author}</span>
                            <span className="text-slate-500">{comment.date}</span>
                          </div>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4">
                    <textarea placeholder="Ajouter un commentaire..." className={inputClass} rows={3} />
                    <button className="mt-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition">Commenter</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal modifier */}
        {editTask && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Modifier l'étape</h2>
              <div className="space-y-4">
                <input type="text" value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} className={inputClass} />
                <textarea value={editTask.description} onChange={e => setEditTask({ ...editTask, description: e.target.value })} className={`${inputClass} h-24`} />
                <select value={editTask.status} onChange={e => setEditTask({ ...editTask, status: e.target.value as Task['status'] })} className={inputClass}>
                  <option value="À faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                  <option value="En retard">En retard</option>
                </select>
                <select value={editTask.assignee} onChange={e => setEditTask({ ...editTask, assignee: e.target.value })} className={inputClass}>
                  <option value="">Assigner à</option>
                  {usersList.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
                <input type="date" value={editTask.dueDate} onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })} className={inputClass} />
              </div>
              <div className="mt-6 flex space-x-2">
                <button onClick={handleUpdateTask} className="rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition">Enregistrer</button>
                <button onClick={() => setEditTask(null)} className="rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-800 dark:text-white transition">Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire création */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Nouvelle étape</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Titre de l'étape" value={newTitle} onChange={e => setNewTitle(e.target.value)} className={inputClass} />
                <textarea placeholder="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} className={`${inputClass} h-24`} />
                <select value={newProjectId} onChange={e => setNewProjectId(e.target.value)} className={inputClass}>
                  <option value="">Sélectionner un projet</option>
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id}>{p.title ?? p.name ?? p.id}</option>
                  ))}
                </select>
                <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} className={inputClass}>
                  <option value="">Assigner à</option>
                  {usersList.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className={inputClass}>
                  <option value="Faible">Priorité: Faible</option>
                  <option value="Moyenne">Priorité: Moyenne</option>
                  <option value="Élevée">Priorité: Élevée</option>
                </select>
                <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className={inputClass} />
              </div>
              <div className="mt-6 flex space-x-2">
                <button onClick={handleCreateTask} className="rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">Créer</button>
                <button onClick={() => setShowForm(false)} className="rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-800 dark:text-white transition">Annuler</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}