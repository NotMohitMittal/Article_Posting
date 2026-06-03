import { create } from "zustand";
import { AxiosAPI } from "../api/axios";
import toast from "react-hot-toast";

export const useArticleStore = create((set, get) => ({
  articleToRead: null,
  articles: [],

  isFetchingArticles: false,
  isCreatingArticle: false,
  isDeletingArticle: false,

  clearArticleToRead: () => set({ articleToRead: null }),

  createArticle: async (article) => {
    try {
      set({ isCreatingArticle: true });
      const res = await AxiosAPI.post("/article/create-article", article);
      
      // FIX: Optimistically update the UI by adding the new article to the state
      set((state) => ({
        articles: [res.data.article, ...state.articles],
      }));
      
      toast.success("Article created!");
      return true; // FIX: Return true so the Studio knows it can close
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to create article");
      return false;
    } finally {
      set({ isCreatingArticle: false });
    }
  },

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
      toast.error(error.response?.data?.message || "Unable to delete article");
    } finally {
      set({ isDeletingArticle: false });
    }
  },

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

  getSubjectWiseArticles: async (subjectSlug) => {
    try {
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