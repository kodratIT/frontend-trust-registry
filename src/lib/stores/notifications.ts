import { writable } from 'svelte/store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  const dismiss = (id: string) => {
    update((notifications) => notifications.filter((n) => n.id !== id));
  };

  const add = (notification: Omit<Notification, 'id'>) => {
    const id = crypto.randomUUID();
    const newNotification = { ...notification, id };
    
    update((notifications) => [...notifications, newNotification]);

    // Auto dismiss after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }

    return id;
  };

  return {
    subscribe,
    add,
    dismiss,
    success: (message: string, duration?: number) => add({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => add({ type: 'error', message, duration: duration ?? 8000 }),
    warning: (message: string, duration?: number) => add({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) => add({ type: 'info', message, duration }),
    clear: () => update(() => []),
  };
}

export const notifications = createNotificationStore();
