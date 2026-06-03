import React, { useEffect, useState } from "react";
import {
  Languages,
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
  Terminal,
  Calculator,
  FlaskConical,
  Palette,
  Book,
  Briefcase,
  Hash,
} from "lucide-react";
import { useSubjectStore } from "../context/SubjectContext";
import { useArticleStore } from "../context/ArticleContext";
import { useThemeStore } from "../context/ThemeContext";
import { useAuthStore } from "../context/AuthContext";

// ── Dynamic Icon Helper ──────────────────────────────────────────────────────
const getSubjectIcon = (name) => {
  if (!name) return <Hash size={16} />;
  const lower = name.toLowerCase();

  if (/(code|web|prog|dev|html|css|js|react|node|sql|python|java)/.test(lower))
    return <Terminal size={16} />;
  if (/(math|calc|algebra|geom|stat)/.test(lower))
    return <Calculator size={16} />;
  if (/(sci|phys|chem|bio|med)/.test(lower)) return <FlaskConical size={16} />;
  if (/(art|design|ui|ux|draw|paint)/.test(lower)) return <Palette size={16} />;
  if (/(hist|eng|lit|write|read|lang)/.test(lower)) return <Book size={16} />;
  if (/(bus|fin|econ|market|manage)/.test(lower))
    return <Briefcase size={16} />;

  return <Hash size={16} />; // Fallback icon
};

// ── Nav Item ─────────────────────────────────────────────────────────────────
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
              ? "bg-zinc-800 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
              : "bg-gray-100 text-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
            : isDarkMode
              ? "hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
              : "hover:bg-gray-100 text-gray-500 hover:text-black"
        }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`shrink-0 transition-colors ${
            active
              ? isDarkMode
                ? "text-white"
                : "text-black"
              : isDarkMode
                ? "text-zinc-500 group-hover/item:text-zinc-300"
                : "text-gray-400 group-hover/item:text-black"
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

    {/* Delete button */}
    {onDelete && isExpanded && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete subject"
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg items-center justify-center
          opacity-0 group-hover/item:opacity-100 transition-all duration-150 flex
          ${
            isDarkMode
              ? "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
          }`}
      >
        <X size={12} />
      </button>
    )}
  </div>
);

// ── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = ({
  label,
  isExpanded,
  isDarkMode,
  actionIcon,
  onAction,
}) => (
  <div
    className={`flex items-center justify-between mb-1.5 transition-all duration-300
    ${isExpanded ? "px-3 opacity-100 h-auto" : "opacity-0 h-0 mb-0 hidden"}`}
  >
    <p
      className={`text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap
      ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}
    >
      {label}
    </p>
    {actionIcon && (
      <button
        onClick={onAction}
        className={`p-1 rounded-lg transition-colors
          ${
            isDarkMode
              ? "hover:bg-zinc-800 text-zinc-500 hover:text-white"
              : "hover:bg-gray-200 text-gray-400 hover:text-black"
          }`}
      >
        {actionIcon}
      </button>
    )}
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ onAddSubject, onWriteArticle, onNavigate, activeView }) => {
  const {
    isFetchingSubjects,
    subjectsList,
    getSubjectsList,
    setSelectedSubject,
    deleteSubject,
  } = useSubjectStore();
  const { getSubjectWiseArticles } = useArticleStore();
  const { isDarkMode, setDark, setLight } = useThemeStore();
  const { authUser, logout } = useAuthStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  useEffect(() => {
    getSubjectsList();
  }, [getSubjectsList]);

  const handleSubjectClick = (subject) => {
    setActiveSubjectId(subject._id);
    setSelectedSubject(subject);
    getSubjectWiseArticles(subject.subject_slug);
    onNavigate("notebook"); 
  };

  const handleDeleteSubject = async (subject) => {
    if (
      !window.confirm(
        `Delete "${subject.subject_name}"? This cannot be undone.`,
      )
    )
      return;
    await deleteSubject(subject._id);
    if (activeSubjectId === subject._id) setActiveSubjectId(null);
  };

  // Guarantee subjects are ALWAYS sorted alphabetically A-Z
  const sortedSubjects = [...subjectsList].sort((a, b) =>
    a.subject_name.localeCompare(b.subject_name)
  );

  const bg = isDarkMode
    ? "bg-[#121212] border-zinc-800"
    : "bg-white border-gray-200";
  const divider = isDarkMode ? "border-zinc-800" : "border-gray-200";

  const avatarUrl = authUser?.user_name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_name)}&background=random`
    : "https://ui-avatars.com/api/?name=User&background=random";

  return (
    <div className="h-screen shrink-0 relative">
      {/* ── Custom Scrollbar Styles ── */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: ${isDarkMode ? "#3f3f46" : "#d1d5db"};
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: ${isDarkMode ? "#52525b" : "#9ca3af"};
        }
      `}</style>

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
              className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md
              ${isDarkMode ? "bg-zinc-800 text-white" : "bg-black text-white"}`}
            >
              <Layers size={15} />
            </div>
            {isExpanded && (
              <span
                className={`font-black text-base tracking-tight ${isDarkMode ? "text-white" : "text-black"}`}
              >
                StudyHub
              </span>
            )}
          </div>

          <button
            onClick={() => setIsExpanded((p) => !p)}
            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors
              ${
                isDarkMode
                  ? "text-zinc-500 hover:text-white hover:bg-zinc-800"
                  : "text-gray-400 hover:text-black hover:bg-gray-100"
              }`}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <ChevronLeft size={15} />
            ) : (
              <ChevronRight size={15} />
            )}
          </button>
        </div>

        {/* ── Write Article CTA ── */}
        <div className={`px-3 py-3 border-b ${divider}`}>
          <button
            onClick={onWriteArticle}
            title={!isExpanded ? "Write Article" : ""}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm border
              ${isExpanded ? "px-3" : "px-0"}
              ${
                isDarkMode
                  ? "bg-white hover:bg-gray-200 text-black border-transparent"
                  : "bg-black hover:bg-zinc-800 text-white border-transparent"
              }`}
          >
            <PenTool size={15} />
            {isExpanded && <span>Write Article</span>}
          </button>
        </div>

        {/* ── Navigation ── */}
        <div
          className={`sidebar-scroll flex-1 overflow-y-auto flex flex-col gap-4 py-4
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
                <div
                  className={`flex items-center gap-2 px-3 py-2 text-xs ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}
                >
                  <Loader2 size={12} className="animate-spin" />
                  {isExpanded && "Loading…"}
                </div>
              ) : sortedSubjects.length === 0 ? (
                isExpanded && (
                  <div className="px-3 py-2 text-center">
                    <p
                      className={`text-xs mb-1 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}
                    >
                      No subjects yet
                    </p>
                    {/* Empty State Add Button Highlighted */}
                    <button
                      onClick={onAddSubject}
                      className={`mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm
                        ${isDarkMode 
                          ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" 
                          : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"}`}
                    >
                      <Plus size={14} /> Add your first subject
                    </button>
                  </div>
                )
              ) : (
                sortedSubjects.map((subject) => (
                  <NavItem
                    key={subject._id}
                    icon={getSubjectIcon(subject.subject_name)}
                    label={subject.subject_name}
                    isExpanded={isExpanded}
                    isDarkMode={isDarkMode}
                    active={activeSubjectId === subject._id}
                    onClick={() => handleSubjectClick(subject)}
                    onDelete={() => handleDeleteSubject(subject)}
                  />
                ))
              )}

              {/* Bottom Add Button Highlighted */}
              {isExpanded && sortedSubjects.length > 0 && (
                <button
                  onClick={onAddSubject}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all mt-2 shadow-sm
                    ${isDarkMode
                      ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                      : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"
                    }`}
                >
                  <Plus size={14} />
                  Add subject
                </button>
              )}
            </nav>
          </div>

          {/* More */}
          <div>
            <SectionLabel label="More" isExpanded={isExpanded} isDarkMode={isDarkMode} />
            <nav className="flex flex-col gap-0.5">
              <NavItem
                icon={<Calendar size={16} />}
                label="Calendar"
                isExpanded={isExpanded}
                isDarkMode={isDarkMode}
                active={activeView === "calendar"}
                onClick={() => onNavigate("calendar")}
              />
              <NavItem 
                icon={<Languages size={16} />}
                label="Vocabulary"
                isExpanded={isExpanded} 
                isDarkMode={isDarkMode} 
                active={activeView === "vocab"}
                onClick={() => onNavigate("vocab")}
              />
              <NavItem icon={<Heart size={16} />} label="Saved" isExpanded={isExpanded} isDarkMode={isDarkMode} />
            </nav>
          </div>
        </div>

        {/* ── Bottom: theme toggle + user ── */}
        <div className={`p-3 mt-auto border-t ${divider}`}>
          {/* Theme toggle */}
          <div
            className={`flex items-center rounded-xl p-1 mb-3 border transition-colors
            ${isExpanded ? "" : "flex-col gap-1"}
            ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`}
          >
            <button
              onClick={setLight}
              title="Light mode"
              className={`flex items-center justify-center rounded-lg transition-all duration-200
                ${isExpanded ? "flex-1 py-2" : "w-10 h-9"}
                ${!isDarkMode ? "bg-white text-black shadow-sm border border-gray-200" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={setDark}
              title="Dark mode"
              className={`flex items-center justify-center rounded-lg transition-all duration-200
                ${isExpanded ? "flex-1 py-2" : "w-10 h-9"}
                ${
                  isDarkMode
                    ? "bg-zinc-700 text-white shadow-md border border-zinc-600"
                    : "text-gray-400 hover:text-black"
                }`}
            >
              <Moon size={14} />
            </button>
          </div>

          {/* User card */}
          <div
            className={`flex items-center rounded-xl border transition-colors
            ${isExpanded ? "gap-3 p-3" : "flex-col gap-2 py-3 px-1"}
            ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`}
          >
            <img
              src={avatarUrl}
              alt="User"
              className={`rounded-full object-cover border shrink-0
                ${isDarkMode ? "border-zinc-700" : "border-gray-200"}
                w-8 h-8`}
            />
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold leading-tight truncate ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  {authUser?.user_name || "Guest User"}
                </p>
                <p
                  className={`text-[11px] truncate ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}
                >
                  {authUser?.user_email || "No email"}
                </p>
              </div>
            )}
            <button
              className={`shrink-0 p-1.5 rounded-lg transition-colors group ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-200"}`}
              title="Logout"
              onClick={logout}
            >
              <LogOut
                size={14}
                className={`transition-colors ${isDarkMode ? "text-zinc-400 group-hover:text-red-400" : "text-gray-400 group-hover:text-red-500"}`}
              />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;