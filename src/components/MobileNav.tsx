import React from "react";
import {
  Home,
  BookOpen,
  Sparkles,
  Gamepad2,
  CalendarCheck,
  ShoppingBag,
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onNavigate,
}) => {
  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "ai", label: "AI Tools", icon: Sparkles },
    { id: "quiz", label: "Quiz", icon: Gamepad2 },
    { id: "planner", label: "Planner", icon: CalendarCheck },
    { id: "store", label: "Store", icon: ShoppingBag },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[50px] ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-blue-600 scale-110" : ""}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
