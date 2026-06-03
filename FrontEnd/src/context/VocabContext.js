import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export const useVocabStore = create(
  persist(
    (set) => ({
      vocabulary: [], // Format: [{ id, word, meaning }]

      addWord: (word, meaning) =>
        set((state) => ({
          vocabulary: [{ id: uuidv4(), word, meaning }, ...state.vocabulary],
        })),

      deleteWord: (id) =>
        set((state) => ({
          vocabulary: state.vocabulary.filter((v) => v.id !== id),
        })),
    }),
    { name: "studyhub-vocab" },
  ),
);
