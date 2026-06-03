import { create } from "zustand";
import { AxiosAPI } from "../api/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  token: null,

  isFetchingProfile: false,
  isRegistering: false,
  isLoggingIn: false,
  isCheckingAuth: true, // Starts true so your app can show a loading spinner on initial load

  // CHECK AUTHENTICATION (Run this on app mount)
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      // Change this endpoint to whatever your backend uses to verify sessions
      const res = await AxiosAPI.get("/user/profile");
      set({ authUser: res.data.user });
    } catch (error) {
      console.log("Not authenticated or session expired:", error);
      // Ensure user is cleared if the check fails (e.g., 401 Unauthorized)
      set({ authUser: null });
    } finally {
      // Always set to false when done so the app can render
      set({ isCheckingAuth: false });
    }
  },

  // REGISTER USER
  register: async ({ user_name, user_email, user_password }) => {
    try {
      set({ isRegistering: true });

      const res = await AxiosAPI.post("/user/register", {
        user_name,
        user_email,
        user_password,
      });
      console.log(res.data.user);
      set({ authUser: res.data.user });

      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      toast.error("Unable to register");
    } finally {
      set({ isRegistering: false });
    }
  },

  // LOGIN USER
  login: async ({ user_email, user_password }) => {
    try {
      set({ isLoggingIn: true });

      const res = await AxiosAPI.post("/user/login", {
        user_email,
        user_password,
      });
      
      console.log(res.data.user);
      set({ authUser: res.data.user });
      
      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      toast.error("Unable to login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // GET PROFILE
  getProfile: async () => {
    try {
      set({ isFetchingProfile: true });
      const res = await AxiosAPI.get("/user/profile");
      // You were missing the state update here!
      set({ authUser: res.data.user });
    } catch (error) {
      console.log(error);
      toast.error("Unable to get-profile");
    } finally {
      set({ isFetchingProfile: false });
    }
  },

  // LOGOUT USER
  logout: async () => {
    try {
      await AxiosAPI.post("/user/logout");
      // Clear the user out of the state so the app knows they are gone
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error);
      toast.error("Unable to logout");
    }
  },
}));
