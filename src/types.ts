export type AcademicYear = "FY" | "SY" | "TY";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  college: string;
  course: "BBA";
  year: AcademicYear;
  role: "user" | "admin";
  createdAt: string;
}

export interface StudentProfile {
  name: string;
  avatar: string;
  college: string;
  year: AcademicYear;
  semester: number;
  nextExamDays?: number;
  stream: string;
  dailyGoalHours: number;
  studiedHoursToday: number;
  streakDays: number;
  quizPoints: number;
  currentRank: number;
}

export interface SubjectProgress {
  id: string;
  name: string;
  code: string;
  progressPercentage: number;
  color: string;
  unitsCompleted: number;
  totalUnits: number;
  nextExamDays?: number;
  examDate?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  year: AcademicYear;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  notifiedAt?: string;
}

export interface UpcomingItem {
  id: string;
  title: string;
  subject: string;
  type: "exam" | "assignment" | "project" | "internal";
  daysLeft: number;
  date: string;
  urgent?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "notes" | "exam" | "assignment" | "quiz" | "announcement";
  read: boolean;
  icon?: string;
  targetModal?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  year: AcademicYear;
  streak: number;
  badge?: string;
  isCurrentUser?: boolean;
}

export interface QuizAttempt {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  points: number;
  completedAt: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  year: AcademicYear;
  semester: number;
  unit: string;
  pages: number;
  author: string;
  rating: number;
  downloads: number;
  tags: string[];
  summary: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: "pdf" | "pptx" | "doc" | "docx" | "other";
}

export interface PYQPaper {
  id: string;
  subject: string;
  yearOfExam: number;
  collegeYear: AcademicYear;
  semester: number;
  examType: "End-Term" | "Mid-Term" | "Internal Backlog";
  duration: string;
  totalMarks: number;
  solved: boolean;
  downloadUrl?: string;
}

export interface StoreItem {
  id: string;
  title: string;
  subject: string;
  year: AcademicYear;
  format: "Spiral-Bound Book" | "Color Handout Kit" | "Formula Cheat Sheet Pack";
  price: number;
  originalPrice: number;
  pages: number;
  rating: number;
  reviewsCount: number;
  deliveryDays: string;
  inStock: boolean;
  featured?: boolean;
  description: string;
}

export interface QuizQuestion {
  id: number;
  year: AcademicYear;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
