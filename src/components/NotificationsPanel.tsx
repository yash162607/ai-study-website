import React from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Gamepad2,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  onOpenAllNotifications: () => void;
  onNavigate: (tab: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onOpenAllNotifications,
  onNavigate,
  onMarkAllAsRead,
}) => {
  const getCategoryIcon = (cat: NotificationItem["category"]) => {
    switch (cat) {
      case "notes":
        return <BookOpen className="h-3.5 w-3.5 text-blue-600" />;
      case "exam":
        return <Calendar className="h-3.5 w-3.5 text-rose-600" />;
      case "assignment":
        return <Clock className="h-3.5 w-3.5 text-amber-600" />;
      case "quiz":
        return <Gamepad2 className="h-3.5 w-3.5 text-purple-600" />;
      case "announcement":
      default:
        return <Sparkles className="h-3.5 w-3.5 text-indigo-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      id="notifications-panel"
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Recent Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark Read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
          {notifications.slice(0, 4).map((notif) => (
            <div
              key={notif.id}
              onClick={() => notif.targetModal && onNavigate(notif.targetModal)}
              className={`cursor-pointer rounded-xl p-2.5 transition border ${
                !notif.read
                  ? "border-blue-100 bg-blue-50/40 hover:bg-blue-50/70"
                  : "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs border border-slate-100">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer "View All" Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onOpenAllNotifications}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
        >
          <span>All Notifications</span>
          <ArrowRight className="h-3 w-3" />
        </button>
        <span className="text-[10px] text-slate-400 font-medium">
          Semester Updates
        </span>
      </div>
    </div>
  );
};

