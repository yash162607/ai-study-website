import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { sampleNotesList, samplePYQPapers } from "../src/data/mockData";
import { PYQPaper, StudyNote } from "../src/types";
import { hashPassword, normalizeEmail } from "./auth";

const database = new Database(path.join(process.cwd(), "studyhub.db"));

const ensureNoteSchema = () => {
  const columns = database.prepare("PRAGMA table_info(notes)").all() as Array<{ name: string }>;
  const existing = new Set(columns.map((column) => column.name));

  const requiredColumns = [
    ["file_name", "TEXT"],
    ["file_url", "TEXT"],
    ["file_type", "TEXT DEFAULT 'other'"],
  ] as const;

  requiredColumns.forEach(([columnName, columnDef]) => {
    if (!existing.has(columnName)) {
      database.exec(`ALTER TABLE notes ADD COLUMN ${columnName} ${columnDef}`);
    }
  });
};

const getFileType = (fileName: string): StudyNote["fileType"] => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".pptx")) return "pptx";
  if (lower.endsWith(".doc")) return "doc";
  if (lower.endsWith(".docx")) return "docx";
  return "other";
};

function buildFileUrl(year: StudyNote["year"], subject: string, fileName: string): string {
  const yearFolder = year === "FY" ? "/FY" : "";
  return `/notes${yearFolder}/${encodeURIComponent(subject)}/${encodeURIComponent(fileName)}`;
}

function getActualUploadedNotes(): Array<Omit<StudyNote, "tags"> & { tags: string[] }> {
  const notesRoot = path.join(process.cwd(), "public", "notes");
  if (!fs.existsSync(notesRoot)) return [];

  const uploaded: Array<Omit<StudyNote, "tags"> & { tags: string[] }> = [];

  const addSubjectNotes = (subject: string, year: StudyNote["year"], subjectDir: string) => {
    const files = fs.readdirSync(subjectDir)
      .filter((file) => /\.(pdf|pptx|doc|docx)$/i.test(file))
      .sort();

    files.forEach((fileName, index) => {
      const title = fileName.replace(/\.[^/.]+$/, "");
      uploaded.push({
        id: `uploaded-${year.toLowerCase()}-${subject}-${index}-${fileName}`,
        title,
        subject,
        year,
        semester: 3,
        unit: "Uploaded Notes",
        pages: 20 + (index % 5) * 8,
        author: "Uploaded Study Material",
        rating: 4.8,
        downloads: 0,
        tags: [subject, "Uploaded", `${year} Notes`],
        summary: `Uploaded notes for ${subject}. This file is available for preview and direct download.`,
        fileUrl: buildFileUrl(year, subject, fileName),
        fileName,
        fileType: getFileType(fileName),
      });
    });
  };

  fs.readdirSync(notesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      if (entry.name === "FY") {
        fs.readdirSync(path.join(notesRoot, entry.name), { withFileTypes: true })
          .filter((subjectEntry) => subjectEntry.isDirectory())
          .forEach((subjectEntry) => {
            addSubjectNotes(
              subjectEntry.name,
              "FY",
              path.join(notesRoot, entry.name, subjectEntry.name)
            );
          });
        return;
      }

      addSubjectNotes(entry.name, "SY", path.join(notesRoot, entry.name));
    });

  return uploaded;
}

function syncUploadedNotes(): void {
  const uploadedNotes = getActualUploadedNotes();
  if (uploadedNotes.length === 0) {
    database.prepare("DELETE FROM notes WHERE id LIKE 'uploaded-%'").run();
    return;
  }

  const subjectNames = uploadedNotes.map((note) => note.subject);
  const placeholders = subjectNames.map(() => "?").join(", ");

  database.prepare(`DELETE FROM notes WHERE id LIKE 'uploaded-%' AND subject NOT IN (${placeholders})`).run(...subjectNames);

  const insertNote = database.prepare(`
    INSERT INTO notes (id, title, subject, year, semester, unit, pages, author, rating, downloads, tags, summary, file_name, file_url, file_type)
    VALUES (@id, @title, @subject, @year, @semester, @unit, @pages, @author, @rating, @downloads, @tags, @summary, @fileName, @fileUrl, @fileType)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      subject = excluded.subject,
      year = excluded.year,
      semester = excluded.semester,
      unit = excluded.unit,
      pages = excluded.pages,
      author = excluded.author,
      rating = excluded.rating,
      downloads = excluded.downloads,
      tags = excluded.tags,
      summary = excluded.summary,
      file_name = excluded.file_name,
      file_url = excluded.file_url,
      file_type = excluded.file_type
  `);

  uploadedNotes.forEach((note) => {
    insertNote.run({
      ...note,
      tags: JSON.stringify(note.tags),
      fileName: note.fileName ?? null,
      fileUrl: note.fileUrl ?? null,
      fileType: note.fileType ?? "other",
    });
  });
}

database.pragma("journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT,
    college TEXT NOT NULL,
    course TEXT NOT NULL,
    year TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    year TEXT NOT NULL,
    semester INTEGER NOT NULL,
    unit TEXT NOT NULL,
    pages INTEGER NOT NULL,
    author TEXT NOT NULL,
    rating REAL NOT NULL,
    downloads INTEGER NOT NULL,
    tags TEXT NOT NULL,
    summary TEXT NOT NULL,
    file_name TEXT,
    file_url TEXT,
    file_type TEXT DEFAULT 'other'
  );

  CREATE TABLE IF NOT EXISTS pyqs (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    year_of_exam INTEGER NOT NULL,
    college_year TEXT NOT NULL,
    semester INTEGER NOT NULL,
    exam_type TEXT NOT NULL,
    duration TEXT NOT NULL,
    total_marks INTEGER NOT NULL,
    solved INTEGER NOT NULL,
    download_url TEXT
  );
`);

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  college: string;
  course: string;
  year: "FY" | "SY" | "TY";
  role: "user" | "admin";
  createdAt: string;
}

function mapUser(row: any): AuthUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile ?? undefined,
    college: row.college,
    course: row.course,
    year: row.year,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function createUser(input: {
  fullName: string;
  email: string;
  mobile?: string;
  college: string;
  course: string;
  year: "FY" | "SY" | "TY";
  password: string;
  role?: "user" | "admin";
}): AuthUser {
  const id = crypto.randomUUID();
  database.prepare(`
    INSERT INTO users (id, full_name, email, mobile, college, course, year, password_hash, role)
    VALUES (@id, @fullName, @email, @mobile, @college, @course, @year, @passwordHash, @role)
  `).run({
    id,
    fullName: input.fullName.trim(),
    email: normalizeEmail(input.email),
    mobile: input.mobile?.trim() || null,
    college: input.college.trim(),
    course: input.course,
    year: input.year,
    passwordHash: hashPassword(input.password),
    role: input.role ?? "user",
  });
  return getUserById(id)!;
}

export function getUserById(id: string): AuthUser | undefined {
  const row = database.prepare("SELECT id, full_name, email, mobile, college, course, year, role, created_at FROM users WHERE id = ?").get(id);
  return row ? mapUser(row) : undefined;
}

export function getUserWithPasswordByEmail(email: string): (AuthUser & { passwordHash: string }) | undefined {
  const row = database.prepare("SELECT * FROM users WHERE email = ?").get(normalizeEmail(email)) as any;
  return row ? { ...mapUser(row), passwordHash: row.password_hash } : undefined;
}

export function createSession(tokenHash: string, userId: string, expiresAt: string): void {
  database.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash, userId, expiresAt);
}

export function getUserBySession(tokenHash: string): AuthUser | undefined {
  const row = database.prepare(`
    SELECT u.id, u.full_name, u.email, u.mobile, u.college, u.course, u.year, u.role, u.created_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > datetime('now')
  `).get(tokenHash);
  return row ? mapUser(row) : undefined;
}

export function deleteSession(tokenHash: string): void {
  database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export function updateUserProfile(id: string, input: { fullName: string; mobile?: string; college: string; course: string; year: "FY" | "SY" | "TY" }): AuthUser | undefined {
  database.prepare("UPDATE users SET full_name = ?, mobile = ?, college = ?, course = ?, year = ? WHERE id = ?").run(input.fullName.trim(), input.mobile?.trim() || null, input.college.trim(), input.course, input.year, id);
  return getUserById(id);
}

export function listUsers(): AuthUser[] {
  return (database.prepare("SELECT id, full_name, email, mobile, college, course, year, role, created_at FROM users ORDER BY created_at DESC").all() as any[]).map(mapUser);
}

export function deleteUser(id: string): void {
  database.prepare("DELETE FROM users WHERE id = ? AND role = 'user'").run(id);
}

export function upsertNote(note: StudyNote): void {
  database.prepare(`
    INSERT INTO notes (id, title, subject, year, semester, unit, pages, author, rating, downloads, tags, summary, file_name, file_url, file_type)
    VALUES (@id, @title, @subject, @year, @semester, @unit, @pages, @author, @rating, @downloads, @tags, @summary, @fileName, @fileUrl, @fileType)
    ON CONFLICT(id) DO UPDATE SET title = excluded.title, subject = excluded.subject, year = excluded.year,
      semester = excluded.semester, unit = excluded.unit, pages = excluded.pages, author = excluded.author,
      rating = excluded.rating, tags = excluded.tags, summary = excluded.summary, file_name = excluded.file_name,
      file_url = excluded.file_url, file_type = excluded.file_type
  `).run({
    ...note,
    tags: JSON.stringify(note.tags),
    fileName: note.fileName ?? null,
    fileUrl: note.fileUrl ?? null,
    fileType: note.fileType ?? "other",
  });
}

export function deleteNote(id: string): void {
  database.prepare("DELETE FROM notes WHERE id = ?").run(id);
}

ensureNoteSchema();

const insertNote = database.prepare(`
  INSERT OR IGNORE INTO notes (id, title, subject, year, semester, unit, pages, author, rating, downloads, tags, summary, file_name, file_url, file_type)
  VALUES (@id, @title, @subject, @year, @semester, @unit, @pages, @author, @rating, @downloads, @tags, @summary, @fileName, @fileUrl, @fileType)
`);
const seedNotes = database.transaction((notes: StudyNote[]) => {
  for (const note of notes) insertNote.run({ ...note, tags: JSON.stringify(note.tags), fileName: note.fileName ?? null, fileUrl: note.fileUrl ?? null, fileType: note.fileType ?? "other" });
});
seedNotes(sampleNotesList);
syncUploadedNotes();

const pyqCount = database.prepare("SELECT COUNT(*) AS count FROM pyqs").get() as { count: number };
if (pyqCount.count === 0) {
  const insertPyq = database.prepare(`
    INSERT INTO pyqs (id, subject, year_of_exam, college_year, semester, exam_type, duration, total_marks, solved, download_url)
    VALUES (@id, @subject, @yearOfExam, @collegeYear, @semester, @examType, @duration, @totalMarks, @solved, @downloadUrl)
  `);
  const seedPyqs = database.transaction((papers: PYQPaper[]) => {
    for (const paper of papers) {
      insertPyq.run({
        ...paper,
        solved: paper.solved ? 1 : 0,
        downloadUrl: paper.downloadUrl ?? null,
      });
    }
  });
  seedPyqs(samplePYQPapers);
}

export function getNotes(): StudyNote[] {
  syncUploadedNotes();
  const rows = database.prepare("SELECT * FROM notes ORDER BY id").all() as Array<StudyNote & { tags: string; file_name?: string | null; file_url?: string | null; file_type?: string | null }>;
  return rows.map((row) => ({
    ...row,
    tags: JSON.parse(row.tags),
    fileName: row.file_name ?? undefined,
    fileUrl: row.file_url ?? undefined,
    fileType: (row.file_type as StudyNote["fileType"]) ?? "other",
  }));
}

export function getPYQs(): PYQPaper[] {
  const rows = database.prepare("SELECT * FROM pyqs ORDER BY year_of_exam DESC, college_year, semester, subject").all() as Array<{
    id: string;
    subject: string;
    year_of_exam: number;
    college_year: PYQPaper["collegeYear"];
    semester: number;
    exam_type: PYQPaper["examType"];
    duration: string;
    total_marks: number;
    solved: number;
    download_url: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    yearOfExam: row.year_of_exam,
    collegeYear: row.college_year,
    semester: row.semester,
    examType: row.exam_type,
    duration: row.duration,
    totalMarks: row.total_marks,
    solved: Boolean(row.solved),
    downloadUrl: row.download_url ?? undefined,
  }));
}

export function upsertPYQ(paper: PYQPaper): void {
  database.prepare(`
    INSERT INTO pyqs (id, subject, year_of_exam, college_year, semester, exam_type, duration, total_marks, solved, download_url)
    VALUES (@id, @subject, @yearOfExam, @collegeYear, @semester, @examType, @duration, @totalMarks, @solved, @downloadUrl)
    ON CONFLICT(id) DO UPDATE SET
      subject = excluded.subject,
      year_of_exam = excluded.year_of_exam,
      college_year = excluded.college_year,
      semester = excluded.semester,
      exam_type = excluded.exam_type,
      duration = excluded.duration,
      total_marks = excluded.total_marks,
      solved = excluded.solved,
      download_url = excluded.download_url
  `).run({
    ...paper,
    solved: paper.solved ? 1 : 0,
    downloadUrl: paper.downloadUrl ?? null,
  });
}

export function deletePYQ(id: string): void {
  database.prepare("DELETE FROM pyqs WHERE id = ?").run(id);
}
