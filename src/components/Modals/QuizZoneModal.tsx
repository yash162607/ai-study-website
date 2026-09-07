import React, { useState, useEffect } from "react";
import {
  X,
  Gamepad2,
  Trophy,
  Timer,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  GraduationCap,
  BookOpen,
  Calculator,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Landmark,
  Scale,
  Megaphone,
  Brain,
  Sigma,
  Users,
} from "lucide-react";
import { AcademicYear, QuizQuestion, QuizAttempt } from "../../types";

interface QuizZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  currentYear: AcademicYear;
  onCompleteQuiz: (earnedPoints: number) => void;
  onRecordQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "completedAt">) => void;
  availableYears: AcademicYear[];
  subjectsByYear: Record<AcademicYear, string[]>;
}

export const QuizZoneModal: React.FC<QuizZoneModalProps> = ({
  isOpen,
  onClose,
  questions,
  currentYear,
  onCompleteQuiz,
  onRecordQuizAttempt,
  availableYears,
  subjectsByYear,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizFinished, setQuizFinished] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(currentYear);
  const [selectedSubject, setSelectedSubject] = useState(subjectsByYear[availableYears[0]][0]);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (!isOpen || quizFinished || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quizFinished, isAnswered, currentIndex]);

  useEffect(() => {
    if (isOpen) return;

    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(30);
    setStreakCount(0);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedYear(currentYear);
      setSelectedSubject(subjectsByYear[currentYear][0]);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuizFinished(false);
      setQuizStarted(false);
    }
  }, [currentYear, isOpen]);

  if (!isOpen) return null;

  const yearQuestions = questions.filter((question) => question.year === selectedYear);
  const currentQ = yearQuestions[currentIndex] || yearQuestions[0];

  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedOption(-1);
    setStreakCount(0);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < yearQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setQuizFinished(true);
      const earned = (score + (selectedOption === currentQ.correctIndex ? 1 : 0)) * 30 + 20;
      onCompleteQuiz(earned);
      onRecordQuizAttempt({
        subject: selectedSubject,
        score: score + (selectedOption === currentQ.correctIndex ? 1 : 0),
        totalQuestions: yearQuestions.length,
        points: earned,
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(30);
    setQuizFinished(false);
    setStreakCount(0);
    setQuizStarted(false);
  };

  const handleYearSelect = (year: AcademicYear) => {
    setSelectedYear(year);
    setSelectedSubject(subjectsByYear[year][0]);
  };

  const handleBackToSetup = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(30);
    setStreakCount(0);
  };

  const getSubjectIcon = (subject: string) => {
    const normalizedSubject = subject.toLowerCase();
    if (normalizedSubject.includes("account")) return Calculator;
    if (normalizedSubject.includes("finance") || normalizedSubject.includes("tax")) return Landmark;
    if (normalizedSubject.includes("marketing")) return Megaphone;
    if (normalizedSubject.includes("law")) return Scale;
    if (normalizedSubject.includes("statistics") || normalizedSubject.includes("optimization")) return Sigma;
    if (normalizedSubject.includes("management") || normalizedSubject.includes("leadership")) return Users;
    if (normalizedSubject.includes("intelligence") || normalizedSubject.includes("visualization")) return ChartNoAxesCombined;
    if (normalizedSubject.includes("research") || normalizedSubject.includes("business")) return BriefcaseBusiness;
    if (normalizedSubject.includes("behaviour")) return Brain;
    return BookOpen;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="quiz-zone-modal-content"
        className="relative flex flex-col w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-sm">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Quiz Zone: Weekly Arena
              </h2>
              <p className="text-xs text-slate-500">
                Answer high-yield exam MCQs and climb the college leaderboard
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

        {/* Body */}
        <div className="p-6">
          {!quizStarted ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Choose your quiz</h3>
                <p className="mt-1 text-xs text-slate-500">Select your year and a subject from the PYQ library.</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Academic year</p>
                <div className="grid grid-cols-3 gap-2">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-bold transition ${
                        selectedYear === year
                          ? "border-amber-500 bg-amber-50 text-amber-900"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" />
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Subject</p>
                <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                  {subjectsByYear[selectedYear].map((subject) => {
                    const SubjectIcon = getSubjectIcon(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => setSelectedSubject(subject)}
                        className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center text-[11px] font-bold transition ${
                          selectedSubject === subject
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                        }`}
                      >
                        <SubjectIcon className="h-5 w-5" />
                        <span>{subject}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

                <button
                type="button"
                  onClick={() => setQuizStarted(true)}
                  disabled={yearQuestions.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start {selectedYear} {selectedSubject} Quiz
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : !quizFinished ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBackToSetup}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  title="Back to Quiz Zone"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quiz Zone</span>
                </button>
                <span className="truncate text-xs font-bold text-blue-700">
                  {selectedYear} • {selectedSubject}
                </span>
              </div>

              {/* Progress & Timer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    Question {currentIndex + 1} of {yearQuestions.length}
                  </span>
                  {streakCount > 1 && (
                    <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 animate-pulse">
                      <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                      {streakCount}x Streak!
                    </span>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                    timeLeft <= 10
                      ? "bg-rose-100 text-rose-700 animate-pulse"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <Timer className="h-4 w-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / yearQuestions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Text */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = currentQ.correctIndex === idx;

                  let style =
                    "bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/20";
                  if (isAnswered) {
                    if (isCorrect) {
                      style = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                    } else if (isSelected && !isCorrect) {
                      style = "bg-rose-50 border-rose-500 text-rose-900";
                    } else {
                      style = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm text-left transition ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon answer */}
              {isAnswered && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950 space-y-1 animate-in fade-in duration-150">
                  <p className="font-bold flex items-center gap-1 text-blue-900">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Concept Breakdown:
                  </p>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Footer action button */}
              {isAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    <span>
                      {currentIndex + 1 < questions.length
                        ? "Next Question"
                        : "Complete Quiz"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Results Finished Screen */
            <div className="text-center py-6 space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mx-auto shadow-sm">
                <Trophy className="h-8 w-8 text-amber-500 fill-amber-400 animate-bounce" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Quiz Completed! 🎉
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Great job practicing your college syllabus concepts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 font-medium">Final Score</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {score} / {questions.length}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-800 font-medium">Points Earned</p>
                  <p className="text-xl font-extrabold text-amber-900 mt-0.5">
                    +{score * 30 + 20} pts
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
