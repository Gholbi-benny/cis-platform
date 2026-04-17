import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 backdrop-blur-xl sticky top-0 z-20 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <div className="text-white text-lg font-bold tracking-tight">CIS Platform</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Gestion collaborative</div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="rounded-lg bg-slate-700/50 border border-slate-600 px-4 py-2 text-sm text-slate-300 font-medium">
                {user.name}
              </div>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wide">{user.role}</span>
              <button
                onClick={logout}
                className="rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 px-4 py-2 text-sm font-semibold text-white transition shadow-md hover:shadow-lg"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
