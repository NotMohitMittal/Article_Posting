import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useArticleStore } from "../context/ArticleContext";
import { useSubjectStore } from "../context/SubjectContext";
import { useThemeStore } from "../context/ThemeContext"; // <-- Imported Theme Store
import { Image, Upload, X, ArrowLeft, PenLine, Check, Copy, Download } from "lucide-react";

// ─── Toolbar config ──────────────────────────────────────────────────────────
const TOOLBAR_GROUPS = [
  [
    { cmd: "bold",          label: "B",      title: "Bold (⌘B)",    style: "font-bold" },
    { cmd: "italic",        label: "I",      title: "Italic (⌘I)",  style: "italic"    },
    { cmd: "underline",     label: "U",      title: "Underline",    style: "underline" },
    { cmd: "strikeThrough", label: "S",      title: "Strikethrough",style: "line-through" },
  ],
  [
    { cmd: "formatBlock", value: "h1", label: "H1", title: "Heading 1" },
    { cmd: "formatBlock", value: "h2", label: "H2", title: "Heading 2" },
    { cmd: "formatBlock", value: "h3", label: "H3", title: "Heading 3" },
    { cmd: "formatBlock", value: "p",  label: "¶",  title: "Paragraph" },
  ],
  [
    { cmd: "insertUnorderedList",          label: "⁃ List",  title: "Bullet list"   },
    { cmd: "insertOrderedList",            label: "1. List", title: "Numbered list" },
    { cmd: "formatBlock", value: "blockquote", label: "❝",  title: "Blockquote"    },
    { cmd: "formatBlock", value: "pre",    label: "</>",     title: "Code block"    },
  ],
  [
    { cmd: "justifyLeft",   label: "⬡L", title: "Align left"   },
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
function ToolBtn({ item, onExec, theme }) {
  const isActive = () => {
    try {
      if (item.value) return document.queryCommandValue(item.cmd) === item.value;
      return document.queryCommandState(item.cmd);
    } catch { return false; }
  };

  return (
    <button
      type="button"
      title={item.title}
      onMouseDown={(e) => { e.preventDefault(); onExec(item.cmd, item.value); }}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-100 select-none ${item.style || ""}`}
      style={isActive() 
        ? { background: theme.buttonHoverBg, color: theme.accentPrimary, boxShadow: `0 0 0 1px ${theme.buttonHoverBg}` }
        : { color: theme.textSecondary }
      }
      onMouseEnter={e => !isActive() && (e.currentTarget.style.background = theme.buttonHoverBg, e.currentTarget.style.color = theme.textPrimary)}
      onMouseLeave={e => !isActive() && (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = theme.textSecondary)}
    >
      {item.label}
    </button>
  );
}

// ─── Image Insert Button (file) ──────────────────────────────────────────────
function ImageToolBtn({ onInsertImage, theme }) {
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all"
        style={{ color: theme.textSecondary }}
        onMouseEnter={e => (e.currentTarget.style.background = theme.buttonHoverBg, e.currentTarget.style.color = theme.accentPrimary)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = theme.textSecondary)}
      >
        <Image size={13} /><span>Image</span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </>
  );
}

// ─── Image URL Insert Button ─────────────────────────────────────────────────
function ImageUrlBtn({ onInsertImageUrl, theme }) {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsertImageUrl(url.trim());
    setUrl(""); setShowInput(false);
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
          className="border text-xs font-mono rounded-lg px-2.5 py-1.5 outline-none w-48 transition-all"
          style={{ background: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
          onFocus={e => e.target.style.borderColor = theme.accentPrimary}
          onBlur={e => e.target.style.borderColor = theme.border}
        />
        <button
          onMouseDown={(e) => { e.preventDefault(); handleInsert(); }}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors"
          style={{ color: theme.accentPrimary }}
          onMouseEnter={e => e.currentTarget.style.background = theme.buttonHoverBg}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >Insert</button>
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowInput(false); setUrl(""); }}
          className="p-1 rounded-lg transition-colors"
          style={{ color: theme.textSecondary }}
          onMouseEnter={e => e.currentTarget.style.color = theme.textPrimary}
          onMouseLeave={e => e.currentTarget.style.color = theme.textSecondary}
        ><X size={12} /></button>
      </div>
    );
  }

  return (
    <button
      type="button"
      title="Insert image from URL"
      onMouseDown={(e) => { e.preventDefault(); setShowInput(true); }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all"
      style={{ color: theme.textSecondary }}
      onMouseEnter={e => (e.currentTarget.style.background = theme.buttonHoverBg, e.currentTarget.style.color = theme.accentPrimary)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = theme.textSecondary)}
    >
      <Upload size={13} /><span>URL</span>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WritingStudio({ open, onClose, onCreated }) {
  const { createArticle, isCreatingArticle } = useArticleStore();
  const { subjectsList, getSubjectsList } = useSubjectStore();
  const { isDarkMode } = useThemeStore(); // <-- Hook into theme state

  const [form, setForm] = useState({
    article_title:   "",
    article_content: "",
    article_subject: "",
    article_tags:    "",
  });
  const [stats,      setStats]      = useState({ words: 0, chars: 0 });
  const [saveStatus, setSaveStatus] = useState("");   
  const [focusMode,  setFocusMode]  = useState(false);
  const [metaOpen,   setMetaOpen]   = useState(false);

  const editorRef       = useRef(null);
  const draftTimer      = useRef(null);
  const savedSelection  = useRef(null);

  // ─── Decorate <pre> blocks with terminal header + copy/save buttons ──────────
  const enhanceCodeBlocks = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.querySelectorAll("pre").forEach((pre) => {
      // Skip already-enhanced blocks
      if (pre.dataset.enhanced === "1") return;
      pre.dataset.enhanced = "1";

      // Wrap inner text in a scrollable span
      const existingContent = pre.innerHTML;
      const contentSpan = document.createElement("span");
      contentSpan.className = "ws-pre-content";
      contentSpan.innerHTML = existingContent;
      pre.innerHTML = "";
      pre.appendChild(contentSpan);

      // Traffic-light dots overlay
      const dots = document.createElement("span");
      dots.className = "ws-pre-dots";
      dots.contentEditable = "false";
      dots.innerHTML = `
        <span style="background:#ff5f57;"></span>
        <span style="background:#febc2e;"></span>
        <span style="background:#28c840;"></span>
      `;
      pre.appendChild(dots);

      // Save button
      const saveBtn = document.createElement("button");
      saveBtn.className = "ws-pre-save-btn";
      saveBtn.contentEditable = "false";
      saveBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Save`;
      saveBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const code = contentSpan.innerText || contentSpan.textContent || "";
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "code-snippet.txt";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Code saved!");
      });
      pre.appendChild(saveBtn);

      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "ws-pre-copy-btn";
      copyBtn.contentEditable = "false";
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

  useEffect(() => {
    if (!open) return;
    getSubjectsList();   

    const draft = sessionStorage.getItem("writingstudio_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm(parsed);
        setTimeout(() => {
          if (editorRef.current)
            editorRef.current.innerHTML = parsed.article_content || "";
          setStats(countWords(parsed.article_content || ""));
          enhanceCodeBlocks();
        }, 50);
      } catch {}
    }
  }, [open, getSubjectsList, enhanceCodeBlocks]);

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
    const html     = editorRef.current?.innerHTML || "";
    const newForm  = { ...form, article_content: html };
    setForm(newForm);
    setStats(countWords(html));
    saveDraft(newForm);
    // Decorate any new <pre> blocks with terminal chrome
    enhanceCodeBlocks();
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

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0)
      savedSelection.current = sel.getRangeAt(0).cloneRange();
  };

  const insertImageHtml = (imgHtml) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    let range;

    if (savedSelection.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
      range = savedSelection.current;
      savedSelection.current = null;
    } else if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    } else {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

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

  const handleInsertImageFile = (dataUrl) =>
    insertImageHtml(`<img src="${dataUrl}" alt="Inserted image" style="max-width:100%;border-radius:10px;margin:1em 0;" /><p><br></p>`);

  const handleInsertImageUrl = (url) =>
    insertImageHtml(`<img src="${url}" alt="Image" style="max-width:100%;border-radius:10px;margin:1em 0;" /><p><br></p>`);

  // ─── FIX: Intercept Pastes and Force Plain Text ────────────────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
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

    // ── Escape <pre> block: pressing Enter on an empty last line exits to <p> ──
    if (e.key === "Enter" && !e.shiftKey) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      // Walk up to find if we're inside a <pre>
      let node = range.startContainer;
      let pre = null;
      while (node && node !== editorRef.current) {
        if (node.nodeName === "PRE") { pre = node; break; }
        node = node.parentNode;
      }

      if (pre) {
        // Get the text of the current line
        const textNode = range.startContainer;
        const offset = range.startOffset;
        const lineText = textNode.nodeType === Node.TEXT_NODE
          ? textNode.textContent
          : "";

        // If the current line is empty (just a newline or nothing) → escape pre
        const isEmptyLine = lineText === "" || (lineText === "\n" && offset <= 1);
        if (isEmptyLine) {
          e.preventDefault();
          // Remove the trailing blank line inside pre if any
          if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent === "\n") {
            textNode.textContent = "";
          }
          // Insert a <p> after the pre
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          pre.parentNode.insertBefore(p, pre.nextSibling);
          // Move cursor into the new <p>
          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          handleEditorInput();
        }
      }
    }
  };

  const resetForm = () => {
    setForm({ article_title: "", article_content: "", article_subject: "", article_tags: "" });
    if (editorRef.current) editorRef.current.innerHTML = "";
    setStats({ words: 0, chars: 0 });
    setSaveStatus("");
    sessionStorage.removeItem("writingstudio_draft");
  };

  const submit = async () => {
    if (!form.article_title.trim()) { toast.error("Title is required"); return; }
    const content = editorRef.current?.innerHTML || "";
    if (!content || content === "<br>") { toast.error("Content is required"); return; }
    if (!form.article_subject) { toast.error("Please pick a subject"); setMetaOpen(true); return; }

    const tags = form.article_tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) { toast.error("Add at least one tag"); setMetaOpen(true); return; }

    await createArticle({
      article_title:   form.article_title.trim(),
      article_content: content,
      article_subject: form.article_subject,
      article_tags:    tags,
    });

    resetForm();
    onCreated?.();
    onClose();
  };

  if (!open) return null;

  const selectedSubjectName = subjectsList.find((s) => s._id === form.article_subject)?.subject_name;

  // ─── FIX: Dynamic Theme Mapping (Depo Studio) ──────────────────────────────
  const theme = isDarkMode ? {
    bg: "#161616",               // Charcoal background
    textPrimary: "#F2F0E9",      // Off-white text
    textSecondary: "#888888",    // Subtle grey
    accentPrimary: "#0033A0",    // Depo Cobalt Blue
    accentSecondary: "#E63973",  // Depo Hot Pink
    border: "#2A2A2A",
    inputBg: "#1F1F1F",
    panelBg: "rgba(22, 22, 22, 0.85)", 
    buttonHoverBg: "rgba(0, 51, 160, 0.15)", // Subtle blue tint
  } : {
    bg: "#eef0ff",
    textPrimary: "#1a1d2e",
    textSecondary: "#7b82a0",
    accentPrimary: "#3d52f5",
    accentSecondary: "#ff9ad7",
    border: "#d4d8f0",
    inputBg: "rgba(255,255,255,0.85)",
    panelBg: "rgba(255, 255, 255, 0.7)",
    buttonHoverBg: "rgba(61, 82, 245, 0.06)",
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: theme.bg, fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap');

        .ws-bg {
          background: ${theme.bg};
          ${!isDarkMode ? `
          background-image:
            radial-gradient(ellipse 70% 55% at 15% 8%,  rgba(138,127,255,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 85% 85%, rgba(93,168,255,0.12)  0%, transparent 55%),
            radial-gradient(ellipse 45% 38% at 65% 18%, rgba(255,154,215,0.09) 0%, transparent 50%);
          ` : ''}
        }

        .writing-body {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.125rem;
          line-height: 1.95;
          color: ${theme.textPrimary};
          word-spacing: 0.02em;
        }
        .writing-body:empty::before {
          content: attr(data-placeholder);
          color: ${theme.textSecondary};
          pointer-events: none;
        }
        .writing-body p   { margin-bottom: 1.1em; }
        .writing-body h1  { font-family:'Playfair Display',Georgia,serif; font-size:2em;   font-weight:800; color:${theme.textPrimary}; margin:1.4em 0 0.5em; line-height:1.2; }
        .writing-body h2  { font-family:'Playfair Display',Georgia,serif; font-size:1.5em; font-weight:700; color:${theme.textPrimary}; margin:1.2em 0 0.4em; line-height:1.3; }
        .writing-body h3  { font-family:'Playfair Display',Georgia,serif; font-size:1.2em; font-weight:700; color:${theme.textPrimary}; margin:1em 0 0.3em; }
        .writing-body strong { color:${theme.textPrimary}; font-weight:700; }
        .writing-body em     { color:${theme.accentSecondary}; font-style:italic; }
        .writing-body u      { text-decoration-color:${theme.accentPrimary}; }
        .writing-body s      { color:${theme.textSecondary}; }
        .writing-body blockquote {
          border-left: 3px solid ${theme.accentPrimary};
          margin: 1.5em 0; padding: 0.5em 0 0.5em 1.2em;
          color: ${theme.textSecondary}; font-style: italic;
          background: ${theme.buttonHoverBg};
          border-radius: 0 8px 8px 0;
        }
        .writing-body code {
          font-family:'JetBrains Mono','Fira Code',monospace; font-size:0.875em;
          background:${theme.inputBg}; border:1px solid ${theme.border}; border-radius:4px;
          color:${theme.accentPrimary}; padding:0.15em 0.4em;
        }
        .writing-body pre {
          position: relative;
          font-family:'JetBrains Mono','Fira Code',monospace; font-size:0.875em;
          background: ${isDarkMode ? '#1e1e2e' : '#1a1b26'};
          border: 1px solid ${isDarkMode ? '#2a2a3e' : '#2a2a3e'};
          border-radius: 10px;
          margin: 1.4em 0;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }
        .writing-body pre::before {
          content: '';
          display: block;
          height: 38px;
          background: ${isDarkMode ? '#252535' : '#252535'};
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ws-pre-dots {
          position: absolute;
          top: 11px;
          left: 14px;
          display: flex;
          gap: 6px;
          pointer-events: none;
          z-index: 2;
        }
        .ws-pre-dots span {
          width: 12px; height: 12px; border-radius: 50%; display: block;
        }
        .ws-pre-content {
          padding: 1em 1.2em;
          overflow-x: auto;
          white-space: pre;
          color: #c8d3f5;
          line-height: 1.7;
          display: block;
        }
        .ws-pre-copy-btn {
          position: absolute;
          top: 7px;
          right: 10px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.07);
          color: rgba(200,211,245,0.7);
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ws-pre-copy-btn:hover { background: rgba(255,255,255,0.14); color: #c8d3f5; }
        .ws-pre-save-btn {
          position: absolute;
          top: 7px;
          right: 88px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.07);
          color: rgba(200,211,245,0.7);
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ws-pre-save-btn:hover { background: rgba(255,255,255,0.14); color: #c8d3f5; }
        .writing-body ul, .writing-body ol { margin:0.8em 0 1em 1.4em; color:${theme.textPrimary}; }
        .writing-body ul   { list-style-type:disc; }
        .writing-body ol   { list-style-type:decimal; }
        .writing-body li   { margin-bottom:0.3em; }
        .writing-body a    { color:${theme.accentPrimary}; text-decoration:underline; text-decoration-color:${theme.buttonHoverBg}; }
        .writing-body a:hover { opacity: 0.8; }
        .writing-body ::selection { background:${theme.buttonHoverBg}; color:${theme.textPrimary}; }
        .writing-body img  { max-width:100%; border-radius:10px; margin:1em 0; display:block; border:1px solid ${theme.border}; }
        .writing-body img:hover { border-color:${theme.accentPrimary}; outline:2px solid ${theme.buttonHoverBg}; }

        .ws-scroll::-webkit-scrollbar       { width:6px; }
        .ws-scroll::-webkit-scrollbar-track { background:transparent; }
        .ws-scroll::-webkit-scrollbar-thumb { background:${theme.border}; border-radius:99px; }
        .ws-scroll::-webkit-scrollbar-thumb:hover { background:${theme.textSecondary}; }

        .ws-input {
          width:100%; padding:9px 14px; border-radius:12px;
          border:1.5px solid ${theme.border}; background:${theme.inputBg};
          font-family:'Sora',sans-serif; font-size:13px; color:${theme.textPrimary};
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
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
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="flex items-center gap-2 transition-colors"
            style={{ color: theme.textSecondary }}
            onMouseEnter={e => e.currentTarget.style.color = theme.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = theme.textSecondary}
          >
            <ArrowLeft size={16} strokeWidth={1.8} /> <span className="text-xs font-mono">Back</span>
          </button>
          <div style={{ width: 1, height: 18, background: theme.border }} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentSecondary})` }}>
              <PenLine size={12} color="white" />
            </div>
            <span className="text-xs font-mono" style={{ color: theme.textSecondary }}>Writing Studio</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {saveStatus === "saving" && <span className="text-xs font-mono animate-pulse" style={{ color: theme.textSecondary }}>saving draft…</span>}
          {saveStatus === "saved" && <span className="text-xs font-mono flex items-center gap-1" style={{ color: theme.accentPrimary }}><Check size={11} strokeWidth={2.5} /> draft saved</span>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono" style={{ color: theme.textSecondary }}>
            <span>{stats.words} words</span>
            <span style={{ color: theme.border }}>·</span>
            <span>{stats.chars} chars</span>
          </div>
          <button
            onClick={() => setFocusMode((f) => !f)}
            className="text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all"
            style={focusMode ? { color: theme.accentPrimary, background: theme.buttonHoverBg } : { color: theme.textSecondary }}
          >⊙ Focus</button>
          <button
            onClick={() => setMetaOpen((m) => !m)}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border transition-all"
            style={metaOpen ? { borderColor: theme.accentPrimary, color: theme.textPrimary, background: theme.buttonHoverBg } : { borderColor: theme.border, color: theme.textSecondary, background: theme.inputBg }}
          >{selectedSubjectName || "Set subject & tags"}</button>
          <button
            onClick={submit} disabled={isCreatingArticle}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold disabled:opacity-50 transition-all"
            style={{ background: theme.accentPrimary, color: "#fff", boxShadow: `0 4px 16px ${theme.buttonHoverBg}` }}
          >
            {isCreatingArticle ? "Publishing…" : <><span>Publish</span><span style={{ opacity: 0.55, marginLeft: 4 }}>⌘S</span></>}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          META PANEL
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out border-b"
        style={{ maxHeight: metaOpen ? "130px" : "0", borderColor: theme.border, background: theme.panelBg, backdropFilter: "blur(12px)" }}
      >
        <div className="px-8 py-4 flex flex-wrap gap-5 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: theme.textSecondary }}>Subject <span style={{ color: theme.accentSecondary }}>*</span></label>
            <select name="article_subject" value={form.article_subject} onChange={handleField} className="ws-input">
              <option value="">Select subject…</option>
              {subjectsList.map((s) => <option key={s._id} value={s._id}>{s.subject_name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: theme.textSecondary }}>Tags <span className="normal-case" style={{ opacity: 0.6 }}>(comma separated)</span> <span style={{ color: theme.accentSecondary }}>*</span></label>
            <input name="article_tags" value={form.article_tags} onChange={handleField} placeholder="react, hooks, patterns" className="ws-input" />
          </div>
          <button onClick={() => setMetaOpen(false)} className="text-xs font-mono pb-2 transition-colors" style={{ color: theme.textSecondary }} onMouseEnter={e => e.currentTarget.style.color = theme.accentPrimary} onMouseLeave={e => e.currentTarget.style.color = theme.textSecondary}>Done ↑</button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          WRITING AREA
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto ws-scroll ws-bg">
        <div className="max-w-2xl mx-auto px-6 pt-16 pb-32">
          <input
            name="article_title" value={form.article_title} onChange={handleField} placeholder="Untitled"
            className="w-full bg-transparent border-none outline-none mb-10"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: theme.textPrimary, lineHeight: 1.2, caretColor: theme.accentPrimary }}
          />

          <div className={`flex flex-wrap items-center gap-1 mb-8 pb-6 border-b transition-opacity duration-300 ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`} style={{ borderColor: theme.border }}>
            {TOOLBAR_GROUPS.map((group, gi) => (
              <div key={gi} className="flex items-center gap-0.5">
                {gi > 0 && <div style={{ width: 1, height: 16, margin: "0 6px", background: theme.border }} />}
                {group.map((item, i) => <ToolBtn key={i} item={item} onExec={exec} theme={theme} />)}
              </div>
            ))}
            <div className="flex items-center gap-0.5">
              <div style={{ width: 1, height: 16, margin: "0 6px", background: theme.border }} />
              <div onMouseDown={saveSelection} className="flex items-center gap-0.5">
                <ImageToolBtn onInsertImage={handleInsertImageFile} theme={theme} />
                <ImageUrlBtn  onInsertImageUrl={handleInsertImageUrl} theme={theme} />
              </div>
            </div>
          </div>

          <div
            ref={editorRef} contentEditable suppressContentEditableWarning
            onInput={handleEditorInput} onKeyDown={handleKeyDown}
            onPaste={handlePaste} // <--- PASTING AS PLAIN TEXT FIRED HERE
            data-placeholder="Begin writing…"
            className="writing-body focus:outline-none min-h-96"
            style={{ caretColor: theme.accentPrimary }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM STATUS BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`flex items-center justify-between px-6 py-2 border-t text-xs font-mono transition-opacity duration-300 ${focusMode ? "opacity-0 hover:opacity-100" : "opacity-100"}`} style={{ borderColor: theme.border, background: theme.panelBg, backdropFilter: "blur(12px)", color: theme.textSecondary }}>
        <span>{selectedSubjectName ? <><span style={{ color: theme.accentPrimary }}>●</span> {selectedSubjectName}</> : "No subject selected"}</span>
        <span>{stats.words} words · {stats.chars} characters</span>
        <span>⌘S to publish · Tab to indent</span>
      </div>
    </div>
  );
}