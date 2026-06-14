import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaHeart, 
  FaStar, 
  FaEnvelope, 
  FaUserPlus, 
  FaUserCheck, 
  FaUsers, 
  FaRegFrownOpen 
} from 'react-icons/fa';
import { FaHandshake } from 'react-icons/fa6';
import { NotificationContext } from '../context/NotificationContext';
import './NotificationBell.css';

// Helper to format timestamps
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

// Helper for type-specific badges
export const getTypeIcon = (type) => {
  switch (type) {
    case 'liked':
      return <FaHeart />;
    case 'super_liked':
      return <FaStar />;
    case 'matched':
      return <FaHandshake />;
    case 'message':
      return <FaEnvelope />;
    case 'team_invite':
      return <FaUserPlus />;
    case 'join_request':
      return <FaUsers />;
    case 'request_accepted':
      return <FaUserCheck />;
    case 'team_accepted':
      return <FaUserCheck />;
    default:
      return <FaBell />;
  }
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markRead, 
    markAllRead 
  } = useContext(NotificationContext);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    
    // Mark as read in background if unread
    if (!notif.isRead) {
      await markRead(notif._id);
    }

    // Determine redirect logic
    const { type, metadata } = notif;
    if (type === 'message') {
      navigate('/chat');
    } else if (['team_invite', 'join_request', 'request_accepted', 'team_accepted'].includes(type)) {
      if (metadata?.teamId) {
        navigate(`/teams/${metadata.teamId}`);
      } else {
        navigate('/teams');
      }
    } else if (['liked', 'super_liked', 'matched'].includes(type)) {
      navigate('/interested');
    }
  };

  const previewNotifications = notifications.slice(0, 5);

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="bell-button" onClick={handleToggle} aria-label="Toggle notifications">
        <FaBell />
        {unreadCount > 0 && (
          <span className="bell-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="dropdown-list">
            {previewNotifications.length === 0 ? (
              <div className="empty-notifications">
                <FaRegFrownOpen className="empty-icon" />
                <p>No notifications yet</p>
              </div>
            ) : (
              previewNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`dropdown-item ${notif.isRead ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="avatar-wrapper">
                    {notif.sender?.avatar?.secureUrl ? (
                      <img 
                        src={notif.sender.avatar.secureUrl} 
                        alt={notif.sender.name || 'User'} 
                        className="sender-avatar"
                      />
                    ) : (
                      <div className="sender-avatar-placeholder">
                        {(notif.sender?.name || 'H').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`type-badge ${notif.type}`}>
                      {getTypeIcon(notif.type)}
                    </span>
                  </div>

                  <div className="item-content">
                    <p className="item-message">{notif.message}</p>
                    <span className="item-time">{formatTimeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link to="/notifications" className="dropdown-footer" onClick={() => setIsOpen(false)}>
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
