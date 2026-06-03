import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { useSubjectStore } from "../context/SubjectContext";
import { useThemeStore } from "../context/ThemeContext";

export default function AddSubjectModal({ open, onClose }) {
  const { addSubject, isAddingSubject } = useSubjectStore();
  const { isDarkMode } = useThemeStore();
  const [form, setForm] = useState({
    subject_name: "",
    subject_description: "",
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.subject_name.trim()) return;
    await addSubject({
      subject_name: form.subject_name.trim(),
      subject_description: form.subject_description.trim(),
    });
    setForm({ subject_name: "", subject_description: "" });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
  };

  if (!open) return null;

  // Monochrome Theme Mapping
  const bg = isDarkMode
    ? "bg-zinc-900 border-zinc-800"
    : "bg-white border-gray-200";

  const label = isDarkMode ? "text-zinc-400" : "text-gray-600";

  const inputBg = isDarkMode
    ? "bg-[#121212] border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${bg}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border
              ${isDarkMode
                ? "bg-zinc-800 border-zinc-700 text-white"
                : "bg-black border-black text-white"
              }`}
            >
              <Plus size={14} />
            </div>
            <h2 className={`text-base font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
              New Subject
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors
              ${isDarkMode
                ? "text-zinc-500 hover:text-white hover:bg-zinc-800"
                : "text-gray-400 hover:text-black hover:bg-gray-100"
              }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${label}`}>
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              name="subject_name"
              value={form.subject_name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="e.g. Web Development"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${inputBg}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${label}`}>
              Description{" "}
              <span className={`normal-case font-normal ${isDarkMode ? "text-zinc-600" : "text-gray-400"}`}>
                (optional)
              </span>
            </label>
            <textarea
              name="subject_description"
              value={form.subject_description}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Escape" && onClose()}
              placeholder="A short description of this subject…"
              rows={3}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${inputBg}`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${isDarkMode
                ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.subject_name.trim() || isAddingSubject}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border border-transparent
              ${isDarkMode
                ? "bg-white text-black hover:bg-gray-200 shadow-black/20"
                : "bg-black text-white hover:bg-zinc-800 shadow-black/10"
              }`}
          >
            {isAddingSubject ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus size={14} /> Add Subject
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}