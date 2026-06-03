import React, { useEffect, useState } from "react";
import {
  Languages,
  Calendar,
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
  Home,
  LayoutGrid,
  ChevronRight as ArrowRight,
  Trash2,
} from "lucide-react";
import { useSubjectStore } from "../context/SubjectContext";
import { useArticleStore } from "../context/ArticleContext";
import { useThemeStore } from "../context/ThemeContext";
import { useAuthStore } from "../context/AuthContext";

// ── Dynamic Icon Helper ───────────────────────────────────────────────────────
const getSubjectIcon = (name, size = 16) => {
  if (!name) return <Hash size={size} />;
  const lower = name.toLowerCase();
  if (/(code|web|prog|dev|html|css|js|react|node|sql|python|java)/.test(lower)) return <Terminal size={size} />;
  if (/(math|calc|algebra|geom|stat)/.test(lower)) return <Calculator size={size} />;
  if (/(sci|phys|chem|bio|med)/.test(lower)) return <FlaskConical size={size} />;
  if (/(art|design|ui|ux|draw|paint)/.test(lower)) return <Palette size={size} />;
  if (/(hist|eng|lit|write|read|lang)/.test(lower)) return <Book size={size} />;
  if (/(bus|fin|econ|market|manage)/.test(lower)) return <Briefcase size={size} />;
  return <Hash size={size} />;
};

// ── Desktop Nav Item ──────────────────────────────────────────────────────────
const NavItem = ({ icon, label, isExpanded, onClick, isDarkMode, active, onDelete }) => (
  <div className="relative group/item">
    <button
      onClick={onClick}
      title={!isExpanded ? label : ""}
      className={`w-full flex items-center rounded-xl transition-all duration-200 text-sm
        ${isExpanded ? "px-3 py-2.5 justify-between pr-8" : "p-3 justify-center"}
        ${active
          ? isDarkMode
            ? "bg-zinc-800 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
            : "bg-gray-100 text-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
          : isDarkMode
            ? "hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
            : "hover:bg-gray-100 text-gray-500 hover:text-black"
        }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`shrink-0 ${active ? isDarkMode ? "text-white" : "text-black" : isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
          {icon}
        </span>
        <span className={`font-medium whitespace-nowrap text-sm ${isExpanded ? "block" : "hidden"}`}>
          {label}
        </span>
      </div>
    </button>
    {onDelete && isExpanded && (
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all flex
          ${isDarkMode ? "text-zinc-500 hover:text-red-400 hover:bg-red-500/10" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
      >
        <X size={12} />
      </button>
    )}
  </div>
);

// ── Desktop Section Label ─────────────────────────────────────────────────────
const SectionLabel = ({ label, isExpanded, isDarkMode, actionIcon, onAction }) => (
  <div className={`flex items-center justify-between mb-1.5 ${isExpanded ? "px-3" : "hidden"}`}>
    <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>{label}</p>
    {actionIcon && (
      <button onClick={onAction} className={`p-1 rounded-lg transition-colors ${isDarkMode ? "hover:bg-zinc-800 text-zinc-500 hover:text-white" : "hover:bg-gray-200 text-gray-400 hover:text-black"}`}>
        {actionIcon}
      </button>
    )}
  </div>
);

// ── Mobile Subjects Sheet ─────────────────────────────────────────────────────
const MobileSubjectsSheet = ({ open, onClose, isDarkMode, setLight, setDark, subjects, isFetching, activeSubjectId, onSubjectClick, onDeleteSubject, onAddSubject }) => {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const bg = isDarkMode ? "bg-[#1a1a1a]" : "bg-white";
  const divider = isDarkMode ? "border-zinc-800" : "border-gray-200";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300
          ${open ? "bg-black/60 backdrop-blur-sm pointer-events-auto" : "bg-transparent pointer-events-none"}`}
      />

      {/* Sheet */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out
          ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "75vh" }}
      >
        <div className={`${bg} rounded-t-3xl flex flex-col overflow-hidden`} style={{ maxHeight: "75vh" }}>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className={`w-9 h-1 rounded-full ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"}`} />
          </div>

          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-3 border-b ${divider} shrink-0`}>
            <div>
              <h2 className={`text-base font-black tracking-tight ${isDarkMode ? "text-white" : "text-black"}`}>Subjects</h2>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>{subjects.length} subject{subjects.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <div className={`flex items-center rounded-xl p-1 border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`}>
                <button
                  onClick={setLight}
                  title="Light mode"
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200
                    ${!isDarkMode ? "bg-white text-black shadow-sm border border-gray-200" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Sun size={13} />
                </button>
                <button
                  onClick={setDark}
                  title="Dark mode"
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200
                    ${isDarkMode ? "bg-zinc-700 text-white border border-zinc-600" : "text-gray-400 hover:text-black"}`}
                >
                  <Moon size={13} />
                </button>
              </div>
              <button
                onClick={onAddSubject}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                  ${isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"}`}
              >
                <Plus size={13} /> Add
              </button>
              <button
                onClick={onClose}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors
                  ${isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-black"}`}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Subject List */}
          <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-1.5">
            {isFetching ? (
              <div className={`flex items-center justify-center gap-2 py-8 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading subjects…</span>
              </div>
            ) : subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-zinc-800" : "bg-gray-100"}`}>
                  <LayoutGrid size={20} className={isDarkMode ? "text-zinc-600" : "text-gray-400"} />
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>No subjects yet</p>
                <button
                  onClick={onAddSubject}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all
                    ${isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"}`}
                >
                  <Plus size={14} /> Add your first subject
                </button>
              </div>
            ) : (
              subjects.map((subject) => {
                const isActive = activeSubjectId === subject._id;
                return (
                  <div key={subject._id} className="relative group/mitem">
                    <button
                      onClick={() => { onSubjectClick(subject); onClose(); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left
                        ${isActive
                          ? isDarkMode
                            ? "bg-zinc-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                            : "bg-gray-100 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                          : isDarkMode
                            ? "hover:bg-zinc-800/60 active:bg-zinc-800"
                            : "hover:bg-gray-50 active:bg-gray-100"
                        }`}
                    >
                      {/* Icon bubble */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                        ${isActive
                          ? isDarkMode ? "bg-zinc-700" : "bg-white shadow-sm"
                          : isDarkMode ? "bg-zinc-800" : "bg-gray-100"
                        }`}
                      >
                        <span className={isActive ? isDarkMode ? "text-white" : "text-black" : isDarkMode ? "text-zinc-500" : "text-gray-500"}>
                          {getSubjectIcon(subject.subject_name, 15)}
                        </span>
                      </div>

                      {/* Name */}
                      <span className={`flex-1 text-sm font-semibold truncate
                        ${isActive
                          ? isDarkMode ? "text-white" : "text-black"
                          : isDarkMode ? "text-zinc-300" : "text-gray-700"
                        }`}
                      >
                        {subject.subject_name}
                      </span>

                      {/* Arrow */}
                      <ChevronRight
                        size={15}
                        className={`shrink-0 transition-colors ${isActive ? isDarkMode ? "text-zinc-400" : "text-gray-400" : isDarkMode ? "text-zinc-700" : "text-gray-300"}`}
                      />
                    </button>

                    {/* Swipe-style delete — visible on long press / hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject); }}
                      className={`absolute right-12 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl items-center justify-center
                        opacity-0 group-hover/mitem:opacity-100 transition-all flex
                        ${isDarkMode ? "text-zinc-500 hover:text-red-400 hover:bg-red-500/10" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Safe area spacer */}
          <div className="shrink-0 h-3" />
        </div>
      </div>
    </>
  );
};

// ── Mobile Bottom Nav ─────────────────────────────────────────────────────────
const MobileBottomNav = ({ activeView, onNavigate, isDarkMode, onWriteArticle, onSubjectsOpen }) => {
  const tabs = [
    { id: "home",     icon: <Home size={20} />,       label: "Home" },
    { id: "subjects", icon: <LayoutGrid size={20} />, label: "Subjects", isSheet: true },
    { id: "write",    icon: null,                     label: "Write",    isCTA: true },
    { id: "calendar", icon: <Calendar size={20} />,   label: "Calendar" },
    { id: "vocab",    icon: <Languages size={20} />,  label: "Vocab" },
  ];

  const handleTab = (tab) => {
    if (tab.isCTA) { onWriteArticle(); return; }
    if (tab.isSheet) { onSubjectsOpen(); return; }
    onNavigate(tab.id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-5 pt-2 pointer-events-none">
      <nav className={`pointer-events-auto flex items-center justify-around rounded-2xl px-2 py-2 shadow-2xl border
        ${isDarkMode ? "bg-[#0e0e0e]/95 border-white/[0.06] backdrop-blur-xl" : "bg-white/95 border-black/[0.06] backdrop-blur-xl"}`}
      >
        {tabs.map((tab) => {
          const isActive = activeView === tab.id || (tab.isSheet && activeView === "notebook");

          if (tab.isCTA) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab)}
                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all -mt-5 shadow-lg
                  ${isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-zinc-800"}`}
                aria-label="Write article"
              >
                <PenTool size={18} />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-1 relative"
            >
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-[14px] transition-all duration-200
                ${isActive ? isDarkMode ? "bg-zinc-800 opacity-100" : "bg-gray-100 opacity-100" : "opacity-0"}`}
              />
              <span className={`relative z-10 transition-colors duration-200
                ${isActive ? isDarkMode ? "text-white" : "text-black" : isDarkMode ? "text-zinc-600" : "text-gray-400"}`}
              >
                {tab.icon}
              </span>
              <span className={`relative z-10 text-[9px] font-semibold tracking-wide transition-colors duration-200
                ${isActive ? isDarkMode ? "text-white" : "text-black" : isDarkMode ? "text-zinc-600" : "text-gray-400"}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ onAddSubject, onWriteArticle, onNavigate, activeView }) => {
  const { isFetchingSubjects, subjectsList, getSubjectsList, setSelectedSubject, deleteSubject } = useSubjectStore();
  const { getSubjectWiseArticles } = useArticleStore();
  const { isDarkMode, setDark, setLight } = useThemeStore();
  const { authUser, logout } = useAuthStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [subjectsSheetOpen, setSubjectsSheetOpen] = useState(false);

  useEffect(() => { getSubjectsList(); }, [getSubjectsList]);

  const handleSubjectClick = (subject) => {
    setActiveSubjectId(subject._id);
    setSelectedSubject(subject);
    getSubjectWiseArticles(subject.subject_slug);
    onNavigate("notebook");
  };

  const handleDeleteSubject = async (subject) => {
    if (!window.confirm(`Delete "${subject.subject_name}"? This cannot be undone.`)) return;
    await deleteSubject(subject._id);
    if (activeSubjectId === subject._id) setActiveSubjectId(null);
  };

  const sortedSubjects = [...subjectsList].sort((a, b) => a.subject_name.localeCompare(b.subject_name));

  const bg = isDarkMode ? "bg-[#121212] border-zinc-800" : "bg-white border-gray-200";
  const divider = isDarkMode ? "border-zinc-800" : "border-gray-200";
  const avatarUrl = authUser?.user_name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_name)}&background=random`
    : "https://ui-avatars.com/api/?name=User&background=random";

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex h-screen shrink-0">
        <style>{`
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background-color: ${isDarkMode ? "#3f3f46" : "#d1d5db"}; border-radius: 10px; }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover { background-color: ${isDarkMode ? "#52525b" : "#9ca3af"}; }
        `}</style>

        <aside className={`flex flex-col h-full border-r transition-all duration-300 ease-in-out ${bg} ${isExpanded ? "w-60" : "w-16"}`}>
          {/* Logo */}
          <div className={`flex items-center py-5 border-b ${divider} ${isExpanded ? "px-4 justify-between" : "px-0 justify-center"}`}>
            <div className="flex items-center gap-2.5">
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${isDarkMode ? "bg-zinc-800 text-white" : "bg-black text-white"}`}>
                <Layers size={15} />
              </div>
              {isExpanded && <span className={`font-black text-base tracking-tight ${isDarkMode ? "text-white" : "text-black"}`}>StudyHub</span>}
            </div>
            <button onClick={() => setIsExpanded((p) => !p)} className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDarkMode ? "text-zinc-500 hover:text-white hover:bg-zinc-800" : "text-gray-400 hover:text-black hover:bg-gray-100"}`}>
              {isExpanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>

          {/* Write CTA */}
          <div className={`px-3 py-3 border-b ${divider}`}>
            <button onClick={onWriteArticle} title={!isExpanded ? "Write Article" : ""} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm border ${isExpanded ? "px-3" : "px-0"} ${isDarkMode ? "bg-white hover:bg-gray-200 text-black border-transparent" : "bg-black hover:bg-zinc-800 text-white border-transparent"}`}>
              <PenTool size={15} />
              {isExpanded && <span>Write Article</span>}
            </button>
          </div>

          {/* Nav */}
          <div className={`sidebar-scroll flex-1 overflow-y-auto flex flex-col gap-4 py-4 ${isExpanded ? "px-3" : "px-2"}`}>
            <div>
              <SectionLabel label="Subjects" isExpanded={isExpanded} isDarkMode={isDarkMode} actionIcon={<Plus size={13} />} onAction={onAddSubject} />
              <nav className="flex flex-col gap-0.5">
                {isFetchingSubjects ? (
                  <div className={`flex items-center gap-2 px-3 py-2 text-xs ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
                    <Loader2 size={12} className="animate-spin" />{isExpanded && "Loading…"}
                  </div>
                ) : sortedSubjects.length === 0 ? (
                  isExpanded && (
                    <div className="px-3 py-2 text-center">
                      <p className={`text-xs mb-1 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>No subjects yet</p>
                      <button onClick={onAddSubject} className={`mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"}`}>
                        <Plus size={14} /> Add your first subject
                      </button>
                    </div>
                  )
                ) : (
                  sortedSubjects.map((subject) => (
                    <NavItem key={subject._id} icon={getSubjectIcon(subject.subject_name)} label={subject.subject_name} isExpanded={isExpanded} isDarkMode={isDarkMode} active={activeSubjectId === subject._id} onClick={() => handleSubjectClick(subject)} onDelete={() => handleDeleteSubject(subject)} />
                  ))
                )}
                {isExpanded && sortedSubjects.length > 0 && (
                  <button onClick={onAddSubject} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all mt-2 ${isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"}`}>
                    <Plus size={14} /> Add subject
                  </button>
                )}
              </nav>
            </div>

            <div>
              <SectionLabel label="More" isExpanded={isExpanded} isDarkMode={isDarkMode} />
              <nav className="flex flex-col gap-0.5">
                <NavItem icon={<Calendar size={16} />} label="Calendar" isExpanded={isExpanded} isDarkMode={isDarkMode} active={activeView === "calendar"} onClick={() => onNavigate("calendar")} />
                <NavItem icon={<Languages size={16} />} label="Vocabulary" isExpanded={isExpanded} isDarkMode={isDarkMode} active={activeView === "vocab"} onClick={() => onNavigate("vocab")} />
                <NavItem icon={<Heart size={16} />} label="Saved" isExpanded={isExpanded} isDarkMode={isDarkMode} />
              </nav>
            </div>
          </div>

          {/* Bottom */}
          <div className={`p-3 mt-auto border-t ${divider}`}>
            <div className={`flex items-center rounded-xl p-1 mb-3 border ${isExpanded ? "" : "flex-col gap-1"} ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`}>
              <button onClick={setLight} className={`flex items-center justify-center rounded-lg transition-all ${isExpanded ? "flex-1 py-2" : "w-10 h-9"} ${!isDarkMode ? "bg-white text-black shadow-sm border border-gray-200" : "text-zinc-500 hover:text-zinc-300"}`}><Sun size={14} /></button>
              <button onClick={setDark} className={`flex items-center justify-center rounded-lg transition-all ${isExpanded ? "flex-1 py-2" : "w-10 h-9"} ${isDarkMode ? "bg-zinc-700 text-white shadow-md border border-zinc-600" : "text-gray-400 hover:text-black"}`}><Moon size={14} /></button>
            </div>
            <div className={`flex items-center rounded-xl border ${isExpanded ? "gap-3 p-3" : "flex-col gap-2 py-3 px-1"} ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"}`}>
              <img src={avatarUrl} alt="User" className={`rounded-full object-cover border shrink-0 w-8 h-8 ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`} />
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-tight truncate ${isDarkMode ? "text-white" : "text-black"}`}>{authUser?.user_name || "Guest User"}</p>
                  <p className={`text-[11px] truncate ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}>{authUser?.user_email || "No email"}</p>
                </div>
              )}
              <button onClick={logout} className={`shrink-0 p-1.5 rounded-lg transition-colors group ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-200"}`}>
                <LogOut size={14} className={`${isDarkMode ? "text-zinc-400 group-hover:text-red-400" : "text-gray-400 group-hover:text-red-500"}`} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        onWriteArticle={onWriteArticle}
        onSubjectsOpen={() => setSubjectsSheetOpen(true)}
      />

      {/* ── Mobile Subjects Sheet ── */}
      <MobileSubjectsSheet
        open={subjectsSheetOpen}
        onClose={() => setSubjectsSheetOpen(false)}
        isDarkMode={isDarkMode}
        setLight={setLight}
        setDark={setDark}
        subjects={sortedSubjects}
        isFetching={isFetchingSubjects}
        activeSubjectId={activeSubjectId}
        onSubjectClick={handleSubjectClick}
        onDeleteSubject={handleDeleteSubject}
        onAddSubject={() => { setSubjectsSheetOpen(false); onAddSubject(); }}
      />
    </>
  );
};

export default Sidebar;