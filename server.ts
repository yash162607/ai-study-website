import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  createSession,
  createUser,
  deleteNote,
  deletePYQ,
  deleteSession,
  deleteUser,
  getNotes,
  getPYQs,
  getUserBySession,
  getUserWithPasswordByEmail,
  listUsers,
  updateUserProfile,
  upsertNote,
  upsertPYQ,
} from "./server/database";
import { createSessionToken, hashSessionToken, isValidEmail, normalizeEmail, verifyPassword } from "./server/auth";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"];
const publicDir = path.join(process.cwd(), "public");
const SESSION_COOKIE = "studyhub_session";
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function bootstrapAdminFromEnvironment(): void {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || listUsers().some((user) => user.role === "admin")) return;
  if (!isValidEmail(email) || password.length < 12) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD are present but do not meet the bootstrap requirements.");
    return;
  }
  createUser({
    fullName: process.env.ADMIN_FULL_NAME || "StudyHub Administrator",
    email,
    college: process.env.ADMIN_COLLEGE || "StudyHub",
    course: "BBA",
    year: "TY",
    password,
    role: "admin",
  });
  console.log(`Created initial admin account for ${normalizeEmail(email)}.`);
}

app.use(express.json({ limit: "10mb" }));
app.use(express.static(publicDir));

function getSessionToken(req: express.Request): string | undefined {
  const cookieHeader = req.headers.cookie || "";
  const sessionCookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return sessionCookie?.slice(`${SESSION_COOKIE}=`.length);
}

function currentUser(req: express.Request) {
  const token = getSessionToken(req);
  return token ? getUserBySession(hashSessionToken(token)) : undefined;
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ error: "Please log in to continue." });
    return;
  }
  (req as express.Request & { user: typeof user }).user = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction): void {
  requireAuth(req, res, () => {
    if ((req as express.Request & { user: { role: string } }).user.role !== "admin") {
      res.status(403).json({ error: "Administrator access is required." });
      return;
    }
    next();
  });
}

function setSessionCookie(res: express.Response, token: string, maxAgeSeconds: number): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; Max-Age=${maxAgeSeconds}; HttpOnly; Path=/; SameSite=Lax${secure}`);
}

function clearSessionCookie(res: express.Response): void {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax`);
}

function validateAccountInput(body: any, isRegistration = true): string | undefined {
  if (!body.email || !isValidEmail(String(body.email))) return "Enter a valid email address.";
  if (!body.password || String(body.password).length < 8) return "Password must be at least 8 characters.";
  if (isRegistration && (!body.fullName?.trim() || !body.college?.trim() || body.course !== "BBA" || !["FY", "SY", "TY"].includes(body.year))) {
    return "Complete all required profile fields.";
  }
  return undefined;
}

app.get("/api/auth/me", (req, res) => {
  res.json({ user: currentUser(req) ?? null });
});

app.post("/api/auth/register", (req, res) => {
  const { fullName, email, mobile, college, course, year, password, confirmPassword, acceptedTerms } = req.body || {};
  const validationError = validateAccountInput(req.body, true);
  if (validationError) return res.status(400).json({ error: validationError });
  if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match." });
  if (!acceptedTerms) return res.status(400).json({ error: "Accept the Terms & Conditions and Privacy Policy to continue." });

  try {
    const user = createUser({ fullName, email, mobile, college, course, year, password, role: "user" });
    const token = createSessionToken();
    createSession(hashSessionToken(token), user.id, new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString());
    setSessionCookie(res, token, 8 * 60 * 60);
    return res.status(201).json({ user });
  } catch (error: any) {
    if (String(error?.code) === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "An account with this email already exists." });
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Unable to create your account right now." });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password, rememberMe } = req.body || {};
  const normalizedEmail = normalizeEmail(String(email || ""));
  const now = Date.now();
  const attempt = loginAttempts.get(normalizedEmail);
  if (attempt && attempt.resetAt > now && attempt.count >= 8) return res.status(429).json({ error: "Too many login attempts. Try again in a few minutes." });
  const user = getUserWithPasswordByEmail(normalizedEmail);
  if (!user || !password || !verifyPassword(password, user.passwordHash)) {
    const nextAttempt = attempt && attempt.resetAt > now ? attempt : { count: 0, resetAt: now + 10 * 60 * 1000 };
    loginAttempts.set(normalizedEmail, { count: nextAttempt.count + 1, resetAt: nextAttempt.resetAt });
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  loginAttempts.delete(normalizedEmail);
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
  const token = createSessionToken();
  createSession(hashSessionToken(token), user.id, new Date(Date.now() + maxAge * 1000).toISOString());
  setSessionCookie(res, token, maxAge);
  return res.json({ user });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getSessionToken(req);
  if (token) deleteSession(hashSessionToken(token));
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.put("/api/auth/profile", requireAuth, (req, res) => {
  const { fullName, mobile, college, course, year } = req.body || {};
  if (!fullName?.trim() || !college?.trim() || course !== "BBA" || !["FY", "SY", "TY"].includes(year)) return res.status(400).json({ error: "Complete all required profile fields." });
  const user = updateUserProfile((req as any).user.id, { fullName, mobile, college, course, year });
  res.json({ user });
});

// Lazy initialization of Gemini API Client
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/notes", requireAuth, (_req, res) => {
  res.json(getNotes());
});

app.get("/api/pyqs", requireAuth, (_req, res) => {
  res.json(getPYQs());
});

app.get("/api/admin/users", requireAdmin, (_req, res) => {
  res.json({ users: listUsers() });
});

app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
  deleteUser(req.params.id);
  res.json({ ok: true });
});

app.post("/api/admin/notes", requireAdmin, (req, res) => {
  try {
    const note = req.body;
    if (!note?.title || !note?.subject || !["FY", "SY", "TY"].includes(note.year)) return res.status(400).json({ error: "Title, subject, and year are required." });
    upsertNote({ ...note, id: note.id || `admin-note-${Date.now()}`, semester: Number(note.semester) || 1, pages: Number(note.pages) || 1, rating: Number(note.rating) || 0, downloads: Number(note.downloads) || 0, tags: Array.isArray(note.tags) ? note.tags : [], author: note.author || "StudyHub Admin", unit: note.unit || "Admin Upload", summary: note.summary || "StudyHub study material" });
    return res.status(201).json({ notes: getNotes() });
  } catch (error) {
    console.error("Admin note error:", error);
    return res.status(400).json({ error: "Unable to save this note." });
  }
});

app.put("/api/admin/notes/:id", requireAdmin, (req, res) => {
  req.body.id = req.params.id;
  return res.redirect(307, "/api/admin/notes");
});

app.delete("/api/admin/notes/:id", requireAdmin, (req, res) => {
  deleteNote(req.params.id);
  res.json({ ok: true });
});

app.post("/api/admin/pyqs", requireAdmin, (req, res) => {
  try {
    const paper = req.body;
    if (!paper?.subject || !["FY", "SY", "TY"].includes(paper.collegeYear)) return res.status(400).json({ error: "Subject and college year are required." });
    upsertPYQ({ ...paper, id: paper.id || `admin-pyq-${Date.now()}`, yearOfExam: Number(paper.yearOfExam) || new Date().getFullYear(), semester: Number(paper.semester) || 1, totalMarks: Number(paper.totalMarks) || 100, duration: paper.duration || "3 hours", examType: paper.examType || "End-Term", solved: Boolean(paper.solved) });
    return res.status(201).json({ papers: getPYQs() });
  } catch (error) {
    console.error("Admin PYQ error:", error);
    return res.status(400).json({ error: "Unable to save this question paper." });
  }
});

app.put("/api/admin/pyqs/:id", requireAdmin, (req, res) => {
  req.body.id = req.params.id;
  return res.redirect(307, "/api/admin/pyqs");
});

app.delete("/api/admin/pyqs/:id", requireAdmin, (req, res) => {
  deletePYQ(req.params.id);
  res.json({ ok: true });
});

// AI Chat / Doubt Solver Endpoint
app.post("/api/ai/ask", requireAuth, async (req, res) => {
  try {
    const { question, subject, studentYear, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are StudyHub AI, a friendly and helpful academic tutor for college students (${studentYear || "College Student"}).
Subject: ${subject || "General Academic Studies"}
Study material context:
"""
${context || "No additional study material was provided."}
"""
Student Question / Academic Doubt:
"${question}"

Answer the student's question directly and naturally, like ChatGPT. Explain the answer clearly and conversationally, using paragraphs, examples, formulas, or bullet points only when they help answer the question. Do not add unrelated study advice, feedback sections, or generic headings.`;

      let response;
      let lastError: unknown;
      for (const model of [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS]) {
        try {
          response = await ai.models.generateContent({ model, contents: prompt });
          break;
        } catch (error) {
          lastError = error;
          console.warn(`Gemini model ${model} failed; trying the next model.`);
        }
      }

      if (response) {
        return res.json({ answer: response.text, source: "gemini" });
      }

      console.error("All Gemini models failed:", lastError);
      return res.json({
        answer: `Google AI Studio is temporarily busy, but your question was received. Please try again in a moment.\n\nQuestion: ${question}`,
        source: "temporary-fallback",
      });
    }

    // High quality student-tailored fallback when offline or no API key
    return res.json({
      answer: `I'd be happy to help with that. Regarding **${subject || "your topic"}**, your question is: ${question}\n\nPlease share any specific details or notes you want me to use, and I'll explain it step by step.`,
      source: "fallback",
    });
  } catch (error: any) {
    console.error("AI Ask error:", error);
    return res.status(500).json({
      error: "Failed to generate AI response",
      details: error?.message || "Unknown error",
    });
  }
});

// AI Text / PDF Note Summarizer Endpoint
app.post("/api/ai/summarize", requireAuth, async (req, res) => {
  try {
    const { content, title, subject, requirement } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content to summarize is required" });
    }

    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are StudyHub AI, an expert exam preparation summarizer.
Subject: ${subject || "General"}
Topic/Title: ${title || "Study Notes"}
Student requirement: ${requirement || "Create a balanced exam-ready revision summary."}
Content:
"""
${content}
"""

Please summarize this study material into:
Start with a short "Requirement Applied" line that confirms how you addressed the student's requirement.
1. 🎯 Executive Summary (2-3 sentences)
2. 🔑 5 High-Yield Key Takeaways for Semester Exams
3. ⚠️ Common Traps / Misconceptions
4. 🧠 Quick Flashcard Questions (3 Q&A pairs)`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      return res.json({
        summary: response.text,
        source: "gemini",
      });
    }

    // High quality fallback summary
    return res.json({
      summary: `### Requirement Applied\n${requirement || "Balanced exam-ready revision summary"}\n\n### 🎯 Executive Summary\nSummary of **${title || "Study Material"}**: This topic covers core theoretical foundations, procedural steps, and critical exam-focused case studies.\n\n### 🔑 5 High-Yield Takeaways\n1. **Foundational Law/Formula**: Ensure you cite the official definitions in Section A.\n2. **Classification**: Review the distinct categories and their comparative matrix.\n3. **Real-world Applications**: Most 5-mark questions test practical scenarios.\n4. **Graphical/Diagrammatic Representation**: Always draw neat labeled diagrams.\n5. **Summary Formula Sheet**: Keep numerical constants ready on your cheat sheet.\n\n### ⚠️ Common Traps\nDo not confuse similar terminology in Unit 2 with Unit 3!\n\n### 🧠 Flashcard Q&A\n**Q1:** What is the primary objective of this module?\n**A1:** To master analytical problem-solving for semester evaluations.`,
      source: "fallback",
    });
  } catch (error: any) {
    console.error("AI Summarize error:", error);
    return res.status(500).json({
      error: "Failed to summarize material",
      details: error?.message || "Unknown error",
    });
  }
});

// AI Quiz Generator Endpoint
app.post("/api/ai/quiz", requireAuth, async (req, res) => {
  try {
    const { topic, subject, count = 3 } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Create a ${count}-question multiple choice quiz for college students on the topic: "${topic || "General College Knowledge"}" in subject "${subject || "Academics"}".
Return ONLY valid JSON matching this exact structure without markdown formatting or code blocks:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      try {
        const parsed = JSON.parse(response.text || "{}");
        return res.json(parsed);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
      }
    }

    // Fallback quiz questions
    return res.json({
      questions: [
        {
          id: 1,
          question: `In ${subject || "College Academics"}, what is the most effective technique for long-term retention?`,
          options: [
            "Passive rereading multiple times",
            "Active recall and spaced repetition",
            "Cramming all night before exams",
            "Highlighting every sentence in the textbook",
          ],
          correctIndex: 1,
          explanation: "Active recall testing forces neural retrieval pathways, significantly strengthening memory consolidation.",
        },
        {
          id: 2,
          question: `When analyzing previous year papers (PYQs), which approach yields maximum score improvement?`,
          options: [
            "Only reading the questions without solving",
            "Identifying high-frequency topics and solving under timed conditions",
            "Memorizing only the shortest answers",
            "Skipping numerical and case study questions",
          ],
          correctIndex: 1,
          explanation: "Topic frequency mapping and timed solving build both conceptual mastery and exam pace.",
        },
        {
          id: 3,
          question: `What is the optimal study session length recommended by cognitive science (Pomodoro principle)?`,
          options: [
            "6 hours uninterrupted without breaks",
            "25–50 minutes of deep focus followed by 5–10 min recovery",
            "10 minutes with frequent social media checks",
            "Only studying when exam is in less than 24 hours",
          ],
          correctIndex: 1,
          explanation: "Focus intervals between 25-50 minutes maintain peak attention while preventing cognitive fatigue.",
        },
      ],
      source: "fallback",
    });
  } catch (error: any) {
    console.error("AI Quiz error:", error);
    return res.status(500).json({
      error: "Failed to generate quiz",
      details: error?.message || "Unknown error",
    });
  }
});

// Vite Middleware for development / Static file serving for production
async function start() {
  bootstrapAdminFromEnvironment();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.get("/notes/*", (req, res, next) => {
    const requestedPath = req.path.replace(/^\/notes\//, "");
    const filePath = path.join(publicDir, requestedPath);
    if (filePath.startsWith(publicDir) && filePath.includes("notes")) {
      res.sendFile(filePath, (err) => {
        if (err) next(err);
      });
      return;
    }
    next();
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyHub Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
