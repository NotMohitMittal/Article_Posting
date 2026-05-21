import { create } from "zustand";
import { AxiosAPI } from "../api/axios";
import toast from "react-hot-toast";

export const useArticleStore = create((set, get) => ({
  articleToRead: null,
  articles: [],          // [] not null — so .length checks work without crashing

  isFetchingArticles: false,   // unified name used by MainBody & ArticleReader
  isCreatingArticle: false,
  isDeletingArticle: false,

  // ── Go back from reader to list ──────────────────────────────────────────
  clearArticleToRead: () => set({ articleToRead: null }),

  // ── Create ───────────────────────────────────────────────────────────────
  createArticle: async (article) => {
    try {
      set({ isCreatingArticle: true });
      const res = await AxiosAPI.post("/article/create-article", article);
      toast.success("Article created!");
      console.log(res.data.article);
    } catch (error) {
      console.log(error);
      toast.error("Unable to create article");
    } finally {
      set({ isCreatingArticle: false });
    }
  },

  // ── Delete (optimistic removal from list) ────────────────────────────────
  deleteArticle: async (articleId) => {
    try {
      set({ isDeletingArticle: true });
      await AxiosAPI.delete(`/article/delete/${articleId}`);
      set((state) => ({
        articles: state.articles.filter((a) => a._id !== articleId),
      }));
      toast.success("Article deleted");
    } catch (error) {
      console.log(error);
      toast.error("Unable to delete article");
    } finally {
      set({ isDeletingArticle: false });
    }
  },

  // ── All articles ─────────────────────────────────────────────────────────
  getAllArticles: async () => {
    try {
      set({ isFetchingArticles: true });
      const res = await AxiosAPI.get("/article/articles");
      set({ articles: res.data.articleList });
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch articles");
    } finally {
      set({ isFetchingArticles: false });
    }
  },

  // ── Subject-wise articles ────────────────────────────────────────────────
  getSubjectWiseArticles: async (subjectSlug) => {
    try {
      // Clear previous articles + reader when switching subjects
      set({ isFetchingArticles: true, articles: [], articleToRead: null });
      const res = await AxiosAPI.get(`/article/subject-wise/article/${subjectSlug}`);
      set({ articles: res.data.articles });
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch subject articles");
    } finally {
      set({ isFetchingArticles: false });
    }
  },

  // ── Open a single article for reading ───────────────────────────────────
  // Backend route is GET /article/read-article/:articleId (was wrongly POST before)
  readArticle: async (articleId) => {
    try {
      set({ isFetchingArticles: true });
      const res = await AxiosAPI.get(`/article/read-article/${articleId}`);
      set({ articleToRead: res.data.article });
    } catch (error) {
      console.log(error);
      toast.error("Failed to open article");
    } finally {
      set({ isFetchingArticles: false });
    }
  },
}));