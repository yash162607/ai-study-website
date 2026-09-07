import React, { useState } from "react";
import {
  X,
  BookOpen,
  Search,
  Download,
  Star,
  FileText,
  Filter,
  Eye,
  CheckCircle2,
  Share2,
  Sparkles,
  FileUp,
} from "lucide-react";
import { StudyNote, AcademicYear } from "../../types";

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: StudyNote[];
  currentYear: AcademicYear;
  onAskAIAboutNote: (noteTitle: string, subject: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  currentYear,
  onAskAIAboutNote,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [activePreviewNote, setActivePreviewNote] = useState<StudyNote | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) setActivePreviewNote(null);
  }, [isOpen]);

  React.useEffect(() => {
    setSelectedSubject("all");
  }, [currentYear]);

  if (!isOpen) return null;

  // Extract unique subjects
  const subjects = Array.from(new Set(notes.filter((note) => note.year === currentYear).map((note) => note.subject)));

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesYear = note.year === currentYear;
    const matchesSubject = selectedSubject === "all" || note.subject === selectedSubject;

    return matchesSearch && matchesYear && matchesSubject;
  }).sort((firstNote, secondNote) => {
    const firstPriority = firstNote.fileType === "pdf" ? 0 : firstNote.fileUrl ? 1 : 2;
    const secondPriority = secondNote.fileType === "pdf" ? 0 : secondNote.fileUrl ? 1 : 2;
    return firstPriority - secondPriority;
  });

  const handleDownload = (note: StudyNote) => {
    if (note.fileUrl) {
      const link = document.createElement("a");
      link.href = note.fileUrl;
      link.download = note.fileName || note.title;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownloadSuccessId(note.id);
    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="notes-modal-content"
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Study Material & Subject Notes
              </h2>
              <p className="text-xs text-slate-500">
                Verified handwritten notes, unit-wise summaries & formula sheets
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

        {/* Filters & Search Toolbar */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by topic, unit, formula, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              {currentYear} Year Material
            </span>
          </div>

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">Subjects:</span>
            <button
              onClick={() => setSelectedSubject("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  selectedSubject === sub
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Notes Grid or Note Reader Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
          {activePreviewNote ? (
            /* Note Preview / Reader Mode */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={() => setActivePreviewNote(null)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  ← Back to Notes List
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAskAIAboutNote(activePreviewNote.title, activePreviewNote.subject)}
                    className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Explain with AI</span>
                  </button>
                  <button
                    onClick={() => setActivePreviewNote(activePreviewNote)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Notes</span>
                  </button>
                  <button
                    onClick={() => handleDownload(activePreviewNote)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{activePreviewNote.fileType === "pdf" ? `Download PDF (${activePreviewNote.pages}p)` : "Download File"}</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <span>{activePreviewNote.subject}</span>
                  <span>•</span>
                  <span>{activePreviewNote.unit}</span>
                  <span>•</span>
                  <span>{activePreviewNote.year} Semester {activePreviewNote.semester}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {activePreviewNote.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Author: {activePreviewNote.author} • ⭐ {activePreviewNote.rating} rating ({activePreviewNote.downloads} student downloads)
                </p>
              </div>

              {activePreviewNote.fileUrl && activePreviewNote.fileType === "pdf" ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-600">
                    <span>Notes Preview</span>
                    <button
                      type="button"
                      onClick={() => window.open(activePreviewNote.fileUrl, "_blank", "noopener,noreferrer")}
                      className="rounded-md bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100"
                    >
                      View Notes
                    </button>
                  </div>
                  <iframe
                    src={activePreviewNote.fileUrl}
                    title={activePreviewNote.title}
                    className="w-full h-[60vh] min-h-[420px] bg-white"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-xs leading-relaxed text-slate-700 font-mono">
                  <div className="border-b border-slate-200 pb-2 font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileUp className="h-4 w-4 text-blue-600" />
                    Study File Preview
                  </div>
                  <p className="text-slate-800 font-sans text-sm">
                    {activePreviewNote.summary}
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-sans">
                    <p className="text-slate-600 text-xs">
                      This file is not a PDF previewable in-browser. Use the download button above to save it to your device.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Notes Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">No notes found matching filters</p>
                  <p className="text-xs">Try searching for other topics or changing the year tab.</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs hover:border-blue-300 hover:shadow-sm transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                          {note.subject}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {note.year} • {note.unit}
                        </span>
                      </div>

                      <h4 className="mt-2.5 text-sm font-bold text-slate-900 line-clamp-2">
                        {note.title}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {note.summary}
                      </p>

                      {/* Tag badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {note.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {note.rating}
                        </span>
                        <span>•</span>
                        <span>{note.pages} pages</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActivePreviewNote(note)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>View Notes</span>
                        </button>

                        <button
                          onClick={() => handleDownload(note)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            downloadSuccessId === note.id
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {downloadSuccessId === note.id ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Downloaded</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5" />
                              <span>{note.fileType === "pdf" ? "PDF" : "File"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredNotes.length}</strong> verified study resources
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close Material Hub
          </button>
        </div>
      </div>
    </div>
  );
};
