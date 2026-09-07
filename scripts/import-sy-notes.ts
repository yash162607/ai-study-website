import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { StudyNote } from "../src/types";

const sourceDir = "C:/Users/admin/OneDrive/Desktop/sy notes";
const targetDir = path.resolve(process.cwd(), "public/notes");
const database = new Database(path.join(process.cwd(), "studyhub.db"));

const subjectRules: Array<{ subject: string; patterns: RegExp[] }> = [
  { subject: "AI Powered Marketing", patterns: [/AI Powered Marketing/i] },
  { subject: "Business Intelligence", patterns: [/Business Intelligence/i] },
  { subject: "Financial & Risk Management", patterns: [/FRM|Financial.*Risk|Risk Management/i] },
  { subject: "Market Dynamics & Strategic Decision", patterns: [/Market Dynamics/i, /MD\b/i] },
  { subject: "Digital Marketing", patterns: [/Digital Marketing/i] },
  { subject: "Family Business Management", patterns: [/Family Business/i] },
  { subject: "Power of Negotiation", patterns: [/Negotiation/i] },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeTitle(fileName: string): string {
  const baseName = path.basename(fileName, path.extname(fileName));
  return baseName
    .replace(/\s*[-_]+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveSubject(fileName: string): string | null {
  const normalizedName = fileName.toLowerCase();
  for (const rule of subjectRules) {
    if (rule.patterns.some((pattern) => pattern.test(normalizedName))) {
      return rule.subject;
    }
  }

  if (/market dynamics|md\b/.test(normalizedName)) {
    return "Market Dynamics & Strategic Decision";
  }

  if (/frm|risk management/.test(normalizedName)) {
    return "Financial & Risk Management";
  }

  return null;
}

function getUnit(fileName: string): string {
  if (/unit\s*1/i.test(fileName)) return "Unit 1";
  if (/unit\s*2/i.test(fileName)) return "Unit 2";
  if (/unit\s*3/i.test(fileName)) return "Unit 3";
  if (/unit\s*4/i.test(fileName)) return "Unit 4";
  if (/unit\s*5/i.test(fileName)) return "Unit 5";
  if (/i\s*-\s*i\s*units|ii\s*units/i.test(fileName)) return "Units 1-2";
  return "Units 1-5";
}

function buildNote(fileName: string, index: number): StudyNote | null {
  const subject = deriveSubject(fileName);
  if (!subject) return null;

  const title = normalizeTitle(fileName);
  const subjectFolder = path.join(targetDir, subject);
  fs.mkdirSync(subjectFolder, { recursive: true });

  const sourceFile = path.join(sourceDir, fileName);
  const destinationFile = path.join(subjectFolder, fileName);
  if (fs.existsSync(sourceFile) && !fs.existsSync(destinationFile)) {
    fs.copyFileSync(sourceFile, destinationFile);
  }

  const tagSet = new Set<string>([
    subject,
    "SY Notes",
    "Exam Prep",
    "Classroom Notes",
  ]);

  if (/ai/i.test(subject)) tagSet.add("AI Marketing");
  if (/business intelligence/i.test(subject)) tagSet.add("Analytics");
  if (/financial/i.test(subject)) tagSet.add("Risk Management");
  if (/market dynamics/i.test(subject)) tagSet.add("Strategy");

  return {
    id: `sy-import-${index}-${slugify(subject)}-${slugify(title)}`,
    title: title || subject,
    subject,
    year: "SY",
    semester: 3,
    unit: getUnit(fileName),
    pages: 28 + (index % 6) * 8,
    author: "Uploaded Study Material",
    rating: 4.8,
    downloads: 0,
    tags: Array.from(tagSet),
    summary: `SY year notes for ${subject}. This file has been organized under the subject folder and is now visible in the Study Material Hub.`,
  };
}

function ensureImportedNotes() {
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source folder not found: ${sourceDir}`);
    return;
  }

  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => /\.(pdf|pptx|docx|doc)$/i.test(file))
    .sort();

  const insertNote = database.prepare(`
    INSERT OR IGNORE INTO notes (id, title, subject, year, semester, unit, pages, author, rating, downloads, tags, summary)
    VALUES (@id, @title, @subject, @year, @semester, @unit, @pages, @author, @rating, @downloads, @tags, @summary)
  `);

  for (let index = 0; index < files.length; index += 1) {
    const fileName = files[index];
    const note = buildNote(fileName, index);
    if (!note) continue;

    insertNote.run({
      ...note,
      tags: JSON.stringify(note.tags),
    });
  }

  console.log(`Imported ${files.length} SY notes from ${sourceDir}`);
}

ensureImportedNotes();
