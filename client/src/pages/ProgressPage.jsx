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
import Footer from "../components/Footer";
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
  return Math.round((currentInterval / REVIEW_INTERVALS.length) * 100);
}

function getProgressColor(percent) {
  if (percent >= 100) return "bg-drac-green";
  if (percent >= 60) return "bg-drac-cyan";
  if (percent >= 30) return "bg-drac-orange";
  return "bg-drac-purple";
}

function getStatusLabel(problem) {
  if (problem.isCompleted) return { text: "Graduated", class: "text-drac-green bg-drac-green/10 border-drac-green/25" };
  const nextReview = new Date(problem.nextReviewDate);
  const now = new Date();
  if (nextReview <= now) return { text: "Due Now", class: "text-drac-red bg-drac-red/10 border-drac-red/25" };
  return { text: `Review ${INTERVAL_LABELS[problem.currentInterval]}`, class: "text-drac-cyan bg-drac-cyan/10 border-drac-cyan/25" };
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

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.topicTags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (difficultyFilter !== "All") {
      result = result.filter((p) => p.difficulty === difficultyFilter);
    }

    if (statusFilter !== "All") {
      if (statusFilter === "Completed") {
        result = result.filter((p) => p.isCompleted);
      } else {
        result = result.filter((p) => !p.isCompleted);
      }
    }

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
      <div className="min-h-screen bg-drac-bg">
        <Navbar username={username} />
        <LoadingSpinner message="Loading your progress..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-drac-bg flex flex-col">
      <Navbar username={username} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-drac-fg">
            Your <span className="text-drac-cyan">progress</span>
          </h1>
          <p className="text-drac-comment mt-1 text-sm">
            Track your spaced repetition journey across all problems
          </p>
        </div>

        {/* Progress Overview Cards */}
        {progressSummary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="drac-card p-4 border-drac-purple/30 animate-fade-in">
              <p className="text-xs text-drac-comment font-medium uppercase tracking-wide">Total Tracked</p>
              <p className="text-2xl font-heading font-bold text-drac-fg mt-1">{progressSummary.total}</p>
            </div>
            <div className="drac-card p-4 border-drac-cyan/30 animate-fade-in" style={{ animationDelay: "0.06s" }}>
              <p className="text-xs text-drac-comment font-medium uppercase tracking-wide">In Progress</p>
              <p className="text-2xl font-heading font-bold text-drac-fg mt-1">{progressSummary.active}</p>
            </div>
            <div className="drac-card p-4 border-drac-green/30 animate-fade-in" style={{ animationDelay: "0.12s" }}>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-drac-comment font-medium uppercase tracking-wide">Graduated</p>
                <Trophy className="w-3 h-3 text-drac-green" />
              </div>
              <p className="text-2xl font-heading font-bold text-drac-fg mt-1">{progressSummary.graduated}</p>
            </div>
            <div className="drac-card p-4 border-drac-orange/30 animate-fade-in" style={{ animationDelay: "0.18s" }}>
              <p className="text-xs text-drac-comment font-medium uppercase tracking-wide">Avg. Progress</p>
              <p className="text-2xl font-heading font-bold text-drac-fg mt-1">{progressSummary.avgProgress}%</p>
            </div>
          </div>
        )}

        {/* Filters & Search Bar */}
        <div className="drac-card p-4 mb-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-drac-comment" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems or tags..."
                className="w-full pl-9 pr-4 py-2 bg-drac-bg border border-drac-comment/25 rounded-md text-drac-fg placeholder-drac-comment focus:outline-none focus:border-drac-purple focus:ring-1 focus:ring-drac-purple/30 transition-colors text-sm"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-drac-comment hidden lg:block" />
              <div className="flex gap-1">
                {DIFFICULTY_FILTERS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${difficultyFilter === d
                        ? d === "Easy"
                          ? "bg-drac-green/15 text-drac-green border border-drac-green/25"
                          : d === "Medium"
                            ? "bg-drac-orange/15 text-drac-orange border border-drac-orange/25"
                            : d === "Hard"
                              ? "bg-drac-red/15 text-drac-red border border-drac-red/25"
                              : "bg-drac-purple/15 text-drac-purple border border-drac-purple/25"
                        : "bg-drac-surface text-drac-comment border border-drac-comment/15 hover:border-drac-comment/30"
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === s
                      ? "bg-drac-purple/15 text-drac-purple border border-drac-purple/25"
                      : "bg-drac-surface text-drac-comment border border-drac-comment/15 hover:border-drac-comment/30"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-drac-comment hidden lg:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 bg-drac-surface border border-drac-comment/15 rounded-md text-xs text-drac-fg focus:outline-none focus:border-drac-purple cursor-pointer"
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
          <p className="text-sm text-drac-comment">
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
                  className="drac-card-hover p-5 animate-fade-in"
                  style={{ animationDelay: `${Math.min(idx * 0.03, 0.4)}s` }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Left: Problem Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${difficultyClass}`}>
                          {problem.difficulty}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${status.class}`}>
                          {status.text}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-drac-comment">
                          <Clock className="w-3 h-3" />
                          {problem.isCompleted
                            ? "Completed"
                            : `Next: ${new Date(problem.nextReviewDate).toLocaleDateString()}`}
                        </span>
                      </div>

                      <h3 className="text-base font-heading font-semibold text-drac-fg truncate mb-2">
                        {problem.title}
                      </h3>

                      {/* Topic Tags */}
                      {problem.topicTags && problem.topicTags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                          <Tag className="w-3 h-3 text-drac-comment" />
                          {problem.topicTags.slice(0, 5).map((tag, i) => (
                            <span key={i} className="tag-badge">
                              {tag}
                            </span>
                          ))}
                          {problem.topicTags.length > 5 && (
                            <span className="text-xs text-drac-comment">+{problem.topicTags.length - 5}</span>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-drac-surface rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-heading font-medium text-drac-comment w-10 text-right">
                          {progress}%
                        </span>
                      </div>

                      {/* Interval Steps */}
                      <div className="flex items-center gap-1 mt-2">
                        {INTERVAL_LABELS.map((label, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-colors ${i < problem.currentInterval || problem.isCompleted
                                ? "bg-drac-green"
                                : i === problem.currentInterval && !problem.isCompleted
                                  ? "bg-drac-cyan"
                                  : "bg-drac-surface"
                              }`}
                            title={label}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-drac-comment/50">Day 1</span>
                        <span className="text-[10px] text-drac-comment/50">Day 60</span>
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
          <div className="drac-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-lg bg-drac-purple/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-drac-purple" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-drac-fg mb-2">No problems found</h3>
            <p className="text-drac-comment text-sm max-w-sm mx-auto">
              {problems.length === 0
                ? "You haven't synced any problems yet. Go back to the dashboard and sync your LeetCode profile."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
