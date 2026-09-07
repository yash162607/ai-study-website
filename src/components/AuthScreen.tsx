import React, { useState } from "react";
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { AuthUser, AcademicYear } from "../types";

interface AuthScreenProps {
  initialMode?: "login" | "register";
  onAuthenticated: (user: AuthUser, isNewUser: boolean) => void;
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode = "login", onAuthenticated }) => {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ fullName: "", email: "", mobile: "", college: "", course: "BBA", year: "SY" as AcademicYear, password: "", confirmPassword: "", acceptedTerms: false, rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (mode === "register" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to complete that request.");
      onAuthenticated(data.user, mode === "register");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete that request.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setError("");
    setNotice("");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">
        <section className="relative hidden overflow-hidden bg-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[36px] border-blue-500/50" />
          <div className="relative">
            <div className="mb-12 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-black text-blue-700">S</div><span className="text-2xl font-bold">Study<span className="text-blue-200">Hub</span></span></div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Your academic command center</p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight">Make every study session count.</h1>
          </div>
          <div className="relative flex items-center gap-3 text-sm text-blue-100"><BookOpen className="h-5 w-5" /> Notes, PYQs, planning, and AI support in one place.</div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">S</div><span className="text-xl font-bold text-blue-900">Study<span className="text-blue-600">Hub</span></span></div></div>
            <div className="mb-7"><p className="mb-2 text-sm font-semibold text-blue-600">{mode === "login" ? "Welcome back" : "Join StudyHub"}</p><h2 className="text-3xl font-bold tracking-tight text-slate-900">{mode === "login" ? "Sign in to continue" : "Create your account"}</h2><p className="mt-2 text-sm text-slate-500">{mode === "login" ? "Your study workspace is waiting." : "Set up your student profile in under a minute."}</p></div>
            {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
            {notice && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</div>}
            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && <><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Full Name</span><div className="relative"><UserRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className={`${inputClass} pl-10`} placeholder="Your full name" /></div></label><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Mobile Number <span className="font-normal normal-case">(optional)</span></span><input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} className={inputClass} inputMode="tel" placeholder="+91 98765 43210" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">College Name</span><input required value={form.college} onChange={(event) => update("college", event.target.value)} className={inputClass} placeholder="Your college" /></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Course</span><select value={form.course} onChange={(event) => update("course", event.target.value)} className={inputClass}><option>BBA</option></select></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Year</span><select value={form.year} onChange={(event) => update("year", event.target.value)} className={inputClass}><option value="FY">FY</option><option value="SY">SY</option><option value="TY">TY</option></select></label></div></>}
              <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Email Address</span><div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={`${inputClass} pl-10`} placeholder="you@example.com" /></div></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Password</span><div className="relative"><LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required minLength={8} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} className={`${inputClass} pl-10 pr-11`} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400" aria-label="Show or hide password">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label>
              {mode === "register" && <><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Confirm Password</span><div className="relative"><input required minLength={8} type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} className={`${inputClass} pr-11`} placeholder="Repeat your password" /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-slate-400" aria-label="Show or hide confirmation password">{showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label><label className="flex items-start gap-2 text-xs text-slate-500"><input required type="checkbox" checked={form.acceptedTerms} onChange={(event) => update("acceptedTerms", event.target.checked)} className="mt-0.5 accent-blue-600" />I agree to the Terms & Conditions and Privacy Policy.</label></>}
              {mode === "login" && <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" checked={form.rememberMe} onChange={(event) => update("rememberMe", event.target.checked)} className="accent-blue-600" />Remember me</label><button type="button" onClick={() => setNotice("Please contact a StudyHub administrator to reset your password.")} className="font-semibold text-blue-600 hover:underline">Forgot Password?</button></div>}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}</button>
            </form>
            <p className="mt-7 text-center text-sm text-slate-500">{mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}<button onClick={() => switchMode(mode === "login" ? "register" : "login")} className="font-bold text-blue-600 hover:underline">{mode === "login" ? "Create Account" : "Login"}</button></p>
          </div>
        </section>
      </div>
    </main>
  );
};