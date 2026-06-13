import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../data/mockData";

type Role = User['role'];

const getHomePage = (role: Role) => {
  switch (role) {
    case 'Directeur général':
    case 'Directeur général adjoint':
    case 'Directeur technique':
    case 'Coordinateur de projet':
      return '/dashboard';
    case 'Équipe technique':
      return '/technical-status';
    case 'Directeur commercial':
      return '/messages';
    default:
      return '/dashboard';
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    try {
      const user = await login(email, password);
      navigate(getHomePage(user.role));
    } catch {
      setError("Identifiants incorrects");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 py-12 text-white relative overflow-hidden">
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
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="votre.email@ciscongo.com"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline focus:outline-none"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 text-sm font-semibold text-white transition shadow-lg hover:shadow-xl mt-2"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}