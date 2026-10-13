import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  notify: (notification: Omit<NotificationItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ type, title, message, durationMs = 4000 }: Omit<NotificationItem, 'id'>) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const item: NotificationItem = { id, type, title, message, durationMs };
      setNotifications((prev) => [...prev, item]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismiss(id);
        }, durationMs);
      }
    },
    [dismiss]
  );

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
