import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../api";

export default function Profile() {
  const { user, updateDisplayName } = useAuth();
  const [name, setName] = useState(user?.name ?? "");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const [nameMessage, setNameMessage] = useState<"ok" | "err" | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    const trimmed = name.trim();
    if (!trimmed || !user) { setNameMessage("err"); return; }
    try {
      await updateUser({ id: user.id, name: trimmed });
      updateDisplayName(trimmed);
      setNameMessage("ok");
    } catch { setNameMessage("err"); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);
    if (newPassword.length < 4) { setPwdMessage({ type: "err", text: "Le nouveau mot de passe doit faire au moins 4 caractères." }); return; }
    if (newPassword !== confirmPassword) { setPwdMessage({ type: "err", text: "La confirmation ne correspond pas." }); return; }
    if (!user) { setPwdMessage({ type: "err", text: "Utilisateur non authentifié." }); return; }
    try {
      await updateUser({ id: user.id, password: newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setPwdMessage({ type: "ok", text: "Mot de passe mis à jour." });
    } catch (error) {
      setPwdMessage({ type: "err", text: error instanceof Error ? error.message : "Impossible de changer le mot de passe." });
    }
  };

  if (!user) return null;

  const inputClass = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";
  const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300";

  return (
    <div className="w-full max-w-lg mx-auto text-left">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Mon profil</h1>
      <p className="text-sm text-slate-600 dark:text-blue-200 mb-8">
        {user.email} · {user.role}
      </p>

      <form onSubmit={handleSaveName} className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/60 p-6 shadow-xl mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Nom affiché</h2>
        <label htmlFor="profile-name" className={`block ${labelClass} mb-2`}>Nom</label>
        <input
          id="profile-name"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameMessage(null); }}
          className={inputClass}
        />
        {nameMessage === "ok" && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">Nom enregistré.</p>}
        {nameMessage === "err" && <p className="mt-3 text-sm text-red-600 dark:text-red-300">Indiquez un nom non vide.</p>}
        <button type="submit" className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 text-sm font-semibold text-white shadow-lg transition">
          Enregistrer le nom
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/60 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mot de passe</h2>

        {pwdMessage && (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            pwdMessage.type === "ok"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
              : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-200"
          }`}>
            {pwdMessage.text}
          </div>
        )}

        <div className="space-y-4">
          {[
            { id: "pwd-current", label: "Mot de passe actuel", value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
            { id: "pwd-new", label: "Nouveau mot de passe", value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
            { id: "pwd-confirm", label: "Confirmer le nouveau mot de passe", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
          ].map(field => (
            <div key={field.id}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor={field.id} className={labelClass}>{field.label}</label>
                <button type="button" onClick={field.toggle} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {field.show ? "Masquer" : "Afficher"}
                </button>
              </div>
              <input
                id={field.id}
                type={field.show ? "text" : "password"}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="mt-6 w-full rounded-lg border border-slate-300 dark:border-slate-500 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600/80 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white transition">
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}