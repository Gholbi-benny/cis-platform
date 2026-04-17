type CardProps = {
  title: string;
  value: string | number;
};

export default function Card({ title, value }: CardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl shadow-slate-950/50 p-6 rounded-lg hover:shadow-2xl transition duration-300 group cursor-pointer">
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 group-hover:text-blue-300 transition">{title}</div>
      <div className="text-5xl font-bold text-white mb-3">{value}</div>
      <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
    </div>
  );
}