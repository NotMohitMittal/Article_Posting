import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useArticleStore } from "../context/ArticleContext";
import { useSubjectStore } from "../context/SubjectContext";
import { Image, Upload, X } from "lucide-react";

// ─── Toolbar config ──────────────────────────────────────────────────────────
const TOOLBAR_GROUPS = [
  [
    { cmd: "bold", label: "B", title: "Bold (⌘B)", style: "font-bold" },
    { cmd: "italic", label: "I", title: "Italic (⌘I)", style: "italic" },
    { cmd: "underline", label: "U", title: "Underline", style: "underline" },
    { cmd: "strikeThrough", label: "S", title: "Strikethrough", style: "line-through" },
  ],
  [
    { cmd: "formatBlock", value: "h1", label: "H1", title: "Heading 1" },
    { cmd: "formatBlock", value: "h2", label: "H2", title: "Heading 2" },
    { cmd: "formatBlock", value: "h3", label: "H3", title: "Heading 3" },
    { cmd: "formatBlock", value: "p", label: "¶", title: "Paragraph" },
  ],
  [
    { cmd: "insertUnorderedList", label: "⁃ List", title: "Bullet list" },
    { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
    { cmd: "formatBlock", value: "blockquote", label: "❝", title: "Blockquote" },
    { cmd: "formatBlock", value: "pre", label: "</>", title: "Code block" },
  ],
  [
    { cmd: "justifyLeft", label: "⬡L", title: "Align left" },
    { cmd: "justifyCenter", label: "⬡C", title: "Align center" },
  ],
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

// ─── Toolbar Button ──────────────────────────────────────────────────────────
function ToolBtn({ item, onExec }) {
  const isActive = () => {
    try {
      if (item.value) return document.queryCommandValue(item.cmd) === item.value;
      return document.queryCommandState(item.cmd);
    } catch {
      return false;
    }
  };

  return (
    <button
      type="button"
      title={item.title}
      onMouseDown={(e) => {
        e.preventDefault();
        onExec(item.cmd, item.value);
      }}
      className={`
        px-2.5 py-1.5 rounded text-xs font-mono transition-all duration-100 select-none
        ${item.style || ""}
        ${
          isActive()
            ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
            : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
        }
      `}
    >
      {item.label}
    </button>
  );
}

// ─── Image Insert Button ─────────────────────────────────────────────────────
function ImageToolBtn({ onInsertImage }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onInsertImage(ev.target.result);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        title="Insert image"
        onMouseDown={(e) => {
          e.preventDefault();
          fileRef.current?.click();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all duration-100 text-stone-400 hover:text-violet-300 hover:bg-violet-500/10"
      >
        <Image size={13} />
        <span>Image</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </>
  );
}

// ─── Image URL Insert Button ─────────────────────────────────────────────────
function ImageUrlBtn({ onInsertImageUrl }) {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsertImageUrl(url.trim());
    setUrl("");
    setShowInput(false);
  };

  if (showInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleInsert();
            if (e.key === "Escape") { setShowInput(false); setUrl(""); }
          }}
          placeholder="Paste image URL…"
          className="bg-[#1a1a2e] border border-[#2a2a4a] text-xs font-mono text-stone-300 rounded px-2 py-1 outline-none focus:border-violet-500/50 w-48 placeholder:text-stone-700"
        />
        <button
          onMouseDown={(e) => { e.preventDefault(); handleInsert(); }}
          className="px-2 py-1 rounded text-xs font-mono text-violet-400 hover:bg-violet-500/10 transition-colors"
        >
          Insert
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowInput(false); setUrl(""); }}
          className="p-1 rounded text-stone-600 hover:text-stone-300 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      title="Insert image from URL"
      onMouseDown={(e) => { e.preventDefault(); setShowInput(true); }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all duration-100 text-stone-400 hover:text-violet-300 hover:bg-violet-500/10"
    >
      <Upload size={13} />
      <span>URL</span>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WritingStudio({ open, onClose, onCreated }) {
  const { createArticle, isCreatingArticle } = useArticleStore();
  const { subjectsList, getSubjectsList } = useSubjectStore();

  const [form, setForm] = useState({
    article_title: "",
    article_content: "",
    article_subject: "",
    article_tags: "",
  });
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [saveStatus, setSaveStatus] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);

  const editorRef = useRef(null);
  const draftTimer = useRef(null);
  // Store the saved selection range for image insertion
  const savedSelection = useRef(null);

  useEffect(() => {
    if (!open) return;
    getSubjectsList();

    const draft = sessionStorage.getItem("inkwell_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm(parsed);
        setTimeout(() => {
          if (editorRef.current)
            editorRef.current.innerHTML = parsed.article_content || "";
          setStats(countWords(parsed.article_content || ""));
        }, 50);
      } catch {}
    }
  }, [open]);

  const saveDraft = useCallback((newForm) => {
    setSaveStatus("saving");
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      sessionStorage.setItem("inkwell_draft", JSON.stringify(newForm));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    }, 800);
  }, []);

  const handleEditorInput = () => {
    const html = editorRef.current?.innerHTML || "";
    const newForm = { ...form, article_content: html };
    setForm(newForm);
    setStats(countWords(html));
    saveDraft(newForm);
  };

  const handleField = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    saveDraft(newForm);
  };

  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val || null);
    handleEditorInput();
  };

  // Save cursor position before image dialogs steal focus
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore cursor and insert image HTML
  const insertImageHtml = (imgHtml) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const sel = window.getSelection();
    let range;

    if (savedSelection.current) {
      // Restore the saved range
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
      range = savedSelection.current;
      savedSelection.current = null;
    } else if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    } else {
      // Fall back: append at end
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    // Only insert inside the editor
    if (!editor.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    document.execCommand("insertHTML", false, imgHtml);
    handleEditorInput();
  };

  const handleInsertImageFile = (dataUrl) => {
    insertImageHtml(
      `<img src="${dataUrl}" alt="Inserted image" style="max-width:100%;border-radius:8px;margin:1em 0;" /><p><br></p>`
    );
  };

  const handleInsertImageUrl = (url) => {
    insertImageHtml(
      `<img src="${url}" alt="Image" style="max-width:100%;border-radius:8px;margin:1em 0;" /><p><br></p>`
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      submit();
    }
  };

  const resetForm = () => {
    setForm({ article_title: "", article_content: "", article_subject: "", article_tags: "" });
    if (editorRef.current) editorRef.current.innerHTML = "";
    setStats({ words: 0, chars: 0 });
    setSaveStatus("");
    sessionStorage.removeItem("inkwell_draft");
  };

  const submit = async () => {
    if (!form.article_title.trim()) { toast.error("Title is required"); return; }
    const content = editorRef.current?.innerHTML || "";
    if (!content || content === "<br>") { toast.error("Content is required"); return; }
    if (!form.article_subject) { toast.error("Pick a subject"); setMetaOpen(true); return; }
    const tags = form.article_tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) { toast.error("At least one tag"); setMetaOpen(true); return; }

    await createArticle({
      article_title: form.article_title.trim(),
      article_content: content,
      article_subject: form.article_subject,
      article_tags: tags,
    });

    resetForm();
    onCreated?.();
    onClose();
  };

  if (!open) return null;

  const selectedSubjectName = subjectsList.find((s) => s._id === form.article_subject)?.subject_name;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#090b18" }}>
      {/* ── Top bar ── */}
      <header
        className={`flex items-center justify-between px-6 py-3 border-b transition-opacity duration-300 ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
        style={{ borderColor: "#1a1c2e", background: "#0d0f1e" }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs font-mono">Back</span>
          </button>

          <div className="w-px h-4 bg-[#1e2035]" />

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-linear-to-br from-violet-600 to-indigo-700">
              <span className="text-white font-serif text-xs italic font-bold">W</span>
            </div>
            <span className="text-stone-500 text-xs font-mono">Writing Studio</span>
          </div>
        </div>

        {/* Center: save status */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {saveStatus === "saving" && (
            <span className="text-stone-600 text-xs font-mono animate-pulse">saving draft…</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-violet-600 text-xs font-mono flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              draft saved
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-stone-700">
            <span>{stats.words} words</span>
            <span className="text-stone-800">·</span>
            <span>{stats.chars} chars</span>
          </div>

          <button
            onClick={() => setFocusMode((f) => !f)}
            className={`text-xs font-mono px-2 py-1 rounded transition-colors ${focusMode ? "text-violet-400 bg-violet-500/10" : "text-stone-600 hover:text-stone-300"}`}
          >
            ⊙ Focus
          </button>

          <button
            onClick={() => setMetaOpen((m) => !m)}
            className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
              metaOpen
                ? "border-[#2e2e4e] text-stone-200 bg-white/5"
                : "border-[#1e1e3e] text-stone-500 hover:border-[#2e2e4e] hover:text-stone-300"
            }`}
          >
            {selectedSubjectName || "Set subject & tags"}
          </button>

          <button
            onClick={submit}
            disabled={isCreatingArticle}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-xs font-mono font-medium transition-all duration-150 disabled:opacity-50 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
          >
            {isCreatingArticle ? "Publishing…" : <>Publish <span className="opacity-50 ml-1">⌘S</span></>}
          </button>
        </div>
      </header>

      {/* ── Meta panel ── */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out border-b"
        style={{ maxHeight: metaOpen ? "120px" : "0", borderColor: "#1a1c2e", background: "#0d0f1e" }}
      >
        <div className="px-8 py-4 flex flex-wrap gap-5 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-mono text-stone-600 uppercase tracking-widest mb-2">Subject</label>
            <select
              name="article_subject"
              value={form.article_subject}
              onChange={handleField}
              className="w-full px-3 py-2 rounded text-sm font-mono focus:outline-none border transition-colors"
              style={{ background: "#090b18", borderColor: "#1e2035", color: "#ccc" }}
            >
              <option value="">Select subject…</option>
              {subjectsList.map((s) => (
                <option key={s._id} value={s._id}>{s.subject_name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-xs font-mono text-stone-600 uppercase tracking-widest mb-2">
              Tags <span className="normal-case text-stone-700">(comma separated)</span>
            </label>
            <input
              name="article_tags"
              value={form.article_tags}
              onChange={handleField}
              placeholder="react, hooks, patterns"
              className="w-full px-3 py-2 rounded text-sm font-mono focus:outline-none border transition-colors placeholder:text-stone-700"
              style={{ background: "#090b18", borderColor: "#1e2035", color: "#ccc" }}
            />
          </div>

          <button
            onClick={() => setMetaOpen(false)}
            className="text-xs font-mono text-stone-600 hover:text-stone-300 pb-2 transition-colors"
          >
            Done ↑
          </button>
        </div>
      </div>

      {/* ── Writing area ── */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#090b18" }}>
        <div className="max-w-2xl mx-auto px-6 pt-16 pb-32">
          <input
            name="article_title"
            value={form.article_title}
            onChange={handleField}
            placeholder="Untitled"
            className="w-full bg-transparent border-none outline-none mb-10 placeholder:text-[#1e2035] caret-violet-500"
            style={{
              fontFamily: '"Crimson Pro", "Playfair Display", Georgia, serif',
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              color: "#e8e0f0",
              lineHeight: 1.2,
            }}
          />

          {/* Toolbar */}
          <div
            className={`flex flex-wrap items-center gap-1 mb-8 pb-6 border-b transition-opacity duration-300 ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
            style={{ borderColor: "#1a1c2e" }}
          >
            {TOOLBAR_GROUPS.map((group, gi) => (
              <div key={gi} className="flex items-center gap-0.5">
                {gi > 0 && <div className="w-px h-4 mx-1.5" style={{ background: "#1e2035" }} />}
                {group.map((item, i) => (
                  <ToolBtn key={i} item={item} onExec={exec} />
                ))}
              </div>
            ))}

            {/* Image insertion group */}
            <div className="flex items-center gap-0.5">
              <div className="w-px h-4 mx-1.5" style={{ background: "#1e2035" }} />
              {/* Save selection before clicking image buttons */}
              <div onMouseDown={saveSelection} className="flex items-center gap-0.5">
                <ImageToolBtn onInsertImage={handleInsertImageFile} />
                <ImageUrlBtn onInsertImageUrl={handleInsertImageUrl} />
              </div>
            </div>
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onKeyDown={handleKeyDown}
            data-placeholder="Begin writing…"
            className="writing-body focus:outline-none min-h-96"
            style={{ caretColor: "#8b5cf6" }}
          />
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div
        className={`flex items-center justify-between px-6 py-2 border-t text-xs font-mono transition-opacity duration-300 ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
        style={{ borderColor: "#1a1c2e", background: "#0d0f1e", color: "#2e3050" }}
      >
        <span>{selectedSubjectName ? `Subject: ${selectedSubjectName}` : "No subject selected"}</span>
        <span>{stats.words} words · {stats.chars} characters</span>
        <span>⌘S to publish · Tab to indent · Click editor before inserting images</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        .writing-body { font-family: 'Lora', Georgia, serif; font-size: 1.125rem; line-height: 1.9; color: #c8bfcf; word-spacing: 0.02em; }
        .writing-body:empty::before { content: attr(data-placeholder); color: #1e2035; pointer-events: none; }
        .writing-body p { margin-bottom: 1.1em; }
        .writing-body h1 { font-family: 'Crimson Pro', Georgia, serif; font-size: 2em; font-weight: 700; color: #e8d0f8; margin: 1.4em 0 0.5em; line-height: 1.2; }
        .writing-body h2 { font-family: 'Crimson Pro', Georgia, serif; font-size: 1.5em; font-weight: 600; color: #d8c0f0; margin: 1.2em 0 0.4em; line-height: 1.3; }
        .writing-body h3 { font-family: 'Crimson Pro', Georgia, serif; font-size: 1.2em; font-weight: 600; color: #c8b0e0; margin: 1em 0 0.3em; }
        .writing-body strong { color: #ddd5ef; font-weight: 600; }
        .writing-body em { color: #a898c0; font-style: italic; }
        .writing-body u  { text-decoration-color: #4a3060; }
        .writing-body s  { color: #4a4a5a; }
        .writing-body blockquote { border-left: 3px solid #8b5cf6; margin: 1.5em 0; padding: 0.5em 0 0.5em 1.2em; color: #8a7a9a; font-style: italic; }
        .writing-body pre, .writing-body code { font-family: 'JetBrains Mono', monospace; font-size: 0.875em; background: #0f1025; border: 1px solid #1e2040; border-radius: 4px; color: #a78bfa; }
        .writing-body pre { padding: 1em 1.2em; margin: 1.2em 0; overflow-x: auto; display: block; white-space: pre; }
        .writing-body code { padding: 0.15em 0.4em; }
        .writing-body ul, .writing-body ol { margin: 0.8em 0 1em 1.4em; color: #b8b0c8; }
        .writing-body ul { list-style-type: disc; }
        .writing-body ol { list-style-type: decimal; }
        .writing-body li { margin-bottom: 0.3em; }
        .writing-body a { color: #8b5cf6; text-decoration: underline; text-decoration-color: #3a1060; }
        .writing-body a:hover { color: #a78bfa; }
        .writing-body ::selection { background: rgba(139,92,246,0.25); color: #f0e8ff; }
        .writing-body img { max-width: 100%; border-radius: 8px; margin: 1em 0; display: block; border: 1px solid #1e2040; }
        .writing-body img:hover { border-color: #4a3080; outline: 2px solid rgba(139,92,246,0.3); }
      `}</style>
    </div>
  );
}