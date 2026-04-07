import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNotificationsStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      connected:     false,

      setConnected: (connected) => set({ connected }),

      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50),
      })),

      markRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),

      markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      })),

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length
      },
    }),
    {
      name: 'githubtask-notifications',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
)