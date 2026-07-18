import { Link, useLocation } from "react-router-dom";
import { Brain, BarChart3, RefreshCw } from "lucide-react";

export default function Navbar({ username, onSync, syncing }) {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname.includes(path)
      ? "text-lc-purple-400 border-b-2 border-lc-purple-400"
      : "text-gray-400 hover:text-gray-200 border-b-2 border-transparent";

  return (
    <nav className="sticky top-0 z-50 bg-lc-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={username ? `/dashboard/${username}` : "/"} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lc-purple-500 to-lc-blue-500 flex items-center justify-center shadow-lg shadow-lc-purple-500/20 group-hover:shadow-lc-purple-500/40 transition-shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient hidden sm:block">LeetRevise</span>
          </Link>

          {/* Navigation Links */}
          {username && (
            <div className="flex items-center gap-1">
              <Link
                to={`/dashboard/${username}`}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${isActive("dashboard")}`}
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                to={`/progress/${username}`}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${isActive("progress")}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {username && onSync && (
              <button
                onClick={onSync}
                disabled={syncing}
                className="btn-outline flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync"}</span>
              </button>
            )}
            {username && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-lc-dark-700/60 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-lc-green-400 animate-pulse"></div>
                <span className="text-sm text-gray-300 font-medium">{username}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
