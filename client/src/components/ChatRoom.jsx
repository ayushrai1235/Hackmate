import React, { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { getMessages } from '../services/chatService';
import { uploadChatAttachment } from '../services/uploadService';
import { compressImage } from '../utils/imageCompressor';
import OnlineStatus from './OnlineStatus';

// Rich preview detector helper
const LinkPreview = ({ url }) => {
  // Regex matchers
  const githubIssueRegex = /https?:\/\/(www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)/;
  const githubRepoRegex = /https?:\/\/(www\.)?github\.com\/([\w.-]+)\/([\w.-]+)(?:\/)?$/;
  const figmaRegex = /https?:\/\/(www\.)?figma\.com\/(file|proto)\/([\w.-]+)\/([\w.-]+)/;

  if (githubIssueRegex.test(url)) {
    const match = url.match(githubIssueRegex);
    const owner = match[2];
    const repo = match[3];
    const issueNum = match[4];
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex flex-col p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 hover:bg-slate-950 transition-all text-left"
      >
        <div className="flex items-center gap-2 mb-1.5 text-xs text-purple-400 font-semibold font-outfit">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub Issue #{issueNum}
        </div>
        <span className="text-sm font-semibold text-white mb-0.5 truncate font-outfit">
          Resolve branch conflicts & clean styling
        </span>
        <span className="text-[10px] text-slate-400 truncate font-sans">
          {owner}/{repo} • Open
        </span>
      </a>
    );
  }

  if (githubRepoRegex.test(url)) {
    const match = url.match(githubRepoRegex);
    const owner = match[2];
    const repo = match[3];
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex flex-col p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-indigo-500/20 hover:bg-slate-950 transition-all text-left"
      >
        <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-300 font-semibold font-outfit">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub Repository
        </div>
        <span className="text-sm font-semibold text-white mb-0.5 truncate font-outfit">
          {owner}/{repo}
        </span>
        <span className="text-[10px] text-slate-400 truncate font-sans">
          Explore codebase and review details
        </span>
      </a>
    );
  }

  if (figmaRegex.test(url)) {
    const match = url.match(figmaRegex);
    const fileName = match[4].replace(/[-_]/g, ' ');
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex flex-col p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/10 to-orange-950/10 border border-orange-500/20 hover:border-orange-500/40 hover:from-purple-950/20 hover:to-orange-950/20 transition-all text-left"
      >
        <div className="flex items-center gap-2 mb-1.5 text-xs text-orange-400 font-semibold font-outfit">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 24c3.315 0 6-2.683 6-6V12c0-3.317-2.685-6-6-6-3.315 0-6 2.683-6 6v6c0 3.317 2.685 6 6 6zM6 6c0-3.317 2.685-6 6-6s6 2.683 6 6v6H6V6z" />
          </svg>
          Figma Design File
        </div>
        <span className="text-sm font-semibold text-white mb-0.5 truncate capitalize font-outfit">
          {decodeURIComponent(fileName)}
        </span>
        <span className="text-[10px] text-slate-400 truncate font-sans">
          Shared design workspace & prototypes
        </span>
      </a>
    );
  }

  return null;
};

// Helper to parse urls from string
const detectUrls = (text) => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

const ChatRoom = ({ chat, currentUserId, cache, updateCache }) => {
  const { socket } = useContext(SocketContext);
  const { user: currentUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const safeUpdateCache = (updatedMessages, more = hasMore, cursor = nextCursor) => {
    if (updateCache) {
      setTimeout(() => {
        updateCache(updatedMessages, more, cursor);
      }, 0);
    }
  };

  const getChatDetails = () => {
    if (chat.isTeamChat) {
      return {
        title: chat.teamId?.name || 'Team Chat',
        avatar: chat.teamId?.logo || null,
        fallbackText: (chat.teamId?.name || 'T').substring(0, 2).toUpperCase(),
        isTeam: true,
      };
    } else {
      const partner = chat.participants.find((p) => p._id !== currentUserId) || chat.participants[0];
      const avatarUrl = partner?.avatar?.secureUrl || (typeof partner?.avatar === 'string' ? partner.avatar : null);
      return {
        title: partner?.name || 'User',
        avatar: avatarUrl,
        fallbackText: (partner?.name || 'U').charAt(0).toUpperCase(),
        isTeam: false,
        partner,
      };
    }
  };

  const details = getChatDetails();

  // Load messages
  const loadMessagesList = async (chatId, cursor = null) => {
    try {
      const data = await getMessages(chatId, cursor);
      if (cursor) {
        setMessages((prev) => {
          const combined = [...data.messages, ...prev];
          safeUpdateCache(combined, data.hasMore, data.nextCursor);
          return combined;
        });
      } else {
        setMessages(data.messages);
        safeUpdateCache(data.messages, data.hasMore, data.nextCursor);
        scrollToBottom();
      }
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const loadOlderMessages = async () => {
    if (!hasMore || loadingOlder || !nextCursor) return;

    const container = messageContainerRef.current;
    const scrollHeightBefore = container ? container.scrollHeight : 0;

    try {
      setLoadingOlder(true);
      const data = await getMessages(chat._id, nextCursor);
      
      setMessages((prev) => {
        const combined = [...data.messages, ...prev];
        safeUpdateCache(combined, data.hasMore, data.nextCursor);
        return combined;
      });

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);

      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - scrollHeightBefore;
        }, 0);
      }
    } catch (err) {
      console.error('Error loading older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMore && !loadingOlder) {
      loadOlderMessages();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Cache-load hook and socket handshake read emitter
  useEffect(() => {
    if (!chat._id) return;

    if (cache) {
      setMessages(cache.messages);
      setNextCursor(cache.nextCursor);
      setHasMore(cache.hasMore);
      if (socket) {
        socket.emit('chat:read', { chatId: chat._id });
      }
    } else {
      setMessages([]);
      loadMessagesList(chat._id);
    }
  }, [chat._id, cache]);

  // Setup sockets
  useEffect(() => {
    if (!chat._id) return;

    if (socket) {
      // Join room
      socket.emit('join:chat', { chatId: chat._id });

      // Handle message events
      const handleNewMessage = (payload) => {
        const message = payload.message || payload;
        const tempId = payload.tempId;

        if (message.chatId === chat._id) {
          setMessages((prev) => {
            let updated = [...prev];
            // Swap optimistic message if it was ours
            if (tempId && updated.some((m) => m._id === tempId)) {
              updated = updated.map((m) => (m._id === tempId ? message : m));
            } else if (!updated.some((m) => m._id === message._id)) {
              updated.push(message);
            }
            safeUpdateCache(updated, hasMore, nextCursor);
            return updated;
          });
          scrollToBottom();

          // Mark chat as read
          if (message.sender._id !== currentUserId) {
            socket.emit('chat:read', { chatId: chat._id });
          }
        }
      };

      const handleMessagesDelivered = ({ chatId: deliveredChatId, messageIds, userId }) => {
        if (deliveredChatId === chat._id) {
          setMessages((prev) => {
            const updated = prev.map((m) => {
              if (messageIds.includes(m._id)) {
                const deliveredTo = [...(m.deliveredTo || [])];
                if (!deliveredTo.includes(userId)) deliveredTo.push(userId);
                return { ...m, deliveredTo };
              }
              return m;
            });
            safeUpdateCache(updated, hasMore, nextCursor);
            return updated;
          });
        }
      };

      const handleChatRead = ({ chatId: readChatId, userId, messageIds }) => {
        if (readChatId === chat._id) {
          setMessages((prev) => {
            const updated = prev.map((m) => {
              if (messageIds.includes(m._id)) {
                const readBy = [...(m.readBy || [])];
                if (!readBy.includes(userId)) readBy.push(userId);
                const deliveredTo = [...(m.deliveredTo || [])];
                if (!deliveredTo.includes(userId)) deliveredTo.push(userId);
                return { ...m, readBy, deliveredTo };
              }
              return m;
            });
            safeUpdateCache(updated, hasMore, nextCursor);
            return updated;
          });
        }
      };

      const handleTypingStart = ({ chatId: typedChatId, userId }) => {
        if (typedChatId === chat._id && userId !== currentUserId) {
          const sender = chat.participants.find((p) => p._id === userId);
          if (sender) {
            setTypingUsers((prev) => ({ ...prev, [userId]: sender.name }));
          }
        }
      };

      const handleTypingStop = ({ chatId: typedChatId, userId }) => {
        if (typedChatId === chat._id) {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
        }
      };

      socket.on('message:new', handleNewMessage);
      socket.on('messages:delivered', handleMessagesDelivered);
      socket.on('chat:read', handleChatRead);
      socket.on('typing:start', handleTypingStart);
      socket.on('typing:stop', handleTypingStop);

      return () => {
        socket.off('message:new', handleNewMessage);
        socket.off('messages:delivered', handleMessagesDelivered);
        socket.off('chat:read', handleChatRead);
        socket.off('typing:start', handleTypingStart);
        socket.off('typing:stop', handleTypingStop);
      };
    }
  }, [chat._id, socket, hasMore, nextCursor]);

  // Handle Input typing status
  const handleTextChange = (e) => {
    setText(e.target.value);

    if (socket && chat._id) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing:start', { chatId: chat._id });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing:stop', { chatId: chat._id });
      }, 2000);
    }
  };

  // Upload attachments
  const handleAttachmentUpload = async (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    if (rawFile.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }

    let file = rawFile;

    // Compress client side if it is a compressible image format
    if (rawFile.type.startsWith('image/') && rawFile.type !== 'image/gif') {
      try {
        file = await compressImage(rawFile, { maxWidth: 1024, maxHeight: 1024, quality: 0.7 });
      } catch (err) {
        console.error('Image compression failed, using raw file instead:', err);
      }
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const data = await uploadChatAttachment(file, (progress) => {
        setUploadProgress(progress);
      });

      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          url: data.secureUrl || data.url,
          type: file.type.startsWith('image/') ? 'image' : 'document',
        },
      ]);
    } catch (err) {
      console.error('Attachment upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;

    if (socket && chat._id) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      socket.emit('typing:stop', { chatId: chat._id });

      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        chatId: chat._id,
        sender: {
          _id: currentUserId,
          name: currentUser?.name || 'Me',
          avatar: currentUser?.avatar || null
        },
        content: text,
        attachments: attachments,
        createdAt: new Date().toISOString(),
        readBy: [currentUserId],
        deliveredTo: [currentUserId],
        status: 'sending'
      };

      // Set optimistic state immediately
      setMessages((prev) => {
        const updated = [...prev, tempMessage];
        safeUpdateCache(updated, hasMore, nextCursor);
        return updated;
      });
      scrollToBottom();

      // Send via socket
      socket.emit('message:send', {
        chatId: chat._id,
        content: text,
        attachments,
        tempId,
      });

      setText('');
      setAttachments([]);
    }
  };

  // Format link parsing securely (without dangerouslySetInnerHTML)
  const renderMessageContent = (content) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    if (parts.length === 1) {
      return <p className="whitespace-pre-wrap select-text">{content}</p>;
    }
    return (
      <p className="whitespace-pre-wrap select-text">
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-indigo-200 underline font-semibold break-all transition-colors"
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </p>
    );
  };

  // Evaluate message receipt delivery checkmarks
  const renderDeliveryStatus = (msg) => {
    if (msg.sender?._id !== currentUserId) return null; // Show checks on our sent messages only

    if (msg.status === 'sending') {
      return (
        <svg className="w-3 h-3 text-slate-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    const isTeam = chat.isTeamChat;
    const otherParticipants = chat.participants.filter((p) => p._id !== currentUserId);
    const otherIds = otherParticipants.map((p) => p._id);

    if (otherIds.length === 0) return null;

    const isRead = isTeam
      ? otherIds.every((id) => msg.readBy?.includes(id))
      : otherIds.some((id) => msg.readBy?.includes(id));

    const isDelivered = isTeam
      ? otherIds.every((id) => msg.deliveredTo?.includes(id))
      : otherIds.some((id) => msg.deliveredTo?.includes(id));

    if (isRead) {
      return (
        <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM2 12l1.41-1.41L7.48 15l-1.41 1.41L2 12z"/>
        </svg>
      );
    }

    if (isDelivered) {
      return (
        <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM2 12l1.41-1.41L7.48 15l-1.41 1.41L2 12z"/>
        </svg>
      );
    }

    return (
      <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/10 overflow-hidden relative">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.3);
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          {details.avatar ? (
            <img
              src={details.avatar}
              alt={details.title}
              className={`w-10 h-10 object-cover border border-white/10 ${details.isTeam ? 'rounded-xl' : 'rounded-2xl'}`}
            />
          ) : (
            <div
              className={`w-10 h-10 flex items-center justify-center font-bold text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 ${
                details.isTeam ? 'rounded-xl' : 'rounded-2xl'
              }`}
            >
              {details.fallbackText}
            </div>
          )}
          <div>
            <h3 className="text-sm font-cabinet font-black text-white leading-tight tracking-wide">
              {details.title}
            </h3>
            {!details.isTeam && details.partner ? (
              <OnlineStatus
                status={details.partner.status}
                lastActive={details.partner.lastActive}
                className="mt-0.5 text-[10px]"
              />
            ) : (
              <span className="text-[10px] text-slate-500 font-bold font-sans">
                Team Room • {chat.participants?.length || 0} participants
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message list area */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar flex flex-col bg-slate-950/20"
      >
        {loadingOlder && (
          <div className="flex justify-center p-2 text-[10px] font-bold text-indigo-400 font-outfit">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-1.5" />
            Loading historical messages...
          </div>
        )}

        {!loadingOlder && hasMore && (
          <button
            onClick={loadOlderMessages}
            className="self-center text-[10px] font-bold tracking-wider uppercase text-indigo-400 hover:text-indigo-300 bg-slate-950/80 border border-white/5 px-4 py-2 rounded-full transition-all mb-4 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            Load older messages
          </button>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender?._id === currentUserId;
          const urls = detectUrls(msg.content);

          return (
            <div
              key={msg._id}
              className={`flex gap-3 max-w-[85%] ${isMine ? 'self-end flex-row-reverse' : 'self-start flex-row'}`}
            >
              {/* Profile Picture (Avatar) */}
              <div className="shrink-0 self-end mb-4">
                {msg.sender?.avatar?.secureUrl || (typeof msg.sender?.avatar === 'string' ? msg.sender.avatar : null) ? (
                  <img
                    src={msg.sender?.avatar?.secureUrl || msg.sender.avatar}
                    alt={msg.sender.name || 'User'}
                    className="w-8 h-8 rounded-xl object-cover border border-white/10 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shadow-sm font-outfit">
                    {(msg.sender?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Bubble & Metadata Container */}
              <div className={`flex flex-col max-w-full ${isMine ? 'items-end' : 'items-start'}`}>
                {/* Sender Name if Team Chat & not mine */}
                {!isMine && chat.isTeamChat && (
                  <span className="text-[10px] text-slate-500 font-semibold mb-1 ml-2 font-sans">
                    {msg.sender?.name}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm select-text relative ${
                    isMine
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.content && renderMessageContent(msg.content)}

                  {/* Attachments inside bubble */}
                  {msg.attachments?.map((att, idx) => {
                    const fileUrl = att.url || att.secureUrl;
                    const fileName = att.name || 'Attachment';
                    return (
                      <div key={idx} className="mt-2 pt-2 border-t border-white/10">
                        {att.type === 'image' ? (
                          <div
                            className="relative group overflow-hidden rounded-xl border border-white/10 transition-all mt-1 inline-block"
                          >
                            <img
                              onClick={() => setPreviewImage({ url: fileUrl, name: fileName })}
                              src={fileUrl}
                              alt={fileName}
                              className="max-w-xs max-h-48 rounded-xl object-cover hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                            />
                            <a
                              href={fileUrl}
                              download={fileName}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10"
                              title="Download Image"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950/40 border border-white/5 text-xs font-medium hover:bg-slate-950 transition-all text-slate-200 mt-2 hover:border-indigo-500/20"
                          >
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="truncate flex-1 max-w-[160px] font-sans">{fileName}</span>
                          </a>
                        )}
                      </div>
                    );
                  })}

                  {/* Link Previews inside bubble */}
                  {urls.map((url, uidx) => (
                    <LinkPreview key={uidx} url={url} />
                  ))}
                </div>

                {/* Meta information row (time, read receipt) */}
                <div className="flex items-center gap-1.5 mt-1 px-1">
                  <span className="text-[9px] text-slate-500 font-semibold font-sans">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {isMine && renderDeliveryStatus(msg)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium pl-2 italic self-start font-sans">
            <span>{Object.values(typingUsers).join(', ')} is typing</span>
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-white/5 bg-slate-950/40 backdrop-blur-md shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {/* Attachment preview list */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-2">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white"
              >
                <span className="truncate max-w-[150px] font-medium font-sans">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-slate-400 hover:text-red-400 font-bold ml-1.5 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress Display */}
        {isUploading && uploadProgress !== null && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/10 rounded-xl mb-3 animate-pulse font-sans">
            <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Uploading attachment: {uploadProgress}%</span>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-center gap-3">
          {/* File upload button */}
          <label className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:border-indigo-500/20 cursor-pointer transition-all">
            <input
              type="file"
              onChange={handleAttachmentUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </label>

          {/* Text Input */}
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            placeholder="Type your message, paste Figma or GitHub link..."
            className="flex-1 min-w-0 bg-slate-900/60 border border-white/5 focus:border-indigo-500/30 rounded-xl px-4.5 py-3 text-sm text-white focus:outline-none placeholder-slate-500 transition-all font-medium premium-input"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() && attachments.length === 0}
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 disabled:border-transparent transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {/* Interactive Full-Screen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 bg-slate-900/50 p-2.5 rounded-full border border-slate-800 transition-all focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={previewImage.url}
            alt={previewImage.name}
            className="max-w-[90%] max-h-[85vh] rounded-2xl object-contain shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
