export default function StatsCard({ icon: Icon, label, value, color = "purple", delay = 0 }) {
  const colorMap = {
    purple: "from-lc-purple-500/20 to-transparent border-lc-purple-500/20 text-lc-purple-400",
    blue: "from-lc-blue-500/20 to-transparent border-lc-blue-500/20 text-lc-blue-400",
    green: "from-lc-green-500/20 to-transparent border-lc-green-500/20 text-lc-green-400",
    yellow: "from-lc-yellow-400/20 to-transparent border-lc-yellow-400/20 text-lc-yellow-400",
    red: "from-lc-red-400/20 to-transparent border-lc-red-400/20 text-lc-red-400",
  };

  const iconColorMap = {
    purple: "text-lc-purple-400 bg-lc-purple-500/15",
    blue: "text-lc-blue-400 bg-lc-blue-500/15",
    green: "text-lc-green-400 bg-lc-green-500/15",
    yellow: "text-lc-yellow-400 bg-lc-yellow-400/15",
    red: "text-lc-red-400 bg-lc-red-400/15",
  };

  return (
    <div
      className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} border animate-slide-up`}
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}
