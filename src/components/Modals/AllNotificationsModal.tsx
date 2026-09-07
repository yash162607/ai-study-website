import React, { useState } from "react";
import {
  X,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Gamepad2,
  CheckCheck,
  CheckCircle2,
} from "lucide-react";
import { NotificationItem } from "../../types";

interface AllNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNavigate: (tab: string) => void;
}

export const AllNotificationsModal: React.FC<AllNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<string>("all");

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.category === filter;
  });

  const getCategoryIcon = (cat: NotificationItem["category"]) => {
    switch (cat) {
      case "notes":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "exam":
        return <Calendar className="h-4 w-4 text-rose-600" />;
      case "assignment":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "quiz":
        return <Gamepad2 className="h-4 w-4 text-purple-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="all-notifications-modal-content"
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Academic Notifications
              </h2>
              <p className="text-xs text-slate-500">
                Official alerts, new note uploads & assignment schedules
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

        {/* Filter Categories */}
        <div className="flex items-center justify-between p-3 sm:px-6 border-b border-slate-100 bg-white overflow-x-auto gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: "Unread" },
              { id: "notes", label: "Notes" },
              { id: "exam", label: "Exams" },
              { id: "assignment", label: "Assignments" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  filter === f.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline shrink-0"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.targetModal) {
                  onClose();
                  onNavigate(item.targetModal);
                }
              }}
              className={`cursor-pointer rounded-xl border p-3.5 transition ${
                !item.read
                  ? "border-blue-200 bg-blue-50/40 hover:bg-blue-50/70"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs border border-slate-100">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
