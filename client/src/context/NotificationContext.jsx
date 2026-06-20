import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  // Fetch notifications
  const fetchNotifications = async (reset = false) => {
    if (!user) return;
    try {
      const currentPage = reset ? 1 : page;
      const res = await api.get(`/notifications?page=${currentPage}&limit=15`);
      const data = res.data;

      if (reset) {
        setNotifications(data.notifications);
        setPage(2);
      } else {
        setNotifications((prev) => {
          // Prevent duplicates by checking _id
          const newNotifs = data.notifications.filter(
            (n) => !prev.some((existing) => existing._id === n._id)
          );
          return [...prev, ...newNotifs];
        });
        setPage((prev) => prev + 1);
      }

      setUnreadCount(data.unreadCount);
      setHasMore(data.notifications.length === 15);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  // Initial load or on user login change
  useEffect(() => {
    if (user) {
      fetchNotifications(true);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPage(1);
      setHasMore(true);
    }
  }, [user]);

  // Setup real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        // Prevent duplicate real-time notifications
        if (prev.some((n) => n._id === notification._id)) {
          return prev;
        }
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  // Mark single as read
  const markRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        hasMore,
        fetchNotifications: () => fetchNotifications(false),
        resetNotifications: () => fetchNotifications(true),
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
