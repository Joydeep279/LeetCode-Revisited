import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Zap, Target, TrendingUp, Sparkles } from "lucide-react";
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

  const features = [
    {
      icon: Zap,
      title: "Smart Scheduling",
      desc: "Spaced repetition ensures you review at the optimal time — Day 1, 3, 7, 15, 30, 60.",
      color: "text-lc-yellow-400",
      bg: "bg-lc-yellow-400/10",
    },
    {
      icon: Target,
      title: "Auto-Sync",
      desc: "Your solved problems are automatically fetched from LeetCode every 6 hours.",
      color: "text-lc-green-400",
      bg: "bg-lc-green-500/10",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      desc: "Monitor your revision streak, completion rate, and upcoming reviews.",
      color: "text-lc-blue-400",
      bg: "bg-lc-blue-500/10",
    },
  ];

  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lc-purple-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lc-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-lc-green-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lc-purple-500/10 border border-lc-purple-500/20 text-lc-purple-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Spaced Repetition
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lc-purple-500 to-lc-blue-500 flex items-center justify-center shadow-2xl shadow-lc-purple-500/30 animate-glow">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Never Forget a
            <span className="block text-gradient">LeetCode Solution</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop re-solving problems you've already cracked. Our smart revision system
            uses the <span className="text-gray-200 font-medium">forgetting curve</span> to schedule reviews
            exactly when your memory needs them.
          </p>

          {/* Username Form */}
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto animate-slide-up"
          >
            <div className="glass-card gradient-border p-2 flex items-center gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter your LeetCode username"
                className="flex-1 px-4 py-3 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none text-sm sm:text-base"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Start <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-sm text-lc-red-400 animate-slide-up">{error}</p>
            )}

            <p className="mt-4 text-xs text-gray-600">
              No login required. Just your public LeetCode username.
            </p>
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {features.map((feat, i) => (
            <div
              key={i}
              className="glass-card-hover p-6 text-center animate-slide-up"
              style={{ animationDelay: `${(i + 1) * 0.15}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mx-auto mb-4`}>
                <feat.icon className={`w-7 h-7 ${feat.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Schedule Preview */}
        <div className="mt-20 animate-fade-in">
          <h2 className="text-2xl font-bold text-center text-gray-100 mb-8">
            The <span className="text-gradient">Revision Schedule</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { day: "Day 1", desc: "Fresh memory" },
              { day: "Day 3", desc: "First reinforcement" },
              { day: "Day 7", desc: "Weekly review" },
              { day: "Day 15", desc: "Bi-weekly check" },
              { day: "Day 30", desc: "Monthly recall" },
              { day: "Day 60", desc: "Long-term lock" },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card px-5 py-3 flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${(i + 4) * 0.1}s` }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lc-purple-500 to-lc-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-100">{item.day}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
