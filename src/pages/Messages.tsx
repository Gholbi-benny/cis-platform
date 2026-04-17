import { useState } from "react";
import { messages } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { useProjectContext } from "../contexts/ProjectContext";

export default function Messages() {
  const { user, hasPermission } = useAuth();
  const { projects, updateProjectDeadline } = useProjectContext();
  const [entries, setEntries] = useState(messages);
  const [deadlineEdits, setDeadlineEdits] = useState<Record<number, string>>({});

  const handleStatusChange = (id: number, status: 'En attente' | 'Validé') => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, status } : entry));
  };

  const handleSendMail = (id: number) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, reply: `Bonjour ${entry.clientName},\nNous vous attendons le ${entry.requestedDate} à 10h à l'agence pour discuter de votre projet.\nCordialement, ${user?.name}` } : entry));
  };

  const handleDeadlineChange = (projectId: number, endDate: string) => {
    setDeadlineEdits(prev => ({ ...prev, [projectId]: endDate }));
  };

  const handleDeadlineSave = (projectId: number) => {
    const endDate = deadlineEdits[projectId];
    if (endDate) {
      updateProjectDeadline(projectId, endDate);
    }
  };

  const relevantProjects = projects.filter(project =>
    project.team.includes(user?.name || '') || project.manager === user?.name
  );

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-white">Messages clients</h1>
            <p className="text-blue-200 mt-2">Gestion des demandes commerciales et suivi des projets potentiel.</p>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Périodes d'échéance projet</h2>
          {relevantProjects.length === 0 ? (
            <p className="text-blue-200">Aucun projet lié à votre rôle actuellement.</p>
          ) : (
          <div className="space-y-4">
            {relevantProjects.map(project => (
              <div key={project.id} className="border border-slate-800 rounded-3xl bg-slate-950/80 p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{project.name}</div>
                    <div className="text-sm text-blue-200">Chef de projet: {project.manager}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user?.role === 'Chef de projet' && project.manager === user.name ? (
                      <>
                        <input
                          type="date"
                          value={deadlineEdits[project.id] ?? project.endDate}
                          onChange={(e) => handleDeadlineChange(project.id, e.target.value)}
                          className="rounded-2xl border border-gray-500 bg-gray-700 px-3 py-2 text-sm text-white"
                        />
                        <button
                          onClick={() => handleDeadlineSave(project.id)}
                          className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                        >
                          Enregistrer
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-blue-200">Échéance: {project.endDate}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{entry.subject}</h2>
                <p className="text-sm text-blue-200">Projet demandé: {entry.projectName}</p>
                <p className="mt-2 text-blue-100">{entry.message}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-200">Client: {entry.clientName}</div>
                <div className="text-sm text-blue-200">Email: {entry.clientEmail}</div>
                <div className="text-sm text-blue-200">Date souhaitée: {entry.requestedDate}</div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                  entry.status === 'Validé' ? 'bg-green-100 text-green-800' :
                  entry.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {entry.status}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-2">
              {hasPermission('manage_requests') && (
                <button
                  onClick={() => handleStatusChange(entry.id, 'En attente')}
                  className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                >
                  Mettre en attente
                </button>
              )}
              {hasPermission('send_messages') && (
                <button
                  onClick={() => handleSendMail(entry.id)}
                  className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                >
                  Envoyer rendez-vous
                </button>
              )}
            </div>

            {entry.reply && (
              <div className="mt-4 bg-slate-950 p-4 rounded-3xl border border-slate-800">
                <h3 className="font-semibold text-sm mb-2 text-white">Message envoyé</h3>
                <pre className="whitespace-pre-wrap text-sm text-blue-100">{entry.reply}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}