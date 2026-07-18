import { ExternalLink, CheckCircle2, Clock, Tag } from "lucide-react";

const INTERVAL_LABELS = ["Day 1", "Day 3", "Day 7", "Day 15", "Day 30", "Day 60"];

export default function ProblemCard({ problem, onComplete, completing }) {
  const difficultyClass =
    problem.difficulty === "Easy"
      ? "difficulty-easy"
      : problem.difficulty === "Medium"
      ? "difficulty-medium"
      : "difficulty-hard";

  const nextReview = new Date(problem.nextReviewDate);
  const isOverdue = nextReview < new Date();
  const intervalLabel = INTERVAL_LABELS[problem.currentInterval] || "Graduated";

  return (
    <div className="glass-card-hover p-5 animate-slide-up group" style={{ animationDelay: `${Math.random() * 0.2}s` }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Problem Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${difficultyClass}`}>
              {problem.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {intervalLabel}
            </span>
            {isOverdue && (
              <span className="px-2 py-0.5 text-xs font-medium text-lc-red-400 bg-lc-red-400/10 rounded-md animate-pulse">
                Overdue
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-gray-100 truncate mb-2 group-hover:text-white transition-colors">
            {problem.title}
          </h3>

          {/* Topic Tags */}
          {problem.topicTags && problem.topicTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-gray-500" />
              {problem.topicTags.slice(0, 4).map((tag, i) => (
                <span key={i} className="tag-badge">
                  {tag}
                </span>
              ))}
              {problem.topicTags.length > 4 && (
                <span className="text-xs text-gray-500">+{problem.topicTags.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Solve
          </a>
          <button
            onClick={() => onComplete(problem._id)}
            disabled={completing === problem._id}
            className="btn-success flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            {completing === problem._id ? "..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
