import React, { useState } from "react";
import { useArticleStore } from "../context/ArticleContext";
import { useSubjectStore } from "../context/SubjectContext";
import { useThemeStore } from "../context/ThemeContext";
import { useAuthStore } from "../context/AuthContext"; // <-- Added this
import {
  BookOpen,
  Clock,
  Tag,
  ArrowRight,
  FileText,
  Loader2,
  Bookmark,
  Search,
  Trash2,
} from "lucide-react";

const estimateReadTime = (content = "") =>
  Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));

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

// ── Article Row Card ────────────────────────────────────────────────────────
const ArticleRowCard = ({ article, onRead, onDelete, isDarkMode, authUser }) => {
  const readTime = estimateReadTime(article.article_content);
  
  // FIX: Check if the currently logged in user is the author of this specific article
  const isAuthor = article.article_author?._id === authUser?._id;

  return (
    <div
      className={`group flex flex-col md:flex-row rounded-2xl p-5 md:p-6 border transition-all duration-300 gap-4 md:gap-6
        ${isDarkMode
          ? "bg-zinc-900/60 hover:bg-zinc-800/90 border-zinc-800/80 hover:border-zinc-600/40 hover:shadow-lg hover:shadow-black/20"
          : "bg-white hover:bg-gray-50 border-gray-200/80 hover:border-gray-300 hover:shadow-md hover:shadow-gray-200"
        }`}
    >
      <div
        className={`hidden md:flex shrink-0 w-11 h-11 rounded-xl items-center justify-center border transition-colors
          ${isDarkMode
            ? "bg-zinc-800/50 text-zinc-300 border-zinc-700/50 group-hover:bg-zinc-700/50"
            : "bg-gray-100 text-gray-600 border-gray-200 group-hover:bg-gray-200"
          }`}
      >
        <Bookmark size={18} />
      </div>

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
              ? "text-zinc-100 group-hover:text-white"
              : "text-gray-900 group-hover:text-black"
            }`}
        >
          {article.article_title}
        </h3>

        <p className={`text-sm line-clamp-2 leading-relaxed ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
          {article.article_content?.replace(/<[^>]*>/g, "") || ""}
        </p>

        {(article.article_author?.user_name || article.article_subject?.subject_name) && (
          <p className={`text-xs mt-2 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
            {article.article_author?.user_name && (
              <span>by <span className="font-semibold">{article.article_author.user_name}</span></span>
            )}
            {article.article_subject?.subject_name && (
              <span className="ml-2">
                in{" "}
                <span className={`font-semibold ${isDarkMode ? "text-zinc-300" : "text-black"}`}>
                  {article.article_subject.subject_name}
                </span>
              </span>
            )}
          </p>
        )}
      </div>

      <div
        className={`flex items-center md:flex-col justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-w-36
          ${isDarkMode ? "border-zinc-800" : "border-gray-100"}`}
      >
        <div className={`flex items-center gap-1.5 text-xs font-medium md:mb-4 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
          <Clock size={13} />
          {readTime} min read
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRead(article._id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${isDarkMode
                ? "bg-zinc-800 hover:bg-zinc-200 text-zinc-300 hover:text-black"
                : "bg-gray-100 hover:bg-black text-gray-700 hover:text-white"
              }`}
          >
            Read
            <ArrowRight size={15} />
          </button>

          {/* FIX: Only render the delete button if the logged-in user is the author */}
          {isAuthor && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${article.article_title}"?`)) {
                  onDelete(article._id);
                }
              }}
              title="Delete Article"
              className={`p-2 rounded-xl transition-all duration-200
                ${isDarkMode
                  ? "bg-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400"
                  : "bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600"
                }`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ isDarkMode }) => (
  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-20">
    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border ${
      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"
    }`}>
      <FileText size={32} className={isDarkMode ? "text-zinc-600" : "text-gray-300"} />
    </div>
    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-zinc-200" : "text-gray-800"}`}>
      No Articles Found
    </h2>
    <p className={`text-sm ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}>
      Select a subject from the sidebar to view its articles, or check back later for new content.
    </p>
  </div>
);

// ── Main Body ───────────────────────────────────────────────────────────────
const MainBody = () => {
  const { articles, isFetchingArticles, readArticle, deleteArticle } = useArticleStore();
  const { selectedSubject } = useSubjectStore();
  const { isDarkMode } = useThemeStore();
  const { authUser } = useAuthStore(); // <-- Get the logged in user here
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
          ? "bg-[#121212] border-zinc-800 text-zinc-200"
          : "bg-white border-gray-200 text-gray-800"
        }`}
    >
      <div
        className={`px-6 md:px-8 py-5 border-b sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-300
          ${isDarkMode
            ? "bg-[#121212]/95 border-zinc-800 backdrop-blur-md"
            : "bg-white/95 border-gray-200 backdrop-blur-md"
          }`}
      >
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? "text-zinc-100" : "text-gray-900"}`}>
            <BookOpen className={isDarkMode ? "text-zinc-300" : "text-black"} size={26} />
            {selectedSubject?.subject_name ?? "Notebook"}
          </h1>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
            {articles.length > 0
              ? `${articles.length} article${articles.length !== 1 ? "s" : ""}`
              : "Select a subject from the sidebar"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors
            ${isDarkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-400"
              : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse
              ${isDarkMode
                ? "bg-zinc-300 shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                : "bg-gray-400 shadow-[0_0_6px_rgba(0,0,0,0.3)]"
              }`}
            />
            Live Feed
          </div>

          {articles.length > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors
              ${isDarkMode
                ? "bg-zinc-900 border-zinc-800 focus-within:border-zinc-500"
                : "bg-white border-gray-200 focus-within:border-black"
              }`}
            >
              <Search size={14} className={isDarkMode ? "text-zinc-500" : "text-gray-400"} />
              <input
                type="text"
                placeholder="Search articles or tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`bg-transparent outline-none w-40 text-sm placeholder:text-zinc-500
                  ${isDarkMode ? "text-zinc-200" : "text-gray-700"}`}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {isFetchingArticles ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 size={38} className={`animate-spin ${isDarkMode ? "text-zinc-400" : "text-black"}`} />
            <p className={`text-sm font-medium animate-pulse ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}>
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
                onDelete={deleteArticle}
                isDarkMode={isDarkMode}
                authUser={authUser} // <-- Pass authUser down to the card
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainBody;