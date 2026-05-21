import React, { useEffect, useState } from "react";
import {
  Globe,
  Calendar,
  BookOpen,
  Heart,
  LogOut,
  Sun,
  Moon,
  Layers,
  PenTool,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { useSubjectStore } from "../context/SubjectContext";
import { useArticleStore } from "../context/ArticleContext";
import { useThemeStore } from "../context/ThemeContext";

// ── Nav Item ────────────────────────────────────────────────────────────────
const NavItem = ({
  icon,
  label,
  badge,
  badgeColor,
  isExpanded,
  onClick,
  isDarkMode,
  active,
  onDelete,
}) => (
  <div className="relative group/item">
    <button
      onClick={onClick}
      title={!isExpanded ? label : ""}
      className={`w-full flex items-center rounded-xl transition-all duration-200 text-sm
        ${isExpanded ? "px-3 py-2.5 justify-between pr-8" : "p-3 justify-center"}
        ${
          active
            ? isDarkMode
              ? "bg-violet-500/20 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]"
              : "bg-purple-100 text-purple-700 shadow-[inset_0_0_0_1px_rgba(147,51,234,0.2)]"
            : isDarkMode
              ? "hover:bg-white/5 text-slate-400 hover:text-slate-200"
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
        }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`shrink-0 transition-colors ${
            active
              ? isDarkMode ? "text-violet-400" : "text-purple-600"
              : isDarkMode ? "text-slate-500 group-hover/item:text-violet-400" : "text-gray-400 group-hover/item:text-purple-500"
          }`}
        >
          {icon}
        </span>
        <span
          className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 text-sm
            ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 hidden"}`}
        >
          {label}
        </span>
      </div>

      {badge && isExpanded && (
        <span
          className={`${badgeColor} text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase`}
        >
          {badge}
        </span>
      )}
    </button>

    {/* Delete button — only for subjects with onDelete prop */}
    {onDelete && isExpanded && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete subject"
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg items-center justify-center
          opacity-0 group-hover/item:opacity-100 transition-all duration-150 flex
          ${isDarkMode
            ? "text-slate-600 hover:text-red-400 hover:bg-red-500/10"
            : "text-gray-300 hover:text-red-500 hover:bg-red-50"
          }`}
      >
        <X size={12} />
      </button>
    )}
  </div>
);

// ── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ label, isExpanded, isDarkMode, actionIcon, onAction }) => (
  <div
    className={`flex items-center justify-between mb-1.5 transition-all duration-300
      ${isExpanded ? "px-3 opacity-100 h-auto" : "opacity-0 h-0 mb-0 hidden"}`}
  >
    <p
      className={`text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap
        ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}
    >
      {label}
    </p>
    {actionIcon && (
      <button
        onClick={onAction}
        className={`p-1 rounded-lg transition-colors
          ${isDarkMode
            ? "hover:bg-violet-500/10 text-slate-500 hover:text-violet-400"
            : "hover:bg-purple-100 text-gray-400 hover:text-purple-600"
          }`}
      >
        {actionIcon}
      </button>
    )}
  </div>
);

// ── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ onAddSubject, onWriteArticle }) => {
  const {
    isFetchingSubjects,
    subjectsList,
    getSubjectsList,
    setSelectedSubject,
    deleteSubject,
    isDeletingSubject,
  } = useSubjectStore();
  const { getSubjectWiseArticles } = useArticleStore();
  const { isDarkMode, setDark, setLight } = useThemeStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  useEffect(() => {
    getSubjectsList();
  }, []);

  const handleSubjectClick = (subject) => {
    setActiveSubjectId(subject._id);
    setSelectedSubject(subject);
    getSubjectWiseArticles(subject.subject_slug);
  };

  const handleDeleteSubject = async (subject) => {
    if (!window.confirm(`Delete "${subject.subject_name}"? This cannot be undone.`)) return;
    await deleteSubject(subject._id);
    if (activeSubjectId === subject._id) setActiveSubjectId(null);
  };

  // Theme-aware styles
  const bg = isDarkMode
    ? "bg-[#0d0f1a] border-[#1e2035]"
    : "bg-white border-gray-200";

  const divider = isDarkMode ? "border-[#1e2035]" : "border-gray-100";

  return (
    <div className="h-screen shrink-0 relative">
      <aside
        className={`flex flex-col h-full border-r transition-all duration-300 ease-in-out ${bg}
          ${isExpanded ? "w-60" : "w-16"}`}
      >
        {/* ── Logo Row ── */}
        <div
          className={`flex items-center py-5 border-b ${divider} transition-all duration-300
            ${isExpanded ? "px-4 justify-between" : "px-0 justify-center"}`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg
                ${isDarkMode
                  ? "bg-linear-to-br from-violet-600 to-indigo-700 shadow-violet-900/40"
                  : "bg-linear-to-br from-purple-500 to-cyan-500 shadow-purple-200"
                }`}
            >
              <Layers size={15} className="text-white" />
            </div>
            {isExpanded && (
              <span
                className={`font-black text-base tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                StudyHub
              </span>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsExpanded((p) => !p)}
            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors
              ${isDarkMode
                ? "text-slate-600 hover:text-slate-300 hover:bg-white/5"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }
              ${!isExpanded ? "mt-0" : ""}`}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>

        {/* ── Write Article CTA ── */}
        <div className={`px-3 py-3 border-b ${divider}`}>
          <button
            onClick={onWriteArticle}
            title={!isExpanded ? "Write Article" : ""}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm
              ${isExpanded ? "px-3" : "px-0"}
              ${isDarkMode
                ? "bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-900/30"
                : "bg-linear-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-purple-200"
              }`}
          >
            <PenTool size={15} />
            {isExpanded && <span>Write Article</span>}
          </button>
        </div>

        {/* ── Navigation ── */}
        <div
          className={`flex-1 overflow-y-auto flex flex-col gap-4 py-4
            ${isExpanded ? "px-3" : "px-2"}`}
        >
          {/* Subjects */}
          <div>
            <SectionLabel
              label="Subjects"
              isExpanded={isExpanded}
              isDarkMode={isDarkMode}
              actionIcon={<Plus size={13} />}
              onAction={onAddSubject}
            />

            <nav className="flex flex-col gap-0.5">
              {isFetchingSubjects ? (
                <div className={`flex items-center gap-2 px-3 py-2 text-xs ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
                  <Loader2 size={12} className="animate-spin" />
                  {isExpanded && "Loading…"}
                </div>
              ) : subjectsList.length === 0 ? (
                isExpanded && (
                  <p className={`px-3 py-2 text-xs ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
                    No subjects yet
                  </p>
                )
              ) : (
                subjectsList.map((subject) => (
                  <NavItem
                    key={subject._id}
                    icon={<Globe size={16} />}
                    label={subject.subject_name}
                    isExpanded={isExpanded}
                    isDarkMode={isDarkMode}
                    active={activeSubjectId === subject._id}
                    onClick={() => handleSubjectClick(subject)}
                    onDelete={() => handleDeleteSubject(subject)}
                  />
                ))
              )}

              {/* Add subject shortcut when expanded and has subjects */}
              {isExpanded && subjectsList.length > 0 && (
                <button
                  onClick={onAddSubject}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors mt-0.5
                    ${isDarkMode
                      ? "text-slate-600 hover:text-violet-400 hover:bg-violet-500/10"
                      : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
                    }`}
                >
                  <Plus size={13} />
                  Add subject
                </button>
              )}
            </nav>
          </div>

          {/* More */}
          <div>
            <SectionLabel
              label="More"
              isExpanded={isExpanded}
              isDarkMode={isDarkMode}
            />
            <nav className="flex flex-col gap-0.5">
              <NavItem
                icon={<Calendar size={16} />}
                label="Calendar"
                badge="New"
                badgeColor={isDarkMode ? "bg-violet-500" : "bg-purple-500"}
                isExpanded={isExpanded}
                isDarkMode={isDarkMode}
              />
              <NavItem
                icon={<BookOpen size={16} />}
                label="Docs"
                isExpanded={isExpanded}
                isDarkMode={isDarkMode}
              />
              <NavItem
                icon={<Heart size={16} />}
                label="Saved"
                isExpanded={isExpanded}
                isDarkMode={isDarkMode}
              />
            </nav>
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className={`p-3 mt-auto border-t ${divider}`}>
          {/* Theme Toggle */}
          <div
            className={`flex items-center rounded-xl p-1 mb-3 border transition-colors
              ${isExpanded ? "" : "flex-col gap-1"}
              ${isDarkMode ? "bg-[#141627] border-[#1e2035]" : "bg-gray-100 border-gray-200"}`}
          >
            <button
              onClick={setLight}
              title="Light mode"
              className={`flex items-center justify-center rounded-lg transition-all duration-200
                ${isExpanded ? "flex-1 py-2" : "w-10 h-9"}
                ${!isDarkMode ? "bg-white text-amber-500 shadow-sm" : "text-slate-600 hover:text-slate-300"}`}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={setDark}
              title="Dark mode"
              className={`flex items-center justify-center rounded-lg transition-all duration-200
                ${isExpanded ? "flex-1 py-2" : "w-10 h-9"}
                ${isDarkMode
                  ? "bg-linear-to-r from-violet-600 to-indigo-700 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-700"
                }`}
            >
              <Moon size={14} />
            </button>
          </div>

          {/* User Card */}
          <div
            className={`flex items-center rounded-xl border transition-colors
              ${isExpanded ? "gap-3 p-3" : "flex-col gap-2 py-3 px-1"}
              ${isDarkMode ? "bg-[#141627] border-[#1e2035]" : "bg-gray-50 border-gray-200"}`}
          >
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="User"
              className={`rounded-full object-cover ring-2 shrink-0
                ${isDarkMode ? "ring-violet-500/30" : "ring-purple-200"}
                ${isExpanded ? "w-8 h-8" : "w-8 h-8"}`}
            />
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight truncate ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Mohit Mittal
                </p>
                <p className={`text-[11px] truncate ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                  notmohitmittal@gmail.com
                </p>
              </div>
            )}
            <button
              className={`shrink-0 p-1.5 rounded-lg transition-colors group ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-200"}`}
              title="Logout"
            >
              <LogOut
                size={14}
                className={`transition-colors group-hover:text-rose-500 ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}
              />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;