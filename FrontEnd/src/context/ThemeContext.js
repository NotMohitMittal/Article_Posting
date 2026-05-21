import { create } from "zustand";

export const useThemeStore = create((set) => ({
  isDarkMode: true,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDark: () => set({ isDarkMode: true }),
  setLight: () => set({ isDarkMode: false }),
}));