import React from "react";
import {
  BookOpen,
  FileText,
  Sparkles,
  Gamepad2,
  CalendarCheck,
  ShoppingBag,
} from "lucide-react";

interface QuickAccessGridProps {
  onNavigate?: (tab: string) => void;
  onSelectAction?: (actionKey: string) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onNavigate,
  onSelectAction,
}) => {
  const handleClick = (id: string) => {
    if (onNavigate) onNavigate(id);
    if (onSelectAction) onSelectAction(id);
  };

  const cards = [
    {
      id: "notes",
      title: "Notes",
      subtitle: "Access curated subject-wise study material & faculty uploads.",
      buttonText: "Explore Notes",
      icon: BookOpen,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBtn: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
      isDark: false,
    },
    {
      id: "pyq",
      title: "PY Papers",
      subtitle: "Practice with previous examination papers & solutions.",
      buttonText: "View Papers",
      icon: FileText,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      hoverBtn: "hover:bg-purple-600 hover:text-white hover:border-purple-600",
      isDark: false,
    },
    {
      id: "quiz",
      title: "Quiz Zone",
      subtitle: "Test your knowledge against college & global ranking.",
      buttonText: "Start Quiz",
      icon: Gamepad2,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
      hoverBtn: "hover:bg-pink-600 hover:text-white hover:border-pink-600",
      isDark: false,
    },
    {
      id: "planner",
      title: "Study Planner",
      subtitle: "Personalized exam schedule, time tracker & daily goals.",
      buttonText: "View Plan",
      icon: CalendarCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      hoverBtn: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
      isDark: false,
    },
    {
      id: "store",
      title: "Notes Store",
      subtitle: "Pre-order spiral printed textbooks & faculty handouts.",
      buttonText: "Browse Store",
      icon: ShoppingBag,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBtn: "hover:bg-amber-600 hover:text-white hover:border-amber-600",
      isDark: false,
    },
    {
      id: "ai",
      title: "AI Help",
      subtitle: "Summarize PDFs, ask doubt queries & instant MCQ quizzes.",
      buttonText: "Launch AI",
      icon: Sparkles,
      iconBg: "bg-blue-600",
      iconColor: "text-white",
      hoverBtn: "bg-blue-600 text-white hover:bg-blue-700 border-blue-500",
      isDark: true,
    },
  ];

  return (
    <section id="quick-access-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase text-[11px] text-slate-500">
          Core Study Services
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          if (card.isDark) {
            return (
              <div
                key={card.id}
                id={`quick-card-${card.id}`}
                className="bg-slate-900 p-4 rounded-xl flex flex-col justify-between items-start shadow-xl ring-2 ring-blue-500 ring-offset-1 text-white transition-all hover:scale-[1.01]"
              >
                <div className="w-full">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-3 text-white shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 mb-4 leading-relaxed line-clamp-2">
                    {card.subtitle}
                  </p>
                </div>
                <button
                  id={`btn-${card.id}`}
                  onClick={() => handleClick(card.id)}
                  className="w-full py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg border border-blue-500 hover:bg-blue-700 transition"
                >
                  {card.buttonText}
                </button>
              </div>
            );
          }

          return (
            <div
              key={card.id}
              id={`quick-card-${card.id}`}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-start transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="w-full">
                <div
                  className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 mb-4 leading-relaxed line-clamp-2">
                  {card.subtitle}
                </p>
              </div>
              <button
                id={`btn-${card.id}`}
                onClick={() => handleClick(card.id)}
                className={`w-full py-1.5 bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 ${card.hoverBtn} transition`}
              >
                {card.buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

