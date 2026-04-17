import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 text-white overflow-hidden relative">
      {/* Éléments de décoration en arrière-plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-12 shadow-2xl backdrop-blur-xl border border-slate-700 relative z-10">
        <div className="space-y-8 text-center">
          <div className="inline-flex rounded-full bg-blue-500/20 px-4 py-2 text-xs font-semibold text-blue-300 border border-blue-400/30 backdrop-blur">Plateforme agile moderne</div>
          
          <div>
            <h1 className="text-6xl font-bold tracking-tight text-white mb-2">CIS Platform</h1>
            <p className="text-base text-slate-400">Suite complète de gestion collaborative</p>
          </div>
          
          <p className="text-lg text-slate-300 leading-relaxed">Gérez vos projets avec efficacité. Suivi technique, commercial et stratégique en un seul endroit.</p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-4">
            <Link to="/login" className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 text-sm font-semibold text-white transition shadow-lg hover:shadow-xl sm:w-auto">
              Se connecter
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-600/50 px-6 py-3 text-sm font-semibold text-white transition">
              Essayer maintenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}