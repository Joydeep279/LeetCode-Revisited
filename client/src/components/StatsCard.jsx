export default function StatsCard({ icon: Icon, label, value, color = "purple", delay = 0 }) {
  const colorMap = {
    purple: "border-drac-purple/30",
    blue:   "border-drac-cyan/30",
    green:  "border-drac-green/30",
    yellow: "border-drac-orange/30",
    red:    "border-drac-red/30",
  };

  const iconColorMap = {
    purple: "text-drac-purple bg-drac-purple/10",
    blue:   "text-drac-cyan bg-drac-cyan/10",
    green:  "text-drac-green bg-drac-green/10",
    yellow: "text-drac-orange bg-drac-orange/10",
    red:    "text-drac-red bg-drac-red/10",
  };

  return (
    <div
      className={`drac-card p-5 ${colorMap[color]} animate-fade-in`}
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-drac-comment font-medium">{label}</p>
          <p className="text-2xl font-heading font-bold text-drac-fg">{value}</p>
        </div>
      </div>
    </div>
  );
}
