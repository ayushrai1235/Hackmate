import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaRegCircle, 
  FaRegFrownOpen 
} from 'react-icons/fa';
import { NotificationContext } from '../context/NotificationContext';
import { formatTimeAgo, getTypeIcon } from '../components/NotificationBell';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    hasMore, 
    fetchNotifications, 
    markRead, 
    markAllRead 
  } = useContext(NotificationContext);

  const handleNotificationClick = async (notif) => {
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

  const handleToggleRead = async (e, notif) => {
    e.stopPropagation(); // prevent card click navigation
    if (!notif.isRead) {
      await markRead(notif._id);
    }
  };

  return (
    <div className="notifications-page-container">
      <div className="notifications-content-box">
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/discover')}
          style={{ marginBottom: '20px' }}
        >
          <FaArrowLeft /> Back to Discover
        </button>

        <div className="notifications-header">
          <div>
            <h1>Notification Center</h1>
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button className="btn-secondary mark-all-read-full" onClick={markAllRead}>
                <FaCheckCircle /> Mark All Read
              </button>
            )}
          </div>
        </div>

        {loading && notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="full-page-empty">
            <FaRegFrownOpen className="empty-state-icon" />
            <h2>Nothing to see here</h2>
            <p>You have no notifications yet. Keep active on Hackmate to match, chat, and build teams!</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-card ${notif.isRead ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="card-left">
                    <div className="avatar-container-large">
                      {notif.sender?.avatar?.secureUrl ? (
                        <img 
                          src={notif.sender.avatar.secureUrl} 
                          alt={notif.sender.name || 'User'} 
                          className="sender-avatar-large"
                        />
                      ) : (
                        <div className="sender-avatar-large-placeholder">
                          {(notif.sender?.name || 'H').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className={`type-badge-large ${notif.type}`}>
                        {getTypeIcon(notif.type)}
                      </span>
                    </div>

                    <div className="message-info">
                      <p className="message-text">{notif.message}</p>
                      <span className="time-stamp">{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                  </div>

                  <div className="card-right">
                    <button 
                      className="read-toggle" 
                      onClick={(e) => handleToggleRead(e, notif)}
                      title={notif.isRead ? 'Read' : 'Mark as read'}
                      disabled={notif.isRead}
                    >
                      {notif.isRead ? <FaCheckCircle style={{ opacity: 0.5 }} /> : <FaRegCircle />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore ? (
              <div className="load-more-container">
                <button className="btn-load-more" onClick={fetchNotifications}>
                  Load More
                </button>
              </div>
            ) : (
              <p className="no-more-notifications">You've reached the end of your notifications</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
