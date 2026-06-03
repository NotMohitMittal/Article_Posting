import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Tag,
  Bookmark,
  Heart,
  Share2,
  Eye,
} from "lucide-react";
import { useThemeStore } from "../context/ThemeContext";

// ── Utility ─────────────────────────────────────────────────────────────────
const estimateReadTime = (content = "") =>
  Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));

const formatDate = (iso) => {
  if (!iso) return "Unknown date";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const DARK_TAG_COLORS = [
  "bg-zinc-800/50 text-zinc-300 border-zinc-700/50",
  "bg-neutral-800/50 text-neutral-300 border-neutral-700/50",
  "bg-stone-800/50 text-stone-300 border-stone-700/50",
  "bg-gray-800/50 text-gray-300 border-gray-700/50",
  "bg-slate-800/50 text-slate-300 border-slate-700/50",
];

const LIGHT_TAG_COLORS = [
  "bg-zinc-100 text-zinc-700 border-zinc-200",
  "bg-neutral-100 text-neutral-700 border-neutral-200",
  "bg-stone-100 text-stone-700 border-stone-200",
  "bg-gray-100 text-gray-700 border-gray-200",
  "bg-slate-100 text-slate-700 border-slate-200",
];

const tagColor = (i, isDark) =>
  isDark ? DARK_TAG_COLORS[i % DARK_TAG_COLORS.length] : LIGHT_TAG_COLORS[i % LIGHT_TAG_COLORS.length];

// ── ArticleReader ────────────────────────────────────────────────────────────
const ArticleReader = ({ article, onBack }) => {
  const { isDarkMode } = useThemeStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const bodyRef = useRef(null);

  // ── Decorate <pre> blocks with terminal chrome (same as WritingStudio) ───────
  const enhanceCodeBlocks = useCallback(() => {
    const container = bodyRef.current;
    if (!container) return;

    container.querySelectorAll("pre").forEach((pre) => {
      if (pre.dataset.enhanced === "1") return;
      pre.dataset.enhanced = "1";

      // If the pre came from WritingStudio it already has .ws-pre-content inside;
      // if it's a raw <pre>, we wrap its content now.
      let contentSpan = pre.querySelector(".ws-pre-content");
      if (!contentSpan) {
        contentSpan = document.createElement("span");
        contentSpan.className = "ws-pre-content";
        contentSpan.innerHTML = pre.innerHTML;
        pre.innerHTML = "";
        pre.appendChild(contentSpan);
      }

      // Traffic-light dots
      const dots = document.createElement("span");
      dots.className = "ws-pre-dots";
      dots.innerHTML = `
        <span style="background:#ff5f57;width:12px;height:12px;border-radius:50%;display:block;"></span>
        <span style="background:#febc2e;width:12px;height:12px;border-radius:50%;display:block;"></span>
        <span style="background:#28c840;width:12px;height:12px;border-radius:50%;display:block;"></span>
      `;
      pre.appendChild(dots);

      // Save button
      const saveBtn = document.createElement("button");
      saveBtn.className = "ws-pre-save-btn";
      saveBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Save`;
      saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const code = contentSpan.innerText || contentSpan.textContent || "";
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "code-snippet.txt";
        a.click();
        URL.revokeObjectURL(url);
      });
      pre.appendChild(saveBtn);

      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "ws-pre-copy-btn";
      copyBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>Copy`;
      copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const code = contentSpan.innerText || contentSpan.textContent || "";
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#28c840" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!`;
          copyBtn.style.color = "#28c840";
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>Copy`;
            copyBtn.style.color = "";
          }, 2000);
        });
      });
      pre.appendChild(copyBtn);
    });
  }, []);


  const hasHtmlContent = /<[a-z][\s\S]*>/i.test(article.article_content || "");
  // Run after the HTML content is painted
  useEffect(() => {
    if (hasHtmlContent) {
      // Small delay lets dangerouslySetInnerHTML finish painting
      const t = setTimeout(enhanceCodeBlocks, 50);
      return () => clearTimeout(t);
    }
  }, [article, hasHtmlContent, enhanceCodeBlocks]);

  if (!article) return null;

  const authorName = article.article_author?.user_name ?? "Unknown Author";
  const subjectName = article.article_subject?.subject_name;
  // Content may be HTML (from WritingStudio rich editor) or plain text
  
  // For read time, strip HTML
  const plainContent = hasHtmlContent
    ? article.article_content.replace(/<[^>]*>/g, "")
    : (article.article_content || "");
  const readTime = estimateReadTime(plainContent);
  const publishedDate = formatDate(article.createdAt);

  return (
    <div
      className={`h-full w-full rounded-2xl border shadow-2xl overflow-y-auto flex flex-col transition-colors duration-300
        ${isDarkMode
          ? "bg-[#121212] border-zinc-800 text-zinc-300"
          : "bg-white border-gray-200 text-gray-800"
        }`}
    >
      {/* ── Sticky Top Nav ── */}
      <div
        className={`sticky top-0 z-20 px-6 py-4 backdrop-blur-md border-b flex items-center justify-between
          ${isDarkMode
            ? "bg-[#121212]/90 border-zinc-800"
            : "bg-white/90 border-gray-200"
          }`}
      >
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
            ${isDarkMode
              ? "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              : "text-gray-500 hover:text-black hover:bg-gray-100"
            }`}
        >
          <ArrowLeft size={17} />
          Back to Articles
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-xl transition-colors
              ${isBookmarked
                ? isDarkMode
                  ? "text-white bg-zinc-800"
                  : "text-black bg-gray-200"
                : isDarkMode
                  ? "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                  : "text-gray-400 hover:text-black hover:bg-gray-100"
              }`}
            title="Bookmark"
          >
            <Bookmark size={19} className={isBookmarked ? "fill-current" : ""} />
          </button>

          <button
            className={`p-2 rounded-xl transition-colors
              ${isDarkMode
                ? "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                : "text-gray-400 hover:text-black hover:bg-gray-100"
              }`}
            title="Share"
          >
            <Share2 size={19} />
          </button>
        </div>
      </div>

      {/* ── Article Content ── */}
      <div className="flex-1 px-6 py-10 md:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        {/* Tags */}
        {article.article_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.article_tags.map((tag, i) => (
              <span
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase ${tagColor(i, isDarkMode)}`}
              >
                <Tag size={11} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1
          className={`text-3xl md:text-5xl font-extrabold leading-tight mb-8 ${isDarkMode ? "text-zinc-100" : "text-black"}`}
        >
          {article.article_title}
        </h1>

        {/* Meta row */}
        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 text-sm border-y py-4 mb-10
            ${isDarkMode ? "border-zinc-800 text-zinc-400" : "border-gray-200 text-gray-500"}`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-gray-100 text-gray-600"}`}
            >
              <User size={15} />
            </div>
            <span className={`font-semibold ${isDarkMode ? "text-zinc-200" : "text-gray-700"}`}>
              {authorName}
            </span>
          </div>

          {subjectName && (
            <div className={`flex items-center gap-1.5 font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-600"}`}>
              {subjectName}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar size={15} />
            {publishedDate}
          </div>

          <div className="flex items-center gap-1.5">
            <Clock size={15} />
            {readTime} min read
          </div>

          {article.views !== undefined && (
            <div className="flex items-center gap-1.5">
              <Eye size={15} />
              {article.views.toLocaleString()} views
            </div>
          )}
        </div>

        {/* Body — supports both HTML (rich editor) and plain text */}
        {hasHtmlContent ? (
          <div
            ref={bodyRef}
            className={`article-body text-base md:text-lg leading-[1.9] ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
            dangerouslySetInnerHTML={{ __html: article.article_content }}
          />
        ) : (
          <div
            className={`text-base md:text-lg leading-[1.9] whitespace-pre-wrap ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
          >
            {article.article_content}
          </div>
        )}

        {/* Footer actions */}
        <footer
          className={`mt-16 pt-8 border-t flex items-center justify-center gap-4 pb-10
            ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
        >
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300
              ${isLiked
                ? isDarkMode
                  ? "bg-zinc-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  : "bg-black text-white shadow-[0_0_20px_rgba(0,0,0,0.15)]"
                : isDarkMode
                  ? "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black"
              }`}
          >
            <Heart size={19} className={isLiked ? "fill-current" : ""} />
            {isLiked ? "Liked!" : "Like this Article"}
          </button>
        </footer>
      </div>

      <style>{`
        .article-body h1 { font-size: 2em; font-weight: 700; margin: 1.4em 0 0.5em; line-height: 1.2; color: ${isDarkMode ? '#fff' : '#000'}; }
        .article-body h2 { font-size: 1.5em; font-weight: 600; margin: 1.2em 0 0.4em; line-height: 1.3; color: ${isDarkMode ? '#fff' : '#000'}; }
        .article-body h3 { font-size: 1.2em; font-weight: 600; margin: 1em 0 0.3em; color: ${isDarkMode ? '#fff' : '#000'}; }
        .article-body p { margin-bottom: 1.1em; }
        .article-body ul { list-style-type: disc; margin: 0.8em 0 1em 1.4em; }
        .article-body ol { list-style-type: decimal; margin: 0.8em 0 1em 1.4em; }
        .article-body li { margin-bottom: 0.3em; }
        .article-body blockquote { border-left: 3px solid ${isDarkMode ? '#52525b' : '#a1a1aa'}; margin: 1.5em 0; padding: 0.5em 0 0.5em 1.2em; font-style: italic; opacity: 0.9; }

        /* ── Terminal-style code blocks (matches WritingStudio) ── */
        .article-body pre {
          position: relative;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.875em;
          background: #1a1b26;
          border: 1px solid #2a2a3e;
          border-radius: 10px;
          margin: 1.4em 0;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }
        .article-body pre::before {
          content: '';
          display: block;
          height: 38px;
          background: #252535;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .article-body .ws-pre-content {
          display: block;
          padding: 1em 1.2em;
          overflow-x: auto;
          white-space: pre;
          color: #c8d3f5;
          line-height: 1.7;
        }
        .article-body .ws-pre-dots {
          position: absolute;
          top: 11px;
          left: 14px;
          display: flex;
          gap: 6px;
          pointer-events: none;
          z-index: 2;
        }
        .article-body .ws-pre-copy-btn,
        .article-body .ws-pre-save-btn {
          position: absolute;
          top: 7px;
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
        .article-body .ws-pre-copy-btn { right: 10px; }
        .article-body .ws-pre-save-btn { right: 88px; }
        .article-body .ws-pre-copy-btn:hover,
        .article-body .ws-pre-save-btn:hover { background: rgba(255,255,255,0.14); color: #c8d3f5; }

        .article-body code { font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
        .article-body a { color: ${isDarkMode ? '#f4f4f5' : '#18181b'}; text-decoration: underline; text-decoration-color: ${isDarkMode ? '#52525b' : '#a1a1aa'}; text-underline-offset: 2px; }
        .article-body a:hover { text-decoration-color: ${isDarkMode ? '#f4f4f5' : '#18181b'}; }
        .article-body img { max-width: 100%; border-radius: 8px; margin: 1em 0; border: 1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}; }
        .article-body strong { font-weight: 600; color: ${isDarkMode ? '#fff' : '#000'}; }
      `}</style>
    </div>
  );
};

export default ArticleReader;