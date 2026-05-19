import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <div className="text-white text-lg font-bold tracking-tight">CIS Platform</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Gestion collaborative</div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Basculer le thème"
                className="rounded-lg border border-slate-300 bg-slate-100/90 p-2 text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 18.25a6.25 6.25 0 100-12.5 6.25 6.25 0 000 12.5z" />
                    <path d="M12 2.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 0112 2.75zm0 18.5a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zm9.25-9.25a.75.75 0 01-.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75zM4.5 12a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 014.5 12zm12.25 6.03a.75.75 0 01-1.06 1.06l-.35-.35a.75.75 0 111.06-1.06l.35.35zm-10.72-10.72a.75.75 0 01-1.06 1.06l-.35-.35a.75.75 0 011.06-1.06l.35.35zm10.72-1.06a.75.75 0 011.06 1.06l-.35.35a.75.75 0 11-1.06-1.06l.35-.35zM6.03 17.97a.75.75 0 011.06 1.06l-.35.35a.75.75 0 11-1.06-1.06l.35-.35z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M21.752 15.002A9.718 9.718 0 0112 21.75a9.75 9.75 0 01-9.75-9.75c0-4.896 3.606-8.943 8.376-9.66a.75.75 0 01.828.985 7.5 7.5 0 009.624 9.624.75.75 0 01.977.83z" />
                  </svg>
                )}
              </button>
              <div className="rounded-lg bg-slate-700/50 border border-slate-600 px-4 py-2 text-sm text-slate-300 font-medium dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100">
                {user.name}
              </div>
              <span className="text-slate-500 dark:text-slate-400">·</span>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wide dark:text-slate-300">{user.role}</span>
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
