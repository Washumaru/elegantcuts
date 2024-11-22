import { nanoid } from 'nanoid';
import { Notification } from '../types/notification';

const NOTIFICATIONS_KEY = 'elegant-cuts-notifications';

class NotificationService {
  private getNotifications(): Notification[] {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveNotifications(notifications: Notification[]) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: nanoid(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.push(newNotification);
    this.saveNotifications(notifications);
    return newNotification;
  }

  getUserNotifications(userId: string): Notification[] {
    return this.getNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getCancellationMessages(userId: string): Notification[] {
    return this.getNotifications()
      .filter(n => n.userId === userId && n.type === 'appointment_cancel')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getShopNotifications(shopId: string): Notification[] {
    return this.getNotifications()
      .filter(n => n.shopId === shopId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  markAsRead(notificationId: string) {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
    }
  }

  markAllAsRead(userId: string) {
    const notifications = this.getNotifications();
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    this.saveNotifications(notifications);
  }

  deleteNotification(notificationId: string) {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(filtered);
  }

  clearUserNotifications(userId: string) {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.userId !== userId);
    this.saveNotifications(filtered);
  }
}

export const notificationService = new NotificationService();