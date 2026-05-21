import React, { useState } from "react";
import { useArticleStore } from "../context/ArticleContext";
import { useSubjectStore } from "../context/SubjectContext";
import { useThemeStore } from "../context/ThemeContext";
import {
  BookOpen,
  Clock,
  Tag,
  ArrowRight,
  FileText,
  Loader2,
  Bookmark,
  Search,
} from "lucide-react";

// ── Utility ─────────────────────────────────────────────────────────────────
const estimateReadTime = (content = "") =>
  Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));

// Dark mode: violet/indigo palette
// Light mode: purple/cyan palette
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

// ── Article Row Card ────────────────────────────────────────────────────────
const ArticleRowCard = ({ article, onRead, isDarkMode }) => {
  const readTime = estimateReadTime(article.article_content);

  return (
    <div
      className={`group flex flex-col md:flex-row rounded-2xl p-5 md:p-6 border transition-all duration-300 gap-4 md:gap-6
        ${isDarkMode
          ? "bg-[#111425]/60 hover:bg-[#151830]/90 border-[#1e2242]/80 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-900/20"
          : "bg-white hover:bg-purple-50/50 border-gray-200/80 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100"
        }`}
    >
      {/* Left icon anchor */}
      <div
        className={`hidden md:flex shrink-0 w-11 h-11 rounded-xl items-center justify-center border transition-colors
          ${isDarkMode
            ? "bg-violet-500/10 text-violet-400 border-violet-500/20 group-hover:bg-violet-500/20"
            : "bg-purple-100 text-purple-600 border-purple-200 group-hover:bg-purple-200"
          }`}
      >
        <Bookmark size={18} />
      </div>

      {/* Title, snippet, tags */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex flex-wrap gap-2 mb-2">
          {article.article_tags?.map((tag, i) => (
            <span
              key={i}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold tracking-widest uppercase ${tagColor(i, isDarkMode)}`}
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>

        <h3
          className={`text-lg font-bold mb-1.5 truncate transition-colors
            ${isDarkMode
              ? "text-slate-100 group-hover:text-violet-300"
              : "text-gray-900 group-hover:text-purple-700"
            }`}
        >
          {article.article_title}
        </h3>

        <p className={`text-sm line-clamp-2 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          {/* Strip HTML tags for preview */}
          {article.article_content?.replace(/<[^>]*>/g, "") || ""}
        </p>

        {(article.article_author?.user_name || article.article_subject?.subject_name) && (
          <p className={`text-xs mt-2 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
            {article.article_author?.user_name && (
              <span>by <span className="font-semibold">{article.article_author.user_name}</span></span>
            )}
            {article.article_subject?.subject_name && (
              <span className="ml-2">
                in{" "}
                <span className={`font-semibold ${isDarkMode ? "text-violet-400" : "text-purple-600"}`}>
                  {article.article_subject.subject_name}
                </span>
              </span>
            )}
          </p>
        )}
      </div>

      {/* Meta + action */}
      <div
        className={`flex items-center md:flex-col justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-w-28
          ${isDarkMode ? "border-[#1e2242]" : "border-gray-100"}`}
      >
        <div className={`flex items-center gap-1.5 text-xs font-medium md:mb-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
          <Clock size={13} />
          {readTime} min read
        </div>

        <button
          onClick={() => onRead(article._id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
            ${isDarkMode
              ? "bg-[#1e2242] hover:bg-violet-600 text-violet-400 hover:text-white"
              : "bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white"
            }`}
        >
          Read
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

// ── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ isDarkMode }) => (
  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-20">
    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border ${
      isDarkMode ? "bg-[#111425] border-[#1e2242]" : "bg-gray-50 border-gray-200"
    }`}>
      <FileText size={32} className={isDarkMode ? "text-slate-600" : "text-gray-300"} />
    </div>
    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
      No Articles Found
    </h2>
    <p className={`text-sm ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}>
      Select a subject from the sidebar to view its articles, or check back later for new content.
    </p>
  </div>
);

// ── Main Body ───────────────────────────────────────────────────────────────
const MainBody = () => {
  const { articles, isFetchingArticles, readArticle } = useArticleStore();
  const { selectedSubject } = useSubjectStore();
  const { isDarkMode } = useThemeStore();
  const [search, setSearch] = useState("");

  const filtered = (articles || []).filter(
    (a) =>
      a.article_title?.toLowerCase().includes(search.toLowerCase()) ||
      a.article_tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      className={`h-full w-full rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors duration-300
        ${isDarkMode
          ? "bg-[#0d0f1a] border-[#1e2035] text-slate-200"
          : "bg-[#fafbff] border-gray-200 text-gray-800"
        }`}
    >
      {/* ── Header ── */}
      <div
        className={`px-6 md:px-8 py-5 border-b sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-300
          ${isDarkMode
            ? "bg-[#0d0f1a]/95 border-[#1e2035] backdrop-blur-md"
            : "bg-white/95 border-gray-200 backdrop-blur-md"
          }`}
      >
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
            <BookOpen className={isDarkMode ? "text-violet-400" : "text-purple-500"} size={26} />
            {selectedSubject?.subject_name ?? "Notebook"}
          </h1>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
            {articles.length > 0
              ? `${articles.length} article${articles.length !== 1 ? "s" : ""}`
              : "Select a subject from the sidebar"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors
            ${isDarkMode
              ? "bg-[#111425] border-[#1e2242] text-slate-400"
              : "bg-purple-50 border-purple-200 text-purple-600"
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse
              ${isDarkMode
                ? "bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.7)]"
                : "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.7)]"
              }`}
            />
            Live Feed
          </div>

          {/* Search */}
          {articles.length > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors
              ${isDarkMode
                ? "bg-[#111425] border-[#1e2242] focus-within:border-violet-500/50"
                : "bg-white border-gray-200 focus-within:border-purple-400"
              }`}
            >
              <Search size={14} className={isDarkMode ? "text-slate-500" : "text-gray-400"} />
              <input
                type="text"
                placeholder="Search articles or tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`bg-transparent outline-none w-40 text-sm placeholder:text-slate-500
                  ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {isFetchingArticles ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 size={38} className={`animate-spin ${isDarkMode ? "text-violet-500" : "text-purple-500"}`} />
            <p className={`text-sm font-medium animate-pulse ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
              Fetching articles…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((article) => (
              <ArticleRowCard
                key={article._id}
                article={article}
                onRead={readArticle}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainBody;