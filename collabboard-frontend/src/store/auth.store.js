import { create } from "zustand";

const getStoredUser = () => {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return null;
  }
};

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || sessionStorage.getItem("token"),
  user: getStoredUser(),

  setAuth: (token, user, persist = true) => {
    if (persist) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    set({ token: null, user: null });
  }
}));
