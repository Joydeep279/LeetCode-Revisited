import { Flame } from "lucide-react";

export default function StreakTracker({ streak = 0 }) {
  // Create a simplified 7-day view
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay(); // 0=Sun ... 6=Sat
  // Remap to Mon=0 ... Sun=6
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm text-gray-400 font-medium">Revision Streak</h3>
            <p className="text-xl font-bold text-gray-100">
              {streak} {streak === 1 ? "Day" : "Days"}
            </p>
          </div>
        </div>
        {streak >= 7 && (
          <span className="px-3 py-1 text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full animate-glow">
            🔥 On Fire!
          </span>
        )}
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const isStreakDay = i <= todayIdx && todayIdx - i < streak;
          const isToday = i === todayIdx;

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-gray-500 font-medium">{day}</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isStreakDay
                    ? "bg-gradient-to-br from-lc-green-500 to-lc-green-400 text-white shadow-md shadow-lc-green-500/30"
                    : "bg-lc-dark-600 text-gray-600"
                  }
                  ${isToday ? "ring-2 ring-lc-purple-500/50 ring-offset-1 ring-offset-lc-dark-700" : ""}
                `}
              >
                {isStreakDay ? "✓" : "·"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Streak Encouragement */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <p className="text-xs text-gray-500 text-center">
          {streak === 0
            ? "Complete a review today to start your streak! 💪"
            : streak < 3
            ? "Keep going! Build that momentum! 🚀"
            : streak < 7
            ? "Great consistency! Almost a full week! 🌟"
            : "Incredible streak! You're unstoppable! 🏆"}
        </p>
      </div>
    </div>
  );
}
