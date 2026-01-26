import React, { useEffect, useState } from 'react';
import { notificationService } from '../services';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  type: 'info' | 'warning' | 'success' | 'error';
  entity_type?: string;
  entity_id?: number;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll(filter === 'unread');
      setNotifications(data);
    } catch (error) {
      console.error('Chyba při načítání notifikací:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Chyba při označení notifikace:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Chyba při označení všech notifikací:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('cs-CZ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Načítání notifikací...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifikace</h1>
        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Označit vše jako přečtené
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Všechny ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded ${
            filter === 'unread'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Nepřečtené ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Žádné notifikace</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 p-4 rounded ${getTypeColor(
                notification.type
              )} ${!notification.is_read ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-300'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getTypeIcon(notification.type)}</span>
                    <h3 className={`font-semibold ${!notification.is_read ? 'font-bold' : ''}`}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded">
                        Nové
                      </span>
                    )}
                  </div>

                  {notification.message && (
                    <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                  )}

                  <div className="text-xs text-gray-500 flex items-center gap-4">
                    <span>{formatDate(notification.created_at)}</span>
                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        className="text-blue-500 hover:underline"
                      >
                        Zobrazit →
                      </a>
                    )}
                  </div>
                </div>

                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Označit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
