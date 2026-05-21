import React, { useEffect, useState } from "react";
import { useAuthStore } from "./context/AuthContext";
import { useArticleStore } from "./context/ArticleContext";
import { useThemeStore } from "./context/ThemeContext";

// Import all your components
import Sidebar from "./components/Sidebar";
import MainBody from "./components/MainBody";
import ArticleReader from "./components/ArticleReader";
import AddSubjectModel from "./components/AddSubjectModel";
import WritingStudio from "./components/WritingStudio";

const App = () => {
  const { articleToRead, clearArticleToRead } = useArticleStore();
  const { getProfile } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isWritingStudioOpen, setIsWritingStudioOpen] = useState(false);

  useEffect(() => {
    // getProfile();
  }, []);

  return (
    <div
      className={`h-screen flex overflow-hidden font-sans transition-colors duration-300
        ${isDarkMode ? "bg-[#080a14] text-slate-200" : "bg-[#f0f0f8] text-gray-800"}`}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        onAddSubject={() => setIsAddSubjectOpen(true)}
        onWriteArticle={() => setIsWritingStudioOpen(true)}
      />

      {/* ── Main Content Area ── */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="h-full rounded-2xl overflow-hidden relative">
          {articleToRead ? (
            <ArticleReader article={articleToRead} onBack={clearArticleToRead} />
          ) : (
            <MainBody />
          )}
        </div>
      </div>

      {/* ── Modals & Overlays ── */}
      <AddSubjectModel
        open={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
      />

      <WritingStudio
        open={isWritingStudioOpen}
        onClose={() => setIsWritingStudioOpen(false)}
        onCreated={() => {
          console.log("Article successfully published!");
        }}
      />
    </div>
  );
};

export default App;