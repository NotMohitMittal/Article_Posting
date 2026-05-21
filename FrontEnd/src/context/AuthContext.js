import { create } from "zustand";
import { AxiosAPI } from "../api/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  token: null,

  isFetchingProfile: false,
  isRegistering: false,
  isLoggingIn: false,
  isCheckingAuth: true,  

  // REGISTER USER
  register: async (formData) => {
    try {
      set({ isRegistering: true });

      const res = await AxiosAPI.post("/user/register", formData);
      console.log(res.data.user);
      set({ authUser: res.data.user });
    } catch (error) {
      console.log(error);
      toast.error("Unable to register");
    } finally {
      set({ isRegistering: false });
    }
  },

  // LOGIN USER
  login: async (formData) => {
    try {
      set({ isLoggingIn: true });

      const res = await AxiosAPI.post("/user/login", formData);
      console.log(res.data.user);
      set({ authUser: res.data.user });
    } catch (error) {
      console.log(error);
      toast.error("Unable to login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  getProfile: async () => {
    try {
      set({ isFetchingProfile: true });
      const res = await AxiosAPI.get("/user/profile");
      console.log(res.data.user);
    } catch (error) {
      console.log(error);
      toast.error("Unable to get-profile");
    } finally {
      set({ isFetchingProfile: false });
    }
  },

  logout: async () => {
    try {
      const res = await AxiosAPI.post("/user/logout");
      console.log(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Unable to logout");
    }
  },
}));
