import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { useUIStore } from "../store/ui.store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const pushToast = useUIStore.getState().pushToast;
    const skipErrorToast = Boolean(error?.config?.skipErrorToast);
    const status = error?.response?.status;

    if (error?.response?.status === 401) {
      if (!skipErrorToast) {
        pushToast({
          type: "error",
          message: "Your session expired. Please login again."
        });
      }
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (!skipErrorToast) {
      const message =
        error?.response?.data?.message ||
        (status ? `Request failed (${status})` : "Network error. Please check your connection.");

      pushToast({
        type: "error",
        message
      });
    }

    return Promise.reject(error);
  }
);
