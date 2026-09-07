import React, { useEffect, useRef, useState } from "react";
import {
  X,
  User,
  GraduationCap,
  Building,
  Target,
  Flame,
  Award,
  Check,
  Sparkles,
  Camera,
} from "lucide-react";
import { StudentProfile, AcademicYear } from "../../types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updated: Partial<StudentProfile>) => void;
  isNewUser?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isNewUser = false,
}) => {
  const [name, setName] = useState(profile.name);
  const [college, setCollege] = useState(profile.college);
  const [year, setYear] = useState<AcademicYear>(profile.year);
  const [semester, setSemester] = useState<number | "">(isNewUser ? "" : profile.semester);
  const [nextExamDays, setNextExamDays] = useState<number | "">(isNewUser ? "" : profile.nextExamDays ?? "");
  const [stream, setStream] = useState(profile.stream);
  const [dailyGoalHours, setDailyGoalHours] = useState<number | "">(isNewUser ? "" : profile.dailyGoalHours);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(profile.name);
    setCollege(profile.college);
    setYear(profile.year);
    setSemester(isNewUser ? "" : profile.semester);
    setNextExamDays(isNewUser ? "" : profile.nextExamDays ?? "");
    setStream(profile.stream);
    setDailyGoalHours(isNewUser ? "" : profile.dailyGoalHours);
    setAvatar(profile.avatar);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : avatar;
      setAvatar(result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<StudentProfile> = {
      name,
      avatar,
      college,
      year,
      stream,
    };
    if (semester !== "") updated.semester = Number(semester);
    if (dailyGoalHours !== "") updated.dailyGoalHours = Number(dailyGoalHours);
    if (nextExamDays !== "") updated.nextExamDays = Number(nextExamDays);
    onSaveProfile(updated);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="profile-modal-content"
        className="relative flex flex-col w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Student Profile & Academic Settings
              </h2>
              <p className="text-xs text-slate-500">
                Customize your year, college stream & study targets
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Avatar and Name */}
          <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/40"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
                aria-label="Upload profile photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div className="flex-1">
              <label className="block font-bold text-slate-700 mb-1">
                Student Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Academic Year Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Current Academic Standing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["FY", "SY", "TY"] as AcademicYear[]).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setYear(y);
                    if (semester !== "") {
                      if (y === "FY") setSemester(1);
                      if (y === "SY") setSemester(4);
                      if (y === "TY") setSemester(6);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl font-bold border transition ${
                    year === y
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {y === "FY" ? "FY (1st Year)" : y === "SY" ? "SY (2nd Year)" : "TY (3rd Year)"}
                </button>
              ))}
            </div>
          </div>

          {/* Semester & Daily Goal Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Semester Number
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              >
                <option value="">Select semester</option>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Next Exam (Days From Today)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={nextExamDays}
                onChange={(e) => setNextExamDays(e.target.value ? Number(e.target.value) : "")}
                placeholder="Leave blank if not set"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(e.target.value ? Number(e.target.value) : "")}
                placeholder="Leave blank if not set"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* College Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              College / University Name
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              required
            />
          </div>

          {/* Stream / Major */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Major / Degree Course
            </label>
            <input
              type="text"
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 transition"
            >
              {saved ? <Check className="h-4 w-4" /> : null}
              <span>{saved ? "Saved!" : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
