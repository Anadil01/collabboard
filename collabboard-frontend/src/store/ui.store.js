import { create } from "zustand";

export const useUIStore = create((set) => ({
  taskModalOpen: false,
  activeTaskId: null,
  activityOpen: true,
  toasts: [],

  openTaskModal: (id) =>
    set({ taskModalOpen: true, activeTaskId: id }),

  closeTaskModal: () =>
    set({ taskModalOpen: false, activeTaskId: null }),

  toggleActivity: () =>
    set((s) => ({ activityOpen: !s.activityOpen })),

  pushToast: ({ type = "info", message, duration = 3200 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    set((s) => ({
      toasts: [...s.toasts, { id, type, message }]
    }));

    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) }));
    }, duration);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) }))
}));
