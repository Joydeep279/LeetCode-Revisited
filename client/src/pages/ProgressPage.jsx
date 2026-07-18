import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  Clock,
  Tag,
  Trophy,
  ArrowUpDown,
} from "lucide-react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAllProblems, getStats } from "../api/api";

const INTERVAL_LABELS = ["Day 1", "Day 3", "Day 7", "Day 15", "Day 30", "Day 60"];
const REVIEW_INTERVALS = [1, 3, 7, 15, 30, 60];

const DIFFICULTY_FILTERS = ["All", "Easy", "Medium", "Hard"];
const STATUS_FILTERS = ["All", "Active", "Completed"];
const SORT_OPTIONS = [
  { value: "nextReview", label: "Next Review" },
  { value: "difficulty", label: "Difficulty" },
  { value: "progress", label: "Progress" },
  { value: "title", label: "Title" },
];

function getProgressPercent(currentInterval, isCompleted) {
  if (isCompleted) return 100;
  // Each interval step = ~16.67% of progress through 6 intervals
  return Math.round((currentInterval / REVIEW_INTERVALS.length) * 100);
}

function getProgressColor(percent) {
  if (percent >= 100) return "bg-lc-green-400";
  if (percent >= 60) return "bg-lc-blue-400";
  if (percent >= 30) return "bg-lc-yellow-400";
  return "bg-lc-purple-400";
}

function getStatusLabel(problem) {
  if (problem.isCompleted) return { text: "Graduated", class: "text-lc-green-400 bg-lc-green-400/10 border-lc-green-400/20" };
  const nextReview = new Date(problem.nextReviewDate);
  const now = new Date();
  if (nextReview <= now) return { text: "Due Now", class: "text-lc-red-400 bg-lc-red-400/10 border-lc-red-400/20 animate-pulse" };
  return { text: `Review ${INTERVAL_LABELS[problem.currentInterval]}`, class: "text-lc-blue-400 bg-lc-blue-500/10 border-lc-blue-500/20" };
}

export default function ProgressPage() {
  const { username } = useParams();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("nextReview");

  const fetchData = useCallback(async () => {
    try {
      const [allData, statsData] = await Promise.all([
        getAllProblems(username),
        getStats(username),
      ]);
      setProblems(allData.problems);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch progress data:", err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProblems = useMemo(() => {
    let result = [...problems];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.topicTags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "All") {
      result = result.filter((p) => p.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter !== "All") {
      if (statusFilter === "Completed") {
        result = result.filter((p) => p.isCompleted);
      } else {
        result = result.filter((p) => !p.isCompleted);
      }
    }

    // Sort
    const diffOrder = { Easy: 0, Medium: 1, Hard: 2 };
    result.sort((a, b) => {
      switch (sortBy) {
        case "nextReview":
          return new Date(a.nextReviewDate) - new Date(b.nextReviewDate);
        case "difficulty":
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        case "progress":
          return (
            getProgressPercent(b.currentInterval, b.isCompleted) -
            getProgressPercent(a.currentInterval, a.isCompleted)
          );
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [problems, search, difficultyFilter, statusFilter, sortBy]);

  const progressSummary = useMemo(() => {
    if (!problems.length) return null;
    const graduated = problems.filter((p) => p.isCompleted).length;
    const active = problems.length - graduated;
    const avgProgress =
      problems.reduce((sum, p) => sum + getProgressPercent(p.currentInterval, p.isCompleted), 0) /
      problems.length;
    return { graduated, active, total: problems.length, avgProgress: Math.round(avgProgress) };
  }, [problems]);

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient">
        <Navbar username={username} />
        <LoadingSpinner message="Loading your progress..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar username={username} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
            Your <span className="text-gradient">Progress</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Track your spaced repetition journey across all problems
          </p>
        </div>

        {/* Progress Overview Cards */}
        {progressSummary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-5 bg-gradient-to-br from-lc-purple-500/20 to-transparent border border-lc-purple-500/20 animate-slide-up">
              <p className="text-sm text-gray-400 font-medium">Total Tracked</p>
              <p className="text-2xl font-bold text-gray-100">{progressSummary.total}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-lc-blue-500/20 to-transparent border border-lc-blue-500/20 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <p className="text-sm text-gray-400 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-gray-100">{progressSummary.active}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-lc-green-500/20 to-transparent border border-lc-green-500/20 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400 font-medium">Graduated</p>
                <Trophy className="w-3.5 h-3.5 text-lc-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-100">{progressSummary.graduated}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-lc-yellow-400/20 to-transparent border border-lc-yellow-400/20 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-sm text-gray-400 font-medium">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-100">{progressSummary.avgProgress}%</p>
            </div>
          </div>
        )}

        {/* Filters & Search Bar */}
        <div className="glass-card p-4 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems or tags..."
                className="w-full pl-10 pr-4 py-2.5 bg-lc-dark-700/80 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lc-purple-500/50 focus:ring-2 focus:ring-lc-purple-500/20 transition-all duration-300 text-sm"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 hidden lg:block" />
              <div className="flex gap-1.5">
                {DIFFICULTY_FILTERS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${difficultyFilter === d
                        ? d === "Easy"
                          ? "bg-lc-green-400/20 text-lc-green-400 border border-lc-green-400/30"
                          : d === "Medium"
                            ? "bg-lc-yellow-400/20 text-lc-yellow-400 border border-lc-yellow-400/30"
                            : d === "Hard"
                              ? "bg-lc-red-400/20 text-lc-red-400 border border-lc-red-400/30"
                              : "bg-lc-purple-500/20 text-lc-purple-400 border border-lc-purple-500/30"
                        : "bg-lc-dark-600/60 text-gray-400 border border-white/5 hover:border-white/10"
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1.5">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${statusFilter === s
                      ? "bg-lc-purple-500/20 text-lc-purple-400 border border-lc-purple-500/30"
                      : "bg-lc-dark-600/60 text-gray-400 border border-white/5 hover:border-white/10"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500 hidden lg:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-lc-dark-600/60 border border-white/5 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-lc-purple-500/50 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredProblems.length} of {problems.length} problems
          </p>
        </div>

        {/* Problem List */}
        {filteredProblems.length > 0 ? (
          <div className="space-y-3">
            {filteredProblems.map((problem, idx) => {
              const progress = getProgressPercent(problem.currentInterval, problem.isCompleted);
              const progressColor = getProgressColor(progress);
              const status = getStatusLabel(problem);
              const difficultyClass =
                problem.difficulty === "Easy"
                  ? "difficulty-easy"
                  : problem.difficulty === "Medium"
                    ? "difficulty-medium"
                    : "difficulty-hard";

              return (
                <div
                  key={problem._id}
                  className="glass-card-hover p-5 animate-slide-up"
                  style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Left: Problem Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${difficultyClass}`}>
                          {problem.difficulty}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${status.class}`}>
                          {status.text}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {problem.isCompleted
                            ? "Completed"
                            : `Next: ${new Date(problem.nextReviewDate).toLocaleDateString()}`}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-gray-100 truncate mb-2">
                        {problem.title}
                      </h3>

                      {/* Topic Tags */}
                      {problem.topicTags && problem.topicTags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                          <Tag className="w-3 h-3 text-gray-500" />
                          {problem.topicTags.slice(0, 5).map((tag, i) => (
                            <span key={i} className="tag-badge">
                              {tag}
                            </span>
                          ))}
                          {problem.topicTags.length > 5 && (
                            <span className="text-xs text-gray-500">+{problem.topicTags.length - 5}</span>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-lc-dark-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-400 w-10 text-right">
                          {progress}%
                        </span>
                      </div>

                      {/* Interval Steps */}
                      <div className="flex items-center gap-1 mt-2">
                        {INTERVAL_LABELS.map((label, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < problem.currentInterval || problem.isCompleted
                                ? "bg-lc-green-400"
                                : i === problem.currentInterval && !problem.isCompleted
                                  ? "bg-lc-blue-400 animate-pulse"
                                  : "bg-lc-dark-500"
                              }`}
                            title={label}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-600">Day 1</span>
                        <span className="text-[10px] text-gray-600">Day 60</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center sm:flex-shrink-0">
                      <a
                        href={problem.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex items-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-lc-purple-500/10 flex items-center justify-center mx-auto mb-5">
              <Search className="w-10 h-10 text-lc-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No Problems Found</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              {problems.length === 0
                ? "You haven't synced any problems yet. Go back to the dashboard and sync your LeetCode profile."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
