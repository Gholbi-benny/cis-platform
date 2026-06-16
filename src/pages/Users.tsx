import { useEffect, useState } from "react";
import { getUsers, createUser } from "../api";
import type { User } from "../data/mockData";

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
            <p className="text-slate-600 dark:text-blue-200 mt-2">Ajouter de nouveaux membres de l'équipe technique.</p>
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
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900"}>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>{u.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Nouvel utilisateur — Équipe technique</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ce compte sera créé avec le rôle "Équipe technique".</p>
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
      </div>
    </div>
  );
}