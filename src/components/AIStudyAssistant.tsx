import React from "react";
import {
  Bot,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface AIStudyAssistantProps {
  onOpenAI: (initialTab?: "ask" | "summarize" | "quiz", prompt?: string) => void;
}

export const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({
  onOpenAI,
}) => {
  const quickPrompts = [
    "Explain Branch Accounts debtors vs stock method",
    "Summarize Section 25 of Indian Contract Act",
    "What are the 7Ps of Services Marketing with examples?",
  ];

  return (
    <section
      id="ai-study-assistant-section"
      className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-white shadow-sm"
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Side: Copy and Headline */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>StudyHub AI Assistant</span>
          </div>

          <h2
            id="ai-assistant-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-white"
          >
            Need Help Studying?
          </h2>

          <p className="text-sm text-slate-300 font-normal leading-relaxed">
            Ask questions, summarize your notes and understand difficult topics instantly with AI academic reasoning.
          </p>

          {/* Quick Prompt Chips */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-slate-400 mb-2">
              Popular questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => onOpenAI("ask", promptText)}
                  className="rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition text-left"
                >
                  "{promptText}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[200px]">
          {/* Button 1: Ask AI */}
          <button
            id="btn-ask-ai"
            onClick={() => onOpenAI("ask")}
            className="group flex items-center justify-between rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-200" />
              <span>Ask AI Question</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Button 2: Summarize PDF */}
          <button
            id="btn-summarize-pdf"
            onClick={() => onOpenAI("summarize")}
            className="group flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-750 hover:text-white hover:border-slate-600 transition"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-300" />
              <span>Summarize PDF</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>
      </div>
    </section>
  );
};

