import React from 'react';
import OnlineStatus from './OnlineStatus';

const ChatList = ({ chats, selectedChatId, onSelectChat, currentUserId }) => {
  const getDMPartner = (chat) => {
    return chat.participants.find((p) => p._id !== currentUserId) || chat.participants[0];
  };

  const getChatInfo = (chat) => {
    if (chat.isTeamChat) {
      return {
        title: chat.teamId?.name || 'Team Chat',
        avatar: chat.teamId?.logo || null,
        fallbackText: (chat.teamId?.name || 'T').substring(0, 2).toUpperCase(),
        isTeam: true,
      };
    } else {
      const partner = getDMPartner(chat);
      const avatarUrl = partner?.avatar?.secureUrl || (typeof partner?.avatar === 'string' ? partner.avatar : null);
      return {
        title: partner?.name || 'HackMate User',
        avatar: avatarUrl,
        fallbackText: (partner?.name || 'U').charAt(0).toUpperCase(),
        isTeam: false,
        partner,
      };
    }
  };

  const formatLastMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const senderName = chat.lastMessage.sender?._id === currentUserId ? 'You: ' : '';
    if (chat.lastMessage.content) {
      return `${senderName}${chat.lastMessage.content}`;
    }
    if (chat.lastMessage.attachments?.length > 0) {
      return `${senderName}Sent ${chat.lastMessage.attachments.length} attachment(s)`;
    }
    return 'No messages yet';
  };

  // Group chats by category
  const teamChats = chats.filter((c) => c.isTeamChat);
  const directChats = chats.filter((c) => !c.isTeamChat);

  const renderChatItem = (chat) => {
    const { title, avatar, fallbackText, isTeam, partner } = getChatInfo(chat);
    const isSelected = chat._id === selectedChatId;
    const lastMsgTime = formatLastMessageTime(chat.lastActivity);
    const preview = getMessagePreview(chat);
    const unread = chat.unreadCount || 0;

    return (
      <button
        key={chat._id}
        onClick={() => onSelectChat(chat)}
        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all border text-left group ${
          isSelected
            ? 'bg-slate-900 border-slate-800 text-white shadow-lg shadow-black/10'
            : 'bg-slate-950/40 border-transparent text-slate-300 hover:bg-slate-900/40 hover:text-white'
        }`}
      >
        {/* Avatar Container */}
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={title}
              className={`w-11 h-11 object-cover ${isTeam ? 'rounded-xl' : 'rounded-full'}`}
            />
          ) : (
            <div
              className={`w-11 h-11 flex items-center justify-center font-bold text-sm bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/10 ${
                isTeam ? 'rounded-xl' : 'rounded-full'
              }`}
            >
              {fallbackText}
            </div>
          )}
          
          {/* Active green dot overlay for DMs */}
          {!isTeam && partner && partner.status === 'Online' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="font-semibold text-sm truncate group-hover:text-white transition-colors">
              {title}
            </span>
            <span className="text-[10px] text-slate-500 shrink-0 font-medium">
              {lastMsgTime}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400 truncate flex-1 font-medium">
              {preview}
            </p>
            {unread > 0 && (
              <span className="h-5 px-1.5 min-w-5 flex items-center justify-center text-[10px] font-bold bg-indigo-600 text-white rounded-full shrink-0 animate-pulse">
                {unread}
              </span>
            )}
          </div>

          {/* User Active text if DM */}
          {!isTeam && partner && (
            <div className="mt-1.5">
              <OnlineStatus
                status={partner.status}
                lastActive={partner.lastActive}
                showText={true}
                className="text-[10px] opacity-70"
              />
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 shrink-0">
        <h2 className="text-base font-bold text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Conversations
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {/* Teams Chats Section */}
        {teamChats.length > 0 && (
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              Team Rooms ({teamChats.length})
            </div>
            <div className="space-y-1.5">
              {teamChats.map(renderChatItem)}
            </div>
          </div>
        )}

        {/* Direct Messages Section */}
        <div>
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            Direct Messages ({directChats.length})
          </div>
          {directChats.length > 0 ? (
            <div className="space-y-1.5">
              {directChats.map(renderChatItem)}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-900/20 border border-dashed border-slate-800/60 rounded-xl">
              No direct messages yet. Match with other hackers to start chatting!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
