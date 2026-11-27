import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './Notification.module.css';

export type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

type ShowNotification = (message: string, type?: NotificationType) => void;

interface NotificationContextType {
  showNotification: ShowNotification;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const AUTO_HIDE_MS = 3000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback<ShowNotification>(
    (message, type = 'info') => {
      const id = ++counter.current;
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), AUTO_HIDE_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className={styles.notifications} aria-live="polite">
        {notifications.map((n) => (
          <div
            key={n.id}
            role={n.type === 'error' ? 'alert' : 'status'}
            className={`${styles.notification} ${styles[n.type]}`}
            onClick={() => dismiss(n.id)}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification(): ShowNotification {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context.showNotification;
}
