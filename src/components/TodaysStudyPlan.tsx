import React, { useEffect, useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  ListTodo,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AcademicYear, StudyTask } from "../types";

interface TodaysStudyPlanProps {
  tasks: StudyTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (
    title: string,
    subject: string,
    priority: "high" | "medium" | "low",
    year: AcademicYear,
    dueDate?: string,
    dueTime?: string
  ) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenFullPlanner: () => void;
  currentYear: AcademicYear;
  availableSubjectsByYear: Record<AcademicYear, string[]>;
}

export const TodaysStudyPlan: React.FC<TodaysStudyPlanProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenFullPlanner,
  currentYear,
  availableSubjectsByYear,
}) => {
  type TaskRow = {
    year: AcademicYear;
    subject: string;
    date: string;
    time: string;
    priority: "high" | "medium" | "low";
  };

  const hours = Array.from({ length: 12 }, (_, index) => String(index + 1));
  const minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
  const meridiems = ["AM", "PM"];

  const parseTimeValue = (timeValue: string) => {
    const match = timeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      return {
        hour: match[1],
        minute: match[2],
        meridiem: match[3].toUpperCase(),
      };
    }

    return {
      hour: "9",
      minute: "00",
      meridiem: "AM",
    };
  };

  const buildTimeValue = (hour: string, minute: string, meridiem: string) => `${hour}:${minute} ${meridiem}`;

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    {
      year: currentYear,
      subject: availableSubjectsByYear[currentYear][0] || "",
      date: "",
      time: "9:00 AM",
      priority: "high",
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    setTaskRows((prev) =>
      prev.map((row) => {
        const nextSubjects = availableSubjectsByYear[row.year] || [];
        if (!nextSubjects.length) {
          return { ...row, subject: "" };
        }

        return {
          ...row,
          subject: nextSubjects.includes(row.subject) ? row.subject : nextSubjects[0],
        };
      })
    );
  }, [availableSubjectsByYear]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const addTaskRow = () => {
    setTaskRows((prev) => [
      ...prev,
      {
        year: currentYear,
        subject: availableSubjectsByYear[currentYear][0] || "",
        date: "",
        time: "9:00 AM",
        priority: "medium",
      },
    ]);
  };

  const removeTaskRow = (index: number) => {
    setTaskRows((prev) => (prev.length > 1 ? prev.filter((_, rowIndex) => rowIndex !== index) : prev));
  };

  const updateTaskRow = (index: number, field: keyof TaskRow, value: string) => {
    setTaskRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const updateTaskTime = (index: number, hour: string, minute: string, meridiem: string) => {
    setTaskRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, time: buildTimeValue(hour, minute, meridiem) } : row
      )
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const validRows = taskRows.filter((row) => row.subject.trim());
    if (!validRows.length) return;

    validRows.forEach((row) => {
      onAddTask(newTaskTitle.trim(), row.subject, row.priority, row.year, row.date, row.time);
    });

    setNewTaskTitle("");
    setTaskRows([
      {
        year: currentYear,
        subject: availableSubjectsByYear[currentYear][0] || "",
        date: "",
        time: "",
        priority: "high",
      },
    ]);
    setIsAdding(false);
  };

  return (
    <div
      id="todays-study-plan-card"
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold text-slate-900">Today's Study Plan</h2>
          <span className="text-xs text-slate-400 font-medium">
            {completedCount}/{totalCount} Completed
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-1 text-xs mb-3">
          <div className="flex items-center gap-1.5">
            {(["all", "pending", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                  filter === f
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenFullPlanner}
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Planner →
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
            No study tasks yet. Add your first task to build today&apos;s plan.
          </div>
        ) : null}

        {/* Inline Add Task Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateTask}
            className="mb-3 rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2 animate-in fade-in duration-150"
          >
            <input
              type="text"
              placeholder="e.g. Solve 15 numericals on Valuation..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <div className="space-y-2">
              {taskRows.map((row, index) => (
                <div key={`${row.year}-${index}`} className="flex flex-wrap items-center gap-2">
                  <select
                    value={row.year}
                    onChange={(e) => updateTaskRow(index, "year", e.target.value as AcademicYear)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                  >
                    {(["FY", "SY", "TY"] as AcademicYear[]).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={row.subject}
                    onChange={(e) => updateTaskRow(index, "subject", e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                    disabled={!availableSubjectsByYear[row.year]?.length}
                  >
                    {(availableSubjectsByYear[row.year] || []).map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateTaskRow(index, "date", e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                  />

                  {(() => {
                    const timeParts = parseTimeValue(row.time);
                    return (
                      <>
                        <select
                          value={timeParts.hour}
                          onChange={(e) => updateTaskTime(index, e.target.value, timeParts.minute, timeParts.meridiem)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                        >
                          {hours.map((hour) => (
                            <option key={hour} value={hour}>{hour}</option>
                          ))}
                        </select>

                        <select
                          value={timeParts.minute}
                          onChange={(e) => updateTaskTime(index, timeParts.hour, e.target.value, timeParts.meridiem)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                        >
                          {minutes.map((minute) => (
                            <option key={minute} value={minute}>{minute}</option>
                          ))}
                        </select>

                        <select
                          value={timeParts.meridiem}
                          onChange={(e) => updateTaskTime(index, timeParts.hour, timeParts.minute, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                        >
                          {meridiems.map((meridiem) => (
                            <option key={meridiem} value={meridiem}>{meridiem}</option>
                          ))}
                        </select>
                      </>
                    );
                  })()}

                  <select
                    value={row.priority}
                    onChange={(e) => updateTaskRow(index, "priority", e.target.value as "high" | "medium" | "low")}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeTaskRow(index)}
                    className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition"
                    aria-label="Delete subject row"
                    title="Delete subject"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={addTaskRow}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Subject
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Save Task
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Task Items List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-400 mb-1.5 opacity-80" />
              <p className="font-semibold text-slate-700">No tasks in this view</p>
              <p className="text-[11px]">You're caught up or ready to plan ahead!</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition ${
                  task.completed
                    ? "border-slate-100 bg-slate-50/60 opacity-75"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                {/* Geometric Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 transition ${
                    task.completed
                      ? "border border-blue-600 bg-blue-600 text-white"
                      : "border border-slate-300 hover:border-blue-600 bg-white"
                  }`}
                  aria-label="Toggle task"
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold leading-snug truncate ${
                      task.completed
                        ? "line-through text-slate-400"
                        : "text-slate-800"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>{task.subject}</span>
                    {task.year && <span>• {task.year}</span>}
                    {task.dueDate && <span>• {task.dueDate}</span>}
                    {task.dueTime && <span>• {task.dueTime}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      task.priority === "high"
                        ? "bg-amber-50 text-amber-600"
                        : task.priority === "medium"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.priority === "high" ? "Priority" : task.priority}
                  </span>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-600 transition p-1"
                    title="Delete task"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer trigger to add task */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Study Task</span>
        </button>

        <span className="text-[10px] text-slate-400">
          Daily goal auto-sync
        </span>
      </div>
    </div>
  );
};

