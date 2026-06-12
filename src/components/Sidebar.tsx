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
  ];

  return (
    <aside className="min-h-screen w-72 border-r border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 px-6 py-8 text-white shadow-xl overflow-y-auto">
      <div className="mb-10">
        <div className="text-2xl font-bold tracking-tight text-white">CIS</div>
        <p className="mt-1 text-xs text-slate-400 uppercase tracking-widest font-semibold">Platform Management</p>
      </div>

      <nav className="space-y-2 mb-8">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-4 py-2">Navigation</div>
        {links.map(link => (
          hasPermission(link.permission) && (
            <Link
              key={link.path}
              to={link.path}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              {link.label}
            </Link>
          )
        ))}
        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-slate-700 hover:text-white ${
                isActive ? "bg-slate-700 text-white" : "text-slate-300"
              }`
            }
          >
            Mon profil
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="mt-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-sm border border-slate-600 shadow-lg">
          <div className="font-semibold text-white">{user.name}</div>
          <div className="mt-2 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">{user.role}</div>
        </div>
      )}
    </aside>
  );
}