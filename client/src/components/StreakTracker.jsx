import { Flame } from "lucide-react";

export default function StreakTracker({ streak = 0 }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <div className="drac-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-drac-orange/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-drac-orange" />
          </div>
          <div>
            <h3 className="text-xs text-drac-comment font-medium uppercase tracking-wide">Streak</h3>
            <p className="text-lg font-heading font-bold text-drac-fg">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
        {streak >= 7 && (
          <span className="px-2.5 py-1 text-xs font-semibold text-drac-orange bg-drac-orange/10 border border-drac-orange/20 rounded">
            on fire
          </span>
        )}
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          const isStreakDay = i <= todayIdx && todayIdx - i < streak;
          const isToday = i === todayIdx;

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-drac-comment font-medium">{day}</span>
              <div
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors
                  ${isStreakDay
                    ? "bg-drac-green text-drac-bg"
                    : "bg-drac-surface text-drac-comment/40"
                  }
                  ${isToday ? "ring-1.5 ring-drac-purple ring-offset-1 ring-offset-drac-current" : ""}
                `}
              >
                {isStreakDay ? "✓" : "·"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-drac-comment/15">
        <p className="text-xs text-drac-comment text-center">
          {streak === 0
            ? "Review a problem to start your streak."
            : streak < 3
            ? "Building momentum — keep it up."
            : streak < 7
            ? "Solid consistency this week."
            : "Unstoppable. Don't break the chain."}
        </p>
      </div>
    </div>
  );
}
