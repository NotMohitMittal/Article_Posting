import { create } from "zustand";
import { persist } from "zustand/middleware";
import {v4 as uuidv4} from "uuid"


export const useTodoStore = create(
  persist(
    (set) => ({
      todos: {}, // Format: { "YYYY-MM-DD": [{ id, text, completed }] }

      addTodo: (dateStr, text) =>
        set((state) => {
          const dayTodos = state.todos[dateStr] || [];
          return {
            todos: {
              ...state.todos,
              [dateStr]: [
                ...dayTodos,
                { id: uuidv4(), text, completed: false },
              ],
            },
          };
        }),

      toggleTodo: (dateStr, id) =>
        set((state) => {
          const dayTodos = state.todos[dateStr] || [];
          return {
            todos: {
              ...state.todos,
              [dateStr]: dayTodos.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t,
              ),
            },
          };
        }),

      deleteTodo: (dateStr, id) =>
        set((state) => {
          const dayTodos = state.todos[dateStr] || [];
          return {
            todos: {
              ...state.todos,
              [dateStr]: dayTodos.filter((t) => t.id !== id),
            },
          };
        }),
    }),
    { name: "studyhub-todos" },
  ),
);
