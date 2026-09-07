import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  X,
  FileText,
  Eye,
  CheckCircle2,
  BookOpen,
  Clock,
  Award,
  BookCheck,
  ExternalLink,
} from "lucide-react";
import { PYQPaper, AcademicYear } from "../../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PDFPreview: React.FC<{ url: string }> = ({ url }) => {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Loading question paper...");

  useEffect(() => {
    let cancelled = false;
    const loadingTask = pdfjsLib.getDocument({ url });

    loadingTask.promise.then(async (pdf) => {
      if (!pagesRef.current) return;
      pagesRef.current.replaceChildren();

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, Math.max(1, (pagesRef.current.clientWidth - 32) / baseViewport.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.className = "mx-auto mb-4 block max-w-full bg-white shadow-md";
        pagesRef.current.appendChild(canvas);
        await page.render({ canvasContext: context, viewport }).promise;
      }
      if (!cancelled) setStatus("");
    }).catch(() => {
      if (!cancelled) setStatus("This paper could not be previewed. Use Open in New Tab to view it.");
    });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [url]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-200 p-4">
      {status && <p className="py-10 text-center text-sm font-semibold text-slate-500">{status}</p>}
      <div ref={pagesRef} />
    </div>
  );
};

interface PYQModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: PYQPaper[];
  currentYear: AcademicYear;
}

export const PYQModal: React.FC<PYQModalProps> = ({
  isOpen,
  onClose,
  papers,
  currentYear,
}) => {
  const [selectedExamYear, setSelectedExamYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");
  const papersContainerRef = useRef<HTMLDivElement>(null);
  const [previewPaper, setPreviewPaper] = useState<PYQPaper | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedExamYear("all");
    setSelectedSemester("all");
    setSelectedExamType("all");
    papersContainerRef.current?.scrollTo({ top: 0 });
  }, [isOpen]);

  if (!isOpen) return null;

  const examYears = Array.from(new Set(papers.filter((paper) => paper.collegeYear === currentYear).map((paper) => paper.yearOfExam)))
    .sort((firstYear, secondYear) => secondYear - firstYear);
  const semesterOptions = currentYear === "FY" ? [1, 2] : currentYear === "SY" ? [3, 4] : [5, 6];

  const filteredPapers = papers.filter((paper) => {
    const matchesExamYear =
      selectedExamYear === "all" || paper.yearOfExam.toString() === selectedExamYear;
    const matchesSemester =
      selectedSemester === "all" || paper.semester.toString() === selectedSemester;
    const paperExamType = paper.examType === "End-Term" ? "external" : "internal";
    const matchesExamType =
      selectedExamType === "all" ||
      paperExamType === selectedExamType;
    return (
      paper.collegeYear === currentYear &&
      matchesExamYear &&
      matchesSemester &&
      matchesExamType
    );
  });

  const getPaperDuration = (paper: PYQPaper) => {
    if (paper.examType === "End-Term") return "2 Hours";
    if (paper.examType === "Internal Backlog") return "30 Minutes";
    return paper.duration;
  };

  const handleViewPaper = (id: string) => {
    const paper = papers.find((item) => item.id === id);
    if (paper?.downloadUrl) setPreviewPaper(paper);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="pyq-modal-content"
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Previous Year Question Papers (PYQs)
              </h2>
              <p className="text-xs text-slate-500">
                Official university past papers with verified solution keys
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

        {/* Filters Toolbar */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Exam Year Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Paper Year:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedExamYear("all")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedExamYear === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {examYears.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedExamYear(yr.toString())}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedExamYear === yr.toString()
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Semester Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              Semester ({currentYear}: Sem {semesterOptions[0]}-{semesterOptions[1]}):
            </span>
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setSelectedSemester("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  selectedSemester === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {semesterOptions.map((semester) => (
                <button
                  key={semester}
                  onClick={() => setSelectedSemester(semester.toString())}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedSemester === semester.toString()
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Sem {semester}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Type Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Exam:
            </span>
            <div className="flex items-center gap-1">
              {[
                { value: "all", label: "All" },
                { value: "internal", label: "Internal" },
                { value: "external", label: "External" },
              ].map((exam) => (
                <button
                  key={exam.value}
                  onClick={() => setSelectedExamType(exam.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedExamType === exam.value
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {exam.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Papers Grid */}
        <div ref={papersContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
          {filteredPapers.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-500">
              {selectedExamYear === "2023" &&
              selectedSemester === "1" &&
              selectedExamType === "internal"
                ? "No paper available"
                : "No papers match the selected filters"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {paper.collegeYear} • Sem {paper.semester}
                    </span>
                  </div>

                  <h3 className="mt-2.5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                    <span>{paper.subject} Examination Paper</span>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {paper.collegeYear} Year
                    </span>
                  </h3>

                  <div className="mt-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      {paper.yearOfExam} {paper.examType === "End-Term" ? "External" : "Internal"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {getPaperDuration(paper)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {paper.totalMarks} Marks
                    </span>
                  </div>

                  {paper.solved ? (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/70 rounded-lg p-2 border border-emerald-200/60">
                      <BookCheck className="h-4 w-4 text-emerald-600" />
                      <span>Includes Full Step-by-Step Model Answers</span>
                    </div>
                  ) : (
                    <div className="mt-3 text-[11px] text-slate-400 bg-slate-50 rounded-lg p-2">
                      Original question paper format without answers
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleViewPaper(paper.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Paper</span>
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredPapers.length}</strong> previous year papers
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close PYQ Archive
          </button>
        </div>
      </div>

      {previewPaper?.downloadUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900">{previewPaper.subject} Examination Paper</h2>
                <p className="text-xs text-slate-500">{previewPaper.yearOfExam} • Semester {previewPaper.semester}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPaper.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in New Tab
                </a>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close paper preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <PDFPreview url={previewPaper.downloadUrl} />
          </div>
        </div>
      )}
    </div>
  );
};
