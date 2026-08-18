import { create } from "zustand";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

interface UIStore {
  isSidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notif: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

let notifCounter = 0;

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: true,
  activeModal: null,
  notifications: [],

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openModal: (modalId) => set({ activeModal: modalId }),

  closeModal: () => set({ activeModal: null }),

  addNotification: (notif) => {
    const id = `notif_${++notifCounter}`;
    const duration = notif.duration ?? 4000;

    set((state) => ({
      notifications: [...state.notifications, { ...notif, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
