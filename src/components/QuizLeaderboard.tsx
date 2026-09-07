import React from "react";
import { BarChart3, BookOpen, CheckCircle2, Gamepad2, Target } from "lucide-react";
import { QuizAttempt } from "../types";

interface QuizLeaderboardProps {
  attempts: QuizAttempt[];
  onStartQuiz: () => void;
}

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ attempts, onStartQuiz }) => {
  const totalQuestions = attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
  const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const accuracy = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const bestScore = attempts.length
    ? Math.max(...attempts.map((attempt) => Math.round((attempt.score / attempt.totalQuestions) * 100)))
    : 0;
  const recentAttempts = attempts.slice(-3).reverse();

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">My Quiz Analysis</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Your personal practice performance</p>
        </div>
        <BarChart3 className="h-5 w-5 text-blue-600" />
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center">
          <Target className="h-7 w-7 text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-900">No quiz attempts yet</p>
          <p className="text-[11px] text-slate-500 mt-1">Complete a quiz to see your accuracy and progress.</p>
          <button onClick={onStartQuiz} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-blue-700">
            <Gamepad2 className="h-3.5 w-3.5" /> Start a Quiz
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-blue-50 p-2.5 text-center">
              <p className="text-[10px] text-blue-700">Accuracy</p>
              <p className="text-lg font-extrabold text-blue-950">{accuracy}%</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
              <p className="text-[10px] text-emerald-700">Quizzes</p>
              <p className="text-lg font-extrabold text-emerald-950">{attempts.length}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-center">
              <p className="text-[10px] text-amber-700">Best score</p>
              <p className="text-lg font-extrabold text-amber-950">{bestScore}%</p>
            </div>
          </div>

          <div className="space-y-2">
            {recentAttempts.map((attempt) => {
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
              return (
                <div key={attempt.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{attempt.subject}</p>
                      <p className="text-[10px] text-slate-500">{attempt.score}/{attempt.totalQuestions} correct • +{attempt.points} pts</p>
                    </div>
                  </div>
                  <span className={`text-xs font-extrabold ${percentage >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-slate-500"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {correctAnswers} correct answers</span>
            <button onClick={onStartQuiz} className="font-bold text-blue-700 hover:underline">Practice again</button>
          </div>
        </>
      )}
    </div>
  );
};
