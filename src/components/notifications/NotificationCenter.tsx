import { useState, useEffect } from 'react';
import { Bell, X, Check, RefreshCw } from 'lucide-react';
import { Notification } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore((state) => state.user);

  const loadNotifications = () => {
    if (user) {
      const userNotifications = notificationService.getUserNotifications(user.id)
        .filter(n => n.type !== 'appointment_cancel'); // Excluir notificaciones de cancelación
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      notificationService.markAllAsRead(user.id);
      loadNotifications();
      toast.success('Todas las notificaciones marcadas como leídas');
    }
  };

  const handleClearAll = () => {
    if (user && window.confirm('¿Estás seguro de que deseas eliminar todas las notificaciones?')) {
      notificationService.clearUserNotifications(user.id);
      loadNotifications();
      toast.success('Todas las notificaciones eliminadas');
    }
  };

  const formatNotificationMessage = (notification: Notification): string => {
    switch (notification.type) {
      case 'barber_join':
        return `${notification.barberName} se ha unido al local`;
      case 'barber_leave':
        return `${notification.barberName} ha dejado el local`;
      case 'shop_delete':
        return `El local "${notification.shopName}" ha sido eliminado`;
      case 'shop_owner':
        return `Has recibido la propiedad del local de ${notification.previousOwnerName}`;
      default:
        return notification.message;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'barber_join':
        return '👋';
      case 'barber_leave':
        return '👋';
      case 'shop_delete':
        return '🏪';
      case 'shop_owner':
        return '👑';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-primary-100"
      >
        <Bell className="w-6 h-6 text-primary-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadNotifications}
                  className="p-1 hover:bg-primary-100 rounded-full"
                  title="Actualizar notificaciones"
                >
                  <RefreshCw className="w-4 h-4 text-primary-600" />
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-primary-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {notifications.length > 0 && (
              <div className="flex justify-between mt-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Eliminar todas
                </button>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-primary-500">
                No hay notificaciones
              </p>
            ) : (
              <div className="divide-y divide-primary-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${
                      !notification.read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <p className="text-sm">
                            {formatNotificationMessage(notification)}
                          </p>
                        </div>
                        <p className="text-xs text-primary-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-2 p-1 hover:bg-primary-100 rounded-full"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4 text-primary-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}