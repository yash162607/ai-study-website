import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  Target,
  ArrowRight,
  Plus,
  Minus,
  Hourglass,
} from "lucide-react";
import { StudentProfile, UpcomingItem } from "../types";

interface WelcomeSectionProps {
  profile: StudentProfile;
  hasStudySettings?: boolean;
  upcomingReminders?: UpcomingItem[];
  onOpenUpcoming?: () => void;
  onOpenPlanner: () => void;
  onLogStudyTime?: (hours: number) => void;
  onAddStudiedTime?: (delta: number) => void;
}

const getGreeting = (date: Date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  profile,
  hasStudySettings = true,
  upcomingReminders = [],
  onOpenUpcoming,
  onOpenPlanner,
  onLogStudyTime,
  onAddStudiedTime,
}) => {
  const [greeting, setGreeting] = useState(() => getGreeting(new Date()));

  useEffect(() => {
    const refreshGreeting = () => setGreeting(getGreeting(new Date()));
    const intervalId = window.setInterval(refreshGreeting, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Find the closest upcoming exam
  const examItems = upcomingReminders
    .filter((item) => item.type === "exam")
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const nextExam = profile.nextExamDays !== undefined
    ? { daysLeft: profile.nextExamDays }
    : examItems[0];

  const goalPercentage = Math.min(
    100,
    profile.dailyGoalHours > 0
      ? Math.round((profile.studiedHoursToday / profile.dailyGoalHours) * 100)
      : 0
  );

  const handleAddDelta = (delta: number) => {
    if (onAddStudiedTime) {
      onAddStudiedTime(delta);
    } else if (onLogStudyTime) {
      onLogStudyTime(delta);
    }
  };

  return (
    <section
      id="welcome-section"
      className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg relative overflow-hidden transition-all"
    >
      {/* Ambient Geometric Background Elements */}
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-4 top-4 opacity-15 pointer-events-none hidden sm:block">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="z-10 relative max-w-xl">
        <h1 id="welcome-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {greeting}, {profile.name} 👋
        </h1>
        <p className="text-blue-100 text-sm mt-1 mb-4 leading-relaxed">
          Ready to make progress today? Track your units, solve PYQs, and prepare with AI.
        </p>

        {/* Geometric Meta Chips */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <div className="bg-blue-500/40 rounded-lg px-3 py-2 border border-blue-400/30 backdrop-blur-xs">
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">
              Current Sem
            </p>
            <p className="text-xs font-bold text-white">
              {hasStudySettings ? `Semester ${profile.semester} (${profile.year})` : ""}
            </p>
          </div>

          <div
            onClick={onOpenUpcoming}
            className="bg-blue-500/40 rounded-lg px-3 py-2 border border-blue-400/30 backdrop-blur-xs cursor-pointer hover:bg-blue-500/60 transition"
          >
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">
              Next Exam
            </p>
            <p className="text-xs font-bold text-white">
              {hasStudySettings && nextExam ? `${nextExam.daysLeft} Days Left` : ""}
            </p>
          </div>

          <div className="bg-blue-500/40 rounded-lg px-3 py-2 border border-blue-400/30 backdrop-blur-xs flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">
              Daily Study Goal
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {hasStudySettings ? `${profile.studiedHoursToday}/${profile.dailyGoalHours}h (${goalPercentage}%)` : ""}
              </span>
              <div className="flex items-center gap-1">
                {hasStudySettings && <button
                  onClick={() => handleAddDelta(0.5)}
                  className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded transition"
                  title="Add 30m"
                >
                  +30m
                </button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Quick Action Trigger */}
      <div className="z-10 relative mt-4 md:mt-0 flex md:flex-col items-center md:items-end gap-2 w-full md:w-auto">
        <button
          onClick={onOpenPlanner}
          className="w-full md:w-auto px-4 py-2 bg-white text-blue-900 text-xs font-bold rounded-xl shadow-sm hover:bg-blue-50 transition flex items-center justify-center gap-1.5"
        >
          <span>Open Study Planner</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
};

