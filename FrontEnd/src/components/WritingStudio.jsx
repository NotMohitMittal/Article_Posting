import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useArticleStore } from "../context/ArticleContext";
import { useSubjectStore } from "../context/SubjectContext";
import { useThemeStore } from "../context/ThemeContext";
import { Image, Upload, X, ArrowLeft, PenLine, Check, ChevronLeft, ChevronRight, SpellCheck } from "lucide-react";

// ─── Sidebar Tool Groups ─────────────────────────────────────────────────────
const SIDEBAR_GROUPS = [
  {
    label: "Format",
    items: [
      { cmd: "bold",          label: "B",   title: "Bold (⌘B)",     style: "font-bold text-base" },
      { cmd: "italic",        label: "I",   title: "Italic (⌘I)",   style: "italic" },
      { cmd: "underline",     label: "U",   title: "Underline",     style: "underline" },
      { cmd: "strikeThrough", label: "S",   title: "Strikethrough", style: "line-through" },
    ],
  },
  {
    label: "Headings",
    items: [
      { cmd: "formatBlock", value: "h1", label: "H1", title: "Heading 1", style: "font-bold" },
      { cmd: "formatBlock", value: "h2", label: "H2", title: "Heading 2", style: "font-semibold" },
      { cmd: "formatBlock", value: "h3", label: "H3", title: "Heading 3" },
      { cmd: "formatBlock", value: "p",  label: "¶",  title: "Paragraph" },
    ],
  },
  {
    label: "Insert",
    items: [
      { cmd: "insertUnorderedList",           label: "•",   title: "Bullet list"  },
      { cmd: "insertOrderedList",             label: "1.",  title: "Numbered list"},
      { cmd: "formatBlock", value: "blockquote", label: "❝",   title: "Blockquote"   },
      { cmd: "formatBlock", value: "pre",        label: "</>", title: "Code block"   },
    ],
  },
  {
    label: "Align",
    items: [
      { cmd: "justifyLeft",   label: "≡L", title: "Align left"   },
      { cmd: "justifyCenter", label: "≡C", title: "Align center" },
      { cmd: "justifyRight",  label: "≡R", title: "Align right"  },
    ],
  },
];

// Text colors palette (Slightly adjusted for high contrast)
const TEXT_COLORS = [
  { color: "#000000", label: "Black"    },
  { color: "#ffffff", label: "White"    },
  { color: "#E63973", label: "Pink"     },
  { color: "#0033A0", label: "Blue"     },
  { color: "#28c840", label: "Green"    },
  { color: "#febc2e", label: "Yellow"   },
  { color: "#ff5f57", label: "Red"      },
  { color: "#a78bfa", label: "Violet"   },
  { color: "#fb923c", label: "Orange"   },
];

// ─── Utilities ───────────────────────────────────────────────────────────────
function countWords(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  return {
    words: text.trim().split(/\s+/).filter(Boolean).length,
    chars: text.length,
  };
}

export function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// ─── Sidebar Tool Button ─────────────────────────────────────────────────────
function SideToolBtn({ item, onExec, theme, collapsed }) {
  const isActive = () => {
    try {
      if (item.value) return document.queryCommandValue(item.cmd) === item.value;
      return document.queryCommandState(item.cmd);
    } catch { return false; }
  };
  const active = isActive();

  return (
    <button
      type="button"
      title={item.title}
      onMouseDown={(e) => { e.preventDefault(); onExec(item.cmd, item.value); }}
      className={`w-full flex items-center rounded-xl text-xs font-mono transition-all duration-100 select-none
        ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2 gap-2.5"}
        ${item.style || ""}`}
      style={active
        ? { background: theme.buttonHoverBg, color: theme.accentPrimary, boxShadow: `inset 0 0 0 1px ${theme.border}` }
        : { color: theme.textSecondary }
      }
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = theme.buttonHoverBg; e.currentTarget.style.color = theme.textPrimary; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textSecondary; } }}
    >
      <span className="shrink-0 w-6 text-center">{item.label}</span>
      {!collapsed && <span className="text-xs opacity-90 font-sans">{item.title}</span>}
    </button>
  );
}

// ─── Color Picker Button ─────────────────────────────────────────────────────
function ColorPickerBtn({ theme, onExec, collapsed }) {
  const [open, setOpen]       = useState(false);
  const [active, setActive]   = useState(null);
  const ref                   = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const apply = (color) => {
    onExec("foreColor", color);
    setActive(color);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        title="Text color"
        onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o); }}
        className={`w-full flex items-center rounded-xl text-xs font-mono transition-all duration-100
          ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2 gap-2.5"}`}
        style={{ color: theme.textSecondary }}
        onMouseEnter={e => { e.currentTarget.style.background = theme.buttonHoverBg; e.currentTarget.style.color = theme.textPrimary; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textSecondary; }}
      >
        <span className="shrink-0 w-6 text-center flex items-center justify-center">
          <span style={{
            fontSize: 14, fontWeight: 800, fontFamily: "serif",
            borderBottom: `3px solid ${active || theme.accentPrimary}`,
            lineHeight: 1, paddingBottom: 1
          }}>A</span>
        </span>
        {!collapsed && <span className="text-xs opacity-90 font-sans">Text color</span>}
      </button>

      {open && (
        <div
          className="absolute left-full top-0 ml-2 z-50 p-2.5 rounded-2xl shadow-2xl border"
          style={{ background: theme.inputBg, borderColor: theme.border, width: 168 }}
        >
          <p className="text-[10px] uppercase tracking-widest font-black mb-2 px-1" style={{ color: theme.textSecondary }}>Text Color</p>
          <div className="grid grid-cols-3 gap-1.5">
            {TEXT_COLORS.map(({ color, label }) => (
              <button
                key={color}
                title={label}
                onMouseDown={(e) => { e.preventDefault(); apply(color); }}
                className="w-full aspect-square rounded-lg border-2 transition-transform hover:scale-110 flex items-center justify-center"
                style={{
                  background: color,
                  borderColor: active === color ? theme.accentPrimary : "transparent",
                  boxShadow: active === color ? `0 0 0 2px ${theme.accentPrimary}` : "none",
                }}
              />
            ))}
          </div>
          <button
            onMouseDown={(e) => { e.preventDefault(); onExec("removeFormat"); setActive(null); setOpen(false); }}
            className="mt-2 w-full text-xs font-mono rounded-lg py-1.5 transition-all"
            style={{ color: theme.textSecondary, background: theme.buttonHoverBg }}
          >Clear color</button>
        </div>
      )}
    </div>
  );
}

// ─── Image Insert Button (file) ──────────────────────────────────────────────
function ImageToolBtn({ onInsertImage, theme, collapsed }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onInsertImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        title="Insert image"
        onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
        className={`w-full flex items-center rounded-xl text-xs font-mono transition-all
          ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2 gap-2.5"}`}
        style={{ color: theme.textSecondary }}
        onMouseEnter={e => { e.currentTarget.style.background = theme.buttonHoverBg; e.currentTarget.style.color = theme.accentPrimary; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textSecondary; }}
      >
        <span className="shrink-0 w-6 flex items-center justify-center"><Image size={15} /></span>
        {!collapsed && <span className="text-xs opacity-90 font-sans">Image file</span>}
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </>
  );
}

// ─── Image URL Button ────────────────────────────────────────────────────────
function ImageUrlBtn({ onInsertImageUrl, theme, collapsed }) {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl]             = useState("");

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsertImageUrl(url.trim());
    setUrl(""); setShowInput(false);
  };

  if (showInput) return (
    <div className="px-2 py-1.5 flex flex-col gap-1.5">
      <input
        autoFocus type="url" value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleInsert(); if (e.key === "Escape") { setShowInput(false); setUrl(""); } }}
        placeholder="Paste URL…"
        className="w-full border text-xs font-mono rounded-lg px-2 py-1.5 outline-none"
        style={{ background: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
      />
      <div className="flex gap-1">
        <button onMouseDown={e => { e.preventDefault(); handleInsert(); }}
          className="flex-1 py-1 rounded-lg text-xs font-mono font-semibold"
          style={{ background: theme.accentPrimary, color: theme.bg }}>Insert</button>
        <button onMouseDown={e => { e.preventDefault(); setShowInput(false); setUrl(""); }}
          className="p-1 rounded-lg" style={{ color: theme.textSecondary }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <button
      type="button" title="Insert image from URL"
      onMouseDown={(e) => { e.preventDefault(); setShowInput(true); }}
      className={`w-full flex items-center rounded-xl text-xs font-mono transition-all
        ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2 gap-2.5"}`}
      style={{ color: theme.textSecondary }}
      onMouseEnter={e => { e.currentTarget.style.background = theme.buttonHoverBg; e.currentTarget.style.color = theme.accentPrimary; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textSecondary; }}
    >
      <span className="shrink-0 w-6 flex items-center justify-center"><Upload size={15} /></span>
      {!collapsed && <span className="text-xs opacity-90 font-sans">Image URL</span>}
    </button>
  );
}

// ─── Writing Sidebar ─────────────────────────────────────────────────────────
function WritingSidebar({ theme, exec, onInsertImage, onInsertImageUrl, saveSelection, spellCheck, onToggleSpell, focusMode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-full shrink-0 flex flex-col border-r transition-all duration-300 ease-in-out overflow-hidden
        ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
      style={{
        width: collapsed ? 60 : 200,
        borderColor: theme.border,
        background: theme.panelBg,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* ── Header ── */}
      <div className={`flex items-center border-b py-4 ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}
           style={{ borderColor: theme.border }}>
        {!collapsed && (
          <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.textSecondary }}>
            Tools
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: theme.textSecondary }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.buttonHoverBg; e.currentTarget.style.color = theme.textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textSecondary; }}
          title={collapsed ? "Expand tools" : "Collapse tools"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Tool groups ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-5"
           style={{ scrollbarWidth: "none" }}>
        {SIDEBAR_GROUPS.map((group, gi) => (
          <div key={gi}>
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.18em] px-2 mb-2"
                 style={{ color: theme.textSecondary }}>{group.label}</p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item, i) => (
                <SideToolBtn key={i} item={item} onExec={exec} theme={theme} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}

        {/* Colors */}
        <div>
          {!collapsed && (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] px-2 mb-2"
               style={{ color: theme.textSecondary }}>Color</p>
          )}
          <ColorPickerBtn theme={theme} onExec={exec} collapsed={collapsed} />
        </div>

        {/* Media */}
        <div>
          {!collapsed && (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] px-2 mb-2"
               style={{ color: theme.textSecondary }}>Media</p>
          )}
          <div onMouseDown={saveSelection} className="flex flex-col gap-1">
            <ImageToolBtn onInsertImage={onInsertImage} theme={theme} collapsed={collapsed} />
            <ImageUrlBtn  onInsertImageUrl={onInsertImageUrl} theme={theme} collapsed={collapsed} />
          </div>
        </div>

        {/* Spell check */}
        <div>
          {!collapsed && (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] px-2 mb-2"
               style={{ color: theme.textSecondary }}>Spell</p>
          )}
          <button
            type="button"
            title={spellCheck ? "Disable spell check" : "Enable spell check"}
            onClick={onToggleSpell}
            className={`w-full flex items-center rounded-xl text-xs font-mono transition-all
              ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2 gap-2.5"}`}
            style={spellCheck
              ? { background: theme.buttonHoverBg, color: theme.accentPrimary, boxShadow: `inset 0 0 0 1px ${theme.border}` }
              : { color: theme.textSecondary }
            }
            onMouseEnter={e => { if (!spellCheck) { e.currentTarget.style.background = theme.buttonHoverBg; e.currentTarget.style.color = theme.textPrimary; } }}
            onMouseLeave={e => { if (!spellCheck) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textSecondary; } }}
          >
            <span className="shrink-0 w-6 flex items-center justify-center">
              <SpellCheck size={15} />
            </span>
            {!collapsed && <span className="text-xs opacity-90 font-sans">{spellCheck ? "Spell on" : "Spell off"}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Sticky Note Colors ───────────────────────────────────────────────────────
const NOTE_COLORS = [
  { bg: "#FFE566", border: "#E6C800", text: "#3a3000", label: "Yellow"  },
  { bg: "#B5EAD7", border: "#7DC4A8", text: "#0a3d2e", label: "Mint"    },
  { bg: "#C7CEEA", border: "#8E9CC7", text: "#1a1f4a", label: "Lavender"},
  { bg: "#FFB7B2", border: "#E07870", text: "#4a0a07", label: "Peach"   },
  { bg: "#FFDAC1", border: "#E0A87A", text: "#4a2000", label: "Apricot" },
];

// ─── Single Sticky Note ───────────────────────────────────────────────────────
function StickyNote({ note, onDelete, onEdit, onColorChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(note.text);
  const textareaRef           = useRef(null);
  const color = NOTE_COLORS[note.colorIdx ?? 0];

  const saveEdit = () => { onEdit(note.id, draft); setEditing(false); };

  useEffect(() => { if (editing) textareaRef.current?.focus(); }, [editing]);

  const timestamp = (() => {
    const d = new Date(note.createdAt);
    return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  })();

  return (
    <div className="relative flex flex-col rounded-2xl p-4 shadow-lg"
         style={{ background: color.bg, border: `1.5px solid ${color.border}`, minHeight: 160, fontFamily: "'Sora', sans-serif" }}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
              style={{ background: color.border, color: color.bg }}>
          Point to update
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <div className="relative group/cp">
            <button title="Change color" className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
                    style={{ background: color.border + "55" }}>
              <span style={{ fontSize: 11 }}>🎨</span>
            </button>
            <div className="absolute right-0 top-8 hidden group-hover/cp:flex gap-1.5 p-2 rounded-xl shadow-xl z-10 border"
                 style={{ background: "#ffffffdd", borderColor: "#ddd" }}>
              {NOTE_COLORS.map((c, i) => (
                <button key={i} title={c.label} onClick={() => onColorChange(note.id, i)}
                        className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ background: c.bg, borderColor: c.border }} />
              ))}
            </div>
          </div>
          <button title={editing ? "Save" : "Edit note"} onClick={() => editing ? saveEdit() : setEditing(true)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
                  style={{ background: color.border + "55", color: color.text }}>
            {editing ? <Check size={12} strokeWidth={2.5} /> : <span style={{ fontSize: 12 }}>✏️</span>}
          </button>
          <button title="Delete note" onClick={() => onDelete(note.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
                  style={{ background: color.border + "55", color: color.text }}>
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      {editing ? (
        <textarea ref={textareaRef} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Escape") { setDraft(note.text); setEditing(false); } }}
          className="flex-1 resize-none rounded-xl p-2 text-sm leading-relaxed outline-none border-2"
          style={{ background: color.bg, borderColor: color.border, color: color.text, fontFamily: "'Sora',sans-serif", minHeight: 90 }} />
      ) : (
        <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap cursor-text select-text"
             style={{ color: color.text }} onDoubleClick={() => setEditing(true)}>
          {note.text || <span style={{ opacity: 0.45 }}>Double-click to edit…</span>}
        </div>
      )}
      <p className="mt-3 text-[11px] opacity-50" style={{ color: color.text }}>{timestamp}</p>
    </div>
  );
}

// ─── Notes Panel ─────────────────────────────────────────────────────────────
function NotesPanel({ theme, isDarkMode }) {
  const STORAGE_KEY = "writingstudio_notes";
  const load = () => { try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
  const save = (arr) => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  const [open,  setOpen]  = useState(false);
  const [notes, setNotes] = useState(load);

  const addNote    = () => { const n = { id: Date.now(), text: "", colorIdx: 0, createdAt: Date.now() }; const next = [n, ...notes]; setNotes(next); save(next); };
  const deleteNote = (id) => { const next = notes.filter(n => n.id !== id); setNotes(next); save(next); };
  const editNote   = (id, text) => { const next = notes.map(n => n.id === id ? { ...n, text } : n); setNotes(next); save(next); };
  const changeColor = (id, colorIdx) => { const next = notes.map(n => n.id === id ? { ...n, colorIdx } : n); setNotes(next); save(next); };

  return (
    <>
      <button onClick={() => setOpen(o => !o)} title="Notes"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center justify-center gap-1 w-9 rounded-xl py-3 shadow-xl border transition-all duration-200 hover:scale-105"
        style={{ background: open ? "#FFE566" : theme.inputBg, borderColor: open ? "#E6C800" : theme.border, color: open ? "#3a3000" : theme.textSecondary }}>
        <span style={{ fontSize: 16 }}>📝</span>
        <span style={{ fontSize: 9, fontFamily: "'Sora',sans-serif", fontWeight: 700, letterSpacing: "0.1em", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", marginTop: 4 }}>NOTES</span>
        {notes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                style={{ background: "#FFE566", color: "#3a3000", border: "1.5px solid #E6C800" }}>{notes.length}</span>
        )}
      </button>
      <div className="fixed top-0 right-0 h-full z-[59] flex flex-col transition-all duration-300 ease-in-out"
           style={{ width: open ? 320 : 0, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
                    background: isDarkMode ? "#121212" : "#f5f5f0", borderLeft: `1px solid ${theme.border}`,
                    boxShadow: open ? "-8px 0 32px rgba(0,0,0,0.18)" : "none", overflow: "hidden" }}>
        <div className="flex flex-col h-full" style={{ width: 320 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18 }}>📝</span>
              <span className="font-black text-sm" style={{ color: theme.textPrimary, fontFamily: "'Sora',sans-serif" }}>Notes</span>
              {notes.length > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFE566", color: "#3a3000" }}>{notes.length}</span>}
            </div>
            <button onClick={addNote} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "#FFE566", color: "#3a3000", border: "1.5px solid #E6C800" }}>
              <span style={{ fontSize: 13 }}>+</span> Add note
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                <span style={{ fontSize: 40 }}>📋</span>
                <p className="text-xs text-center font-medium" style={{ color: theme.textSecondary }}>No notes yet.<br />Click "Add note" to jot something down.</p>
              </div>
            ) : notes.map(note => (
              <StickyNote key={note.id} note={note} onDelete={deleteNote} onEdit={editNote} onColorChange={changeColor} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WritingStudio({ open, onClose, onCreated, articleToEdit }) {
  const { createArticle, updateArticle, isCreatingArticle } = useArticleStore();
  const { subjectsList, getSubjectsList }    = useSubjectStore();
  const { isDarkMode }                        = useThemeStore();

  const [form, setForm] = useState({ article_title: "", article_content: "", article_subject: "", article_tags: "" });
  const [stats,       setStats]       = useState({ words: 0, chars: 0 });
  const [saveStatus,  setSaveStatus]  = useState("");
  const [focusMode,   setFocusMode]   = useState(false);
  const [metaOpen,    setMetaOpen]    = useState(false);
  const [spellCheck,  setSpellCheck]  = useState(true);

  const editorRef      = useRef(null);
  const draftTimer     = useRef(null);
  const savedSelection = useRef(null);

  // ─── Enhance code blocks ──────────────────────────────────────────────────
  const enhanceCodeBlocks = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll("pre").forEach((pre) => {
      if (pre.dataset.enhanced === "1") return;
      pre.dataset.enhanced = "1";
      const existingContent = pre.innerHTML;
      const contentSpan = document.createElement("span");
      contentSpan.className = "ws-pre-content";
      contentSpan.innerHTML = existingContent;
      pre.innerHTML = "";
      pre.appendChild(contentSpan);
      const dots = document.createElement("span");
      dots.className = "ws-pre-dots";
      dots.contentEditable = "false";
      dots.innerHTML = `<span style="background:#ff5f57;"></span><span style="background:#febc2e;"></span><span style="background:#28c840;"></span>`;
      pre.appendChild(dots);
      const saveBtn = document.createElement("button");
      saveBtn.className = "ws-pre-save-btn"; saveBtn.contentEditable = "false";
      saveBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Save`;
      saveBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const code = contentSpan.innerText || contentSpan.textContent || "";
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob); const a = document.createElement("a");
        a.href = url; a.download = "code-snippet.txt"; a.click(); URL.revokeObjectURL(url);
        toast.success("Code saved!");
      });
      pre.appendChild(saveBtn);
      const copyBtn = document.createElement("button");
      copyBtn.className = "ws-pre-copy-btn"; copyBtn.contentEditable = "false";
      copyBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>Copy`;
      copyBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const code = contentSpan.innerText || contentSpan.textContent || "";
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#28c840" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!`;
          copyBtn.style.color = "#28c840";
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>Copy`;
            copyBtn.style.color = "";
          }, 2000);
        }).catch(() => toast.error("Failed to copy"));
      });
      pre.appendChild(copyBtn);
    });
  }, []);

  // ── Pre-fill the form if editing, else load drafts ──
  useEffect(() => {
    if (!open) return;
    getSubjectsList();
    
    if (articleToEdit) {
      // Edit Mode
      const prefill = {
        article_title: articleToEdit.article_title || "",
        article_content: articleToEdit.article_content || "",
        article_subject: articleToEdit.article_subject?._id || articleToEdit.article_subject || "",
        article_tags: articleToEdit.article_tags?.join(", ") || "",
      };
      setForm(prefill);
      setTimeout(() => {
        if (editorRef.current) editorRef.current.innerHTML = prefill.article_content;
        setStats(countWords(prefill.article_content));
        enhanceCodeBlocks();
      }, 50);
    } else {
      // Create Mode
      const draft = sessionStorage.getItem("writingstudio_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setForm(parsed);
          setTimeout(() => {
            if (editorRef.current) editorRef.current.innerHTML = parsed.article_content || "";
            setStats(countWords(parsed.article_content || ""));
            enhanceCodeBlocks();
          }, 50);
        } catch {}
      }
    }
  }, [open, articleToEdit, getSubjectsList, enhanceCodeBlocks]);

  const saveDraft = useCallback((newForm) => {
    setSaveStatus("saving");
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      sessionStorage.setItem("writingstudio_draft", JSON.stringify(newForm));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2500);
    }, 800);
  }, []);

  const handleEditorInput = () => {
    const html    = editorRef.current?.innerHTML || "";
    const newForm = { ...form, article_content: html };
    setForm(newForm); setStats(countWords(html)); saveDraft(newForm);
    enhanceCodeBlocks();
  };

  const handleField = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm); saveDraft(newForm);
  };

  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val || null);
    handleEditorInput();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedSelection.current = sel.getRangeAt(0).cloneRange();
  };

  const insertImageHtml = (imgHtml) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    let range;
    if (savedSelection.current) {
      sel.removeAllRanges(); sel.addRange(savedSelection.current);
      range = savedSelection.current; savedSelection.current = null;
    } else if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    } else {
      range = document.createRange(); range.selectNodeContents(editor); range.collapse(false);
    }
    if (!editor.contains(range.commonAncestorContainer)) {
      range = document.createRange(); range.selectNodeContents(editor); range.collapse(false);
      sel.removeAllRanges(); sel.addRange(range);
    }
    document.execCommand("insertHTML", false, imgHtml);
    handleEditorInput();
  };

  const handleInsertImageFile = (dataUrl) =>
    insertImageHtml(`<img src="${dataUrl}" alt="Inserted image" style="max-width:100%;border-radius:10px;margin:1em 0;" /><p><br></p>`);

  const handleInsertImageUrl = (url) =>
    insertImageHtml(`<img src="${url}" alt="Image" style="max-width:100%;border-radius:10px;margin:1em 0;" /><p><br></p>`);

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;"); }
    if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); submit(); }
    if (e.key === "Enter" && !e.shiftKey) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      let node = range.startContainer; let pre = null;
      while (node && node !== editorRef.current) {
        if (node.nodeName === "PRE") { pre = node; break; }
        node = node.parentNode;
      }
      if (pre) {
        const textNode = range.startContainer;
        const lineText = textNode.nodeType === Node.TEXT_NODE ? textNode.textContent : "";
        const isEmptyLine = lineText === "" || (lineText === "\n" && range.startOffset <= 1);
        if (isEmptyLine) {
          e.preventDefault();
          if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent === "\n") textNode.textContent = "";
          const p = document.createElement("p"); p.innerHTML = "<br>";
          pre.parentNode.insertBefore(p, pre.nextSibling);
          const newRange = document.createRange(); newRange.setStart(p, 0); newRange.collapse(true);
          sel.removeAllRanges(); sel.addRange(newRange);
          handleEditorInput();
        }
      }
    }
  };

  const resetForm = () => {
    setForm({ article_title: "", article_content: "", article_subject: "", article_tags: "" });
    if (editorRef.current) editorRef.current.innerHTML = "";
    setStats({ words: 0, chars: 0 }); setSaveStatus("");
    if (!articleToEdit) sessionStorage.removeItem("writingstudio_draft");
  };

  const submit = async () => {
    if (!form.article_title.trim()) { toast.error("Title is required"); return; }
    const content = editorRef.current?.innerHTML || "";
    if (!content || content === "<br>") { toast.error("Content is required"); return; }
    if (!form.article_subject) { toast.error("Please pick a subject"); setMetaOpen(true); return; }
    const tags = form.article_tags.split(",").map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) { toast.error("Add at least one tag"); setMetaOpen(true); return; }

    const payload = {
      article_title: form.article_title.trim(),
      article_content: content,
      article_subject: form.article_subject,
      article_tags: tags,
    };

    if (articleToEdit) {
      await updateArticle(articleToEdit._id, payload);
    } else {
      await createArticle(payload);
      sessionStorage.removeItem("writingstudio_draft");
    }

    resetForm(); onCreated?.(); onClose();
  };

  if (!open) return null;

  const selectedSubjectName = subjectsList.find(s => s._id === form.article_subject)?.subject_name;

  // ── High Contrast Monochrome Theme Map ──
  const theme = isDarkMode ? {
    bg: "#121212", 
    textPrimary: "#ffffff", 
    textSecondary: "#a1a1aa",
    accentPrimary: "#ffffff", 
    accentSecondary: "#d4d4d8",
    border: "#27272a", 
    inputBg: "#18181b",
    panelBg: "rgba(18,18,18,0.95)",
    buttonHoverBg: "rgba(255,255,255,0.1)",
    selectionBg: "rgba(255,255,255,0.2)",
    cursorColor: "#ffffff",
  } : {
    bg: "#ffffff", 
    textPrimary: "#000000", 
    textSecondary: "#71717a",
    accentPrimary: "#000000", 
    accentSecondary: "#52525b",
    border: "#e4e4e7", 
    inputBg: "#f4f4f5",
    panelBg: "rgba(255,255,255,0.95)",
    buttonHoverBg: "rgba(0,0,0,0.06)",
    selectionBg: "rgba(0,0,0,0.15)",
    cursorColor: "#000000",
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: theme.bg, fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap');

        .ws-bg {
          background: ${theme.bg};
        }

        .writing-body {
          font-family: 'Lora', Georgia, serif; font-size: 1.125rem;
          line-height: 1.95; color: ${theme.textPrimary}; word-spacing: 0.02em;
        }
        .writing-body:empty::before { content: attr(data-placeholder); color: ${theme.textSecondary}; pointer-events: none; }
        .writing-body p   { margin-bottom: 1.1em; }
        .writing-body h1  { font-family:'Playfair Display',Georgia,serif; font-size:2em;   font-weight:800; color:${theme.textPrimary}; margin:1.4em 0 0.5em; line-height:1.2; }
        .writing-body h2  { font-family:'Playfair Display',Georgia,serif; font-size:1.5em; font-weight:700; color:${theme.textPrimary}; margin:1.2em 0 0.4em; line-height:1.3; }
        .writing-body h3  { font-family:'Playfair Display',Georgia,serif; font-size:1.2em; font-weight:700; color:${theme.textPrimary}; margin:1em 0 0.3em; }
        .writing-body strong { color:${theme.textPrimary}; font-weight:700; }
        .writing-body em     { color:${theme.accentSecondary}; font-style:italic; }
        .writing-body u      { text-decoration-color:${theme.accentPrimary}; }
        .writing-body s      { color:${theme.textSecondary}; }
        .writing-body blockquote { border-left:3px solid ${theme.border}; margin:1.5em 0; padding:0.5em 0 0.5em 1.2em; color:${theme.textSecondary}; font-style:italic; background:${theme.buttonHoverBg}; border-radius:0 8px 8px 0; }
        .writing-body code { font-family:'JetBrains Mono','Fira Code',monospace; font-size:0.875em; background:${theme.inputBg}; border:1px solid ${theme.border}; border-radius:4px; color:${theme.textPrimary}; padding:0.15em 0.4em; }
        .writing-body pre { position:relative; font-family:'JetBrains Mono','Fira Code',monospace; font-size:0.875em; background:#1a1b26; border:1px solid #2a2a3e; border-radius:10px; margin:1.4em 0; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.35); }
        .writing-body pre::before { content:''; display:block; height:38px; background:#252535; border-bottom:1px solid rgba(255,255,255,0.06); }
        .ws-pre-dots { position:absolute; top:11px; left:14px; display:flex; gap:6px; pointer-events:none; z-index:2; }
        .ws-pre-dots span { width:12px; height:12px; border-radius:50%; display:block; }
        .ws-pre-content { padding:1em 1.2em; overflow-x:auto; white-space:pre; color:#c8d3f5; line-height:1.7; display:block; }
        .ws-pre-copy-btn { position:absolute; top:7px; right:10px; z-index:2; display:flex; align-items:center; gap:5px; padding:3px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.07); color:rgba(200,211,245,0.7); font-family:'Sora',sans-serif; font-size:11px; cursor:pointer; transition:background 0.15s,color 0.15s; }
        .ws-pre-copy-btn:hover { background:rgba(255,255,255,0.14); color:#c8d3f5; }
        .ws-pre-save-btn { position:absolute; top:7px; right:88px; z-index:2; display:flex; align-items:center; gap:5px; padding:3px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.07); color:rgba(200,211,245,0.7); font-family:'Sora',sans-serif; font-size:11px; cursor:pointer; transition:background 0.15s,color 0.15s; }
        .ws-pre-save-btn:hover { background:rgba(255,255,255,0.14); color:#c8d3f5; }
        .writing-body ul, .writing-body ol { margin:0.8em 0 1em 1.4em; color:${theme.textPrimary}; }
        .writing-body ul { list-style-type:disc; } .writing-body ol { list-style-type:decimal; }
        .writing-body li { margin-bottom:0.3em; }
        .writing-body a { color:${theme.textPrimary}; text-decoration:underline; text-decoration-color:${theme.textSecondary}; }
        .writing-body a:hover { opacity:0.8; }

        /* ── Cursor color fixed here ── */
        .writing-body { caret-color: ${theme.cursorColor}; }
        input[name="article_title"] { caret-color: ${theme.cursorColor}; }

        /* ── Selection color ── */
        .writing-body ::selection { background: ${theme.selectionBg}; color: ${theme.textPrimary}; }
        .writing-body ::-moz-selection { background: ${theme.selectionBg}; color: ${theme.textPrimary}; }

        .writing-body img { max-width:100%; border-radius:10px; margin:1em 0; display:block; border:1px solid ${theme.border}; }
        .writing-body img:hover { border-color:${theme.accentPrimary}; outline:2px solid ${theme.buttonHoverBg}; }

        .ws-scroll::-webkit-scrollbar       { width:6px; }
        .ws-scroll::-webkit-scrollbar-track { background:transparent; }
        .ws-scroll::-webkit-scrollbar-thumb { background:${theme.border}; border-radius:99px; }
        .ws-scroll::-webkit-scrollbar-thumb:hover { background:${theme.textSecondary}; }

        .ws-input { width:100%; padding:9px 14px; border-radius:12px; border:1.5px solid ${theme.border}; background:${theme.inputBg}; font-family:'Sora',sans-serif; font-size:13px; color:${theme.textPrimary}; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .ws-input::placeholder { color:${theme.textSecondary}; }
        .ws-input:focus { border-color:${theme.accentPrimary}; box-shadow:0 0 0 4px ${theme.buttonHoverBg}; }
        .ws-input option { background:${theme.bg}; color:${theme.textPrimary}; }
        input[name="article_title"]::placeholder { color: ${theme.textSecondary}; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          TOP BAR
      ══════════════════════════════════════════════════════════════════ */}
      <header
        className={`ws-bg flex items-center justify-between px-6 py-3 border-b transition-opacity duration-300 ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
        style={{ borderColor: theme.border, backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => { resetForm(); onClose(); }} className="flex items-center gap-2 transition-colors"
            style={{ color: theme.textSecondary }}
            onMouseEnter={e => e.currentTarget.style.color = theme.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = theme.textSecondary}>
            <ArrowLeft size={16} strokeWidth={1.8} /> <span className="text-xs font-mono">Back</span>
          </button>
          <div style={{ width: 1, height: 18, background: theme.border }} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                 style={{ background: theme.textPrimary }}>
              <PenLine size={12} color={theme.bg} />
            </div>
            <span className="text-xs font-mono font-semibold" style={{ color: theme.textPrimary }}>{articleToEdit ? "Editing Article" : "Writing Studio"}</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {saveStatus === "saving" && <span className="text-xs font-mono animate-pulse" style={{ color: theme.textSecondary }}>saving draft…</span>}
          {saveStatus === "saved"  && <span className="text-xs font-mono flex items-center gap-1" style={{ color: theme.textPrimary }}><Check size={11} strokeWidth={2.5} /> draft saved</span>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono" style={{ color: theme.textSecondary }}>
            <span>{stats.words} words</span>
            <span style={{ color: theme.border }}>·</span>
            <span>{stats.chars} chars</span>
          </div>
          <button onClick={() => setFocusMode(f => !f)} className="text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all"
            style={focusMode ? { color: theme.accentPrimary, background: theme.buttonHoverBg } : { color: theme.textSecondary }}>
            ⊙ Focus
          </button>
          <button onClick={() => setMetaOpen(m => !m)} className="text-xs font-mono px-3 py-1.5 rounded-lg border transition-all"
            style={metaOpen ? { borderColor: theme.accentPrimary, color: theme.textPrimary, background: theme.buttonHoverBg } : { borderColor: theme.border, color: theme.textSecondary, background: theme.inputBg }}>
            {selectedSubjectName || "Set subject & tags"}
          </button>
          <button onClick={submit} disabled={isCreatingArticle}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold disabled:opacity-50 transition-all border"
            style={{ background: theme.textPrimary, color: theme.bg, borderColor: "transparent" }}>
            {isCreatingArticle ? "Publishing…" : <><span>Publish</span><span style={{ opacity: 0.55, marginLeft: 4 }}>⌘S</span></>}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          META PANEL
      ══════════════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden transition-all duration-300 ease-in-out border-b"
           style={{ maxHeight: metaOpen ? "130px" : "0", borderColor: theme.border, background: theme.panelBg, backdropFilter: "blur(12px)" }}>
        <div className="px-8 py-4 flex flex-wrap gap-5 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: theme.textSecondary }}>
              Subject <span style={{ color: theme.textPrimary }}>*</span>
            </label>
            <select name="article_subject" value={form.article_subject} onChange={handleField} className="ws-input">
              <option value="">Select subject…</option>
              {subjectsList.map(s => <option key={s._id} value={s._id}>{s.subject_name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: theme.textSecondary }}>
              Tags <span className="normal-case" style={{ opacity: 0.6 }}>(comma separated)</span> <span style={{ color: theme.textPrimary }}>*</span>
            </label>
            <input name="article_tags" value={form.article_tags} onChange={handleField} placeholder="react, hooks, patterns" className="ws-input" />
          </div>
          <button onClick={() => setMetaOpen(false)} className="text-xs font-mono pb-2 transition-colors"
            style={{ color: theme.textSecondary }}
            onMouseEnter={e => e.currentTarget.style.color = theme.accentPrimary}
            onMouseLeave={e => e.currentTarget.style.color = theme.textSecondary}>Done ↑</button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BODY = LEFT SIDEBAR + EDITOR
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Tool Sidebar ── */}
        <WritingSidebar
          theme={theme}
          exec={exec}
          onInsertImage={handleInsertImageFile}
          onInsertImageUrl={handleInsertImageUrl}
          saveSelection={saveSelection}
          spellCheck={spellCheck}
          onToggleSpell={() => setSpellCheck(s => !s)}
          focusMode={focusMode}
        />

        {/* ── Writing Area ── */}
        <div className="flex-1 overflow-y-auto ws-scroll ws-bg">
          <div className="max-w-2xl mx-auto px-6 pt-16 pb-32">
            <input
              name="article_title" value={form.article_title} onChange={handleField} placeholder="Untitled"
              className="w-full bg-transparent border-none outline-none mb-10"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: theme.textPrimary, lineHeight: 1.2 }}
            />
            {/* The spellCheck HTML5 attribute is properly wired here */}
            <div
              ref={editorRef} contentEditable suppressContentEditableWarning
              onInput={handleEditorInput} onKeyDown={handleKeyDown} onPaste={handlePaste}
              data-placeholder="Begin writing…"
              className="writing-body focus:outline-none min-h-96"
              spellCheck={spellCheck} 
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM STATUS BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`flex items-center justify-between px-6 py-2 border-t text-xs font-mono transition-opacity duration-300 ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
           style={{ borderColor: theme.border, background: theme.panelBg, backdropFilter: "blur(12px)", color: theme.textSecondary }}>
        <span>{selectedSubjectName ? <><span style={{ color: theme.accentPrimary }}>●</span> {selectedSubjectName}</> : "No subject selected"}</span>
        <span>{stats.words} words · {stats.chars} characters</span>
        <span>⌘S to publish · Tab to indent</span>
      </div>

      {/* ── Sticky Notes Panel ── */}
      <NotesPanel theme={theme} isDarkMode={isDarkMode} />
    </div>
  );
}