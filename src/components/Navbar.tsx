import React, { useState } from "react";
import {
  Bell,
  BookOpen,
  Sparkles,
  Gamepad2,
  CalendarCheck,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Flame,
  CheckCheck,
  GraduationCap,
} from "lucide-react";
import { StudentProfile, NotificationItem, AcademicYear } from "../types";

interface NavbarProps {
  profile: StudentProfile;
  notifications: NotificationItem[];
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
  onYearChange?: (year: AcademicYear) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  notifications,
  activeTab,
  onNavigate,
  onOpenProfile,
  onOpenNotifications,
  onLogout,
  onYearChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "notes", label: "Study Material" },
    { id: "ai", label: "AI Tools", isAI: true },
    { id: "quiz", label: "Quiz Zone" },
    { id: "planner", label: "Study Planner" },
    { id: "store", label: "Notes Store", isStore: true },
  ];

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 h-16 w-full border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-all"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        {/* Left: Brand Logo & Year Badge */}
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
                <span>S</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-blue-900">
                Study<span className="text-blue-600">Hub</span>
              </span>
            </button>

            {/* Academic Year Switcher Badge */}
            {onYearChange && (
              <div className="relative hidden sm:block">
                <button
                  id="academic-year-btn"
                  onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition"
                  title="Switch Academic Year"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  <span>{profile.year}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {yearDropdownOpen && (
                  <div
                    id="year-dropdown-menu"
                    className="absolute left-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in duration-100"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      College Year
                    </div>
                    {(["FY", "SY", "TY"] as AcademicYear[]).map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          onYearChange(y);
                          setYearDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                          profile.year === y
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>
                          {y === "FY"
                            ? "FY (First Year)"
                            : y === "SY"
                            ? "SY (Second Year)"
                            : "TY (Third Year)"}
                        </span>
                        {profile.year === y && (
                          <span className="rounded-full bg-blue-600 p-0.5 text-white">
                            <CheckCheck className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500 h-full">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              let style = "text-slate-500 hover:text-blue-600 transition";
              if (isActive) {
                style = "text-blue-600 border-b-2 border-blue-600 py-5 font-semibold";
              } else if (link.isStore) {
                style = "text-amber-600 hover:text-amber-700 font-medium transition";
              }

              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-1.5 focus:outline-none ${style}`}
                >
                  <span>{link.label}</span>
                  {link.isAI && (
                    <span className="rounded bg-blue-100 text-blue-700 px-1 py-0.2 text-[9px] font-bold">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Streak, Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Daily Streak */}
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200/60"
            title={`${profile.streakDays} Day Study Streak`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
            <span>{profile.streakDays}d Streak</span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 text-slate-400 hover:text-blue-600 transition cursor-pointer rounded-lg hover:bg-slate-50 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {notifDropdownOpen && (
              <div
                id="notification-dropdown-panel"
                className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in duration-100"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      onOpenNotifications();
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-2.5 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 3).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        if (notif.targetModal) onNavigate(notif.targetModal);
                      }}
                      className={`cursor-pointer rounded-xl p-2.5 text-left transition hover:bg-slate-50 border ${
                        !notif.read
                          ? "border-blue-100 bg-blue-50/40"
                          : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">
                        {notif.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      onOpenNotifications();
                    }}
                    className="w-full rounded-lg bg-slate-50 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Open Notification Center
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Avatar & Chip */}
          <button
            id="student-profile-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200 text-left focus:outline-none hover:opacity-90 transition"
            title="Open Student Profile"
          >
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {profile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {profile.year} - {profile.stream}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          <button
            onClick={onLogout}
            className="hidden rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:block"
            title="Log out"
          >
            Logout
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden shadow-lg animate-in slide-in-from-top-2 duration-150 absolute top-16 left-0 right-0 z-50"
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover border border-blue-200"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">{profile.name}</p>
                <p className="text-[10px] text-slate-500">
                  {profile.year} • {profile.college}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.isAI && (
                    <span
                      className={`text-[9px] px-1 rounded ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onLogout();
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

