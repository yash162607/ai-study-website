import React, { useEffect, useState } from "react";
import { FilePenLine, LogOut, Plus, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { AuthUser, PYQPaper, StudyNote } from "../types";

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

const emptyNote = { title: "", subject: "", year: "SY" as const, semester: 3, unit: "", pages: 1, author: "", rating: 0, downloads: 0, tags: [], summary: "" };
const emptyPyq = { subject: "", yearOfExam: new Date().getFullYear(), collegeYear: "SY" as const, semester: 3, examType: "End-Term" as const, duration: "3 hours", totalMarks: 100, solved: false };
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [tab, setTab] = useState<"overview" | "notes" | "pyqs" | "users">("overview");
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [papers, setPapers] = useState<PYQPaper[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [noteForm, setNoteForm] = useState<any>(emptyNote);
  const [pyqForm, setPyqForm] = useState<any>(emptyPyq);
  const [message, setMessage] = useState("");

  const load = async () => {
    const headers = { "Content-Type": "application/json" };
    const [notesResponse, papersResponse, usersResponse] = await Promise.all([fetch("/api/notes"), fetch("/api/pyqs"), fetch("/api/admin/users", { headers })]);
    if (notesResponse.ok) setNotes(await notesResponse.json());
    if (papersResponse.ok) setPapers(await papersResponse.json());
    if (usersResponse.ok) setUsers((await usersResponse.json()).users);
  };
  useEffect(() => { load().catch(() => setMessage("Unable to load admin data.")); }, []);

  const save = async (kind: "notes" | "pyqs", value: any) => {
    const id = value.id;
    const response = await fetch(`/api/admin/${kind}${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to save item.");
    setMessage(`${kind === "notes" ? "Note" : "PYQ"} saved successfully.`);
    await load();
    if (kind === "notes") setNoteForm(emptyNote); else setPyqForm(emptyPyq);
  };

  const remove = async (kind: "notes" | "pyqs" | "users", id: string) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    const response = await fetch(`/api/admin/${kind}/${id}`, { method: "DELETE" });
    if (response.ok) { setMessage("Item deleted."); await load(); }
  };

  return <div className="min-h-screen bg-slate-950 text-slate-900">
    <header className="border-b border-slate-800 bg-slate-900 px-4 py-4 text-white sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><div className="flex items-center gap-2 text-xl font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">S</span> Study<span className="text-blue-400">Hub</span><span className="ml-2 rounded-full bg-amber-400/15 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-300">Admin</span></div><p className="mt-1 text-xs text-slate-400">Content and user management console</p></div><button onClick={onLogout} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"><LogOut className="h-4 w-4" /> Logout</button></div></header>
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8 lg:flex-row"><aside className="lg:w-56"><div className="mb-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-white"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-emerald-400" /> {user.fullName}</div><p className="text-xs text-slate-400">{user.email}</p></div><nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">{([['overview', 'Overview'], ['notes', 'Manage Notes'], ['pyqs', 'Manage PYQs'], ['users', 'Students']] as const).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${tab === id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>{label}</button>)}</nav></aside>
      <main className="min-w-0 flex-1 rounded-2xl bg-slate-50 p-5 sm:p-7">{message && <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}<button onClick={() => setMessage("")}><X className="h-4 w-4" /></button></div>}
        {tab === "overview" && <><h1 className="text-2xl font-bold">Admin overview</h1><p className="mt-1 text-sm text-slate-500">Manage the material that students use every day.</p><div className="mt-6 grid gap-4 sm:grid-cols-3">{[["Study notes", notes.length, "notes"], ["Question papers", papers.length, "pyqs"], ["Registered students", users.filter((item) => item.role === "user").length, "users"]].map(([label, value, id]) => <button key={id} onClick={() => setTab(id as any)} className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></button>)}</div></>}
        {tab === "notes" && <section><div className="mb-5 flex items-center justify-between"><div><h1 className="text-2xl font-bold">Manage notes</h1><p className="text-sm text-slate-500">Add, edit, or remove study material.</p></div><button onClick={() => setNoteForm(emptyNote)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> New note</button></div><form onSubmit={(event) => { event.preventDefault(); save("notes", noteForm).catch((error) => setMessage(error.message)); }} className="mb-7 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2"><input required className={inputClass} placeholder="Title" value={noteForm.title} onChange={(event) => setNoteForm({ ...noteForm, title: event.target.value })} /><input required className={inputClass} placeholder="Subject" value={noteForm.subject} onChange={(event) => setNoteForm({ ...noteForm, subject: event.target.value })} /><select className={inputClass} value={noteForm.year} onChange={(event) => setNoteForm({ ...noteForm, year: event.target.value })}><option>FY</option><option>SY</option><option>TY</option></select><input className={inputClass} placeholder="Unit" value={noteForm.unit} onChange={(event) => setNoteForm({ ...noteForm, unit: event.target.value })} /><input className={inputClass} placeholder="Summary" value={noteForm.summary} onChange={(event) => setNoteForm({ ...noteForm, summary: event.target.value })} /><button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">{noteForm.id ? "Update note" : "Add note"}</button></form><div className="space-y-2">{notes.map((note) => <div key={note.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-bold">{note.title}</p><p className="text-xs text-slate-500">{note.subject} · {note.year}</p></div><div className="flex gap-2"><button onClick={() => setNoteForm(note)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Edit note"><FilePenLine className="h-4 w-4" /></button><button onClick={() => remove("notes", note.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete note"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></section>}
        {tab === "pyqs" && <section><div className="mb-5"><h1 className="text-2xl font-bold">Manage PYQs</h1><p className="text-sm text-slate-500">Keep previous-year question papers current.</p></div><form onSubmit={(event) => { event.preventDefault(); save("pyqs", pyqForm).catch((error) => setMessage(error.message)); }} className="mb-7 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2"><input required className={inputClass} placeholder="Subject" value={pyqForm.subject} onChange={(event) => setPyqForm({ ...pyqForm, subject: event.target.value })} /><input className={inputClass} type="number" placeholder="Exam year" value={pyqForm.yearOfExam} onChange={(event) => setPyqForm({ ...pyqForm, yearOfExam: Number(event.target.value) })} /><select className={inputClass} value={pyqForm.collegeYear} onChange={(event) => setPyqForm({ ...pyqForm, collegeYear: event.target.value })}><option>FY</option><option>SY</option><option>TY</option></select><input className={inputClass} placeholder="Duration" value={pyqForm.duration} onChange={(event) => setPyqForm({ ...pyqForm, duration: event.target.value })} /><button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">{pyqForm.id ? "Update PYQ" : "Add PYQ"}</button></form><div className="space-y-2">{papers.map((paper) => <div key={paper.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-bold">{paper.subject}</p><p className="text-xs text-slate-500">{paper.collegeYear} · {paper.yearOfExam} · {paper.examType}</p></div><div className="flex gap-2"><button onClick={() => setPyqForm(paper)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Edit PYQ"><FilePenLine className="h-4 w-4" /></button><button onClick={() => remove("pyqs", paper.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete PYQ"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></section>}
        {tab === "users" && <section><div className="mb-5"><h1 className="text-2xl font-bold">Student users</h1><p className="text-sm text-slate-500">View basic account information and remove student accounts.</p></div><div className="space-y-2">{users.map((student) => <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-bold">{student.fullName} <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase text-slate-500">{student.role}</span></p><p className="text-xs text-slate-500">{student.email} · {student.college} · {student.year}</p></div>{student.role === "user" && <button onClick={() => remove("users", student.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete student"><Trash2 className="h-4 w-4" /></button>}</div>)}</div></section>}
      </main>
    </div>
  </div>;
};
