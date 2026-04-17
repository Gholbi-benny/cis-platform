import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../data/mockData";

type Role = User['role'];

const getHomePage = (role: Role) => {
  switch (role) {
    case 'Directeur':
    case 'Chef de projet':
      return '/dashboard';
    case 'Équipe technique':
      return '/technical-status';
    case 'Commercial':
      return '/messages';
    default:
      return '/login';
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("Directeur");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    if (login(email, password, role)) {
      navigate(getHomePage(role));
    } else {
      setError("Identifiants ou rôle incorrect");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 py-12 text-white relative overflow-hidden">
      {/* Décoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-10 shadow-2xl backdrop-blur-xl border border-slate-700 relative z-10">
        <div className="space-y-2 text-center mb-8">
          <div className="inline-flex rounded-full bg-blue-500/20 px-4 py-2 text-xs font-semibold text-blue-300 border border-blue-400/30">Accès sécurisé</div>
          <h2 className="text-3xl font-bold text-white mt-4">Connexion</h2>
          <p className="text-sm text-slate-400">Accédez à votre tableau de bord professionnel</p>
        </div>

        <div className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="votre.email@ciscongo.com"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="login-password"
                className="text-slate-300 text-xs font-semibold uppercase tracking-wide"
              >
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
                aria-controls="login-password"
                aria-pressed={showPassword}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="Directeur">Directeur</option>
              <option value="Chef de projet">Chef de projet</option>
              <option value="Équipe technique">Équipe technique</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 text-sm font-semibold text-white transition shadow-lg hover:shadow-xl mt-2"
          >
            Se connecter
          </button>
        </div>

        <div className="mt-8 rounded-lg bg-blue-500/10 p-4 text-sm text-blue-300 border border-blue-500/30">
          <p className="font-semibold text-white">Comptes de test :</p>
          <ul className="mt-3 space-y-2">
            <li>Directeur: el_lee-segnor@ciscongo.com</li>
            <li>Chef projet: gholbi@ciscongo.com</li>
            <li>Technique: gloire@ciscongo.com</li>
            <li>Commercial: chalbery@ciscongo.com</li>
          </ul>
          <p className="mt-4 text-xs text-slate-400 border-t border-blue-500/20 pt-3">
            Mot de passe initial (tous les comptes) : <span className="text-blue-200 font-mono">demo123</span>
            <br />
            Vous pourrez le modifier dans <span className="text-slate-300">Mon profil</span> après connexion.
          </p>
        </div>
      </div>
    </div>
  );
}
