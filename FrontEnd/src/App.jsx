import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import MainBody from "./components/MainBody";
import ArticleReader from "./components/ArticleReader";
import AddSubjectModal from "./components/AddSubjectModel";
import WritingStudio from "./components/WritingStudio";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { useAuthStore } from "./context/AuthContext";
import { useArticleStore } from "./context/ArticleContext";
import { useThemeStore } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
// ── Protected layout (sidebar + main content area) ──────────────────────────
const AppLayout = () => {
  const { articleToRead, clearArticleToRead } = useArticleStore();
  const { isDarkMode } = useThemeStore();

  // Modal / view state lifted here so Sidebar can open them
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [writingOpen, setWritingOpen] = useState(false);

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#090b1a]" : "bg-gray-100"
      }`}
    >
      {/* Sidebar — receives the two action props it needs */}
      <Sidebar
        onAddSubject={() => setAddSubjectOpen(true)}
        onWriteArticle={() => setWritingOpen(true)}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden p-4">
        {articleToRead ? (
          <ArticleReader article={articleToRead} onBack={clearArticleToRead} />
        ) : (
          <MainBody />
        )}
      </main>

      {/* Add Subject Modal */}
      <AddSubjectModal
        open={addSubjectOpen}
        onClose={() => setAddSubjectOpen(false)}
      />

      {/* Writing Studio slide-over */}
      <WritingStudio open={writingOpen} onClose={() => setWritingOpen(false)} />
    </div>
  );
};

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b1a]">
        <div className="w-10 h-10 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute authUser={authUser}>
              <AppLayout />
            </ProtectedRoute>
          }
        />

        {/* Public / Non-Protected Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute authUser={authUser}>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute authUser={authUser}>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
