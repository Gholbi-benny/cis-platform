import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const { user, hasPermission } = useAuth();

  const links = [
    { path: "/dashboard", label: "Dashboard", permission: "view_dashboard" },
    { path: "/projects", label: "Projets", permission: "view_projects" },
    { path: "/tasks", label: "Étapes", permission: "view_tasks" },
    { path: "/messages", label: "Messages clients", permission: "view_messages" },
    { path: "/technical-status", label: "Statut technique", permission: "update_tasks" },
    { path: "/users", label: "Utilisateurs", permission: "manage_users" },
  ];

  return (
    <aside className="min-h-screen w-72 border-r border-slate-200 bg-white px-6 py-8 text-slate-900 shadow-xl overflow-y-auto dark:border-slate-700 dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900 dark:text-white">
      <div className="mb-10">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">CIS</div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Platform Management</p>
      </div>

      <nav className="space-y-2 mb-8">
        <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider px-4 py-2">Navigation</div>
        {links.map(link => (
          hasPermission(link.permission) && (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          )
        ))}
        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              }`
            }
          >
            Mon profil
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="mt-12 rounded-lg bg-slate-100 border border-slate-200 p-4 text-sm shadow-lg dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-800 dark:border-slate-600">
          <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
          <div className="mt-2 inline-block rounded-full bg-blue-100 border border-blue-300 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-300">{user.role}</div>
        </div>
      )}
    </aside>
  );
}