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
        className={`w-full flex items-start gap-3.5 p-3 rounded-2xl transition-all border text-left group cursor-pointer ${
          isSelected
            ? 'bg-indigo-950/20 border-indigo-500/20 text-white shadow-lg shadow-indigo-500/5'
            : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
        }`}
      >
        {/* Avatar Container */}
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={title}
              className={`w-11 h-11 object-cover ${
                isTeam
                  ? 'rounded-xl'
                  : 'rounded-2xl ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all'
              }`}
            />
          ) : (
            <div
              className={`w-11 h-11 flex items-center justify-center font-bold text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 ${
                isTeam ? 'rounded-xl' : 'rounded-2xl'
              }`}
            >
              {fallbackText}
            </div>
          )}
          
          {/* Active green dot overlay for DMs */}
          {!isTeam && partner && partner.status === 'Online' && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-md" />
          )}
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span className={`font-outfit text-sm font-semibold truncate transition-colors ${
              isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
            }`}>
              {title}
            </span>
            <span className="text-[9px] font-sans text-slate-500 shrink-0 font-medium">
              {lastMsgTime}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400 truncate flex-grow font-medium leading-tight">
              {preview}
            </p>
            {unread > 0 && (
              <span className="h-5 px-1.5 min-w-5 flex items-center justify-center text-[9px] font-cabinet font-black bg-indigo-600 text-white rounded-full shrink-0 shadow-md shadow-indigo-600/20">
                {unread}
              </span>
            )}
          </div>

          {/* User Active text if DM */}
          {!isTeam && partner && (
            <div className="mt-1.5 opacity-80">
              <OnlineStatus
                status={partner.status}
                lastActive={partner.lastActive}
                showText={true}
                className="text-[9px]"
              />
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950/40">
      <div className="p-5 border-b border-white/5 shrink-0">
        <h2 className="text-base font-cabinet font-black tracking-wide text-white">
          Inbox
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto p-3.5 space-y-4 custom-scrollbar">
        {/* Teams Chats Section */}
        {teamChats.length > 0 && (
          <div>
            <div className="px-2.5 mb-2.5 text-[9px] font-cabinet font-black text-slate-500 tracking-wider uppercase">
              Team Rooms ({teamChats.length})
            </div>
            <div className="space-y-1">
              {teamChats.map(renderChatItem)}
            </div>
          </div>
        )}

        {/* Direct Messages Section */}
        <div>
          <div className="px-2.5 mb-2.5 text-[9px] font-cabinet font-black text-slate-500 tracking-wider uppercase">
            Direct Messages ({directChats.length})
          </div>
          {directChats.length > 0 ? (
            <div className="space-y-1">
              {directChats.map(renderChatItem)}
            </div>
          ) : (
            <div className="p-5 text-center text-xs font-sans text-slate-400 bg-slate-900/10 border border-white/5 rounded-2xl leading-relaxed">
              No direct messages yet. Match with other hackers to start chatting!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
