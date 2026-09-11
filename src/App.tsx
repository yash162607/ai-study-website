import React, { useEffect, useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { AdminDashboard } from "./components/AdminDashboard";
import { Navbar } from "./components/Navbar";
import { WelcomeSection } from "./components/WelcomeSection";
import { QuickAccessGrid } from "./components/QuickAccessGrid";
import { StudyProgressSection } from "./components/StudyProgressSection";
import { TodaysStudyPlan } from "./components/TodaysStudyPlan";
import { UpcomingReminders } from "./components/UpcomingReminders";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { QuizLeaderboard } from "./components/QuizLeaderboard";
import { MobileNav } from "./components/MobileNav";

// Modals
import { NotesModal } from "./components/Modals/NotesModal";
import { PYQModal } from "./components/Modals/PYQModal";
import { AIModal } from "./components/Modals/AIModal";
import { QuizZoneModal } from "./components/Modals/QuizZoneModal";
import { StudyPlannerModal } from "./components/Modals/StudyPlannerModal";
import { NotesStoreModal } from "./components/Modals/NotesStoreModal";
import { ProfileModal } from "./components/Modals/ProfileModal";
import { FullLeaderboardModal } from "./components/Modals/FullLeaderboardModal";
import { AllNotificationsModal } from "./components/Modals/AllNotificationsModal";

// Data
import {
  initialStudentProfile,
  leaderboardData,
  sampleNotesList,
  samplePYQPapers,
  sampleStoreItems,
  sampleQuizBank,
} from "./data/mockData";
import {
  StudentProfile,
  SubjectProgress,
  StudyTask,
  UpcomingItem,
  NotificationItem,
  LeaderboardUser,
  QuizAttempt,
  AuthUser,
} from "./types";

function mapTaskRecord(record: any, year: AuthUser["year"]): StudyTask {
  return { id: record.id, title: record.title, subject: record.subject, year, priority: record.priority, completed: record.completed, dueDate: record.date, dueTime: record.time };
}

function mapDeadlineRecord(record: any): UpcomingItem {
  return { id: record.id, title: record.title, subject: record.subject, type: record.type, daysLeft: record.daysLeft, date: record.dueDate, urgent: record.daysLeft <= 3 };
}

function mapNotificationRecord(record: any): NotificationItem {
  return { id: record.id, title: record.title, description: record.message, time: record.createdAt, category: record.type, read: record.isRead };
}

function mapQuizRecord(record: any): QuizAttempt {
  return { id: record.id, subject: record.subject, score: record.correctAnswers, totalQuestions: record.totalQuestions, points: Math.round(record.score), completedAt: record.completedAt };
}

function StudyDashboard({ authUser, onLogout, isNewUser }: { authUser: AuthUser; onLogout: () => void; isNewUser: boolean }) {
  // Primary Application State
  const [profile, setProfile] = useState<StudentProfile>(initialStudentProfile);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [reminders, setReminders] = useState<UpcomingItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load dashboard");
        return response.json();
      })
      .then((data) => {
        setSubjects(Array.isArray(data.progress) ? data.progress : []);
        setTasks(Array.isArray(data.allTasks) ? data.allTasks.map((task: any) => mapTaskRecord(task, authUser.year)) : []);
        setReminders(Array.isArray(data.upcomingDeadlines) ? data.upcomingDeadlines.map(mapDeadlineRecord) : []);
        setNotifications(Array.isArray(data.notifications) ? data.notifications.map(mapNotificationRecord) : []);
        setQuizAttempts(Array.isArray(data.quizHistory) ? data.quizHistory.map(mapQuizRecord) : []);
        setProfile((current) => ({ ...current, studiedHoursToday: (data.studyHistory || []).filter((session: any) => session.startedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((total: number, session: any) => total + session.durationMinutes / 60, 0) }));
      })
      .catch(() => undefined);
  }, [authUser.year]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(leaderboardData);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [notes, setNotes] = useState(sampleNotesList);
  const [papers, setPapers] = useState(samplePYQPapers);

  useEffect(() => {
    let savedSettings: Partial<StudentProfile> = {};
    const savedSettingsJson = localStorage.getItem(`studyhub_settings_${authUser.id}`);
    if (savedSettingsJson) {
      try {
        savedSettings = JSON.parse(savedSettingsJson);
      } catch {
        localStorage.removeItem(`studyhub_settings_${authUser.id}`);
      }
    }
    setProfile((current) => ({
      ...current,
      ...savedSettings,
      name: authUser.fullName,
      college: authUser.college,
      year: authUser.year,
      stream: authUser.course,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.fullName)}&background=dbeafe&color=1d4ed8`,
    }));
  }, [authUser]);

  useEffect(() => {
    Promise.all([
      fetch("/api/notes").then((response) => {
        if (!response.ok) throw new Error("Failed to load notes");
        return response.json();
      }),
      fetch("/api/pyqs").then((response) => {
        if (!response.ok) throw new Error("Failed to load question papers");
        return response.json();
      }),
    ]).then(([storedNotes, storedPapers]) => {
      if (Array.isArray(storedNotes)) setNotes(storedNotes);
      if (Array.isArray(storedPapers) && storedPapers.length > 0) setPapers(storedPapers);
    }).catch(() => undefined);
  }, []);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>("home");

  // Modals visibility state
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isPYQOpen, setIsPYQOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialTab, setAiInitialTab] = useState<"ask" | "summarize" | "quiz">("ask");
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>("");
  const [isQuizZoneOpen, setIsQuizZoneOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAllNotificationsOpen, setIsAllNotificationsOpen] = useState(false);

  // Navigation dispatcher
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "notes":
        setIsNotesOpen(true);
        break;
      case "pyq":
        setIsPYQOpen(true);
        break;
      case "ai":
        setAiInitialTab("ask");
        setAiInitialPrompt("");
        setIsAIOpen(true);
        break;
      case "quiz":
        setIsQuizZoneOpen(true);
        break;
      case "planner":
        setIsPlannerOpen(true);
        break;
      case "store":
        setIsStoreOpen(true);
        break;
      case "notifications":
        setIsAllNotificationsOpen(true);
        break;
      case "profile":
        setIsProfileOpen(true);
        break;
      case "home":
      default:
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
    }
  };

  const handleYearChange = (year: AuthUser["year"]) => {
    setProfile((current) => ({ ...current, year }));
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: profile.name,
        mobile: authUser.mobile,
        college: profile.college,
        course: authUser.course,
        year,
      }),
    }).catch(() => undefined);
  };

  // AI Assistant launcher with parameters
  const handleOpenAI = (tab: "ask" | "summarize" | "quiz" = "ask", prompt?: string) => {
    setAiInitialTab(tab);
    setAiInitialPrompt(prompt || "");
    setIsAIOpen(true);
  };

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    fetch(`/api/tasks/${taskId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: !task.completed }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to update task")))
      .then((data) => setTasks((prev) => prev.map((item) => item.id === taskId ? mapTaskRecord(data.task, authUser.year) : item)))
      .catch(() => undefined);
  };

  const handleAddTask = (
    title: string,
    subject: string,
    priority: "high" | "medium" | "low",
    year: StudentProfile["year"] = profile.year,
    dueDate?: string,
    dueTime?: string
  ) => {
    const date = dueDate || new Date().toISOString().slice(0, 10);
    fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, subject, priority, date, time: dueTime }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to create task")))
      .then((data) => setTasks((prev) => [mapTaskRecord(data.task, authUser.year), ...prev]))
      .catch(() => undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      .then((response) => response.ok ? setTasks((prev) => prev.filter((task) => task.id !== taskId)) : undefined)
      .catch(() => undefined);
  };

  useEffect(() => {
    setTasks((prev) =>
      prev.filter((task) => {
        if (!task.dueDate) return true;
        const taskDate = new Date(`${task.dueDate}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return taskDate >= today;
      })
    );
  }, []);

  // Study hours updater
  const handleLogStudyTime = (addedHours: number) => {
    const startedAt = new Date();
    const endedAt = new Date(startedAt.getTime() + addedHours * 60 * 60 * 1000);
    fetch("/api/study-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: "General Study", startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString(), durationMinutes: Math.round(addedHours * 60) }) }).catch(() => undefined);
    setProfile((prev) => ({
      ...prev,
      studiedHoursToday: Math.min(prev.dailyGoalHours, +(prev.studiedHoursToday + addedHours).toFixed(1)),
    }));
  };

  // Reminder adder
  const handleAddReminder = (item: Omit<UpcomingItem, "id">) => {
    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : new Date(Date.now() + item.daysLeft * 86400000).toISOString().slice(0, 10);
    fetch("/api/deadlines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: item.title, subject: item.subject, type: item.type, dueDate }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to create deadline")))
      .then((data) => setReminders((prev) => [mapDeadlineRecord(data.deadline), ...prev]))
      .catch(() => undefined);
  };

  const handleDeleteReminder = (id: string) => {
    fetch(`/api/deadlines/${id}`, { method: "DELETE" })
      .then((response) => response.ok ? setReminders((prev) => prev.filter((item) => item.id !== id)) : undefined)
      .catch(() => undefined);
  };

  const handleEditReminder = (item: UpcomingItem) => {
    const title = window.prompt("Deadline title", item.title)?.trim();
    if (!title) return;
    const dueDate = window.prompt("Due date (YYYY-MM-DD)", item.date)?.trim();
    if (!dueDate) return;
    fetch(`/api/deadlines/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, dueDate }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to update deadline")))
      .then((data) => setReminders((prev) => prev.map((current) => current.id === item.id ? mapDeadlineRecord(data.deadline) : current)))
      .catch(() => undefined);
  };

  // Add Points to Leaderboard
  const handleAddLeaderboardPoints = (earnedPoints: number) => {
    setLeaderboard((prev) =>
      prev.map((u) => {
        if (u.isCurrentUser) {
          const updatedPts = u.points + earnedPoints;
          return { ...u, points: updatedPts, streak: u.streak + 1 };
        }
        return u;
      })
    );
  };

  const handleRecordQuizAttempt = (attempt: Omit<QuizAttempt, "id" | "completedAt">) => {
    fetch("/api/quiz-performance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quizId: `quiz-${Date.now()}`, subject: attempt.subject, totalQuestions: attempt.totalQuestions, correctAnswers: attempt.score, score: attempt.totalQuestions ? (attempt.score / attempt.totalQuestions) * 100 : 0 }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to save quiz")))
      .then((data) => setQuizAttempts((prev) => [mapQuizRecord(data.attempt), ...prev]))
      .catch(() => undefined);
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    fetch("/api/notifications/read-all", { method: "PUT" }).then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))).catch(() => undefined);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const parseDueTime = (timeValue?: string): Date | null => {
      if (!timeValue) return null;

      const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!timeMatch) {
        const plainMatch = timeValue.match(/^(\d{1,2}):(\d{2})$/);
        if (!plainMatch) return null;
        const [_, hour, minute] = plainMatch;
        const hourNum = Number(hour);
        const date = new Date();
        date.setHours(hourNum, Number(minute), 0, 0);
        return date;
      }

      let hour = Number(timeMatch[1]);
      const minute = Number(timeMatch[2]);
      const meridiem = timeMatch[3].toUpperCase();

      if (meridiem === "AM" && hour === 12) hour = 0;
      if (meridiem === "PM" && hour < 12) hour += 12;

      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      return date;
    };

    const checkForDueTasks = () => {
      setTasks((prev) => {
        const dueTasks = prev.filter((task) => {
          if (!task.dueDate || !task.dueTime || task.notifiedAt || task.completed) return false;

          const date = new Date(`${task.dueDate}T00:00:00`);
          const dueTimeDate = parseDueTime(task.dueTime);
          if (!dueTimeDate) return false;

          date.setHours(dueTimeDate.getHours(), dueTimeDate.getMinutes(), 0, 0);

          const now = new Date();
          const diffMs = date.getTime() - now.getTime();
          return diffMs <= 60_000 && diffMs >= -30_000;
        });

        if (!dueTasks.length) return prev;

        setNotifications((current) => [
          ...dueTasks.map((task) => ({
            id: `notif-reminder-${task.id}`,
            title: `Study time reminder: ${task.title}`,
            description: `${task.subject} (${task.year}) is scheduled for ${task.dueDate} at ${task.dueTime}.`,
            time: "Now",
            category: "assignment" as const,
            read: false,
          })),
          ...current,
        ]);

        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          dueTasks.forEach((task) => {
            new Notification("Study reminder", {
              body: `${task.title} for ${task.subject} is scheduled at ${task.dueTime}.`,
            });
          });
        }

        return prev.map((task) => {
          const shouldMark = dueTasks.some((nextTask) => nextTask.id === task.id);
          return shouldMark ? { ...task, notifiedAt: new Date().toISOString() } : task;
        });
      });
    };

    const interval = window.setInterval(checkForDueTasks, 30_000);
    checkForDueTasks();

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20 md:pb-12 selection:bg-blue-600 selection:text-white">
      {/* Top Sticky Navigation Bar */}
      <Navbar
        profile={profile}
        notifications={notifications}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setIsAllNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={onLogout}
        onYearChange={handleYearChange}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 1. Welcome Section & Daily Academic Metrics */}
        <WelcomeSection
          profile={profile}
          hasStudySettings={!isNewUser}
          onLogStudyTime={handleLogStudyTime}
          onOpenPlanner={() => setIsPlannerOpen(true)}
          onOpenUpcoming={() => {
            const el = document.getElementById("upcoming-card");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* 2. Quick Access Primary Service Grid */}
        <QuickAccessGrid onNavigate={handleNavigate} />

        {/* 3. Core Operational Split Layout: Progress & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Column: Study Progress + Today's Study Plan */}
          <div className="lg:col-span-7 space-y-6">
            {/* Subject Progress Section */}
            <StudyProgressSection
              subjects={subjects}
              onOpenNotes={() => setIsNotesOpen(true)}
              onAskAIDoubt={(sub) => handleOpenAI("ask", `What are the most scoring topics in ${sub}?`)}
            />

            {/* Today's Study Plan Task Manager */}
            <TodaysStudyPlan
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onOpenFullPlanner={() => setIsPlannerOpen(true)}
              currentYear={profile.year}
              availableSubjectsByYear={{
                FY: [...new Set(papers.filter((paper) => paper.collegeYear === "FY").map((paper) => paper.subject))],
                SY: [...new Set(papers.filter((paper) => paper.collegeYear === "SY").map((paper) => paper.subject))],
                TY: [...new Set(papers.filter((paper) => paper.collegeYear === "TY").map((paper) => paper.subject))],
              }}
            />
          </div>

          {/* Right / Secondary Column: Upcoming Deadlines & Notifications & Leaderboard */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upcoming Exams / Reminders */}
            <UpcomingReminders
              reminders={reminders}
              onOpenPYQs={() => setIsPYQOpen(true)}
              onOpenNotes={() => setIsNotesOpen(true)}
              onAddReminder={handleAddReminder}
              onDeleteReminder={handleDeleteReminder}
              onEditReminder={handleEditReminder}
            />

            {/* Quiz Leaderboard */}
            <QuizLeaderboard
              attempts={quizAttempts}
              onStartQuiz={() => setIsQuizZoneOpen(true)}
            />

            {/* Recent Notifications */}
            <NotificationsPanel
              notifications={notifications}
              onOpenAllNotifications={() => setIsAllNotificationsOpen(true)}
              onNavigate={handleNavigate}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
            />
          </div>
        </div>

        {/* Footer info note */}
        <footer className="pt-6 pb-2 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-600">
            StudyHub Academic Portal • Built for FY, SY & TY College Excellence
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Handcrafted for distraction-free exam preparation, note sharing & AI-accelerated learning.
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onNavigate={handleNavigate} />

      {/* Interactive Modals */}
      <NotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        notes={notes}
        currentYear={profile.year}
        onAskAIAboutNote={(title, subject) => {
          setIsNotesOpen(false);
          handleOpenAI("ask", `Please explain key exam questions from ${title} in ${subject}`);
        }}
      />

      <PYQModal
        isOpen={isPYQOpen}
        onClose={() => setIsPYQOpen(false)}
        papers={papers}
        currentYear={profile.year}
      />

      <AIModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialTab={aiInitialTab}
        initialPrompt={aiInitialPrompt}
        currentYear={profile.year}
        onAddLeaderboardPoints={handleAddLeaderboardPoints}
        onRecordQuizAttempt={handleRecordQuizAttempt}
        availableSubjects={[...new Set(papers.map((paper) => paper.subject))].filter(
          (subject) => !subject.toLowerCase().startsWith("all subjects")
        )}
      />

      <QuizZoneModal
        isOpen={isQuizZoneOpen}
        onClose={() => setIsQuizZoneOpen(false)}
        questions={sampleQuizBank}
        currentYear={profile.year}
        onCompleteQuiz={handleAddLeaderboardPoints}
        onRecordQuizAttempt={handleRecordQuizAttempt}
        availableYears={[profile.year]}
        subjectsByYear={{
          FY: [...new Set(papers.filter((paper) => paper.collegeYear === "FY").map((paper) => paper.subject))],
          SY: [...new Set(papers.filter((paper) => paper.collegeYear === "SY").map((paper) => paper.subject))],
          TY: [...new Set(papers.filter((paper) => paper.collegeYear === "TY").map((paper) => paper.subject))],
        }}
      />

      <StudyPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        currentYear={profile.year}
        availableSubjectsByYear={{
          FY: [...new Set(papers.filter((paper) => paper.collegeYear === "FY").map((paper) => paper.subject))],
          SY: [...new Set(papers.filter((paper) => paper.collegeYear === "SY").map((paper) => paper.subject))],
          TY: [...new Set(papers.filter((paper) => paper.collegeYear === "TY").map((paper) => paper.subject))],
        }}
      />

      <NotesStoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        items={sampleStoreItems}
        currentYear={profile.year}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        isNewUser={isNewUser}
        onLogout={onLogout}
        onSaveProfile={(updated) => {
          setProfile((prev) => {
            const next = { ...prev, ...updated };
            return next;
          });
          localStorage.setItem(`studyhub_settings_${authUser.id}`, JSON.stringify({
            semester: updated.semester ?? profile.semester,
            nextExamDays: updated.nextExamDays,
            dailyGoalHours: updated.dailyGoalHours,
          }));
          fetch("/api/auth/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: updated.name || profile.name,
              mobile: authUser.mobile,
              college: updated.college || profile.college,
              course: authUser.course,
              year: updated.year || profile.year,
            }),
          }).then(async (response) => {
            if (!response.ok) return;
            const data = await response.json();
            if (data.user) setProfile((current) => ({ ...current, name: data.user.fullName, college: data.user.college, year: data.user.year, stream: data.user.course }));
          }).catch(() => undefined);
        }}
      />

      <FullLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        users={leaderboard}
        onStartQuiz={() => {
          setIsLeaderboardOpen(false);
          setIsQuizZoneOpen(true);
        }}
      />

      <AllNotificationsModal
        isOpen={isAllNotificationsOpen}
        onClose={() => setIsAllNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.user) {
          setAuthUser(data.user);
          const dashboardResponse = await fetch("/api/dashboard");
          const dashboard = await dashboardResponse.json();
          setIsNewUser(!(dashboard.allTasks?.length || dashboard.upcomingDeadlines?.length || dashboard.studyHistory?.length || dashboard.quizHistory?.length || dashboard.notifications?.length || dashboard.progress?.length));
          return;
        }
      } catch {
        setAuthUser(null);
      }
    };

    restoreSession().finally(() => setAuthChecked(true));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setAuthUser(null);
  };

  if (!authChecked) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-white">Loading StudyHub...</div>;
  if (!authUser) return <AuthScreen onAuthenticated={async (user) => {
    const dashboardResponse = await fetch("/api/dashboard");
    const dashboard = await dashboardResponse.json();
    setIsNewUser(!(dashboard.allTasks?.length || dashboard.upcomingDeadlines?.length || dashboard.studyHistory?.length || dashboard.quizHistory?.length || dashboard.notifications?.length || dashboard.progress?.length));
    setAuthUser(user);
  }} />;
  if (authUser.role === "admin") return <AdminDashboard user={authUser} onLogout={logout} />;
  return <StudyDashboard authUser={authUser} onLogout={logout} isNewUser={isNewUser} />;
}

export default App;
