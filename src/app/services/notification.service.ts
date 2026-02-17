type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

class NotificationService {
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  show(type: NotificationType, message: string, duration = 3000) {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message, duration };
    this.notifications.push(notification);
    this.notify();

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  success(message: string) { this.show('success', message); }
  error(message: string) { this.show('error', message); }
  warning(message: string) { this.show('warning', message); }
  info(message: string) { this.show('info', message); }
}

export const notificationService = new NotificationService();