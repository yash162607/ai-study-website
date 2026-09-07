import React, { useState } from "react";
import {
  X,
  Trophy,
  Crown,
  Medal,
  Flame,
  Search,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { LeaderboardUser, AcademicYear } from "../../types";

interface FullLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: LeaderboardUser[];
  onStartQuiz: () => void;
}

export const FullLeaderboardModal: React.FC<FullLeaderboardModalProps> = ({
  isOpen,
  onClose,
  users,
  onStartQuiz,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<AcademicYear | "all">("all");

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === "all" || u.year === yearFilter;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="full-leaderboard-modal-content"
        className="relative flex flex-col w-full max-w-2xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Full College Quiz Leaderboard
              </h2>
              <p className="text-xs text-slate-500">
                Top performers across FY, SY, and TY semester tracks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search classmates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            {(["all", "FY", "SY", "TY"] as const).map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  yearFilter === y
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {y === "all" ? "All" : y}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-2.5">
          {filteredUsers.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                user.isCurrentUser
                  ? "bg-blue-50/80 border-blue-300 shadow-2xs"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                    user.rank === 1
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : user.rank === 2
                      ? "bg-slate-200 text-slate-800"
                      : user.rank === 3
                      ? "bg-amber-200/60 text-amber-950"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  #{user.rank}
                </span>

                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {user.name}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                      {user.year}
                    </span>
                  </div>
                  {user.badge && (
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {user.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-sm font-extrabold text-slate-900">
                  {user.points} pts
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-700">
                  <Flame className="h-3 w-3 fill-amber-400 text-amber-500" />
                  {user.streak}d streak
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs">
          <span className="text-slate-500">Points reset every Sunday at midnight</span>
          <button
            onClick={() => {
              onClose();
              onStartQuiz();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400 transition"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Play Quiz to Earn Points</span>
          </button>
        </div>
      </div>
    </div>
  );
};
