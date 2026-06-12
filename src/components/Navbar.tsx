import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useState } from "react";
import { getUnreadCount, getNotifications, markNotificationAsRead } from "../api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unread, setUnread] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    getUnreadCount().then(r => {
      if (mounted) setUnread(r.unread ?? 0);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [user]);

  const openNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await getNotifications();
      setNotifications(notifs || []);
      setShowNotifs(v => !v);
      const unreadCount = notifs.filter((n: any) => !n.is_read).length;
      setUnread(unreadCount);
    } catch (e) {
      console.error('Erreur chargement notifications', e);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

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
              <div className="relative">
                <button onClick={openNotifications} className="relative mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{unread}</span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg p-3 z-50">
                    <div className="text-sm font-semibold mb-2">Notifications</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-xs text-slate-500">Aucune notification</div>
                      ) : notifications.map(n => (
                        <div key={n.id} className={`p-2 rounded-md ${n.is_read ? 'bg-slate-100 dark:bg-slate-700' : 'bg-blue-50 dark:bg-slate-900'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium">{n.title}</div>
                              <div className="text-xs text-slate-500">{n.message}</div>
                            </div>
                            {!n.is_read && (
                              <button onClick={() => markAsRead(n.id)} className="text-xs text-sky-600 ml-2">Marquer lu</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
