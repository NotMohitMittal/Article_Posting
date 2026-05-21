import React, { useState } from "react";
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
  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  "bg-sky-500/10 text-sky-400 border-sky-500/20",
];
const LIGHT_TAG_COLORS = [
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  "bg-sky-100 text-sky-700 border-sky-200",
];

const tagColor = (i, isDark) =>
  isDark ? DARK_TAG_COLORS[i % DARK_TAG_COLORS.length] : LIGHT_TAG_COLORS[i % LIGHT_TAG_COLORS.length];

// ── ArticleReader ────────────────────────────────────────────────────────────
const ArticleReader = ({ article, onBack }) => {
  const { isDarkMode } = useThemeStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!article) return null;

  const authorName = article.article_author?.user_name ?? "Unknown Author";
  const subjectName = article.article_subject?.subject_name;
  // Content may be HTML (from WritingStudio rich editor) or plain text
  const hasHtmlContent = /<[a-z][\s\S]*>/i.test(article.article_content || "");
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
          ? "bg-[#0d0f1a] border-[#1e2035] text-slate-200"
          : "bg-white border-gray-200 text-gray-800"
        }`}
    >
      {/* ── Sticky Top Nav ── */}
      <div
        className={`sticky top-0 z-20 px-6 py-4 backdrop-blur-md border-b flex items-center justify-between
          ${isDarkMode
            ? "bg-[#0d0f1a]/90 border-[#1e2035]"
            : "bg-white/90 border-gray-200"
          }`}
      >
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
            ${isDarkMode
              ? "text-slate-400 hover:text-violet-400 hover:bg-violet-500/10"
              : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
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
                  ? "text-violet-400 bg-violet-500/10"
                  : "text-purple-600 bg-purple-100"
                : isDarkMode
                  ? "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            title="Bookmark"
          >
            <Bookmark size={19} className={isBookmarked ? "fill-current" : ""} />
          </button>

          <button
            className={`p-2 rounded-xl transition-colors
              ${isDarkMode
                ? "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
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
          className={`text-3xl md:text-5xl font-extrabold leading-tight mb-8 ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}
        >
          {article.article_title}
        </h1>

        {/* Meta row */}
        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 text-sm border-y py-4 mb-10
            ${isDarkMode ? "border-[#1e2035] text-slate-500" : "border-gray-100 text-gray-500"}`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${isDarkMode ? "bg-violet-500/20 text-violet-400" : "bg-purple-100 text-purple-600"}`}
            >
              <User size={15} />
            </div>
            <span className={`font-semibold ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
              {authorName}
            </span>
          </div>

          {subjectName && (
            <div className={`flex items-center gap-1.5 font-medium ${isDarkMode ? "text-violet-400" : "text-purple-600"}`}>
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
            className={`article-body text-base md:text-lg leading-[1.9] ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
            dangerouslySetInnerHTML={{ __html: article.article_content }}
          />
        ) : (
          <div
            className={`text-base md:text-lg leading-[1.9] whitespace-pre-wrap ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
          >
            {article.article_content}
          </div>
        )}

        {/* Footer actions */}
        <footer
          className={`mt-16 pt-8 border-t flex items-center justify-center gap-4 pb-10
            ${isDarkMode ? "border-[#1e2035]" : "border-gray-100"}`}
        >
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300
              ${isLiked
                ? isDarkMode
                  ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                  : "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.25)]"
                : isDarkMode
                  ? "bg-[#111425] text-slate-300 hover:bg-[#1a1d35]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <Heart size={19} className={isLiked ? "fill-current" : ""} />
            {isLiked ? "Liked!" : "Like this Article"}
          </button>
        </footer>
      </div>

      <style>{`
        .article-body h1 { font-size: 2em; font-weight: 700; margin: 1.4em 0 0.5em; line-height: 1.2; }
        .article-body h2 { font-size: 1.5em; font-weight: 600; margin: 1.2em 0 0.4em; line-height: 1.3; }
        .article-body h3 { font-size: 1.2em; font-weight: 600; margin: 1em 0 0.3em; }
        .article-body p { margin-bottom: 1.1em; }
        .article-body ul { list-style-type: disc; margin: 0.8em 0 1em 1.4em; }
        .article-body ol { list-style-type: decimal; margin: 0.8em 0 1em 1.4em; }
        .article-body li { margin-bottom: 0.3em; }
        .article-body blockquote { border-left: 3px solid #8b5cf6; margin: 1.5em 0; padding: 0.5em 0 0.5em 1.2em; font-style: italic; opacity: 0.8; }
        .article-body pre { background: #161625; border: 1px solid #252545; border-radius: 6px; padding: 1em 1.2em; margin: 1.2em 0; overflow-x: auto; }
        .article-body code { font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
        .article-body a { color: #8b5cf6; text-decoration: underline; }
        .article-body img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
        .article-body strong { font-weight: 600; }
      `}</style>
    </div>
  );
};

export default ArticleReader;