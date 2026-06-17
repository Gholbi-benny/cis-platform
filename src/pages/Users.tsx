import { useEffect, useState } from "react";
import { getUsers, createUser, adminUpdateUser, deleteUser } from "../api";
import type { User } from "../data/mockData";

const ROLES = [
  'Directeur général',
  'Directeur général adjoint',
  'Directeur technique',
  'Coordinateur de projet',
  'Équipe technique',
  'Directeur commercial',
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await getUsers();
      setUsers(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    setCreateError(null);
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateError("Le nom, l'email et le mot de passe sont requis.");
      return;
    }
    if (newPassword.length < 6) {
      setCreateError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setCreating(true);
    try {
      const created = await createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: "Équipe technique",
      });
      setUsers((current) => [...current, created]);
      setShowForm(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Impossible de créer l'utilisateur.");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: User) => {
    setEditUser({ ...u });
    setEditPassword("");
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditError(null);
    if (!editUser.name.trim() || !editUser.email.trim()) {
      setEditError("Le nom et l'email sont requis.");
      return;
    }
    if (editPassword && editPassword.length < 6) {
      setEditError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setSaving(true);
    try {
      const updated = await adminUpdateUser({
        id: editUser.id,
        name: editUser.name.trim(),
        email: editUser.email.trim(),
        role: editUser.role,
        ...(editPassword ? { password: editPassword } : {}),
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditUser(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Impossible de modifier l'utilisateur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Impossible de supprimer l'utilisateur.");
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-slate-300 dark:border-gray-500 bg-slate-50 dark:bg-gray-700 px-3 py-2 text-slate-900 dark:text-white";

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Directeur général':
      case 'Directeur général adjoint':
        return 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30';
      case 'Directeur technique':
        return 'bg-sky-600/15 text-sky-700 dark:text-sky-300 border border-sky-500/30';
      case 'Coordinateur de projet':
        return 'bg-amber-600/15 text-amber-700 dark:text-amber-300 border border-amber-500/30';
      case 'Équipe technique':
        return 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
      case 'Directeur commercial':
        return 'bg-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-500/30';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Gestion des utilisateurs</h1>
            <p className="text-slate-600 dark:text-blue-200 mt-2">Ajouter, modifier ou supprimer des comptes et leurs rôles.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">
            Nouvel utilisateur
          </button>
        </div>

        {loading ? (
          <div className="py-20">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-200 dark:bg-slate-800 px-6 py-5 text-slate-900 dark:text-white shadow-lg">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 dark:border-white border-t-transparent"></span>
              Chargement des utilisateurs...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-200">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-3xl shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-6 py-4 text-sm font-semibold">Nom</th>
                  <th className="px-6 py-4 text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold">Rôle</th>
                  <th className="px-6 py-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900"}>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleColor(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="rounded-xl bg-sky-600 hover:bg-sky-700 px-3 py-1 text-xs font-semibold text-white transition">
                          Modifier
                        </button>
                        <button onClick={() => { setDeleteTarget(u); setDeleteError(null); }} className="rounded-xl bg-rose-600 hover:bg-rose-700 px-3 py-1 text-xs font-semibold text-white transition">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal créer */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Nouvel utilisateur — Équipe technique</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ce compte sera créé avec le rôle "Équipe technique" (modifiable ensuite).</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nom complet</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Email</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Mot de passe</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                </div>
                {createError && <p className="text-sm text-red-500 dark:text-red-300">{createError}</p>}
              </div>
              <div className="mt-6 flex space-x-2">
                <button onClick={handleCreateUser} disabled={creating} className="rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition">
                  {creating ? 'Création...' : 'Créer'}
                </button>
                <button onClick={() => { setShowForm(false); setCreateError(null); }} className="rounded-2xl bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 transition hover:bg-slate-300 dark:hover:bg-slate-600">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal modifier */}
        {editUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Modifier l'utilisateur</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nom complet</label>
                  <input type="text" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Email</label>
                  <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Rôle</label>
                  <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value as User['role'] })} className={inputClass}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nouveau mot de passe (optionnel)</label>
                  <input type="password" placeholder="Laisser vide pour ne pas changer" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className={inputClass} />
                </div>
                {editError && <p className="text-sm text-red-500 dark:text-red-300">{editError}</p>}
              </div>
              <div className="mt-6 flex space-x-2">
                <button onClick={handleSaveEdit} disabled={saving} className="rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button onClick={() => setEditUser(null)} className="rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-800 dark:text-white transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal supprimer */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Supprimer l'utilisateur</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Voulez-vous vraiment supprimer <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) ? Cette action est irréversible.
              </p>
              {deleteError && <p className="text-sm text-red-500 dark:text-red-300 mb-4">{deleteError}</p>}
              <div className="flex space-x-2">
                <button onClick={handleDelete} disabled={deleting} className="rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition">
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
                <button onClick={() => { setDeleteTarget(null); setDeleteError(null); }} className="rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-800 dark:text-white transition">
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