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
    showToast("Loaded Demo Data!");
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
      <div className="min-h-screen mesh-gradient">
        <Navbar username={username} />
        <LoadingSpinner message="Loading your revision dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar username={username} onSync={handleSync} syncing={syncing} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up">
          <div
            className={`glass-card px-5 py-3 text-sm font-medium shadow-2xl ${
              toast.type === "error"
                ? "border-lc-red-400/30 text-lc-red-400"
                : "border-lc-green-400/30 text-lc-green-400"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
            Today's <span className="text-gradient">Revision</span>
          </h1>
          <p className="text-gray-400 mt-1">
            {problems.length > 0
              ? `You have ${problems.length} problem${problems.length !== 1 ? "s" : ""} to review today`
              : "You're all caught up!"}
          </p>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <div className="glass-card p-12 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-lc-green-500/10 flex items-center justify-center mx-auto mb-5">
                  <Inbox className="w-10 h-10 text-lc-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">All Clear! 🎉</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-6">
                  No problems due for review right now. Keep solving new problems on LeetCode,
                  and they'll appear here when it's time to revise.
                </p>
                <button 
                  onClick={loadMockData}
                  className="px-6 py-2 bg-lc-dark-600 hover:bg-lc-dark-500 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-lc-dark-400"
                >
                  Load Demo Data
                </button>
              </div>

            )}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-6">
            {stats && <StreakTracker streak={stats.streak} />}

            {/* Difficulty Breakdown */}
            {stats && (
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="text-sm font-medium text-gray-400 mb-4">Difficulty Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Easy", count: stats.difficulties.Easy, color: "bg-lc-green-400", total: stats.totalProblems },
                    { label: "Medium", count: stats.difficulties.Medium, color: "bg-lc-yellow-400", total: stats.totalProblems },
                    { label: "Hard", count: stats.difficulties.Hard, color: "bg-lc-red-400", total: stats.totalProblems },
                  ].map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{d.label}</span>
                        <span className="text-gray-500">{d.count}</span>
                      </div>
                      <div className="h-2 bg-lc-dark-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${d.color} rounded-full transition-all duration-700`}
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
              <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <p className="text-xs text-gray-500 text-center">
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
