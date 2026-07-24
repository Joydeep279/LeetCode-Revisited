import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, CalendarClock, CheckCheck, Clock, Inbox } from "lucide-react";
import Navbar from "../components/Navbar";
import ProblemCard from "../components/ProblemCard";
import StatsCard from "../components/StatsCard";
import StreakTracker from "../components/StreakTracker";
import LoadingSpinner from "../components/LoadingSpinner";
import { getDueProblems, markProblemComplete, getStats, syncProblems } from "../api/api";

export default function DashboardPage() {
  const { username } = useParams();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [dueData, statsData] = await Promise.all([
        getDueProblems(username),
        getStats(username),
      ]);
      setProblems(dueData.problems);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComplete = async (problemId) => {
    // Demo mode handler
    if (problemId.toString().startsWith("mock")) {
      setCompleting(problemId);
      setTimeout(() => {
        showToast("Problem reviewed successfully! (Demo Mode)");
        setProblems((prev) => prev.filter((p) => p._id !== problemId));
        setStats((prev) => ({
          ...prev,
          dueToday: Math.max(0, prev.dueToday - 1),
          totalReviewsMade: prev.totalReviewsMade + 1,
        }));
        setCompleting(null);
      }, 600);
      return;
    }

    setCompleting(problemId);
    try {
      const result = await markProblemComplete(problemId);
      showToast(result.message);
      // Remove completed problem from the list & refresh stats
      setProblems((prev) => prev.filter((p) => p._id !== problemId));
      const statsData = await getStats(username);
      setStats(statsData);
    } catch (err) {
      showToast("Failed to mark as complete", "error");
    } finally {
      setCompleting(null);
    }
  };

  const loadMockData = () => {
    setProblems([
      {
        _id: "mock1",
        title: "Two Sum",
        difficulty: "Easy",
        nextReviewDate: new Date().toISOString(),
        currentInterval: 0,
        topicTags: ["Array", "Hash Table"],
        leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      },
      {
        _id: "mock2",
        title: "LRU Cache",
        difficulty: "Medium",
        nextReviewDate: new Date(Date.now() - 86400000).toISOString(),
        currentInterval: 2,
        topicTags: ["Hash Table", "Linked List", "Design"],
        leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
      },
      {
        _id: "mock3",
        title: "Merge k Sorted Lists",
        difficulty: "Hard",
        nextReviewDate: new Date(Date.now() - 172800000).toISOString(),
        currentInterval: 3,
        topicTags: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
        leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
      }
    ]);
    
    setStats({
      totalProblems: 15,
      dueToday: 3,
      totalReviewsMade: 42,
      upcoming: 5,
      streak: 7,
      difficulties: { Easy: 5, Medium: 8, Hard: 2 },
      lastSyncedAt: new Date().toISOString(),
    });
    showToast("Loaded demo data");
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncProblems(username);
      showToast(`Sync complete! ${result.newProblemsCount} new problems found.`);
      await fetchData();
    } catch (err) {
      showToast("Sync failed. Please try again.", "error");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-drac-bg">
        <Navbar username={username} />
        <LoadingSpinner message="Loading your revision dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-drac-bg">
      <Navbar username={username} onSync={handleSync} syncing={syncing} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 animate-slide-up">
          <div
            className={`drac-card px-4 py-2.5 text-sm font-medium shadow-lg ${
              toast.type === "error"
                ? "border-drac-red/40 text-drac-red"
                : "border-drac-green/40 text-drac-green"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-drac-fg">
            Today's <span className="text-drac-pink">revision</span>
          </h1>
          <p className="text-drac-comment mt-1 text-sm">
            {problems.length > 0
              ? `${problems.length} problem${problems.length !== 1 ? "s" : ""} due for review`
              : "You're all caught up."}
          </p>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatsCard
              icon={BookOpen}
              label="Total Problems"
              value={stats.totalProblems}
              color="purple"
              delay={0}
            />
            <StatsCard
              icon={CalendarClock}
              label="Due Today"
              value={stats.dueToday}
              color="yellow"
              delay={1}
            />
            <StatsCard
              icon={CheckCheck}
              label="Reviews Done"
              value={stats.totalReviewsMade}
              color="green"
              delay={2}
            />
            <StatsCard
              icon={Clock}
              label="Upcoming (7d)"
              value={stats.upcoming}
              color="blue"
              delay={3}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem List — 2/3 width */}
          <div className="lg:col-span-2">
            {problems.length > 0 ? (
              <div className="space-y-3">
                {problems.map((problem) => (
                  <ProblemCard
                    key={problem._id}
                    problem={problem}
                    onComplete={handleComplete}
                    completing={completing}
                  />
                ))}
              </div>
            ) : (
              <div className="drac-card p-12 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-lg bg-drac-green/10 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-drac-green" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-drac-fg mb-2">All clear</h3>
                <p className="text-drac-comment text-sm max-w-sm mx-auto mb-5">
                  No problems due right now. Keep solving on LeetCode — they'll
                  show up here when it's time to revise.
                </p>
                <button 
                  onClick={loadMockData}
                  className="px-5 py-2 bg-drac-surface hover:bg-drac-subtle text-drac-fg rounded-md text-sm font-medium transition-colors border border-drac-comment/20"
                >
                  Load demo data
                </button>
              </div>
            )}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-4">
            {stats && <StreakTracker streak={stats.streak} />}

            {/* Difficulty Breakdown */}
            {stats && (
              <div className="drac-card p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <h3 className="text-xs text-drac-comment font-medium uppercase tracking-wide mb-4">Difficulty Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Easy", count: stats.difficulties.Easy, color: "bg-drac-green", total: stats.totalProblems },
                    { label: "Medium", count: stats.difficulties.Medium, color: "bg-drac-orange", total: stats.totalProblems },
                    { label: "Hard", count: stats.difficulties.Hard, color: "bg-drac-red", total: stats.totalProblems },
                  ].map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-drac-fg text-sm">{d.label}</span>
                        <span className="text-drac-comment text-sm">{d.count}</span>
                      </div>
                      <div className="h-1.5 bg-drac-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full ${d.color} rounded-full transition-all duration-500`}
                          style={{ width: `${d.total > 0 ? (d.count / d.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Synced */}
            {stats?.lastSyncedAt && (
              <div className="drac-card p-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <p className="text-xs text-drac-comment text-center">
                  Last synced: {new Date(stats.lastSyncedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
