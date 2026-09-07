import React, { useState } from "react";
import {
  X,
  Sparkles,
  Bot,
  FileText,
  Gamepad2,
  Send,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Calculator,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Landmark,
  Scale,
  Megaphone,
  Sigma,
  Users,
  ArrowLeft,
  Plus,
  Pin,
  Paperclip,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { AcademicYear, QuizQuestion, QuizAttempt } from "../../types";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "ask" | "summarize" | "quiz";
  initialPrompt?: string;
  currentYear: AcademicYear;
  onAddLeaderboardPoints?: (points: number) => void;
  onRecordQuizAttempt?: (attempt: Omit<QuizAttempt, "id" | "completedAt">) => void;
  availableSubjects: string[];
}

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  subject: string;
  attachments?: string[];
};

type ChatSession = {
  id: string;
  subject: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
  messages: ChatMessage[];
};

const chatStorageKey = "studyhub-ai-chat-sessions";
const defaultChatSubject = "General Academic Studies";

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  initialTab = "ask",
  initialPrompt = "",
  currentYear,
  onAddLeaderboardPoints,
  onRecordQuizAttempt,
  availableSubjects,
}) => {
  const [activeTab, setActiveTab] = useState<"ask" | "summarize" | "quiz">(
    initialTab
  );

  // Tab 1: Ask AI state
  const [askQuestion, setAskQuestion] = useState(initialPrompt);
  const [askSubject, setAskSubject] = useState(defaultChatSubject);
  const [aiView, setAiView] = useState<"suite" | "chat">("suite");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatAttachments, setChatAttachments] = useState<File[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const activeChat = chatSessions.find((chat) => chat.id === activeChatId);

  // Tab 2: Summarize PDF state
  const [summaryTitle, setSummaryTitle] = useState("Unit 3 Branch Accounts");
  const [summaryText, setSummaryText] = useState(
    "Branch accounting involves maintaining accounting records for autonomous and non-autonomous branch outlets. In the Debtors method, the head office treats the branch simply as a debtor. All goods dispatched to the branch at cost or invoice price are debited, while all cash received or returns are credited. Stock and Debtors method provides closer internal control over pilferage and stock shortages by splitting transactions into Branch Stock Account, Branch Debtors Account, Branch Adjustment Account, and Branch P&L Account."
  );
  const [summaryRequirement, setSummaryRequirement] = useState("");
  const [summaryFiles, setSummaryFiles] = useState<File[]>([]);
  const [isDraggingSummaryFile, setIsDraggingSummaryFile] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  // Tab 3: Generate Quiz state
  const [quizTopic, setQuizTopic] = useState("Contract Act 1872 Consideration Rules");
  const [quizSubject, setQuizSubject] = useState(availableSubjects[0]);
  const [isQuizSubjectPickerOpen, setIsQuizSubjectPickerOpen] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const [copied, setCopied] = useState(false);
  const subjectOptions = availableSubjects.filter(
    (subject) => !subject.toLowerCase().startsWith("all subjects")
  );

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
    return BrainCircuit;
  };

  // Sync initialPrompt if changed
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialPrompt) setAskQuestion(initialPrompt);
  }, [initialTab, initialPrompt]);

  React.useEffect(() => {
    if (!isOpen) {
      setAiView("suite");
      setActiveChatId(null);
      setChatAttachments([]);
    }
  }, [isOpen]);

  React.useEffect(() => {
    try {
      const savedChats = window.localStorage.getItem(chatStorageKey);
      if (savedChats) {
        const sessions = JSON.parse(savedChats) as ChatSession[];
        setChatSessions(sessions.filter((chat) => !chat.subject.toLowerCase().startsWith("all subjects")));
      }
    } catch {
      setChatSessions([]);
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(chatStorageKey, JSON.stringify(chatSessions));
  }, [chatSessions]);

  if (!isOpen) return null;

  const createChat = (subject: string, prompt = "") => {
    const id = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id,
      subject,
      title: prompt || "New study chat",
      pinned: false,
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `${id}-welcome`,
          role: "ai",
          text: `Hello! I am your StudyHub AI tutor for ${subject}. What would you like to understand?`,
          subject,
        },
      ],
    };
    setChatSessions((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    setAskSubject(subject);
    setAiView("chat");
    setAskQuestion(prompt);
  };

  const openChat = (chat: ChatSession) => {
    setActiveChatId(chat.id);
    setAskSubject(chat.subject);
    setAiView("chat");
    setAskQuestion("");
  };

  const togglePinnedChat = (chatId: string) => {
    setChatSessions((prev) => prev.map((chat) => chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat));
  };

  const deleteChat = (chatId: string) => {
    setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setAiView("suite");
    }
  };

  const addFiles = (files: FileList | File[]) => {
    const supportedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/") || file.type === "application/pdf" || file.type.includes("text") || file.type.includes("document")
    );
    setChatAttachments((prev) => [...prev, ...supportedFiles].slice(0, 5));
  };

  const addSummaryFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/") || file.type === "application/pdf" || file.type.includes("text") || file.name.match(/\.(doc|docx)$/i)
    ).slice(0, 5);
    setSummaryFiles(selectedFiles);
    const textFile = selectedFiles.find((file) => file.type.includes("text"));
    if (textFile) setSummaryText(await textFile.text());
    if (selectedFiles.length && !summaryTitle) setSummaryTitle(selectedFiles[0].name);
  };

  // Handle Ask AI Submit
  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!askQuestion.trim() && !chatAttachments.length) || askLoading || !activeChat) return;

    const userText = askQuestion.trim() || "Please review the attached study material.";
    const attachmentNames = chatAttachments.map((file) => file.name);
    const userMessage: ChatMessage = { id: `message-${Date.now()}`, role: "user", text: userText, subject: askSubject, attachments: attachmentNames };
    setChatSessions((prev) => prev.map((chat) => chat.id === activeChat.id ? { ...chat, title: chat.messages.length <= 1 ? userText : chat.title, updatedAt: new Date().toISOString(), messages: [...chat.messages, userMessage] } : chat));
    setAskQuestion("");
    setChatAttachments([]);
    setAskLoading(true);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          subject: askSubject,
          studentYear: currentYear,
          attachments: attachmentNames,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The AI service could not answer right now.");
      }
      setChatSessions((prev) => prev.map((chat) => chat.id === activeChat.id ? { ...chat, updatedAt: new Date().toISOString(), messages: [...chat.messages, { id: `message-${Date.now()}-ai`, role: "ai", text: data.answer || "I could not formulate an answer at this moment.", subject: askSubject }] } : chat));
    } catch (err) {
      console.error(err);
      setChatSessions((prev) => prev.map((chat) => chat.id === activeChat.id ? { ...chat, updatedAt: new Date().toISOString(), messages: [...chat.messages, { id: `message-${Date.now()}-ai`, role: "ai", text: `I could not reach Google AI Studio: ${err instanceof Error ? err.message : "Please try again."}`, subject: askSubject }] } : chat));
    } finally {
      setAskLoading(false);
    }
  };

  // Handle Summarize Submit
  const handleSummarizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryText.trim() || summaryLoading) return;

    setSummaryLoading(true);
    setSummaryResult(null);

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: summaryText,
          title: summaryTitle,
          subject: "Academics",
          requirement: summaryRequirement,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The summary service could not respond right now.");
      setSummaryResult(data.summary);
    } catch (err) {
      console.error(err);
      setSummaryResult(
        "### 🎯 Summary Breakdown\n- **Core Theme**: High-yield syllabus concepts synthesized for examination revision.\n- **Exam Tip**: Ensure you memorize the statutory exceptions and draw neat comparison charts."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handle Quiz Generation Submit
  const handleGenerateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim() || quizLoading) return;

    setQuizLoading(true);
    setGeneratedQuiz(null);
    setUserAnswers({});
    setQuizScore(null);

    try {
      const response = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quizTopic,
          subject: quizSubject,
          count: 3,
        }),
      });
      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setGeneratedQuiz(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  // Evaluate user quiz answers
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (quizScore !== null) return; // Already submitted
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleFinishQuiz = () => {
    if (!generatedQuiz) return;
    let score = 0;
    generatedQuiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    if (onAddLeaderboardPoints) {
      onAddLeaderboardPoints(score * 25);
    }
    onRecordQuizAttempt?.({
      subject: quizSubject,
      score,
      totalQuestions: generatedQuiz.length,
      points: score * 25,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="ai-modal-content"
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  StudyHub AI Suite
                </h2>
                <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 text-[10px] font-bold text-indigo-200">
                  Gemini 2.5 Flash Lite
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Instant doubt solving and PDF note summaries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 pt-2">
          <button
            onClick={() => setActiveTab("ask")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "ask"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>1. Ask AI Doubts</span>
          </button>

          <button
            onClick={() => setActiveTab("summarize")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "summarize"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>2. Summarize Notes / PDF</span>
          </button>

        </div>

        {/* Tab 1: Ask AI Doubts */}
        {activeTab === "ask" && (
          <div className="flex flex-1 overflow-hidden bg-slate-50/40">
            {aiView === "suite" ? (
              <div className="w-full overflow-y-auto p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Your AI workspace</h3>
                    <p className="mt-1 text-xs text-slate-500">Ask anything about your studies.</p>
                  </div>
                  <button type="button" onClick={() => createChat(defaultChatSubject)} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> New chat
                  </button>
                </div>

                <form onSubmit={(event) => { event.preventDefault(); if (askQuestion.trim()) createChat(defaultChatSubject, askQuestion.trim()); }} className="mx-auto mb-6 flex min-h-32 w-full max-w-3xl flex-col justify-between rounded-2xl border border-slate-300 bg-white p-3 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
                  <textarea value={askQuestion} onChange={(event) => setAskQuestion(event.target.value)} placeholder="Message your AI tutor..." rows={3} className="w-full resize-none bg-transparent p-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none" />
                  <div className="flex items-center justify-between px-2 pt-2">
                    <span className="text-[10px] text-slate-400">StudyHub AI</span>
                    <button type="submit" disabled={!askQuestion.trim()} title="Start chat" className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"><Send className="h-4 w-4" /></button>
                  </div>
                </form>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">Chat history</h4>
                    <span className="text-[10px] font-semibold text-slate-400">Saved on this device</span>
                  </div>
                  {chatSessions.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">Your conversations will appear here.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {[...chatSessions].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)).map((chat) => (
                        <div key={chat.id} className="flex items-center gap-2 rounded-xl p-2.5 hover:bg-slate-50">
                          <button type="button" onClick={() => openChat(chat)} className="min-w-0 flex-1 text-left">
                            <p className="truncate text-xs font-bold text-slate-800">{chat.title}</p>
                            <p className="text-[10px] text-slate-400">{chat.messages.filter((message) => message.role === "user").length} prompts</p>
                          </button>
                          <button type="button" title={chat.pinned ? "Unpin chat" : "Pin chat"} onClick={() => togglePinnedChat(chat.id)} className={chat.pinned ? "text-amber-500" : "text-slate-300 hover:text-amber-500"}><Pin className="h-4 w-4" /></button>
                          <button type="button" title="Delete chat" onClick={() => deleteChat(chat.id)} className="text-slate-300 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col bg-white p-3 sm:p-5">
                <div className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <button type="button" title="Back to AI Suite" onClick={() => { setAiView("suite"); setChatAttachments([]); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /></button>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{activeChat?.title}</p></div>
                  <button type="button" title={activeChat?.pinned ? "Unpin chat" : "Pin chat"} onClick={() => activeChatId && togglePinnedChat(activeChatId)} className={activeChat?.pinned ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}><Pin className="h-4 w-4" /></button>
                  <button type="button" title="New chat" onClick={() => createChat(defaultChatSubject)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200"><Plus className="h-4 w-4" /></button>
                </div>

                <div className="mb-3 flex-1 space-y-5 overflow-y-auto px-1 py-3 sm:px-8">
                  {activeChat?.messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                      {msg.role === "ai" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white"><Bot className="h-4 w-4" /></div>}
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.role === "user" ? "bg-slate-100 text-slate-800" : "text-slate-800"}`}>
                        <div className="whitespace-pre-line">{msg.text}</div>
                        {msg.attachments?.length ? <p className="mt-2 border-t border-slate-200 pt-2 text-[10px] text-slate-500">Attached: {msg.attachments.join(", ")}</p> : null}
                        {msg.role === "ai" && <div className="mt-2 flex"><button type="button" title="Copy response" onClick={() => copyToClipboard(msg.text)} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy</button></div>}
                      </div>
                    </div>
                  ))}
                  {askLoading && <div className="flex items-center gap-3 text-xs text-slate-500"><Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Consulting academic sources...</div>}
                </div>

                <form onSubmit={handleAskSubmit} className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-300 bg-white p-2.5 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
                  {chatAttachments.length > 0 && <div className="mb-2 flex flex-wrap gap-1.5 px-2">{chatAttachments.map((file) => <span key={file.name} className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{file.name}</span>)}</div>}
                  <div onDragOver={(event) => { event.preventDefault(); setIsDraggingFile(true); }} onDragLeave={() => setIsDraggingFile(false)} onDrop={(event) => { event.preventDefault(); setIsDraggingFile(false); addFiles(event.dataTransfer.files); }} className={`flex items-center gap-2 rounded-xl px-1 ${isDraggingFile ? "bg-blue-50 ring-2 ring-blue-300" : ""}`}>
                    <label title="Attach an image" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600"><ImageIcon className="h-4 w-4" /><input type="file" multiple accept="image/*" className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ""; }} /></label>
                    <label title="Attach a PDF" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600"><FileText className="h-4 w-4" /><input type="file" multiple accept="application/pdf" className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ""; }} /></label>
                    <label title="Attach a document" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600"><Paperclip className="h-4 w-4" /><input type="file" multiple accept=".doc,.docx,.txt" className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ""; }} /></label>
                    <input type="text" placeholder="Message your AI tutor..." value={askQuestion} onChange={(event) => setAskQuestion(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none" />
                    <button type="submit" disabled={askLoading || (!askQuestion.trim() && !chatAttachments.length)} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"><Send className="h-4 w-4" /><span className="hidden sm:inline">Send</span></button>
                  </div>
                  <p className="px-2 pt-1 text-[10px] text-slate-400">Drag and drop images, PDFs, or documents here.</p>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Summarize Notes / PDF */}
        {activeTab === "summarize" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Input Text or Sample PDF */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Upload study material
                  </h3>
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Topic / Document Title</label>
                  <input
                    type="text"
                    value={summaryTitle}
                    onChange={(e) => setSummaryTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>

                <div
                  onDragOver={(event) => { event.preventDefault(); setIsDraggingSummaryFile(true); }}
                  onDragLeave={() => setIsDraggingSummaryFile(false)}
                  onDrop={(event) => { event.preventDefault(); setIsDraggingSummaryFile(false); void addSummaryFiles(event.dataTransfer.files); }}
                  className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${isDraggingSummaryFile ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"}`}
                >
                  {summaryFiles.length > 0 ? (
                    <div className="mb-3 w-full space-y-1.5">
                      {summaryFiles.map((file) => <div key={file.name} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-left text-[11px] font-semibold text-indigo-700 shadow-sm"><FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-[10px] font-normal text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</span></div>)}
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center gap-3 text-indigo-600"><ImageIcon className="h-7 w-7" /><FileText className="h-7 w-7" /><Paperclip className="h-7 w-7" /></div>
                      <p className="text-sm font-bold text-slate-700">Drag and drop your notes here</p>
                      <p className="mt-1 text-[11px] text-slate-500">Images, files, and PDFs supported</p>
                    </>
                  )}
                  <label className="mt-2 cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700">
                    Browse files
                    <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={(event) => { if (event.target.files) void addSummaryFiles(event.target.files); event.currentTarget.value = ""; }} />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">What should the AI focus on?</label>
                  <input type="text" value={summaryRequirement} onChange={(event) => setSummaryRequirement(event.target.value)} placeholder="e.g. Focus on formulas, definitions, and 10-mark answers" className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500">
                  Text files are read automatically. Add a title or paste extracted PDF/image text if the file contains scanned content.
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Ready for AI analysis</span>

                  <button
                    onClick={handleSummarizeSubmit}
                    disabled={summaryLoading || !summaryText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {summaryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span>Generate Summary</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Generated Summary Result */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-900">
                      AI Summary
                    </h3>
                    {summaryResult && (
                      <button
                        onClick={() => copyToClipboard(summaryResult)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>Copy Summary</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3.5 text-xs text-slate-700 space-y-2 leading-relaxed">
                    {summaryLoading ? (
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                        <p className="font-semibold text-slate-700">
                          Extracting key takeaways and exam flashcards...
                        </p>
                      </div>
                    ) : summaryResult ? (
                      <div className="whitespace-pre-line font-sans bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-96 overflow-y-auto">
                        {summaryResult}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 space-y-1">
                        <FileText className="h-8 w-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-slate-600">
                          No summary generated yet
                        </p>
                        <p className="text-[11px]">
                          Click "Generate Summary" to extract bullet points and high-yield notes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Generate Quiz */}
        {activeTab === "quiz" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40 space-y-5">
            {/* Quiz Generator Input Form */}
            <form
              onSubmit={handleGenerateQuizSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Generate Practice Questions with AI
                </h3>
                <span className="text-xs font-semibold text-purple-600">
                  Instant Grading & Scoring
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Topic / Sub-Chapter
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Valuation of Goodwill or Price Elasticity..."
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Subject
                  </label>
                  {isQuizSubjectPickerOpen ? (
                    <div className="grid max-h-32 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3">
                      {subjectOptions.map((subject) => {
                        const SubjectIcon = getSubjectIcon(subject);
                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => {
                              setQuizSubject(subject);
                              setIsQuizSubjectPickerOpen(false);
                            }}
                            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border p-1.5 text-center text-[10px] font-bold transition ${
                              quizSubject === subject
                                ? "border-purple-500 bg-purple-50 text-purple-900"
                                : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                            }`}
                          >
                            <SubjectIcon className="h-4 w-4" />
                            <span>{subject}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsQuizSubjectPickerOpen(true)}
                      className="flex w-full items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-left text-xs font-bold text-purple-900"
                    >
                      {React.createElement(getSubjectIcon(quizSubject), { className: "h-4 w-4 shrink-0" })}
                      <span className="truncate">{quizSubject}</span>
                      <span className="ml-auto text-[10px] font-semibold text-purple-600">Change</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={quizLoading || !quizTopic.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-sm"
                >
                  {quizLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gamepad2 className="h-4 w-4" />
                  )}
                  <span>Create 3 Practice MCQs</span>
                </button>
              </div>
            </form>

            {/* Generated Quiz Interactive Player */}
            {generatedQuiz && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Practice Quiz: {quizTopic}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Select the best answer for each question and submit for evaluation
                    </p>
                  </div>

                  {quizScore !== null && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                      Score: {quizScore} / {generatedQuiz.length} (+{quizScore * 25} Leaderboard Points!)
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {generatedQuiz.map((q, idx) => {
                    const answered = userAnswers[q.id] !== undefined;
                    const isSubmitted = quizScore !== null;

                    return (
                      <div
                        key={q.id || idx}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5"
                      >
                        <p className="text-xs font-bold text-slate-900">
                          Q{idx + 1}. {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[q.id] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;

                            let buttonStyle =
                              "bg-white border-slate-200 text-slate-700 hover:border-blue-400";
                            if (isSelected) {
                              buttonStyle = "bg-blue-50 border-blue-500 text-blue-700 font-bold";
                            }
                            if (isSubmitted) {
                              if (isCorrect) {
                                buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold";
                              } else if (isSelected && !isCorrect) {
                                buttonStyle = "bg-rose-50 border-rose-500 text-rose-800";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleAnswerSelect(q.id, optIdx)}
                                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs text-left transition ${buttonStyle}`}
                              >
                                <span>{opt}</span>
                                {isSubmitted && isCorrect && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-1" />
                                )}
                                {isSubmitted && isSelected && !isCorrect && (
                                  <XCircle className="h-4 w-4 text-rose-600 shrink-0 ml-1" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {isSubmitted && (
                          <div className="mt-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">
                    {Object.keys(userAnswers).length} of {generatedQuiz.length} answered
                  </span>

                  {quizScore === null ? (
                    <button
                      onClick={handleFinishQuiz}
                      disabled={Object.keys(userAnswers).length === 0}
                      className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      Submit & Check Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizScore(null);
                        setUserAnswers({});
                      }}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      Retry Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BrainCircuit className="h-3.5 w-3.5 text-blue-600" />
            StudyHub Academic Reasoning Engine
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
