import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types/notification';
import toast from 'react-hot-toast';

export default function MessageCenter() {
  const [messages, setMessages] = useState<Notification[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      loadMessages();
      const interval = setInterval(loadMessages, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadMessages = () => {
    if (!user) return;
    const userMessages = notificationService.getCancellationMessages(user.id);
    setMessages(userMessages);
    setUnreadCount(userMessages.filter(n => !n.read).length);
  };

  const handleMarkAsRead = (messageId: string) => {
    notificationService.markAsRead(messageId);
    loadMessages();
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.id);
    loadMessages();
    toast.success('Todos los mensajes marcados como leídos');
  };

  const handleClearAll = () => {
    if (!user) return;
    notificationService.clearUserNotifications(user.id);
    loadMessages();
    toast.success('Todos los mensajes eliminados');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMessages(!showMessages)}
        className="relative p-2 rounded-full hover:bg-primary-100"
      >
        <MessageSquare className="w-6 h-6 text-primary-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showMessages && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Mensajes de Cancelación</h3>
              <button
                onClick={() => setShowMessages(false)}
                className="p-1 hover:bg-primary-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {messages.length > 0 && (
              <div className="flex justify-between mt-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Marcar todos como leídos
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Eliminar todos
                </button>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="p-4 text-center text-primary-500">
                No hay mensajes de cancelación
              </p>
            ) : (
              <div className="divide-y divide-primary-100">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 ${!message.read ? 'bg-primary-50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {message.message}
                        </p>
                        <p className="text-xs text-primary-500 mt-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!message.read && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="text-xs text-primary-600 hover:text-primary-800"
                        >
                          Marcar como leído
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