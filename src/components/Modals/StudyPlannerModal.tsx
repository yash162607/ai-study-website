import React, { useEffect, useState } from "react";
import {
  X,
  CalendarCheck,
  Clock,
  Plus,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  BookOpen,
  Trash2,
} from "lucide-react";
import { AcademicYear, StudyTask } from "../../types";

interface StudyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: StudyTask[];
  onAddTask: (
    title: string,
    subject: string,
    priority: "high" | "medium" | "low",
    year: AcademicYear,
    dueDate?: string,
    dueTime?: string
  ) => void;
  onToggleTask: (taskId: string) => void;
  currentYear: AcademicYear;
  availableSubjectsByYear: Record<AcademicYear, string[]>;
}

export const StudyPlannerModal: React.FC<StudyPlannerModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onToggleTask,
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

  const [selectedDay, setSelectedDay] = useState<string>("Today");
  const [newTitle, setNewTitle] = useState("");
  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    {
      year: currentYear,
      subject: availableSubjectsByYear[currentYear][0] || "",
      date: "",
      time: "9:00 AM",
      priority: "medium",
    },
  ]);

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

  if (!isOpen) return null;

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  weekStart.setDate(weekStart.getDate() + diffToMonday);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
      full: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dateObj: date,
    };
  });

  const scheduledDates = new Set(
    tasks
      .filter((task) => task.dueDate)
      .map((task) => new Date(`${task.dueDate}T00:00:00`).toISOString().slice(0, 10))
  );

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const validRows = taskRows.filter((row) => row.subject.trim());
    if (!validRows.length) return;

    validRows.forEach((row) => {
      onAddTask(newTitle.trim(), row.subject, row.priority, row.year, row.date, row.time);
    });

    setNewTitle("");
    setTaskRows([
      {
        year: currentYear,
        subject: availableSubjectsByYear[currentYear][0] || "",
        date: "",
        time: "",
        priority: "medium",
      },
    ]);
  };

  const selectedDayDate = days.find((dayItem) => dayItem.full === selectedDay)?.key || new Date().toISOString().slice(0, 10);
  const scheduleSlots = tasks
    .filter((task) => {
      if (!task.dueDate) return false;
      const currentDate = new Date(`${task.dueDate}T00:00:00`).toISOString().slice(0, 10);
      return currentDate === selectedDayDate;
    })
    .sort((a, b) => {
      const aTime = a.dueTime || "23:59";
      const bTime = b.dueTime || "23:59";
      return aTime.localeCompare(bTime);
    })
    .map((task) => ({
      time: task.dueTime ? task.dueTime : "Flexible timing",
      subject: task.subject,
      task: task.title,
      color: task.priority === "high" ? "border-red-500 bg-red-50/60" : task.priority === "medium" ? "border-amber-500 bg-amber-50/60" : "border-emerald-500 bg-emerald-50/60",
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="study-planner-modal-content"
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Semester Study Planner & Weekly Timetable
              </h2>
              <p className="text-xs text-slate-500">
                Organize daily focus hours and track syllabus prep
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

        {/* Days Bar */}
        <div className="flex items-center justify-between gap-1 p-3 sm:px-6 border-b border-slate-100 bg-white overflow-x-auto">
          {days.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.full)}
              className={`flex flex-col items-center min-w-[70px] py-2 px-3 rounded-xl border transition ${
                selectedDay === d.full
                  ? "bg-sky-600 text-white shadow-sm font-bold border-sky-600"
                  : scheduledDates.has(d.key)
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-transparent"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider">
                {d.label}
              </span>
              <span className="text-xs font-bold mt-0.5">{d.date}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40 space-y-6">
          {/* Quick Schedule Overview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Study Timetable for {selectedDay}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {scheduleSlots.length} task{scheduleSlots.length === 1 ? "" : "s"} scheduled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheduleSlots.length > 0 ? (
                scheduleSlots.map((slot, i) => (
                  <div
                    key={`${slot.subject}-${slot.time}-${i}`}
                    className={`rounded-xl border-l-4 p-3.5 bg-white border border-slate-200 shadow-2xs ${slot.color}`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{slot.subject}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Clock className="h-3 w-3" />
                        {slot.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 font-medium">
                      {slot.task}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                  No study tasks scheduled for this day yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Add Plan Form */}
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Add New Study Task / Target
            </h4>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Task title (e.g., Solve 5 numerical problems on Leverages)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              {taskRows.map((row, index) => (
                <div key={`${row.year}-${index}`} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                  <select
                    value={row.year}
                    onChange={(e) => updateTaskRow(index, "year", e.target.value as AcademicYear)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                  >
                    {(["FY", "SY", "TY"] as AcademicYear[]).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={row.subject}
                    onChange={(e) => updateTaskRow(index, "subject", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                  />

                  {(() => {
                    const timeParts = parseTimeValue(row.time);
                    return (
                      <>
                        <select
                          value={timeParts.hour}
                          onChange={(e) => updateTaskTime(index, e.target.value, timeParts.minute, timeParts.meridiem)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                        >
                          {hours.map((hour) => (
                            <option key={hour} value={hour}>{hour}</option>
                          ))}
                        </select>

                        <select
                          value={timeParts.minute}
                          onChange={(e) => updateTaskTime(index, timeParts.hour, e.target.value, timeParts.meridiem)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                        >
                          {minutes.map((minute) => (
                            <option key={minute} value={minute}>{minute}</option>
                          ))}
                        </select>

                        <select
                          value={timeParts.meridiem}
                          onChange={(e) => updateTaskTime(index, timeParts.hour, timeParts.minute, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeTaskRow(index)}
                    className="w-full rounded-xl border border-rose-200 bg-rose-50 px-2 py-1.5 text-rose-600 hover:bg-rose-100 transition"
                    aria-label="Delete subject row"
                    title="Delete subject"
                  >
                    <Trash2 className="h-3.5 w-3.5 mx-auto" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={addTaskRow}
                  className="inline-flex items-center gap-1 rounded-xl border border-dashed border-sky-300 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Subject
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Active Study Plan Checklist
            </h4>
            <div className="space-y-2">
              {tasks
                .filter((task) => {
                  if (!task.dueDate) return true;
                  const taskDate = new Date(`${task.dueDate}T00:00:00`);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return taskDate >= today;
                })
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className="cursor-pointer flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-white hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          task.completed ? "text-sky-600" : "text-slate-300"
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          task.completed
                            ? "line-through text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">
                      {task.subject}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Synced with your semester exam countdowns</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close Planner
          </button>
        </div>
      </div>
    </div>
  );
};
