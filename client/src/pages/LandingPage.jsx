import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";
import { registerUser } from "../api/api";

export default function LandingPage() {
  const [username, setUsername] = useState("Joydeep279");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const sessionStr = localStorage.getItem("lc_revisited_session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.username && (session.expires === "infinite" || session.expires > Date.now())) {
          navigate(`/dashboard/${session.username}`);
        } else {
          localStorage.removeItem("lc_revisited_session");
        }
      } catch (e) {
        localStorage.removeItem("lc_revisited_session");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalUsername = username.trim();
    if (!finalUsername) return;

    // Extract username if a full LeetCode URL was pasted
    const match = finalUsername.match(/(?:leetcode\.com\/(?:u\/)?)([^\/\?]+)/i);
    if (match) {
      finalUsername = match[1];
      setUsername(finalUsername);
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(finalUsername);
      
      const expires = "infinite";
      localStorage.setItem("lc_revisited_session", JSON.stringify({
        username: finalUsername.toLowerCase(),
        expires
      }));

      navigate(`/dashboard/${finalUsername.toLowerCase()}`);
    } catch (err) {
      const msg =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-drac-bg">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">

        {/* Hero — left-aligned, no floating orbs, no sparkle badge */}
        <div className="mb-20 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-drac-purple flex items-center justify-center">
              <Brain className="w-6 h-6 text-drac-bg" />
            </div>
            <span className="font-heading font-bold text-xl text-drac-purple tracking-tight">
              LeetRevise
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold mb-5 leading-tight text-drac-fg">
            You solved it once.
            <br />
            <span className="text-drac-pink">Don't solve it again from scratch.</span>
          </h1>

          <p className="text-base sm:text-lg text-drac-comment max-w-xl mb-10 leading-relaxed">
            LeetRevise syncs your solved LeetCode problems and schedules reviews
            using spaced repetition. You get reminded right before you'd forget —
            Day 1, 3, 7, 15, 30, 60.
          </p>

          {/* Username Form */}
          <form onSubmit={handleSubmit} className="max-w-md animate-slide-up">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="LeetCode username"
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-drac-bg/30 border-t-drac-bg rounded-full animate-spin"></div>
                ) : (
                  <>
                    Start <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-drac-red animate-fade-in">{error}</p>
            )}

            <p className="mt-3 text-xs text-drac-comment/60">
              No account needed. Just your public LeetCode username.
            </p>
          </form>
        </div>

        {/* Features — compact list, not 3 big cards */}
        <div className="mb-16 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="font-heading font-bold text-lg text-drac-fg mb-5">How it works</h2>
          <div className="space-y-4">
            {[
              {
                icon: Zap,
                title: "Auto-scheduled reviews",
                desc: "Spaced repetition picks the right day to resurface each problem. You just show up.",
                color: "text-drac-orange",
                bg: "bg-drac-orange/10",
              },
              {
                icon: Target,
                title: "Syncs from LeetCode",
                desc: "Your solved problems are pulled automatically every 6 hours. No manual input.",
                color: "text-drac-green",
                bg: "bg-drac-green/10",
              },
              {
                icon: TrendingUp,
                title: "Track your progress",
                desc: "See your streak, completion rate, and what's coming up for review this week.",
                color: "text-drac-cyan",
                bg: "bg-drac-cyan/10",
              },
            ].map((feat, i) => (
              <div key={i} className="drac-card p-4 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-md ${feat.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <feat.icon className={`w-4.5 h-4.5 ${feat.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-semibold text-drac-fg mb-0.5">{feat.title}</h3>
                  <p className="text-sm text-drac-comment leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule — simple horizontal stepper */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="font-heading font-bold text-lg text-drac-fg mb-5">The review schedule</h2>
          <div className="drac-card p-5">
            <div className="flex items-center justify-between gap-1">
              {[
                { day: "1", label: "Fresh" },
                { day: "3", label: "Reinforce" },
                { day: "7", label: "Weekly" },
                { day: "15", label: "Bi-weekly" },
                { day: "30", label: "Monthly" },
                { day: "60", label: "Lock in" },
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-md bg-drac-purple/15 border border-drac-purple/25 flex items-center justify-center text-xs font-heading font-bold text-drac-purple mb-1">
                      {step.day}
                    </div>
                    <span className="text-[10px] text-drac-comment">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-px bg-drac-comment/20 mx-1.5 mt-[-14px]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
