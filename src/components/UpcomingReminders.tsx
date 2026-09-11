import React, { useState } from "react";
import {
  Calendar,
  Plus,
  BookOpen,
  FileCheck,
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { UpcomingItem } from "../types";

interface UpcomingRemindersProps {
  reminders: UpcomingItem[];
  onOpenPYQs: () => void;
  onOpenNotes: () => void;
  onAddReminder: (item: Omit<UpcomingItem, "id">) => void;
  onDeleteReminder: (id: string) => void;
  onEditReminder: (item: UpcomingItem) => void;
}

export const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({
  reminders,
  onOpenPYQs,
  onOpenNotes,
  onAddReminder,
  onDeleteReminder,
  onEditReminder,
}) => {
  const [activeType, setActiveType] = useState<"all" | "exam" | "assignment">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Sustainable Urban Development ( SUD)");
  const [newType, setNewType] = useState<"exam" | "assignment" | "project">("exam");
  const [newDueDate, setNewDueDate] = useState(() => new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10));

  const subjectOptions = [
    "Sustainable Urban Development ( SUD)",
    "Organizational Behaviour ( OB)",
    "Leadership",
    "Maths",
    "Accounts",
    "Unleash your potential",
    "Communication",
    "AI Powered Marketing",
    "Business Intelligence",
    "Financial & Risk Management",
    "Market Dynamics & Strategic Decision",
    "Family Business Management",
    "Power of Negotiation",
    "Digital Marketing",
    "Business Research Methodology",
    "Corporate Finance",
    "Data Visualization & Power BI",
    "Direct Tax",
    "On the Job Training",
    "Optimization Techniques (OR)",
    "Service Marketing",
  ];

  const filtered = reminders.filter((r) => {
    if (activeType === "exam") return r.type === "exam";
    if (activeType === "assignment") return r.type === "assignment" || r.type === "project";
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddReminder({
      title: newTitle.trim(),
      subject: newSubject,
      type: newType,
      daysLeft: Math.max(0, Math.ceil((new Date(`${newDueDate}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)),
      date: newDueDate,
      urgent: false,
    });
    setNewTitle("");
    setShowAddForm(false);
  };

  const getDaysBadge = (daysLeft: number) => {
    if (daysLeft <= 3) {
      return "bg-rose-50 text-rose-600 border border-rose-200/60";
    }
    if (daysLeft <= 10) {
      return "bg-amber-50 text-amber-600 border border-amber-200/60";
    }
    return "bg-slate-100 text-slate-600";
  };

  const getIndicatorColor = (type: string) => {
    if (type === "exam") return "bg-rose-500";
    if (type === "assignment") return "bg-blue-500";
    return "bg-purple-500";
  };

  return (
    <div
      id="upcoming-card"
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Next 14 Days</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            title="Add Reminder"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-3">
        <button
          onClick={() => setActiveType("all")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            activeType === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveType("exam")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            activeType === "exam"
              ? "bg-slate-900 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          Exams
        </button>
        <button
          onClick={() => setActiveType("assignment")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            activeType === "assignment"
              ? "bg-slate-900 text-white"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          Assignments
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="mb-3 rounded-xl border border-rose-200 bg-rose-50/40 p-3 text-xs space-y-2 animate-in fade-in duration-150"
        >
          <input
            type="text"
            placeholder="Event name (e.g. Accounts Mock Test)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
            >
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
            >
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
            </select>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
              placeholder="Days left"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-3 py-1 font-bold text-white hover:bg-rose-700"
            >
              Add Reminder
            </button>
          </div>
        </form>
      )}

      {/* Reminder items */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
          No deadlines added yet. Add your exams and assignments here.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-1.5 h-8 rounded-full shrink-0 ${getIndicatorColor(
                    item.type
                  )}`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.subject} • {new Date(`${item.date}T00:00:00`).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${getDaysBadge(item.daysLeft)}`}>
                  {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"} left
                </span>
                <button onClick={() => onEditReminder(item)} className="p-1 text-slate-400 hover:text-blue-600" title="Edit deadline"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => onDeleteReminder(item.id)} className="p-1 text-slate-400 hover:text-rose-600" title="Delete deadline"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={onOpenPYQs}
          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline text-[11px]"
        >
          <span>Practice PYQs for Exams</span>
          <ArrowRight className="h-3 w-3" />
        </button>
        <span className="text-[10px] font-semibold text-slate-400">
          Auto-Synced
        </span>
      </div>
    </div>
  );
};

