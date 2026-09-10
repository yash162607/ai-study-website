import React from "react";
import { Plus, ArrowRight, Sparkles } from "lucide-react";
import { SubjectProgress } from "../types";

interface StudyProgressSectionProps {
  subjects: SubjectProgress[];
  onSelectSubject?: (subjectName: string) => void;
  onOpenNotes?: () => void;
  onOpenAddSubject?: () => void;
  onAskAIDoubt?: (subject: string) => void;
}

export const StudyProgressSection: React.FC<StudyProgressSectionProps> = ({
  subjects,
  onSelectSubject,
  onOpenNotes,
  onOpenAddSubject,
  onAskAIDoubt,
}) => {
  // Calculate average progress percentage
  const totalPercentage = subjects.reduce(
    (acc, sub) => acc + sub.progressPercentage,
    0
  );
  const overallPercentage = Math.round(
    subjects.length > 0 ? totalPercentage / subjects.length : 0
  );

  const getBarColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500"];
    return colors[index % colors.length];
  };

  return (
    <div
      id="study-progress-section"
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
    >
      {/* Header matching Geometric Balance */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          My Study Progress
        </h2>
        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold">
          {overallPercentage}% Overall
        </span>
      </div>

      {/* Progress Bars List */}
      {subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
          No study progress yet. Add your subjects and track them here.
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((sub, index) => {
            const barColor = getBarColor(index);
            return (
              <div
                key={sub.id}
                onClick={() => {
                  if (onSelectSubject) onSelectSubject(sub.name);
                  else if (onOpenNotes) onOpenNotes();
                }}
                className="cursor-pointer group"
              >
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-slate-700 font-semibold group-hover:text-blue-600 transition truncate">
                    {sub.name}
                  </span>
                  <span className="font-bold text-slate-900 ml-2">
                    {sub.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${sub.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>{sub.unitsCompleted}/{sub.totalUnits} Units</span>
                  {sub.nextExamDays ? (
                    <span>Exam in {sub.nextExamDays}d</span>
                  ) : (
                    <span>Exam in 12d</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={onOpenNotes}
          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <span>Explore Study Materials</span>
          <ArrowRight className="h-3 w-3" />
        </button>
        {onOpenAddSubject && (
          <button
            onClick={onOpenAddSubject}
            className="text-[10px] font-semibold text-slate-400 hover:text-slate-600"
          >
            + Customize
          </button>
        )}
      </div>
    </div>
  );
};

