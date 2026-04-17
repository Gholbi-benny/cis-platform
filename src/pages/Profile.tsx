import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, updateDisplayName, updatePassword } = useAuth();
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

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameMessage("err");
      return;
    }
    updateDisplayName(trimmed);
    setNameMessage("ok");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);
    if (newPassword.length < 4) {
      setPwdMessage({ type: "err", text: "Le nouveau mot de passe doit faire au moins 4 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: "err", text: "La confirmation ne correspond pas au nouveau mot de passe." });
      return;
    }
    const ok = updatePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdMessage({ type: "ok", text: "Mot de passe mis à jour." });
    } else {
      setPwdMessage({ type: "err", text: "Mot de passe actuel incorrect." });
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-lg mx-auto text-left">
      <h1 className="text-3xl font-bold text-white mb-2">Mon profil</h1>
      <p className="text-sm text-blue-200 mb-8">
        {user.email} · {user.role}
      </p>

      <form onSubmit={handleSaveName} className="rounded-2xl border border-slate-600 bg-slate-800/60 p-6 shadow-xl mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Nom affiché</h2>
        <label htmlFor="profile-name" className="block text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">
          Nom
        </label>
        <input
          id="profile-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameMessage(null);
          }}
          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
        {nameMessage === "ok" && (
          <p className="mt-3 text-sm text-emerald-300">Nom enregistré.</p>
        )}
        {nameMessage === "err" && (
          <p className="mt-3 text-sm text-red-300">Indiquez un nom non vide.</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800"
        >
          Enregistrer le nom
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-600 bg-slate-800/60 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Mot de passe</h2>

        {pwdMessage && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              pwdMessage.type === "ok"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/50 bg-red-500/10 text-red-200"
            }`}
          >
            {pwdMessage.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="pwd-current" className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Mot de passe actuel
              </label>
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
              >
                {showCurrent ? "Masquer" : "Afficher"}
              </button>
            </div>
            <input
              id="pwd-current"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="pwd-new" className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Nouveau mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
              >
                {showNew ? "Masquer" : "Afficher"}
              </button>
            </div>
            <input
              id="pwd-new"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="pwd-confirm" className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Confirmer le nouveau mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
              >
                {showConfirm ? "Masquer" : "Afficher"}
              </button>
            </div>
            <input
              id="pwd-confirm"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg border border-slate-500 bg-slate-700/80 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-600/80"
        >
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}
