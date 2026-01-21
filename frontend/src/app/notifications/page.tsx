'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.list) {
        setNotifications(data.data.list);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setUnreadCount(data.data.total);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.code === 0) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.code === 0) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">
          通知消息
          {unreadCount > 0 && (
            <span className="ml-2 text-base md:text-lg" style={{ color: 'var(--color-error)' }}>
              ({unreadCount})
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="text-sm md:text-base"
            style={{ color: 'var(--color-primary)' }}
          >
            全部已读
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <p style={{ color: 'var(--text-secondary)' }}>暂无通知</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card cursor-pointer transition"
              style={{
                backgroundColor: notif.isRead ? 'var(--bg-card)' : 'var(--bg-hover)',
              }}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-sm md:text-base mb-1">{notif.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {notif.content}
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(notif.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                {!notif.isRead && (
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: 'var(--color-error)' }}
                  ></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
