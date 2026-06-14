import React from 'react';

const formatLastActive = (lastActiveDate) => {
  if (!lastActiveDate) return 'Offline';
  const lastActive = new Date(lastActiveDate);
  const now = new Date();
  const diffMs = now - lastActive;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Active just now';
  if (diffMins < 60) return `Active ${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Active ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `Active ${diffDays}d ago`;
};

/**
 * OnlineStatus Indicator
 * @param {object} props
 * @param {string} props.status - 'Online' or 'Offline'
 * @param {string} props.lastActive - Date string
 * @param {boolean} [props.showText=true] - Whether to render helper text (e.g. "Active just now")
 * @param {string} [props.className] - Extra class names
 */
const OnlineStatus = ({ status, lastActive, showText = true, className = '' }) => {
  const isOnline = status === 'Online';

  return (
    <div className={`flex items-center gap-1.5 text-xs text-slate-400 ${className}`}>
      <span
        className={`w-2 h-2 rounded-full shadow-sm shrink-0 transition-colors ${
          isOnline
            ? 'bg-emerald-500 shadow-emerald-500/20'
            : 'bg-slate-600 shadow-slate-600/10'
        }`}
      />
      {showText && (
        <span className="truncate">
          {isOnline ? 'Active now' : formatLastActive(lastActive)}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
