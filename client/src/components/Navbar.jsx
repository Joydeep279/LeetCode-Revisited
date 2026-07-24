import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, BarChart3, RefreshCw, LogOut } from "lucide-react";

export default function Navbar({ username, onSync, syncing }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname.includes(path)
      ? "text-drac-pink border-b-2 border-drac-pink"
      : "text-drac-comment hover:text-drac-fg border-b-2 border-transparent";

  const handleLogout = () => {
    localStorage.removeItem("lc_revisited_session");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-drac-darker border-b border-drac-comment/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={username ? `/dashboard/${username}` : "/"} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-drac-purple flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-drac-bg" />
            </div>
            <span className="text-base font-heading font-bold text-drac-purple hidden sm:block tracking-tight">
              LeetRevise
            </span>
          </Link>

          {/* Navigation Links */}
          {username && (
            <div className="flex items-center gap-1">
              <Link
                to={`/dashboard/${username}`}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${isActive("dashboard")}`}
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                to={`/progress/${username}`}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${isActive("progress")}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2.5">
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
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-drac-current border border-drac-comment/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-drac-green"></div>
                  <span className="text-sm text-drac-fg font-medium">{username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-drac-comment hover:text-drac-red hover:bg-drac-red/10 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
