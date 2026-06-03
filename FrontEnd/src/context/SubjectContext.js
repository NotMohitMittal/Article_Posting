import { create } from "zustand";
import { AxiosAPI } from "../api/axios";
import toast from "react-hot-toast";

export const useSubjectStore = create((set, get) => ({
  selectedSubject: null,   // stores { _id, subject_name, subject_slug }
  listFetched: false,
  subjectsList: [],

  isFetchingSubjects: false,
  isAddingSubject: false,
  isDeletingSubject: false,

  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  clearSelectedSubject: () => set({ selectedSubject: null }),

  addSubject: async ({subject_name, subject_description}) => {
    try {
      set({ isAddingSubject: true });
      const res = await AxiosAPI.post("/subject/add-subject", {subject_name, subject_description});
      // Append new subject to local list so sidebar updates without a full refetch
      set((state) => ({
        subjectsList: [...state.subjectsList, res.data.subject],
      }));
      toast.success("Subject added!");
    } catch (error) {
      console.log(error);
      toast.error("Unable to add subject");
    } finally {
      set({ isAddingSubject: false });
    }
  },

  getSubjectsList: async () => {
    try {
      const { listFetched } = get();
      if (listFetched) return;

      set({ isFetchingSubjects: true });
      const res = await AxiosAPI.get("/subject/subjectList");
      set({ subjectsList: res.data.subjects, listFetched: true });
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch subjects");
    } finally {
      set({ isFetchingSubjects: false });
    }
  },

  deleteSubject: async (subjectId) => {
    try {
      set({ isDeletingSubject: true });
      await AxiosAPI.delete(`/subject/delete/${subjectId}`);
      set((state) => ({
        subjectsList: state.subjectsList.filter((s) => s._id !== subjectId),
        // Clear selection if the deleted subject was active
        selectedSubject:
          state.selectedSubject?._id === subjectId ? null : state.selectedSubject,
      }));
      toast.success("Subject deleted");
    } catch (error) {
      console.log(error);
      toast.error("Unable to delete subject");
    } finally {
      set({ isDeletingSubject: false });
    }
  },
}));